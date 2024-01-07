import { useEffect, useState } from "react";
import { Flex, Stack, Text, Spinner, Button, HStack } from "@chakra-ui/react";
import {
  collection,
  DocumentData,
  getDocs,
  limit,
  orderBy,
  Query,
  query,
  QuerySnapshot,
  where,
} from "firebase/firestore";
import type { NextPage } from "next";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilValue } from "recoil";
import { auth, firestore } from "../../firebase/clientApp";
import {
  Community,
  CommunitySnippet,
  communityState,
} from "../../atoms/communitiesAtom";
import { Post, PostVote, PostOptions } from "../../atoms/postsAtom";
import PersonalHome from "../../components/Community/PersonalHome";
import Recommendations from "../../components/Community/Recommendations";
import PageContentLayout from "../../components/Layout/PageContent";
import PostLoader from "../../components/Post/Loader";
import PostItem from "../../components/Post/PostItem";
import usePosts from "../../hooks/usePosts";
import { useRouter } from "next/router";
import PostEventNav from "../../components/Post/PostEventNav";

type JoinedCommunitiesHomeProps = {
  communityData: Community;
  snippets: CommunitySnippet[];
};

const Joined: NextPage<JoinedCommunitiesHomeProps> = ({ communityData }) => {
  const [user, loadingUser] = useAuthState(auth);
  const mySnippets = useRecoilValue(communityState).mySnippets;
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchPostLoading, setFetchPostLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string>("");
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
  const communityStateValue = useRecoilValue(communityState);

  const getCommunityEventPosts = async () => {
    console.log("GETTING USER HOME POSTS");

    // Check if the user has joined any communities
    if (!communityStateValue.initSnippetsFetched) return;

    try {
      let postQuery: Query<DocumentData>;

      console.log("GETTING POSTS IN USER COMMUNITIES");

      const myCommunityIds = communityStateValue.mySnippets.map(
        (snippet) => snippet.communityId
      );

      // Divide the myCommunityIds array into chunks of 10 or fewer elements
      const chunkSize = 8;
      const communityIdChunks: string[][] = [];
      for (let i = 0; i < myCommunityIds.length; i += chunkSize) {
        communityIdChunks.push(myCommunityIds.slice(i, i + chunkSize));
      }

      // Perform separate queries for each chunk and combine the results
      const postPromises: Promise<QuerySnapshot<DocumentData>>[] = [];
      for (const chunk of communityIdChunks) {
        const queryConditions = [
          where("communityId", "in", chunk),
          orderBy("createdAt", "desc"),
          orderBy("voteStatus", "desc"),
          limit(8 * currentPage),
        ];

        if (selectedCountry) {
          queryConditions.push(where("country", "==", selectedCountry));
        }

        if (selectedCountry && selectedTags) {
          queryConditions.push(
            where("country", "==", selectedCountry),
            where("postTags", "==", selectedTags)
          );
        } else if (selectedTags) {
          queryConditions.push(where("postTags", "==", selectedTags));
        }

        postPromises.push(
          getDocs(query(collection(firestore, "posts"), ...queryConditions))
        );
      }

      // Merge results from different queries
      const postDocs = await Promise.all(postPromises);
      let posts: Post[] = [];
      for (const querySnapshot of postDocs) {
        const chunkPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];
        posts.push(...chunkPosts);
      }

      console.log("USER HOME POSTS", posts);

      // Filter posts to include only those where isVolunteer is true
      const volunteerPosts = posts.filter((post) => post.isVolunteer === true);

      setPostStateValue((prev) => ({
        ...prev,
        posts: volunteerPosts, // Only volunteer posts
        // ... (other state updates)
      }));

      // Check if there are more posts to load
      const fetchedPostsLength = posts.length;
      const pageSize = 8;
      const morePostsAvailable = fetchedPostsLength === pageSize;

      // Update the 'hasMore' state based on whether there are more posts available to load
      setHasMore(morePostsAvailable);
    } catch (error: any) {
      console.log("getUserHomePosts error", error.message);
    }

    setLoading(false);
    setFetchPostLoading(false);
  };
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
    //eslint-disable-next-line
  }, [hasMore, currentPage]);

  useEffect(() => {
    setLoading(true);
    //eslint-disable-next-line
  }, [user]);

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

  const handleSelectCountry = (selectedCountry: string) => {
    setSelectedCountry(selectedCountry);
    // Call your filtering function or update state here
    // Example: setFilterCountry(selectedCountry);
  };

  const handleSelectTags = (selectedTags: string) => {
    setSelectedTags(selectedTags);
    // Call your filtering function or update state here
    // Example: setFilterEvent(selectedTags);
  };

  useEffect(() => {
    if (!communityStateValue.initSnippetsFetched) return;

    if (user) {
      getCommunityEventPosts();
    }
    //eslint-disable-next-line
  }, [
    user,
    communityStateValue.initSnippetsFetched,
    currentPage,
    selectedCountry,
    selectedTags,
  ]);

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

  // Fetch post options when the component mounts
  useEffect(() => {
    if (!user?.uid || !postStateValue.posts.length) return; // Skip if there's no user or no posts

    const getUserPostOptions = async () => {
      const postIds = postStateValue.posts.map((post) => post.id);

      // Divide the postIds array into chunks of 10 or fewer elements
      const chunkSize = 10;
      const postIdsChunks = [];
      for (let i = 0; i < postIds.length; i += chunkSize) {
        postIdsChunks.push(postIds.slice(i, i + chunkSize));
      }

      // Fetch postOptions for each chunk and combine the results
      const postOptionsPromises = postIdsChunks.map(async (chunk) => {
        const postOptionsQuery = query(
          collection(firestore, `users/${user?.uid}/postOptions`),
          where("postId", "in", chunk)
        );
        const querySnapshot = await getDocs(postOptionsQuery);
        return querySnapshot.docs.map((postOption) => ({
          id: postOption.id,
          ...postOption.data(),
        }));
      });

      try {
        const postOptionsChunks = await Promise.all(postOptionsPromises);
        const postOptions = postOptionsChunks.flat(); // Combine results from different chunks
        setPostStateValue((prev) => ({
          ...prev,
          postOptions: postOptions as PostOptions[],
        }));
      } catch (error: any) {
        console.log("getUserPostOptions error", error.message);
      }
    };

    getUserPostOptions();
    //eslint-disable-next-line
  }, [user?.uid, postStateValue.posts]);

  const filteredPosts = postStateValue.posts.filter((post) => {
    const postId = post.id;
    const postOptions = postStateValue.postOptions.find(
      (item) => item.postId === postId
    );
    const isHidden = postOptions?.isHidden;
    const isReported = postOptions?.isReported;

    // Only include the post in the filtered list if it is not hidden and not reported
    return !isHidden && !isReported;
  });

  return (
    <PageContentLayout>
      <></>
      <Stack spacing={4}>
        <Flex fontSize="11pt" color="gray.500" fontWeight={600}>
          <Text>Recent Events</Text>
        </Flex>
        {user && (
          <PostEventNav
            onSelectCountry={handleSelectCountry}
            onSelectTags={handleSelectTags}
          />
        )}
        {loading ? (
          <PostLoader />
        ) : (
          <Flex flexDirection="column">
            <Stack>
              {filteredPosts.map((post: Post, index) => (
                <>
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
                </>
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
            ) : null}
          </Flex>
        )}
      </Stack>
      <Stack spacing={5}>
        <Recommendations communityData={communityData} />
        <PersonalHome />
      </Stack>
    </PageContentLayout>
  );
};

export default Joined;
