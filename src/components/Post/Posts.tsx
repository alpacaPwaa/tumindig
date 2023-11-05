import React, { useEffect, useState } from "react";
import { Flex, Icon, Spinner, Stack, Text } from "@chakra-ui/react";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { Community, communityState } from "../../atoms/communitiesAtom";
import { auth, firestore } from "../../firebase/clientApp";
import PostLoader from "./Loader";
import { Post, PostVote } from "../../atoms/postsAtom";
import PostItem from "./PostItem";
import { useRouter } from "next/router";
import usePosts from "../../hooks/usePosts";
import { FaUsers } from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilValue } from "recoil";

type PostsProps = {
  communityData: Community;
  userId?: string;
  loadingUser: boolean;
};

const Posts: React.FC<PostsProps> = ({
  communityData,
  userId,
  loadingUser,
}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [fetchPostLoading, setFetchPostLoading] = useState(false);
  const [user] = useAuthState(auth);
  const communityStateValue = useRecoilValue(communityState);

  const {
    postStateValue,
    filteredPosts,
    setPostStateValue,
    onVote,
    onDeletePost,
    onHidePost,
    onSavePost,
    onReportPost,
  } = usePosts(communityData!);

  const onSelectPost = (post: Post, postIdx: number) => {
    setPostStateValue((prev) => ({
      ...prev,
      selectedPost: { ...post, postIdx },
    }));
    router.push(`/tumindig/${communityData?.id!}/comments/${post.id}`);
  };

  useEffect(() => {
    if (
      postStateValue.postsCache[communityData?.id!] &&
      !postStateValue.postUpdateRequired
    ) {
      setPostStateValue((prev) => ({
        ...prev,
        posts: postStateValue.postsCache[communityData?.id!],
      }));
      return;
    }

    getPosts();
    //eslint-disable-next-line
  }, [communityData, postStateValue.postUpdateRequired]);

  const getPosts = async () => {
    console.log("WE ARE GETTING POSTS!!!");

    try {
      const postsQuery = query(
        collection(firestore, "posts"),
        where("communityId", "==", communityData?.id!),
        orderBy("isPinned", "desc"),
        orderBy("voteStatus", "desc"),
        orderBy("createdAt", "desc"),
        limit(10 * currentPage)
      );
      const postDocs = await getDocs(postsQuery);
      const posts = postDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPostStateValue((prev) => ({
        ...prev,
        posts: posts as Post[],
        postsCache: {
          ...prev.postsCache,
          [communityData?.id!]: posts as Post[],
        },
        postUpdateRequired: false,
      }));
      setPosts(posts as Post[]);

      // Check if there are more posts to load
      const fetchedPostsLength = posts.length;
      const pageSize = 10;
      const morePostsAvailable = fetchedPostsLength === pageSize;

      // Update the 'hasMore' state based on whether there are more posts available to load
      setHasMore(morePostsAvailable);
    } catch (error: any) {
      console.log("getPosts error", error.message);
    }
    setLoading(false);
    setFetchPostLoading(false);
  };

  useEffect(() => {
    if (!hasMore || loading) return;

    const handleScroll = () => {
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
    //eslint-disable-next-line
  }, [hasMore, currentPage]);

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
    //eslint-disable-next-line
  }, [postStateValue.posts, postStateValue.selectedPost, user?.uid]);

  useEffect(() => {
    setFetchPostLoading(true);
    getPosts();
    //eslint-disable-next-line
  }, [currentPage]);

  useEffect(() => {
    setLoading(true);
    //eslint-disable-next-line
  }, []);

  console.log("HERE IS POST STATE", postStateValue);

  return (
    <>
      {loading ? (
        <PostLoader />
      ) : (
        <Stack>
          {filteredPosts.map((post: Post, index) => (
            <PostItem
              key={post.id}
              post={post}
              postIdx={index}
              onVote={onVote}
              onDeletePost={onDeletePost}
              userVoteValue={
                postStateValue.postVotes.find((item) => item.postId === post.id)
                  ?.voteValue
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
              userIsCreator={userId === post.creatorId}
              onSelectPost={onSelectPost}
              mediaURLs={[]}
              onHidePost={onHidePost}
              onSavePost={onSavePost}
              onReportPost={onReportPost}
              communityData={communityData}
            />
          ))}
        </Stack>
      )}
      {fetchPostLoading && (
        <Flex p={2} justifyContent="center" fontSize="10pt" fontWeight={800}>
          <Spinner size="sm" mr={2} />
          <Text>Loading</Text>
        </Flex>
      )}

      {posts.length === 0 ? (
        <Flex
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Icon
            color="gray.300"
            as={FaUsers}
            fontSize={200}
            border="8px solid"
            borderColor="gray.300"
            borderRadius="50%"
            mb={3}
            mt={6}
          />
          <Text color="gray.500" fontSize="15pt" fontWeight={800}>
            No Post Yet
          </Text>
          <Text color="gray.500" fontSize="11pt" fontWeight={500}>
            Start the conversation with your first post!
          </Text>
        </Flex>
      ) : null}
    </>
  );
};
export default Posts;
