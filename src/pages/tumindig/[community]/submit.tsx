import {
  Box,
  Button,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
  useMediaQuery,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { RiUserUnfollowFill } from "react-icons/ri";
import { useRecoilValue } from "recoil";
import {
  CommunitySnippet,
  communityState,
} from "../../../atoms/communitiesAtom";
import { defaultMenuItem } from "../../../atoms/directoryMenuAtom";
import { Post } from "../../../atoms/postsAtom";
import About from "../../../components/Community/About";
import PageContentLayout from "../../../components/Layout/PageContent";
import NewPostForm from "../../../components/Post/PostForm/NewPostForm";
import { auth } from "../../../firebase/clientApp";
import useCommunityData from "../../../hooks/useCommunityData";
import useDirectory from "../../../hooks/useDirectory";

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
  const [bannedUser, setBannedUser] = useState(false);
  const { onSelectMenuItem } = useDirectory();
  const { loading } = useCommunityData();
  const [md] = useMediaQuery("(min-width: 768px)");

  /**
   * Not sure why not working
   * Attempting to redirect user if not authenticated
   */
  useEffect(() => {
    if (!user && !loadingUser && communityStateValue.currentCommunity.id) {
      router.push(`/tumindig/${communityStateValue.currentCommunity.id}`);
    }
    //eslint-disable-next-line
  }, [user, loadingUser, communityStateValue.currentCommunity]);

  console.log("HERE IS USER", user, loadingUser);

  useEffect(() => {
    const isBanned = !!communityStateValue.bannedSnippet.find(
      (snippet) =>
        communityStateValue.currentCommunity &&
        snippet.isBanned === true &&
        snippet.userUid === user?.uid
    );

    if (isBanned) {
      setBannedUser(true);
    }
  }, [communityStateValue, user]);

  return (
    <PageContentLayout maxWidth="1060px">
      <></>
      <>
        {user && (
          <NewPostForm
            communityId={communityStateValue.currentCommunity.id}
            communityVisibility={
              communityStateValue.currentCommunity.privacyType === "restricted"
            }
            communityImageURL={communityStateValue.currentCommunity.imageURL}
            user={user}
            post={post}
          />
        )}

        <Modal
          isOpen={bannedUser}
          closeOnOverlayClick={false}
          onClose={() => setBannedUser(false)}
          size={md ? "md" : "xs"}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalBody p={6}>
              <Stack spacing={4} alignItems="center" justifyContent="center">
                <Flex
                  bg="red.500"
                  height="100px"
                  width="100px"
                  borderRadius="full"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon color="white" as={RiUserUnfollowFill} fontSize={80} />
                </Flex>
                <Text textAlign="center" fontWeight={700} fontSize="11pt">
                  {user && (user.displayName || user?.email!.split("@")[0])} has
                  been banned from {communityStateValue.currentCommunity.id}
                </Text>
                <Text textAlign="center" fontSize="10pt" color="gray.500">
                  It appears that you may have violated the community rules.
                  Please contact the community moderators or administrators for
                  more information.
                </Text>
                <Button
                  onClick={() => onSelectMenuItem(defaultMenuItem)}
                  width="100%"
                  size="md"
                  fontSize="11pt"
                >
                  Go Back
                </Button>
              </Stack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
      {communityStateValue.currentCommunity && (
        <Box width={300} marginRight={4}>
          <About
            communityData={communityStateValue.currentCommunity}
            pt={6}
            onCreatePage
            loading={loading}
            post={post}
          />
        </Box>
      )}
    </PageContentLayout>
  );
};

export default CreateCommmunityPostPage;
