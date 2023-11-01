import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import { useRecoilValue } from "recoil";
import {
  CommunitySnippet,
  communityState,
} from "../../../atoms/communitiesAtom";
import { Post } from "../../../atoms/postsAtom";
import About from "../../../components/Community/About";
import Header from "../../../components/Community/Header";
import PageContentLayout from "../../../components/Layout/PageContent";
import useCommunityData from "../../../hooks/useCommunityData";

type aboutProps = { communitySnippet: CommunitySnippet[]; post: Post };

const about: React.FC<aboutProps> = ({ communitySnippet, post }) => {
  const communityStateValue = useRecoilValue(communityState);
  const { loading } = useCommunityData();

  return (
    <>
      <PageContentLayout>
        <>
          {communityStateValue.currentCommunity && (
            <Header communityData={communityStateValue.currentCommunity} />
          )}
        </>
        <Flex justifyContent="center">
          {communityStateValue.currentCommunity && (
            <Box width="100%">
              <About
                communityData={communityStateValue.currentCommunity}
                pt={6}
                onCreatePage
                loading={loading}
                post={post}
              />
            </Box>
          )}
        </Flex>
        <></>
      </PageContentLayout>
    </>
  );
};
export default about;
