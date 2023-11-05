import {
  AspectRatio,
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Image,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
} from "@chakra-ui/react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import router from "next/router";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { IoPeopleCircleSharp } from "react-icons/io5";
import { Community } from "../../atoms/communitiesAtom";
import { auth, firestore } from "../../firebase/clientApp";
import useCommunityData from "../../hooks/useCommunityData";
import useDirectory from "../../hooks/useDirectory";

type RecommendationsProps = { communityData: Community };

const Recommendations: React.FC<RecommendationsProps> = ({ communityData }) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const { communityStateValue, loadingCommunityMap, onJoinLeaveCommunity } =
    useCommunityData();
  const { onSelectMenuItem } = useDirectory();
  const [user] = useAuthState(auth);

  const goToCommunityList = () => {
    router.push(`/communities`); // Use router.push to navigate to the profile page
  };

  const getCommunityRecommendations = async () => {
    setLoading(true);
    try {
      const communityQuery = query(
        collection(firestore, "communities"),
        orderBy("numberOfMembers", "desc"),
        limit(5)
      );
      const communityDocs = await getDocs(communityQuery);
      const communities = communityDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Community[];
      console.log("HERE ARE COMS", communities);

      setCommunities(communities);
    } catch (error: any) {
      console.log("getCommunityRecommendations error", error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    getCommunityRecommendations();
  }, []);

  return (
    <Flex
      bg="white"
      borderRadius={4}
      cursor="pointer"
      border="1px solid"
      borderColor="gray.300"
      direction="column"
    >
      <Flex direction="column" p="5px 12px 5px 12px">
        <Flex
          align="flex-end"
          fontSize="11pt"
          p={3}
          borderRadius="4px 4px 0px 0px"
          fontWeight={600}
          backgroundSize="cover"
        >
          Top Communities
        </Flex>
        <Divider />
        {loading ? (
          <Stack mt={2} p={3}>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Skeleton height="10px" width="70%" />
            </Flex>
          </Stack>
        ) : (
          <>
            {communities.map((item, index) => {
              const isJoined = !!communityStateValue.mySnippets.find(
                (snippet) => snippet.communityId === item.id
              );

              const isBanned = !!communityStateValue.bannedSnippet.find(
                (snippet) =>
                  snippet.communityId === item.id &&
                  snippet.isBanned === true &&
                  snippet.userUid === user?.uid // Add this condition to match the current user
              );

              return (
                <Link key={item.id} href={`/tumindig/${item.id}`}>
                  <Flex
                    position="relative"
                    align="center"
                    fontSize="10pt"
                    p="10px 12px"
                    fontWeight={600}
                  >
                    <Flex width="75%" align="center">
                      <Flex width="20%" align="center" justifyContent="center">
                        {item.imageURL ? (
                          <Box borderRadius="full" boxSize="32px" mr={2}>
                            <AspectRatio ratio={1 / 1}>
                              <Image
                                src={item.imageURL}
                                boxSize="100%"
                                style={{
                                  borderRadius: "50%",
                                  mask: "url(#circle-mask)",
                                }}
                                alt="Image"
                              />
                            </AspectRatio>
                          </Box>
                        ) : (
                          <Icon
                            as={IoPeopleCircleSharp}
                            fontSize={32}
                            color="gray.300"
                            mr={2}
                          />
                        )}
                      </Flex>
                      <Flex width="80%">
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >{`${item.id}`}</span>
                      </Flex>
                    </Flex>
                    <Box position="absolute" right="10px">
                      <Button
                        height="22px"
                        fontSize="8pt"
                        isLoading={!!loadingCommunityMap[item.id]}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onJoinLeaveCommunity(item, isJoined);
                        }}
                        isDisabled={isBanned}
                        variant={isJoined ? "outline" : "solid"}
                      >
                        {isBanned ? "Banned" : isJoined ? "Joined" : "Join"}
                      </Button>
                    </Box>
                  </Flex>
                </Link>
              );
            })}
          </>
        )}
      </Flex>
      <Box p="5px 12px 12px 12px">
        <Button height="30px" width="100%" onClick={goToCommunityList}>
          View All
        </Button>
      </Box>
    </Flex>
  );
};
export default Recommendations;
