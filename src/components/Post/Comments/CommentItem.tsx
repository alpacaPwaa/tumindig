import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Spinner,
  Stack,
  Text,
  Textarea,
  Image,
  AspectRatio,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import moment from "moment";
import { FaReddit, FaUser, FaUserCircle } from "react-icons/fa";
import ReplyItem, { Reply, ReplyVotes } from "./ReplyItem";
import {
  IoIosArrowDown,
  IoIosArrowUp,
  IoMdArrowDropdown,
  IoMdArrowDropup,
} from "react-icons/io";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../../firebase/clientApp";
import { useSetRecoilState } from "recoil";
import { authModalState } from "../../../atoms/authModalAtom";
import ResizeTextarea from "react-textarea-autosize";
import { User } from "firebase/auth";
import { UserNotification } from "../../../atoms/notificationAtom";
import { BsArrowReturnRight } from "react-icons/bs";

export type Comment = {
  id: string;
  creatorId: string;
  creatorDisplayText: string;
  creatorPhotoURL: string;
  communityId: string;
  postId: string;
  postTitle: string;
  text: string;
  createdAt?: Timestamp;
  replies: Reply[];
  voteStatus: number;
  currentUserVoteStatus: {
    id?: string;
    voteValue: number;
  };
  isEdited?: boolean;
};

export type CommentVotes = {
  id: string;
  commentsId: string;
  communityId: string;
  voteValue: number;
};

