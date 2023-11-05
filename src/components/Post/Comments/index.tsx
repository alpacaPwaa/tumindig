import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text,
  useMediaQuery,
} from "@chakra-ui/react";
import { User } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { useSetRecoilState } from "recoil";
import { authModalState } from "../../../atoms/authModalAtom";
import { Post, postState } from "../../../atoms/postsAtom";
import { auth, firestore } from "../../../firebase/clientApp";
import CommentItem, { Comment, CommentVotes } from "./CommentItem";
import CommentInput from "./Input";
import { Reply, ReplyVotes } from "./ReplyItem";
import { useAuthState } from "react-firebase-hooks/auth";
import { TfiComments } from "react-icons/tfi";
import { UserNotification } from "../../../atoms/notificationAtom";

type CommentsProps = {
  selectedPost: Post;
  community: string;
};

const Comments: React.FC<CommentsProps> = ({ selectedPost, community }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [user] = useAuthState(auth); // will revisit how 'auth' state is passed
  const [replies, setReplies] = useState<Reply[]>([]);
  const [commentFetchLoading, setCommentFetchLoading] = useState(false);
  const [commentCreateLoading, setCommentCreateLoading] = useState(false);
  const [commentUpdateLoading, setCommentUpdateLoading] = useState(false);
  const [commentLoader, setCommentLoader] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState("");
  const setAuthModalState = useSetRecoilState(authModalState);
  const setPostState = useSetRecoilState(postState);
  const [editMode, setEditMode] = useState("");
  const [votingDisabled, setVotingDisabled] = useState(false);
  const [commentVotes, setCommentVotes] = useState<CommentVotes[]>([]);
  const [replyVotes, setReplyVotes] = useState<ReplyVotes[]>([]);
  const [currentPageComment, setCurrentPageComment] = useState(1);
  const [md] = useMediaQuery("(min-width: 768px)");

  const onCreateComment = async (commentText: string) => {
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    const isCreatorCommenting = user?.uid === selectedPost.creatorId;

    setCommentCreateLoading(true);
    try {
      const batch = writeBatch(firestore);

      // Create comment document
      const commentDocRef = doc(collection(firestore, "comments"));
      batch.set(commentDocRef, {
        postId: selectedPost.id,
        creatorId: user.uid,
        creatorDisplayText: user.displayName || user.email!.split("@")[0],
        creatorPhotoURL: user.photoURL,
        communityId: community,
        text: commentText,
        postTitle: selectedPost.title,
        createdAt: serverTimestamp(),
        voteStatus: 0, // Initialize voteStatus with a value of 0
        currentUserVoteStatus: {
          id: "",
          voteValue: 0,
        },
      } as Comment);

      if (!isCreatorCommenting) {
        const commentNotificationRef = doc(
          collection(
            firestore,
            "users",
            `${selectedPost.creatorId}/userNotification`
          )
        );

        //New Notification
        const newNotification: UserNotification = {
          userDisplayText: user.displayName || user.email!.split("@")[0],
          userProfile: user.photoURL || "",
          userId: user.uid,
          triggerDocumentId: selectedPost.id,
          creatorId: selectedPost.creatorId,
          createdAt: serverTimestamp() as Timestamp,
          communityId: community,
          notificationId: commentNotificationRef.id,
          notificationType: "reply",
          isRead: false,
        };

        batch.set(commentNotificationRef, newNotification);
      }

      // Update post numberOfComments
      batch.update(doc(firestore, "posts", selectedPost.id), {
        numberOfComments: increment(1),
      });
      await batch.commit();

      setComment("");
      const { id: postId, title } = selectedPost;
      setComments((prev) => [
        {
          id: commentDocRef.id,
          creatorId: user.uid,
          creatorDisplayText: user.displayName || user.email!.split("@")[0],
          creatorPhotoURL: user.photoURL,
          communityId: community,
          postId,
          postTitle: title,
          text: comment,
          createdAt: {
            seconds: Date.now() / 1000,
          },
          voteStatus: 0, // Set an initial value for voteStatus
          currentUserVoteStatus: {
            id: "",
            voteValue: 0,
          },
        } as Comment,
        ...prev,
      ]);

      // Fetch posts again to update number of comments
      setPostState((prev) => ({
        ...prev,
        selectedPost: {
          ...prev.selectedPost,
          numberOfComments: prev.selectedPost?.numberOfComments! + 1,
        } as Post,
        postUpdateRequired: true,
      }));
    } catch (error: any) {
      console.log("onCreateComment error", error.message);
    }
    setCommentCreateLoading(false);
  };

  const onDeleteComment = useCallback(
    async (comment: Comment) => {
      setDeleteLoading(comment.id as string);
      try {
        if (!comment.id) throw "Comment has no ID";
        const batch = writeBatch(firestore);
        const commentDocRef = doc(firestore, "comments", comment.id);
        batch.delete(commentDocRef);

        // Delete the associated replies
        const replyDocs = await getDocs(
          query(
            collection(firestore, "replies"),
            where("commentId", "==", comment.id)
          )
        );
        replyDocs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        batch.update(doc(firestore, "posts", comment.postId), {
          numberOfComments: increment(-1),
        });

        await batch.commit();

        setPostState((prev) => ({
          ...prev,
          selectedPost: {
            ...prev.selectedPost,
            numberOfComments: prev.selectedPost?.numberOfComments! - 1,
          } as Post,
          postUpdateRequired: true,
        }));

        setComments((prev) => prev.filter((item) => item.id !== comment.id));
        setReplies((prev) =>
          prev.filter((reply) => reply.commentId !== comment.id)
        );
      } catch (error: any) {
        console.log("Error deleting comment and replies", error.message);
      }
      setDeleteLoading("");
    },
    [setComments, setReplies, setPostState]
  );

  const onUpdateComment = useCallback(
    async (commentId: string, newText: string) => {
      setCommentUpdateLoading(true);
      try {
        const commentRef = doc(firestore, "comments", commentId);
        await updateDoc(commentRef, {
          text: newText,
          isEdited: true,
        });
        setComments((prev) =>
          prev.map((item) => {
            if (item.id === commentId) {
              return {
                ...item,
                text: newText,
              };
            }
            return item;
          })
        );
        setCommentUpdateLoading(false);
        setEditMode("");
      } catch (error: any) {
        console.log("Error updating comment", error.message);
      }
    },
    [setComments]
  );

  const onVoteComment = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    comment: Comment,
    vote: number,
    communityId: string
  ) => {
    event.stopPropagation();
    if (!user?.uid) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    if (votingDisabled) return; // Disable voting if it's already in progress

    setVotingDisabled(true); // Disable voting until the server response is received

    const { voteStatus } = comment;
    const existingVote = commentVotes.find(
      (vote) => vote.commentsId === comment.id
    );

    try {
      let voteChange = vote;
      const batch = writeBatch(firestore);

      const updatedComment = { ...comment };
      const updatedComments = [...comments];
      let updatedCommentVotes = [...commentVotes];

      // New vote
      if (!existingVote) {
        const commentVoteRef = doc(
          collection(firestore, "users", `${user.uid}/commentVotes`)
        );

        const newVote: CommentVotes = {
          id: commentVoteRef.id,
          commentsId: comment.id,
          communityId,
          voteValue: vote,
        };

        batch.set(commentVoteRef, newVote);

        updatedComment.voteStatus = voteStatus + vote;
        updatedCommentVotes = [...updatedCommentVotes, newVote];
      }
      // Removing existing vote
      else {
        const commentVoteRef = doc(
          firestore,
          "users",
          `${user.uid}/commentVotes/${existingVote.id}`
        );

        // Removing vote
        if (existingVote.voteValue === vote) {
          voteChange *= -1;
          updatedComment.voteStatus = voteStatus - vote;
          updatedCommentVotes = updatedCommentVotes.filter(
            (vote) => vote.id !== existingVote.id
          );
          batch.delete(commentVoteRef);
        }
        // Changing vote
        else {
          voteChange = 2 * vote;
          updatedComment.voteStatus = voteStatus + 2 * vote;
          const voteIdx = updatedCommentVotes.findIndex(
            (vote) => vote.id === existingVote.id
          );

          // Vote was found - findIndex returns -1 if not found
          if (voteIdx !== -1) {
            updatedCommentVotes[voteIdx].voteValue = vote;
          }
          batch.update(commentVoteRef, {
            voteValue: vote,
          });
        }
      }

      const commentIndex = updatedComments.findIndex(
        (c) => c.id === comment.id
      );

      if (commentIndex !== -1) {
        updatedComments[commentIndex] = updatedComment;
      }

      // Optimistically update the UI
      setCommentVotes(updatedCommentVotes);
      setComments(updatedComments);

      // Update database
      const commentRef = doc(firestore, "comments", comment.id);
      batch.update(commentRef, {
        voteStatus: voteStatus + voteChange,
      });

      await batch.commit();
      setVotingDisabled(false); // Re-enable voting after the server response is received
    } catch (error) {
      console.log("onVoteComment error", error);
      setVotingDisabled(false); // Re-enable voting in case of an error
    }
  };

  const getPostComments = async (): Promise<Comment[]> => {
    try {
      // Fetch comments from Firestore
      const commentsQuery = query(
        collection(firestore, "comments"),
        where("postId", "==", selectedPost.id),
        orderBy("voteStatus", "desc"),
        limit(5 * currentPageComment)
      );
      const commentDocs = await getDocs(commentsQuery);
      const comments = commentDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[];

      // Fetch votes from Firestore
      const userCommentVotes = comments.map((comment) =>
        getCommentVotes(comment.id, user!)
      );
      const commentVotes = await Promise.all(userCommentVotes);
      const flattenedCommentVotes = commentVotes.flat(); // Flatten the array of comment votes

      setCommentVotes(flattenedCommentVotes);

      return comments; // Return the fetched comments
    } catch (error: any) {
      console.log("getPostComments error", error.message);
      return []; // Return an empty array in case of an error
    }
  };

  const getCommentVotes = async (commentId: string, user: User) => {
    try {
      const commentVotesQuery = query(
        collection(firestore, `users/${user?.uid}`, "commentVotes"),
        where("commentsId", "==", commentId)
      );
      const commentVoteDocs = await getDocs(commentVotesQuery);
      const commentVotes = commentVoteDocs.docs.map((doc) =>
        doc.data()
      ) as CommentVotes[];
      return commentVotes;
    } catch (error: any) {
      console.log("getCommentVotes error", error.message);
      return [];
    }
  };

  const fetchCommentVotes = async () => {
    if (user) {
      const userCommentVotes = comments.map((comment) =>
        getCommentVotes(comment.id, user)
      );
      const commentVotes = await Promise.all(userCommentVotes);
      const flattenedCommentVotes = commentVotes.flat();

      setCommentVotes(flattenedCommentVotes);
    }
  };

  useEffect(() => {
    const fetchPostComment = async () => {
      await fetchCommentVotes(); // Fetch comment votes before proceeding
      try {
        // Fetch comments and comments votes from Firestore
        const fetchedComments = await getPostComments();
        setComments(fetchedComments);
        setCommentFetchLoading(false);
        setCommentLoader(false);
      } catch (error) {
        console.log("Fetch Comment Replies Error", error);
      }
    };

    fetchPostComment();
    //eslint-disable-next-line
  }, [user, currentPageComment]);

  const handleLoadMoreComments = () => {
    setCommentFetchLoading(true);
    try {
      setCurrentPageComment((prevPage) => prevPage + 1);
    } catch (error: any) {
      console.log("Load More Error", error);
    }
  };

  useEffect(() => {
    // Logout or no authenticated user
    if (!user?.uid && commentVotes.length > 0) {
      setCommentVotes([]);
    }
  }, [user, commentVotes]);

  //Comments loader
  useEffect(() => {
    setCommentLoader(true);
  }, []);

  return (
    <Box bg="white" p={2} borderRadius="0px 0px 4px 4px">
      <Flex
        direction="column"
        pl={2}
        pr={2}
        mb={6}
        fontSize="10pt"
        width="100%"
      >
        <CommentInput
          comment={comment}
          setComment={setComment}
          loading={commentCreateLoading}
          user={user}
          onCreateComment={onCreateComment}
        />
      </Flex>
      <Stack spacing={6} p={2}>
        {commentLoader ? (
          <>
            {[0, 1, 2, 4, 5].map((item) => (
              <Box key={item} padding="6" bg="white">
                <SkeletonCircle size="10" />
                <SkeletonText mt="4" noOfLines={2} spacing="4" />
              </Box>
            ))}
          </>
        ) : (
          <>
            {!!comments.length ? (
              <>
                {comments.map((item: Comment) => (
                  <CommentItem
                    userVoteValue={
                      commentVotes.find(
                        (comment) => comment.commentsId === item.id
                      )?.voteValue
                    }
                    replies={replies.filter(
                      (reply) => reply.commentId === item.id
                    )}
                    key={item.id}
                    comment={item}
                    onDeleteComment={onDeleteComment}
                    onUpdateComment={onUpdateComment}
                    isLoadingDelete={deleteLoading === (item.id as string)}
                    isLoadingUpdate={commentUpdateLoading}
                    userId={user?.uid}
                    setEditMode={setEditMode}
                    editMode={editMode === item.id}
                    onVoteComment={onVoteComment}
                    communityId={community}
                    replyVotes={replyVotes}
                  />
                ))}
              </>
            ) : (
              <Flex
                direction="column"
                justify="center"
                align="center"
                borderTop="1px solid"
                borderColor="gray.100"
                textAlign="center"
                p={md ? 20 : 10}
              >
                <Icon color="gray.300" as={TfiComments} fontSize={150} mb={2} />
                <Text
                  color="gray.500"
                  fontSize={md ? "15pt" : "12pt"}
                  fontWeight={800}
                >
                  No Comments Yet
                </Text>
                <Text
                  color="gray.500"
                  fontSize={md ? "11pt" : "9pt"}
                  fontWeight={500}
                >
                  Start the conversation with your first comment!
                </Text>
              </Flex>
            )}
          </>
        )}
        {comments.length >= currentPageComment * 5 ? (
          <Button
            mt={2}
            variant="ghost"
            size="sm"
            width="100%"
            fontSize="10pt"
            fontWeight={800}
            onClick={handleLoadMoreComments} // Add onClick event handler
          >
            Load More
          </Button>
        ) : commentFetchLoading ? (
          <Button
            mt={2}
            isLoading={commentFetchLoading}
            loadingText="Loading"
            variant="ghost"
            size="sm"
            width="100%"
            fontSize="10pt"
            fontWeight={800}
          />
        ) : null}
      </Stack>
    </Box>
  );
};
export default Comments;
