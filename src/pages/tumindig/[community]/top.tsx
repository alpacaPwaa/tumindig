import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState } from "recoil";
import safeJsonStringify from "safe-json-stringify";
import {
  Community,
  CommunitySnippet,
  communityState,
} from "../../../atoms/communitiesAtom";
import About from "../../../components/Community/About";
import CommunityNotFound from "../../../components/Community/CommunityNotFound";
import CreatePostLink from "../../../components/Community/CreatePostLink";
import Header from "../../../components/Community/Header";
import PageContentLayout from "../../../components/Layout/PageContent";
import Posts from "../../../components/Post/Posts";
import { auth, firestore } from "../../../firebase/clientApp";
import { Post } from "../../../atoms/postsAtom";
import { useRouter } from "next/router";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  Button,
  Stack,
  Icon,
  Box,
  Flex,
  useMediaQuery,
} from "@chakra-ui/react";
import { FaUserAltSlash } from "react-icons/fa";
import { RiUserUnfollowFill } from "react-icons/ri";
import useDirectory from "../../../hooks/useDirectory";
import { defaultMenuItem } from "../../../atoms/directoryMenuAtom";
import TopPosts from "../../../components/Post/TopPost";
import NewTopPostLink from "../../../components/Community/NewTopPostLink";

interface CommunityTopPageProps {
  post: Post;
  communityData: Community;
  communutySnippet: CommunitySnippet[];
}

const CommunityTopPage: NextPage<CommunityTopPageProps> = ({
  communityData,
  communutySnippet,
  post,
}) => {
  const [user, loadingUser] = useAuthState(auth);
  const [bannedUser, setBannedUser] = useState(false);
  const { onSelectMenuItem } = useDirectory();
  const [md] = useMediaQuery("(min-width: 768px)");

  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState);
  // State to keep track of the selected community ID
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(
    null
  );
  const router = useRouter();
  const { community } = router.query;

  // Update the selectedCommunityId state whenever the community ID changes
  useEffect(() => {
    setSelectedCommunityId(community as string);
  }, [community]);

  useEffect(() => {
    setCommunityStateValue((prev) => ({
      ...prev,
      currentCommunity: communityData,
    }));
    //eslint-disable-next-line
  }, [communityData]);

  useEffect(() => {
    const isBanned = !!communityStateValue.bannedSnippet.find(
      (snippet) =>
        snippet.communityId === communityData.id &&
        snippet.isBanned === true &&
        snippet.userUid === user?.uid
    );

    if (isBanned) {
      setBannedUser(true);
    }
    //eslint-disable-next-line
  }, [communityStateValue, user]);

  // Community was not found in the database
  if (!communityData) {
    return <CommunityNotFound />;
  }

  return (
    <>
      <PageContentLayout>
        <>
          <Header
            communityData={communityData}
            key={selectedCommunityId} // Add a unique key to force the component to re-mount when the community changes
          />
        </>
        {/* Left Content */}
        <>
          <CreatePostLink />
          <NewTopPostLink />
          {/* {communityData.communityCategory != "Sponsor" && (
            <CommunitySponsor communityData={communityData} />
          )} */}
          <TopPosts
            key={selectedCommunityId}
            communityData={communityData}
            userId={user?.uid}
            loadingUser={loadingUser}
          />
        </>
        {/* Right Content */}
        <>
          <About
            key={selectedCommunityId}
            communityData={communityData}
            post={post}
          />
        </>
      </PageContentLayout>

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
                been banned from {communityData.id}
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
  );
};

export default CommunityTopPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  console.log("GET SERVER SIDE PROPS RUNNING");

  try {
    const communityDocRef = doc(
      firestore,
      "communities",
      context.query.community as string
    );
    const communityDoc = await getDoc(communityDocRef);
    return {
      props: {
        communityData: communityDoc.exists()
          ? JSON.parse(
              safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() }) // needed for dates
            )
          : "",
      },
    };
  } catch (error) {
    // Could create error page here
    console.log("getServerSideProps error - [community]", error);
  }
}