type CommentItemProps = {
  comment: Comment;
  communityId: string;
  userVoteValue?: number;
  onDeleteComment: (comment: Comment) => void;
  onUpdateComment: (commentId: string, newText: string) => Promise<void>;
  isLoadingDelete: boolean;
  isLoadingUpdate: boolean;
  userId?: string;
  setEditMode: (commentId: string) => void;
  editMode: boolean;
  replies: Reply[];
  replyVotes: ReplyVotes[];
  onVoteComment: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    comment: Comment,
    vote: number,
    communityId: string
  ) => void;
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  communityId,
  userVoteValue,
  onDeleteComment,
  onUpdateComment,
  isLoadingDelete,
  isLoadingUpdate,
  userId,
  setEditMode,
  editMode,
  onVoteComment,
}) => {
  const [editedText, setEditedText] = React.useState(comment.text);
  const [replyVisible, setReplyVisible] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");
  const [user] = useAuthState(auth); // will revisit how 'auth' state is passed
  const [reply, setReply] = useState("");
  const [replies, setReplies] = useState<Reply[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyCreateLoading, setReplyCreateLoading] = useState(false);
  const [replyUpdateLoading, setReplyUpdateLoading] = useState(false);
  const setAuthModalState = useSetRecoilState(authModalState);
  const [deleteReplyLoading, setDeleteReplyLoading] = useState("");
  const [votingDisabled, setVotingDisabled] = useState(false);
  const [replyVotes, setReplyVotes] = useState<ReplyVotes[]>([]);
  const [currentPageReply, setCurrentPageReply] = useState(1);
  const [replyFetchLoading, setReplyFetchLoading] = useState(false);
  const [showFullComment, setShowFullComment] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [repliesVisible, setRepliesVisible] = useState(false);

  const onCreateCommentReply = async (commentId: string, replyText: string) => {
    setReplyCreateLoading(true);

    const isCreatorReplying = user?.uid === comment.creatorId;

    try {
      const batch = writeBatch(firestore);

      // Create reply document
      const replyDocRef = doc(collection(firestore, "replies"));
      batch.set(replyDocRef, {
        commentId: commentId,
        creatorId: user?.uid,
        creatorDisplayText: user?.displayName || user?.email!.split("@")[0],
        creatorPhotoURL: user?.photoURL,
        communityId: communityId,
        text: replyText,
        voteStatus: 0,
        currentUserVoteStatus: {
          id: "",
          voteValue: 0,
        },
        createdAt: serverTimestamp(),
      } as Reply);

      //New Notification
      if (!isCreatorReplying) {
        const replyNotificationRef = doc(
          collection(
            firestore,
            "users",
            `${comment.creatorId}/userNotification`
          )
        );

        const newNotification: UserNotification = {
          userDisplayText: user?.displayName || user?.email!.split("@")[0],
          userProfile: user?.photoURL || "",
          userId: user?.uid,
          triggerDocumentId: comment.id,
          creatorId: comment.creatorId,
          createdAt: serverTimestamp() as Timestamp,
          communityId: communityId,
          notificationId: replyNotificationRef.id,
          notificationType: "reply",
          isRead: false,
        };

        batch.set(replyNotificationRef, newNotification);
      }

      await batch.commit();
      setReply("");

      const reply = {
        id: replyDocRef.id,
        commentId: commentId,
        creatorId: user?.uid,
        creatorDisplayText: user?.displayName || user?.email!.split("@")[0],
        creatorPhotoURL: user?.photoURL,
        communityId: communityId,
        text: replyText,
        createdAt: {
          seconds: Date.now() / 1000,
        },
        voteStatus: 0,
        currentUserVoteStatus: {
          id: "",
          voteValue: 0,
        },
      } as Reply;

      setReplies((prev) => [...prev, reply]);

      setReplyCreateLoading(false);
      setReplyVisible(false);
      setReplyText("");

      // Save the reply to Firestore
      await setDoc(doc(firestore, "replies", reply.id), reply);
    } catch (error: any) {
      console.log("onCreateCommentReply error", error.message);
    }
  };

  const onDeleteReply = useCallback(
    async (replyId: string) => {
      setDeleteReplyLoading(replyId);
      try {
        const batch = writeBatch(firestore);
        const replyDocRef = doc(firestore, "replies", replyId);
        batch.delete(replyDocRef);
        await batch.commit();
        setReplies((prev) => prev.filter((reply) => reply.id !== replyId));
      } catch (error: any) {
        console.log("Error deleting reply", error.message);
      }
      setDeleteReplyLoading("");
    },
    [setReplies]
  );

  const onUpdateReply = useCallback(
    async (replyId: string, newText: string) => {
      setReplyUpdateLoading(true);
      try {
        const replyRef = doc(firestore, "replies", replyId);
        await updateDoc(replyRef, {
          text: newText,
          isEdited: true,
        });
        setReplies((prev) =>
          prev.map((item) => {
            if (item.id === replyId) {
              return {
                ...item,
                text: newText,
              };
            }
            return item;
          })
        );

        setReplyUpdateLoading(false);
      } catch (error: any) {
        console.log("Error updating reply", error.message);
      }
    },
    [setReplies]
  );

  const onVoteReply = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    reply: Reply,
    vote: number,
    communityId: string
  ) => {
    event.stopPropagation();
    if (!user?.uid) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    if (votingDisabled) return;

    setVotingDisabled(true);

    const { voteStatus } = reply;
    const existingVote = replyVotes.find((vote) => vote.repliesId === reply.id);

    try {
      let voteChange = vote;
      const batch = writeBatch(firestore);

      const updatedReply = { ...reply };
      const updatedReplies = [...replies];
      let updatedReplyVotes = [...replyVotes];

      if (!existingVote) {
        const replyVoteRef = doc(
          collection(firestore, "users", `${user.uid}/replyVotes`)
        );

        const newVote: ReplyVotes = {
          id: replyVoteRef.id,
          repliesId: reply.id,
          communityId,
          voteValue: vote,
        };

        batch.set(replyVoteRef, newVote);

        updatedReply.voteStatus = voteStatus + vote;
        updatedReplyVotes = [...updatedReplyVotes, newVote];
      } else {
        const replyVoteRef = doc(
          firestore,
          "users",
          `${user.uid}/replyVotes/${existingVote.id}`
        );

        if (existingVote.voteValue === vote) {
          voteChange *= -1;
          updatedReply.voteStatus = voteStatus - vote;
          updatedReplyVotes = updatedReplyVotes.filter(
            (vote) => vote.id !== existingVote.id
          );
          batch.delete(replyVoteRef);
        } else {
          voteChange = 2 * vote;
          updatedReply.voteStatus = voteStatus + 2 * vote;
          const voteIdx = updatedReplyVotes.findIndex(
            (vote) => vote.id === existingVote.id
          );

          if (voteIdx !== -1) {
            updatedReplyVotes[voteIdx].voteValue = vote;
          }

          batch.update(replyVoteRef, {
            voteValue: vote,
          });
        }
      }

      const replyIndex = updatedReplies.findIndex((r) => r.id === reply.id);

      if (replyIndex !== -1) {
        updatedReplies[replyIndex] = updatedReply;
      }

      setReplyVotes(updatedReplyVotes);
      setReplies(updatedReplies);

      const replyRef = doc(firestore, "replies", reply.id);
      batch.update(replyRef, {
        voteStatus: voteStatus + voteChange,
      });

      await batch.commit();
      setVotingDisabled(false);
    } catch (error) {
      console.log("onVoteReply error", error);
      setVotingDisabled(false);
    }
  };

  const getCommentReplies = async (comments: Comment[]): Promise<Reply[]> => {
    try {
      // Fetch replies from Firestore
      const commentIds = comments.map((comment) => comment.id);
      const repliesQuery = query(
        collection(firestore, "replies"),
        where("commentId", "in", commentIds),
        orderBy("voteStatus", "desc"),
        orderBy("createdAt", "asc"),
        limit(3 * currentPageReply)
      );
      const replyDocs = await getDocs(repliesQuery);
      const replies = replyDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Reply[];

      // Fetch votes from Firestore
      const userReplyVotes = replies.map((reply) =>
        getReplyVotes(reply.id, user!)
      );
      const replyVotes = await Promise.all(userReplyVotes);
      const flattenedReplyVotes = replyVotes.flat(); // Flatten the array of reply votes

      setReplyVotes(flattenedReplyVotes);

      return replies; // Return fetched replies here
    } catch (error: any) {
      console.log("getCommentReplies error", error.message);
      return []; // Return an empty array
    }
  };

  const handleLoadMoreReply = () => {
    setReplyFetchLoading(true);
    try {
      const newPage = currentPageReply + 1;
      setCurrentPageReply(newPage);
    } catch (error) {
      console.log("Load More Error", error);
    }
  };

  const getReplyVotes = async (repliesId: string, user: User) => {
    try {
      const replyVotesQuery = query(
        collection(firestore, `users/${user?.uid}`, "replyVotes"),
        where("repliesId", "==", repliesId)
      );
      const replyVoteDocs = await getDocs(replyVotesQuery);
      const replyVotes = replyVoteDocs.docs.map((doc) =>
        doc.data()
      ) as ReplyVotes[];
      return replyVotes;
    } catch (error: any) {
      console.log("getReplyVotes error", error.message);
      return [];
    }
  };

  // Fetch reply votes when the user changes
  const fetchReplyVotes = async () => {
    if (user) {
      const userReplyVotes = replies.map((reply) =>
        getReplyVotes(reply.id, user)
      );
      const replyVotes = await Promise.all(userReplyVotes);
      const flattenedReplyVotes = replyVotes.flat();

      setReplyVotes(flattenedReplyVotes);
    }
  };

  useEffect(() => {
    const fetchCommentReplies = async () => {
      await fetchReplyVotes(); // Fetch reply votes before proceeding
      try {
        // Fetch replies and reply votes from Firestore
        const fetchedReplies = await getCommentReplies(comments);
        setReplies(fetchedReplies);
        setReplyFetchLoading(false);
      } catch (error) {
        console.log("Fetch Comment Replies Error", error);
      }
    };

    fetchCommentReplies();
  }, [user, comments, currentPageReply]);

  useEffect(() => {
    // Logout or no authenticated user
    if (!user?.uid && replyVotes.length > 0) {
      setReplyVotes([]);
    }
  }, [user, replyVotes]);

  useEffect(() => {
    setComments([comment]);
  }, [comment]);

  const toggleEditMode = () => {
    if (editMode) {
      setEditMode("");
    } else {
      setEditMode(comment.id as string);
    }
    setEditedText(comment.text);
  };

  const toggleReplyVisible = () => {
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    setReplyVisible(!replyVisible);
    setReplyText("");
  };

  const toggleComment = () => {
    setShowFullComment(!showFullComment);
  };

  const handleToggleDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleSave = async () => {
    await onUpdateComment(comment.id as string, editedText);
    setEditMode("");
  };

  const handleReply = () => {
    onCreateCommentReply(comment.id as string, replyText);
  };

  return (
    <Flex>
      <Box mr={2}>
        {comment.creatorPhotoURL ? (
          <Box borderRadius="full" overflow="hidden" boxSize="35px">
            <AspectRatio ratio={1 / 1}>
              <Image
                src={comment.creatorPhotoURL}
                alt="User Photo"
                objectFit="cover"
                boxSize="100%"
                style={{ borderRadius: "50%" }}
              />
            </AspectRatio>
          </Box>
        ) : (
          <Icon as={FaUserCircle} fontSize="35px" color="gray.300" />
        )}
      </Box>
      <Stack spacing={1} width="100%">
        <Stack direction="row" align="center" spacing={2} fontSize="8pt">
          <Text
            fontWeight={700}
            _hover={{ textDecoration: "underline", cursor: "pointer" }}
          >
            {comment.creatorDisplayText}
          </Text>
          <Text color="gray.500" mx={1}>
            &middot;
          </Text>
          {comment.createdAt?.seconds && (
            <Text color="gray.600">
              {moment(new Date(comment.createdAt?.seconds * 1000)).fromNow()}
            </Text>
          )}
          {comment.isEdited && <Text color="gray.500">Edited</Text>}
        </Stack>
        {editMode ? (
          <Textarea
            width="100%"
            fontSize="10pt"
            as={ResizeTextarea}
            borderRadius={4}
            disabled={isLoadingUpdate}
            value={editedText}
            _focus={{
              outline: "none",
              bg: "white",
              border: "1px solid black",
            }}
            onChange={(e) => setEditedText(e.target.value)}
            css={{
              "&::-webkit-scrollbar": {
                width: "0.4em",
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "transparent",
              },
            }}
          />
        ) : !showFullComment && comment.text?.length > 350 ? (
          <Text fontSize="11pt">
            {comment.text.slice(0, 350)}
            <Button
              variant="link"
              fontSize="10pt"
              color="blue.500"
              onClick={toggleComment}
            >
              ...See More
            </Button>
          </Text>
        ) : (
          <Text fontSize="11pt">
            {comment.text}
            {comment.text?.length > 350 && (
              <Button
                variant="link"
                fontSize="10pt"
                color="blue.500"
                onClick={toggleComment}
              >
                Hide
              </Button>
            )}
          </Text>
        )}

        <Stack
          direction="row"
          align="center"
          cursor="pointer"
          fontWeight={600}
          color="gray.500"
        >
          <Button
            position="relative"
            variant="ghost"
            size="xs"
            onClick={(event) => onVoteComment(event, comment, 1, communityId)}
          >
            <Icon
              fontSize="11pt"
              fontWeight={800}
              position="absolute"
              as={IoIosArrowUp}
              color={userVoteValue === 1 ? "blue.500" : "gray.500"}
            />
          </Button>
          <Text
            fontSize="10pt"
            fontWeight={900}
            color={
              userVoteValue === 1
                ? "blue.500"
                : userVoteValue === -1
                ? "red.500"
                : "gray.500"
            }
          >
            {comment.voteStatus}
          </Text>
          <Button
            fontSize="11pt"
            fontWeight={900}
            position="relative"
            variant="ghost"
            size="xs"
            onClick={(event) => onVoteComment(event, comment, -1, communityId)}
          >
            <Icon
              position="absolute"
              as={IoIosArrowDown}
              color={userVoteValue === -1 ? "red.500" : "gray.500"}
            />
          </Button>
          {userId === comment.creatorId && (
            <>
              {editMode ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    _hover={{ color: "blue.500" }}
                    onClick={handleSave}
                    isLoading={isLoadingUpdate}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    _hover={{ color: "blue.500" }}
                    onClick={toggleEditMode}
                    ml={2}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleEditMode}
                    _hover={{ color: "blue.500" }}
                    ml={2}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleToggleDeleteModal}
                    _hover={{ color: "blue.500" }}
                    ml={2}
                  >
                    Delete
                  </Button>
                </>
              )}
            </>
          )}
          {!editMode && (
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleReplyVisible}
              _hover={{ color: "blue.500" }}
              ml={2}
            >
              Reply
            </Button>
          )}
        </Stack>

        {!!replies.length && (
          <Text
            fontSize="10pt"
            p="5px 0px 5px 0px"
            fontWeight={700}
            _hover={{ textDecoration: "underline", cursor: "pointer" }}
            color="blue.500"
            onClick={() => setRepliesVisible(!repliesVisible)}
          >
            {repliesVisible ? (
              <Flex flexDirection="row" align="center">
                <Icon mr={2} fontSize={20} as={IoMdArrowDropup} />
                <Text>Hide Replies</Text>
              </Flex>
            ) : (
              <Flex flexDirection="row" align="center">
                <Icon mr={2} fontSize={20} as={IoMdArrowDropdown} />
                <Text>Show Replies</Text>
              </Flex>
            )}
          </Text>
        )}

        {repliesVisible && (
          <>
            {replies.map((item: Reply) => (
              <ReplyItem
                userVoteValue={
                  replyVotes.find((reply) => reply.repliesId === item.id)
                    ?.voteValue
                }
                onVoteReply={onVoteReply}
                key={item.id}
                reply={item}
                handleToggleVisibility={toggleReplyVisible}
                userId={userId}
                onUpdateReply={onUpdateReply}
                isLoadingUpdate={replyUpdateLoading}
                onDeleteReply={onDeleteReply}
                isLoadingDelete={deleteReplyLoading === (item.id as string)}
                communityId={communityId}
              />
            ))}

            {replies.length >= currentPageReply * 3 ? (
              <Flex
                flexDirection="row"
                align="center"
                color="blue.500"
                _hover={{ textDecoration: "underline", cursor: "pointer" }}
              >
                <Icon as={BsArrowReturnRight} mr={2} fontSize={20} />
                <Text
                  fontSize="10pt"
                  fontWeight={700}
                  onClick={handleLoadMoreReply} // Add onClick event handler
                >
                  Show More Replies
                </Text>
              </Flex>
            ) : replyFetchLoading ? (
              <Flex flexDirection="row" align="center" color="blue.500">
                <Spinner size="sm" mr={2} />
                <Text cursor="pointer" fontSize="10pt" fontWeight={700}>
                  Loading Replies
                </Text>
              </Flex>
            ) : null}
          </>
        )}

        {replyVisible && (
          <Flex mt={2} flexDirection="column" position="relative">
            <Flex>
              {user?.photoURL ? (
                <Box
                  borderRadius="full"
                  overflow="hidden"
                  boxSize="35px"
                  mr={2}
                  mt={2}
                >
                  <AspectRatio ratio={1 / 1}>
                    <Image
                      src={user.photoURL}
                      alt="User Photo"
                      objectFit="cover"
                      boxSize="100%"
                      style={{ borderRadius: "50%" }}
                    />
                  </AspectRatio>
                </Box>
              ) : (
                <Icon as={FaUserCircle} fontSize={36} color="gray.300" mr={3} />
              )}
              <Textarea
                width="100%"
                fontSize="10pt"
                as={ResizeTextarea}
                borderRadius={4}
                disabled={replyCreateLoading}
                value={replyText}
                _focus={{
                  outline: "none",
                  bg: "white",
                  border: "1px solid black",
                }}
                onChange={(e) => setReplyText(e.target.value)}
                css={{
                  "&::-webkit-scrollbar": {
                    width: "0.4em",
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "transparent",
                  },
                }}
              />
            </Flex>
            <Flex
              position="absolute"
              left="1px"
              right={0.1}
              bottom="1px"
              justify="flex-end"
              p="6px 8px"
              borderRadius="0px 0px 4px 4px"
            >
              <Button
                color="gray.500"
                size="sm"
                variant="ghost"
                _hover={{ color: "blue.500" }}
                disabled={!replyText}
                isLoading={replyCreateLoading}
                mt={2}
                onClick={() => handleReply()}
              >
                Save
              </Button>
              <Button
                color="gray.500"
                size="sm"
                variant="ghost"
                _hover={{ color: "blue.500" }}
                mt={2}
                onClick={toggleReplyVisible}
              >
                Cancel
              </Button>
            </Flex>
          </Flex>
        )}
      </Stack>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="14pt"
            fontWeight={700}
          >
            Delete Comment
          </ModalHeader>
          <Box pl={3} pr={3}>
            <Divider />
            <ModalCloseButton _focus={{ border: "none" }} />
            <ModalBody
              display="flex"
              textAlign="center"
              fontSize="11pt"
              padding="10px 4px"
            >
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </ModalBody>
          </Box>
          <ModalFooter
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.100"
            width="100%"
            borderRadius="0px 0px 10px 10px"
            p={3}
          >
            <Button
              onClick={() => onDeleteComment(comment)}
              isLoading={isLoadingDelete}
              mr={2}
              height="30px"
              width="20%"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              height="30px"
              width="20%"
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default CommentItem;
