import React, { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, listAll, ref } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { authModalState } from "../atoms/authModalAtom";
import { Community, communityState } from "../atoms/communitiesAtom";
import { Post, PostOptions, postState, PostVote } from "../atoms/postsAtom";
import { auth, firestore, storage } from "../firebase/clientApp";
import { useRouter } from "next/router";
import { UserNotification } from "../atoms/notificationAtom";
import { useToast } from "@chakra-ui/react";

const usePosts = (communityData?: Community) => {
  const [user, loadingUser] = useAuthState(auth);
  const [postStateValue, setPostStateValue] = useRecoilState(postState);
  const setAuthModalState = useSetRecoilState(authModalState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [votingDisabled, setVotingDisabled] = useState(false);
  const router = useRouter();
  const [voteStatus, setVoteStatus] = useState(0);
  const communityStateValue = useRecoilValue(communityState);
  const toast = useToast();

  const onSelectPost = (post: Post, postIdx: number) => {
    console.log("HERE IS STUFF", post, postIdx);

    setPostStateValue((prev) => ({
      ...prev,
      selectedPost: { ...post, postIdx },
    }));
    router.push(`/tumindig/${post.communityId}/comments/${post.id}`);
  };

  const onVote = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
    // postIdx?: number
  ) => {
    event.stopPropagation();
    if (!user?.uid) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    if (votingDisabled) return; // Disable voting if it's already in progress

    setVotingDisabled(true); // Disable voting until the server response is received

    const { voteStatus } = post;
    const existingVote = postStateValue.postVotes.find(
      (vote) => vote.postId === post.id
    );

    // Update the vote for the specific post in the postVotes state
    setPostStateValue((prev) => ({
      ...prev,
      postVotes: [
        ...prev.postVotes.filter((item) => item.postId !== post.id), // Remove previous vote for the same post
        { postId: post.id, voteValue: vote }, // Add the new vote for the specific post
      ],
    }));

    const isCreatorUpvoting = user.uid === post.creatorId;

    // is this an upvote or a downvote?
    // has this user voted on this post already? was it up or down?

    try {
      let voteChange = vote;
      const batch = writeBatch(firestore);

      const updatedPost = { ...post };
      const updatedPosts = [...postStateValue.posts];
      let updatedPostVotes = [...postStateValue.postVotes];

      //New Notification
      if (!isCreatorUpvoting) {
        const postNotificationRef = doc(
          collection(firestore, "users", `${post.creatorId}/userNotification`)
        );

        const newNotification: UserNotification = {
          userDisplayText: user.displayName || user.email!.split("@")[0],
          userProfile: user.photoURL || "",
          userId: user.uid,
          triggerDocumentId: post.id,
          creatorId: post.creatorId,
          notificationType: "post",
          isRead: false,
          createdAt: serverTimestamp() as Timestamp,
          notificationId: postNotificationRef.id,
          communityId,
        };

        console.log("NEW Notification!!!", newNotification);

        batch.set(postNotificationRef, newNotification);
      }

      // New vote
      if (!existingVote) {
        const postVoteRef = doc(
          collection(firestore, "users", `${user.uid}/postVotes`)
        );

        const newVote: PostVote = {
          id: postVoteRef.id,
          postId: post.id,
          communityId,
          voteValue: vote,
        };

        console.log("NEW VOTE!!!", newVote);

        batch.set(postVoteRef, newVote);

        updatedPost.voteStatus = voteStatus + vote;
        updatedPostVotes = [...updatedPostVotes, newVote];
      }

      // Removing existing vote
      else {
        // Used for both possible cases of batch writes
        const postVoteRef = doc(
          firestore,
          "users",
          `${user.uid}/postVotes/${existingVote.id}`
        );

        // Removing vote
        if (existingVote.voteValue === vote) {
          voteChange *= -1;
          updatedPost.voteStatus = voteStatus - vote;
          updatedPostVotes = updatedPostVotes.filter(
            (vote) => vote.id !== existingVote.id
          );
          batch.delete(postVoteRef);
        }
        // Changing vote
        else {
          voteChange = 2 * vote;
          updatedPost.voteStatus = voteStatus + 2 * vote;
          const voteIdx = postStateValue.postVotes.findIndex(
            (vote) => vote.id === existingVote.id
          );
          // console.log("HERE IS VOTE INDEX", voteIdx);

          // Vote was found - findIndex returns -1 if not found
          if (voteIdx !== -1) {
            updatedPostVotes[voteIdx] = {
              ...existingVote,
              voteValue: vote,
            };
          }
          batch.update(postVoteRef, {
            voteValue: vote,
          });
        }
      }

      let updatedState = { ...postStateValue, postVotes: updatedPostVotes };

      const postIdx = postStateValue.posts.findIndex(
        (item) => item.id === post.id
      );

      // if (postIdx !== undefined) {
      updatedPosts[postIdx!] = updatedPost;
      updatedState = {
        ...updatedState,
        posts: updatedPosts,
        postsCache: {
          ...updatedState.postsCache,
          [communityId]: updatedPosts,
        },
      };
      // }

      /**
       * Optimistically update the UI
       * Used for single page view [pid]
       * since we don't have real-time listener there
       */
      if (updatedState.selectedPost) {
        updatedState = {
          ...updatedState,
          selectedPost: updatedPost,
        };
      }

      // Optimistically update the UI
      setPostStateValue(updatedState);

      // Update database
      const postRef = doc(firestore, "posts", post.id);
      batch.update(postRef, { voteStatus: voteStatus + voteChange });
      await batch.commit();
      setVotingDisabled(false); // Re-enable voting after the server response is received
    } catch (error) {
      console.log("onVote error", error);
      setVotingDisabled(false); // Re-enable voting in case of an error
    }
    setVoteStatus(voteStatus + vote);
  };

  const onDeletePost = async (post: Post): Promise<boolean> => {
    try {
      // if post has an image url, delete all files in the folder
      if (post.mediaURLs) {
        const folderRef = ref(storage, `posts/${post.id}`);
        const items = await listAll(folderRef);

        // Delete each item in the folder
        await Promise.all(items.items.map((item) => deleteObject(item)));
      }

      // delete post from posts collection
      const postDocRef = doc(firestore, "posts", post.id);
      await deleteDoc(postDocRef);

      // delete postVotes
      const postVotesQuery = query(
        collection(firestore, "users", `${user?.uid}/postVotes`),
        where("postId", "==", post.id)
      );
      const postVotesSnapshot = await getDocs(postVotesQuery);
      const batch = writeBatch(firestore);
      postVotesSnapshot.forEach((postVoteDoc) => {
        const postVoteRef = doc(
          firestore,
          "users",
          `${user?.uid}/postVotes`,
          postVoteDoc.id
        );
        batch.delete(postVoteRef);
      });
      await batch.commit();

      // delete postOptions
      const postOptionsQuery = query(
        collection(firestore, "users", `${user?.uid}/postOptions`),
        where("postId", "==", post.id)
      );
      const postOptionsSnapshot = await getDocs(postOptionsQuery);
      const postOptionsBatch = writeBatch(firestore);
      postOptionsSnapshot.forEach((postOptionsDoc) => {
        const postOptionsRef = doc(
          firestore,
          "users",
          `${user?.uid}/postOptions`,
          postOptionsDoc.id
        );
        postOptionsBatch.delete(postOptionsRef);
      });
      await postOptionsBatch.commit();

      // Update post state
      setPostStateValue((prev) => ({
        ...prev,
        posts: prev.posts.filter((item) => item.id !== post.id),
        postsCache: {
          ...prev.postsCache,
          [post.communityId]: prev.postsCache[post.communityId]?.filter(
            (item) => item.id !== post.id
          ),
        },
        postVotes: prev.postVotes.filter((vote) => vote.postId !== post.id),
        postOptions: prev.postOptions.filter(
          (option) => option.postId !== post.id
        ),
      }));

      toast({
        title: "Post Deleted",
        description: "The post has been deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      /**
       * Cloud Function will trigger on post delete
       * to delete all comments with postId === post.id
       */
      return true; // Indicate successful deletion
    } catch (error) {
      console.log("Error deleting post", error);
      toast({
        title: "Error",
        description: "Failed to delete the post.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false; // Indicate deletion failure
    }
  };

  const onHidePost = async (post: Post, communityId: string) => {
    try {
      const batch = writeBatch(firestore);
      const postRef = doc(firestore, "posts", post.id);

      // Check if the postOptions file already exists
      const postOptionsQuery = query(
        collection(firestore, `users/${user?.uid}/postOptions`),
        where("postId", "==", post.id)
      );
      const postOptionsSnapshot = await getDocs(postOptionsQuery);
      const postOptionsDoc = postOptionsSnapshot.docs[0];

      if (postOptionsDoc) {
        // If the file exists, update the isHidden property
        const postOptionsRef = doc(
          firestore,
          `users/${user?.uid}/postOptions`,
          postOptionsDoc.id
        );

        // Check if the post is already hidden
        const isAlreadyHidden = postOptionsDoc.data().isHidden;

        const postOptionsData = {
          isHidden: !isAlreadyHidden, // Toggle the isHidden property
        };
        batch.update(postOptionsRef, postOptionsData);

        // Display the appropriate toast message
        const toastMessage = isAlreadyHidden
          ? "Post unhidden successfully"
          : "Post hidden successfully";

        toast({
          title: toastMessage,
          description: `The post has been ${
            isAlreadyHidden ? "un" : ""
          }hidden.`,
          status: "success",
          duration: 3000, // The duration for which the toast will be displayed (in milliseconds)
          isClosable: true, // Whether the toast can be closed by the user
        });

        // Optimistically update the postOptions state
        setPostStateValue((prev) => {
          const updatedPostOptions = prev.postOptions.map((option) =>
            option.postId === post.id
              ? { ...option, isHidden: !isAlreadyHidden }
              : option
          );
          return { ...prev, postOptions: updatedPostOptions };
        });
      } else {
        // If the file doesn't exist, create a new file
        const postOptionsRef = doc(
          collection(firestore, `users/${user?.uid}/postOptions`)
        );
        const postOptionsData: PostOptions = {
          postId: post.id,
          isHidden: true,
          communityId,
          isSaved: false,
          isReported: false,
        };
        batch.set(postOptionsRef, postOptionsData);

        // Optimistically update the postOptions state
        setPostStateValue((prev) => {
          const updatedPostOptions = [...prev.postOptions, postOptionsData];
          return { ...prev, postOptions: updatedPostOptions };
        });

        // Display the "Post hidden successfully" toast
        toast({
          title: "Post hidden successfully",
          description: "The post has been hidden.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      // Commit the batch write
      await batch.commit();
    } catch (error) {
      console.log("Error hiding post", error);
      // Display an error toast if there's an error
      toast({
        title: "Error",
        description: "Failed to hide/unhide the post.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const onSavePost = async (post: Post, communityId: string) => {
    try {
      const batch = writeBatch(firestore);
      const postRef = doc(firestore, "posts", post.id);

      // Get the current value of isSaved
      const postSnapshot = await getDoc(postRef);
      const isSaved = postSnapshot.data()?.isSaved || false;

      // Update the isSaved property to its opposite value
      batch.update(postRef, { isSaved: !isSaved });

      // Check if the postOptions file already exists
      const postOptionsQuery = query(
        collection(firestore, `users/${user?.uid}/postOptions`),
        where("postId", "==", post.id)
      );
      const postOptionsSnapshot = await getDocs(postOptionsQuery);
      const postOptionsDoc = postOptionsSnapshot.docs[0];

      if (postOptionsDoc) {
        // If the file exists, update the isSaved property
        const postOptionsRef = doc(
          firestore,
          `users/${user?.uid}/postOptions`,
          postOptionsDoc.id
        );

        const isAlreadySaved = postOptionsDoc.data().isSaved;

        const postOptionsData = {
          isSaved: !isAlreadySaved,
        };
        batch.update(postOptionsRef, postOptionsData);

        // Display the appropriate toast message
        const toastMessage = isAlreadySaved
          ? "Post unsaved successfully"
          : "Post saved successfully";

        toast({
          title: toastMessage,
          description: `The post has been ${isAlreadySaved ? "un" : ""}saved.`,
          status: "success",
          duration: 3000, // The duration for which the toast will be displayed (in milliseconds)
          isClosable: true, // Whether the toast can be closed by the user
        });

        // Optimistically update the postOptions state
        setPostStateValue((prev) => {
          const updatedPostOptions = prev.postOptions.map((option) =>
            option.postId === post.id
              ? { ...option, isSaved: !option.isSaved }
              : option
          );
          return { ...prev, postOptions: updatedPostOptions };
        });
      } else {
        // If the file doesn't exist, create a new file
        const postOptionsRef = doc(
          collection(firestore, `users/${user?.uid}/postOptions`)
        );
        const postOptionsData: PostOptions = {
          postId: post.id,
          isHidden: false,
          communityId,
          isSaved: !isSaved,
          isReported: false,
        };
        batch.set(postOptionsRef, postOptionsData);

        // Optimistically update the postOptions state
        setPostStateValue((prev) => {
          const updatedPostOptions = [...prev.postOptions, postOptionsData];
          return { ...prev, postOptions: updatedPostOptions };
        });

        // Display the "Post hidden successfully" toast
        toast({
          title: "Post saved successfully",
          description: "The post has been saved.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      // Commit the batch write
      await batch.commit();
    } catch (error) {
      console.log("Error saving post", error);
      // Display an error toast if there's an error
      toast({
        title: "Error",
        description: "Failed to save/unsave the post.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const onReportPost = async (post: Post, communityId: string) => {
    try {
      const batch = writeBatch(firestore);
      const postRef = doc(firestore, "posts", post.id);

      // Check if the postOptions file already exists
      const postOptionsQuery = query(
        collection(firestore, `users/${user?.uid}/postOptions`),
        where("postId", "==", post.id)
      );
      const postOptionsSnapshot = await getDocs(postOptionsQuery);
      const postOptionsDoc = postOptionsSnapshot.docs[0];

      if (postOptionsDoc) {
        // If the file exists, update the isReported property
        const postOptionsRef = doc(
          firestore,
          `users/${user?.uid}/postOptions`,
          postOptionsDoc.id
        );
        const postOptionsData = {
          isReported: !postOptionsDoc.data().isReported,
        };
        batch.update(postOptionsRef, postOptionsData);

        // Optimistically update the postOptions state
        setPostStateValue((prev) => {
          const updatedPostOptions = prev.postOptions.map((option) =>
            option.postId === post.id
              ? { ...option, isReported: !option.isReported }
              : option
          );
          return { ...prev, postOptions: updatedPostOptions };
        });
      } else {
        // If the file doesn't exist, create a new file
        const postOptionsRef = doc(
          collection(firestore, `users/${user?.uid}/postOptions`)
        );
        const postOptionsData: PostOptions = {
          postId: post.id,
          isHidden: false,
          communityId,
          isSaved: false,
          isReported: true,
        };
        batch.set(postOptionsRef, postOptionsData);

        // Optimistically update the postOptions state
        setPostStateValue((prev) => {
          const updatedPostOptions = [...prev.postOptions, postOptionsData];
          return { ...prev, postOptions: updatedPostOptions };
        });

        toast({
          title: "Post Reported",
          description: "The post has been reported.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      // Commit the batch write
      await batch.commit();
    } catch (error) {
      console.log("Error reporting post", error);
      toast({
        title: "Error",
        description: "Failed to report the post.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getCommunityPostOptions = async (communityId: String) => {
    const postOptionsQuery = query(
      collection(firestore, `users/${user?.uid}/postOptions`),
      where("communityId", "==", communityId)
    );
    const postOptionsDocs = await getDocs(postOptionsQuery);
    const postOptions = postOptionsDocs.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPostStateValue((prev) => ({
      ...prev,
      postOptions: postOptions as PostOptions[],
    }));
  };

  const filterReportedOrHiddenPosts = (posts: Post[]) => {
    const filteredPosts = posts.filter((post) => {
      const postOptions = postStateValue.postOptions.find(
        (option) => option.postId === post.id
      );
      return !postOptions?.isReported && !postOptions?.isHidden;
    });
    return filteredPosts;
  };

  const filteredPosts = filterReportedOrHiddenPosts(postStateValue.posts);

  useEffect(() => {
    if (!user?.uid || !communityStateValue.currentCommunity) return;
    getCommunityPostOptions(communityStateValue.currentCommunity.id);
  }, [user, communityStateValue.currentCommunity]);

  useEffect(() => {
    // Logout or no authenticated user
    if (!user?.uid && !loadingUser) {
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: [],
        postOptions: [],
      }));
      return;
    }
  }, [user, loadingUser]);

  return {
    postStateValue,
    filteredPosts,
    setPostStateValue,
    onSelectPost,
    onDeletePost,
    onHidePost,
    onSavePost,
    onReportPost,
    loading,
    setLoading,
    onVote,
    error,
  };
};

export default usePosts;
