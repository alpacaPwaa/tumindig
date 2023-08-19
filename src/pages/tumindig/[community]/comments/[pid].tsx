import React, { useEffect } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { Post, PostVote } from "../../../../atoms/postsAtom";
import About from "../../../../components/Community/About";
import PageContentLayout from "../../../../components/Layout/PageContent";
import Comments from "../../../../components/Post/Comments";
import PostLoader from "../../../../components/Post/Loader";
import PostItem from "../../../../components/Post/PostItem";
import { auth, firestore } from "../../../../firebase/clientApp";
import useCommunityData from "../../../../hooks/useCommunityData";
import usePosts from "../../../../hooks/usePosts";
import { CommunitySnippet } from "../../../../atoms/communitiesAtom";

type PostPageProps = {
  post: Post;
  communitySnippets: CommunitySnippet[];
};

const PostPage: React.FC<PostPageProps> = ({ post, communitySnippets }) => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const { community, pid } = router.query;
  const { communityStateValue } = useCommunityData();

  // Need to pass community data here to see if current post [pid] has been voted on
  const {
    postStateValue,
    setPostStateValue,
    onDeletePost,
    setLoading,
    onVote,
    onHidePost,
    onSavePost,
    onReportPost,
    loading,
  } = usePosts(communityStateValue.currentCommunity);

  const fetchPost = async () => {
    console.log("FETCHING POST");

    setLoading(true);
    try {
      const postDocRef = doc(firestore, "posts", pid as string);
      const postDoc = await getDoc(postDocRef);
      setPostStateValue((prev) => ({
        ...prev,
        selectedPost: { id: postDoc.id, ...postDoc.data() } as Post,
      }));
    } catch (error: any) {
      console.log("fetchPost error", error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    const { pid } = router.query;

    if (pid && !postStateValue.selectedPost) {
      fetchPost();
    }
  }, [router.query, postStateValue.selectedPost]);

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

  // Fetch votes for the specific post that the user voted on
  const fetchVotesForPost = async (postId: string) => {
    try {
      const postVotes = await getUserPostVotes(postId);
      setPostStateValue((prev) => ({
        ...prev,
        postVotes: [
          ...prev.postVotes.filter((item) => item.postId !== postId),
          ...(postVotes as PostVote[]),
        ],
      }));
    } catch (error: any) {
      console.log("getUserPostVotes error", error.message);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    // Fetch votes for the specific post that the user voted on
    const votedPostId = pid as string; // Use the pid from router.query directly
    if (votedPostId) {
      fetchVotesForPost(votedPostId);
    }
  }, [pid, user?.uid]);

  return (
    <PageContentLayout>
      <></>
      {/* Left Content */}
      <>
        {loading ? (
          <PostLoader />
        ) : (
          <>
            {postStateValue.selectedPost && (
              <>
                <PostItem
                  post={postStateValue.selectedPost}
                  onHidePost={onHidePost}
                  onSavePost={onSavePost}
                  onReportPost={onReportPost}
                  onVote={onVote}
                  onDeletePost={onDeletePost}
                  userVoteValue={
                    postStateValue.postVotes.find(
                      (item) => item.postId === postStateValue.selectedPost!.id
                    )?.voteValue
                  }
                  hidePost={
                    postStateValue.postOptions.find(
                      (item) => item.postId === postStateValue.selectedPost!.id
                    )?.isHidden
                  }
                  savePost={
                    postStateValue.postOptions.find(
                      (item) => item.postId === postStateValue.selectedPost!.id
                    )?.isSaved
                  }
                  reportPost={
                    postStateValue.postOptions.find(
                      (item) => item.postId === postStateValue.selectedPost!.id
                    )?.isReported
                  }
                  userIsCreator={
                    user?.uid === postStateValue.selectedPost.creatorId
                  }
                  router={router}
                  mediaURLs={[]}
                  communityData={communityStateValue.currentCommunity} // Add communityData prop
                />
                <Comments
                  community={community as string}
                  selectedPost={postStateValue.selectedPost}
                />
              </>
            )}
          </>
        )}
      </>
      {/* Right Content */}
      <>
        <About
          communityData={
            communityStateValue.currentCommunity
            // communityStateValue.visitedCommunities[community as string]
          }
          loading={loading}
          post={post}
          communitySnippets={communitySnippets}
        />
      </>
    </PageContentLayout>
  );
};
export default PostPage;
