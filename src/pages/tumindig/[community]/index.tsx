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
import CommunitySponsor from "../../../components/Community/CommunitySponsor";

interface CommunityPageProps {
  post: Post;
  communityData: Community;
  communutySnippet: CommunitySnippet[];
}

const CommunityPage: NextPage<CommunityPageProps> = ({
  communityData,
  communutySnippet,
  post,
}) => {
  const [user, loadingUser] = useAuthState(auth);

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
  }, [communityData]);

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
          {communityData.communityCategory != "Sponsor" && (
            <CommunitySponsor communityData={communityData} />
          )}
          <Posts
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
            communitySnippets={communutySnippet}
            post={post}
          />
        </>
      </PageContentLayout>
    </>
  );
};

export default CommunityPage;

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
