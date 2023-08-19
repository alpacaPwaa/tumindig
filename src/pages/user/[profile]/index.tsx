import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import PageContentLayout from "../../../components/Layout/PageContent";
import { auth, firestore } from "../../../firebase/clientApp";
import ProfilePage from "../../../components/Profile/ProfilePage";
import { NextPage } from "next";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import usePosts from "../../../hooks/usePosts";
import { Community } from "../../../atoms/communitiesAtom";
import { Flex, Stack, Spinner, Text, Icon } from "@chakra-ui/react";
import { Post, PostVote } from "../../../atoms/postsAtom";
import PostLoader from "../../../components/Post/Loader";
import PostItem from "../../../components/Post/PostItem";
import ProfileNav from "../../../components/Profile/ProfileNav";
import { AiOutlineFolderOpen } from "react-icons/ai";

type ProfileProps = { profile: string; communityData: Community };

const Profile: NextPage<ProfileProps> = ({ communityData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchPostLoading, setFetchPostLoading] = useState(false);
  const {
    postStateValue,
    onHidePost,
    onSavePost,
    onReportPost,
    setPostStateValue,
    onVote,
    onSelectPost,
    onDeletePost,
    loading,
    setLoading,
  } = usePosts();
  const [user] = useAuthState(auth);

  const getUserPosts = async () => {
    console.log("GETTING NO USER FEED");

    try {
      const postQuery = query(
        collection(firestore, "posts"),
        orderBy("createdAt", "desc"),
        limit(8 * currentPage)
      );
      const postDocs = await getDocs(postQuery);
      const posts = postDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("NO USER FEED", posts);

      setPostStateValue((prev) => ({
        ...prev,
        posts: posts as Post[],
      }));

      // Check if there are more posts to load
      const fetchedPostsLength = posts.length;
      const pageSize = 8;
      const morePostsAvailable = fetchedPostsLength === pageSize;

      // Update the 'hasMore' state based on whether there are more posts available to load
      setHasMore(morePostsAvailable);
    } catch (error: any) {
      console.log("getNoUserHomePosts error", error.message);
    }
    setLoading(false);
    setFetchPostLoading(false);
  };

  const getUserPostVotes = async (postId: string) => {
    if (!user?.uid || !postId) return [];

    try {
      // Fetch the vote for the specific post using its postId
      const postVotesQuery = query(
        collection(firestore, `users/${user?.uid}/postVotes`),
        where("postId", "==", postId)
      );
      const querySnapshot = await getDocs(postVotesQuery);
      const postVotes = querySnapshot.docs.map((postVote) => {
        const data = postVote.data();
        // Check if the data has postId and voteValue properties
        if (data.postId && data.voteValue) {
          return {
            id: postVote.id,
            ...data,
          };
        }
        // Otherwise, it's a partial object with only the id property
        return { id: postVote.id };
      });

      return postVotes;
    } catch (error: any) {
      console.log("getUserPostVotes error", error.message);
      return [];
    }
  };

  useEffect(() => {
    if (!user?.uid) return; // If the user is not authenticated, return early

    // Function to fetch votes for a specific post by postId
    const fetchVotesForPost = async (postId: string) => {
      try {
        const postVotes = await getUserPostVotes(postId);
        setPostStateValue((prev) => ({
          ...prev,
          postVotes: [
            ...prev.postVotes.filter((item) => item.postId !== postId), // Remove previous vote for the same post
            ...(postVotes as PostVote[]), // Add the fetched vote for the specific post
          ],
        }));
      } catch (error: any) {
        console.log("getUserPostVotes error", error.message);
      }
    };

    // Fetch votes for each post and get an array of promises
    const fetchVotesPromises = postStateValue.posts.map((post) =>
      fetchVotesForPost(post.id)
    );

    // Wait for all the promises to resolve
    Promise.all(fetchVotesPromises).then(() => {
      // After fetching votes for all posts, fetch votes for the specific post that the user voted on
      const votedPostId = postStateValue.selectedPost?.id; // Get the postId of the voted post
      if (votedPostId) {
        fetchVotesForPost(votedPostId); // Fetch votes only for the voted post
      }
    });
  }, [postStateValue.posts, postStateValue.selectedPost, user?.uid]);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loading) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;
      const scrollThreshold = 0.8;

      if (
        scrollPosition >= scrollThreshold * pageHeight &&
        hasMore &&
        !loading
      ) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, currentPage]);

  useEffect(() => {
    getUserPosts();
  }, [user, currentPage]);

  useEffect(() => {
    setLoading(true);
  }, [user]);

  return (
    <PageContentLayout>
      <>
        <ProfileNav />
      </>
      <>
        <>
          {loading ? (
            <PostLoader />
          ) : (
            <Flex flexDirection="column">
              <Stack>
                {postStateValue.posts
                  .filter((post) => user?.uid === post.creatorId)
                  .map((post: Post, index) => (
                    <PostItem
                      key={post.id}
                      post={post}
                      postIdx={index}
                      onVote={onVote}
                      onDeletePost={onDeletePost}
                      userVoteValue={
                        postStateValue.postVotes.find(
                          (item) => item.postId === post.id
                        )?.voteValue
                      }
                      hidePost={
                        postStateValue.postOptions.find(
                          (item) => item.postId === post.id
                        )?.isHidden
                      }
                      savePost={
                        postStateValue.postOptions.find(
                          (item) => item.postId === post.id
                        )?.isSaved
                      }
                      reportPost={
                        postStateValue.postOptions.find(
                          (item) => item.postId === post.id
                        )?.isReported
                      }
                      userIsCreator={user?.uid === post.creatorId}
                      onSelectPost={onSelectPost}
                      homePage
                      mediaURLs={[]}
                      onHidePost={onHidePost}
                      onSavePost={onSavePost}
                      onReportPost={onReportPost}
                      communityData={communityData}
                    />
                  ))}
              </Stack>
              {fetchPostLoading ? (
                <Flex
                  p={2}
                  justifyContent="center"
                  fontSize="10pt"
                  fontWeight={800}
                >
                  <Spinner size="sm" mr={2} />
                  <Text>Loading</Text>
                </Flex>
              ) : postStateValue.posts.length === 0 ? (
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  flexDirection="column"
                >
                  <Icon
                    color="gray.300"
                    as={AiOutlineFolderOpen}
                    fontSize={200}
                    mt={6}
                  />
                  <Text color="gray.500" fontSize="15pt" fontWeight={800}>
                    No Post Yet
                  </Text>
                  <Text color="gray.500" fontSize="11pt" fontWeight={500}>
                    All your post will appear here.
                  </Text>
                </Flex>
              ) : null}
            </Flex>
          )}
        </>
      </>
      <>
        <ProfilePage />
      </>
    </PageContentLayout>
  );
};

export default Profile;
