import { Box, Text } from "@chakra-ui/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilValue } from "recoil";
import {
  CommunitySnippet,
  communityState,
} from "../../../atoms/communitiesAtom";
import { Post } from "../../../atoms/postsAtom";
import About from "../../../components/Community/About";
import PageContentLayout from "../../../components/Layout/PageContent";
import NewPostForm from "../../../components/Post/PostForm/NewPostForm";
import { auth } from "../../../firebase/clientApp";
import useCommunityData from "../../../hooks/useCommunityData";

interface CreateCommmunityPostPageProps {
  communitySnippet: CommunitySnippet[];
  post: Post;
}

const CreateCommmunityPostPage: NextPage<CreateCommmunityPostPageProps> = ({
  communitySnippet,
  post,
}) => {
  const [user, loadingUser, error] = useAuthState(auth);
  const router = useRouter();
  const { community } = router.query;
  // const visitedCommunities = useRecoilValue(communityState).visitedCommunities;
  const communityStateValue = useRecoilValue(communityState);
  const { loading } = useCommunityData();

  /**
   * Not sure why not working
   * Attempting to redirect user if not authenticated
   */
  useEffect(() => {
    if (!user && !loadingUser && communityStateValue.currentCommunity.id) {
      router.push(`/tumindig/${communityStateValue.currentCommunity.id}`);
    }
  }, [user, loadingUser, communityStateValue.currentCommunity]);

  console.log("HERE IS USER", user, loadingUser);

  return (
    <PageContentLayout maxWidth="1060px">
      <></>
      <>
        {user && (
          <NewPostForm
            communityId={communityStateValue.currentCommunity.id}
            communityImageURL={communityStateValue.currentCommunity.imageURL}
            user={user}
          />
        )}
      </>
      {communityStateValue.currentCommunity && (
        <Box width={300} marginRight={4}>
          <About
            communityData={communityStateValue.currentCommunity}
            pt={6}
            onCreatePage
            loading={loading}
            communitySnippets={communitySnippet}
            post={post}
          />
        </Box>
      )}
    </PageContentLayout>
  );
};

export default CreateCommmunityPostPage;
