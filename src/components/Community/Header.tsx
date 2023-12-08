import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  Image,
  useMediaQuery,
  HStack,
} from "@chakra-ui/react";
import { FaEyeSlash, FaGlobeAmericas, FaLock, FaUsers } from "react-icons/fa";
import { Community, communityState } from "../../atoms/communitiesAtom";
import useCommunityData from "../../hooks/useCommunityData";
import { firestore } from "../../firebase/clientApp";
import { doc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";

type HeaderProps = {
  communityData: Community;
};

const Header: React.FC<HeaderProps> = ({ communityData }) => {
  /**
   * !!!Don't pass communityData boolean until the end
   * It's a small optimization!!!
   */
  const { loading, onJoinLeaveCommunity } = useCommunityData(!!communityData);
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState);
  const [bannerURL, setBannerURL] = useState<string | null>(
    communityData.bannerURL
  );
  const [shouldShowBanner, setShouldShowBanner] = useState<boolean>(false);
  const isJoined = !!communityStateValue.mySnippets.find(
    (item) => item.communityId === communityData.id
  );
  const [md] = useMediaQuery("(min-width: 768px)");
  const router = useRouter();

  const goToCommunity = () => {
    router.push(`/tumindig/${communityData.id}`); // Use router.push to navigate to the profile page
  };

  const goToAboutPage = () => {
    router.push(`/tumindig/${communityData.id}/about`); // Use router.push to navigate to the profile page
  };

  const goToEventPage = () => {
    router.push(`/tumindig/${communityData.id}/events`); // Use router.push to navigate to the profile page
  };

  // Replace the existing useEffect with this one
  useEffect(() => {
    const communityDocRef = doc(firestore, "communities", communityData.id);
    const unsubscribe = onSnapshot(communityDocRef, (snapshot) => {
      const updatedBannerURL = snapshot.data()?.bannerURL || null;

      // Update the bannerURL state
      setBannerURL(updatedBannerURL);

      // Set shouldShowBanner to true if a new bannerURL is available
      if (updatedBannerURL) {
        setShouldShowBanner(true);
      }
    });

    return () => unsubscribe();
  }, [communityData.id]);

  return (
    <Flex bgColor="white" flexDirection="column">
      <Flex flexDirection="row">
        <Flex direction="column" width="100%" maxHeight="300px">
          {!shouldShowBanner ? (
            <Box height="75px" bg="blue.400" />
          ) : (
            <Box
              height="300px"
              bg={`url(${bannerURL})`}
              bgSize="cover"
              bgPosition="center"
            />
          )}
          <Flex justifyContent="center" bg="white" height="50%">
            <Flex width="95%" maxWidth="860px">
              {/* IMAGE URL IS ADDED AT THE VERY END BEFORE DUMMY DATA - USE ICON AT FIRST */}
              {communityData.imageURL ? (
                <Image
                  borderRadius="full"
                  boxSize="75px"
                  src={communityData.imageURL}
                  alt="Dan Abramov"
                  position="relative"
                  top={-3}
                  color="blue.500"
                  border="4px solid white"
                  objectFit="cover"
                />
              ) : (
                <Icon
                  as={FaUsers}
                  fontSize={75}
                  position="relative"
                  top={-3}
                  color="white"
                  border="4px solid white"
                  borderRadius="50%"
                  backgroundColor="gray.300"
                />
              )}
              <Flex padding="10px 16px">
                <Flex direction="column" mr={6}>
                  <Text
                    fontWeight={800}
                    fontSize={md ? "16pt" : "10pt"}
                    maxWidth={md ? "80%" : "100%"} // Adjust the maximum width as needed
                    wordBreak="break-word"
                  >
                    {communityData.id}
                  </Text>
                  <Flex flexDirection="row" alignItems="center">
                    <Flex
                      color="gray.500"
                      justifyContent="center"
                      alignItems="center"
                    >
                      {communityData.privacyType === "public" && (
                        <>
                          {md ? (
                            <>
                              <Icon
                                as={FaGlobeAmericas}
                                color="gray.500"
                                fontSize={13}
                                mr={1}
                              />
                              <Text fontSize="10pt">Public Community</Text>
                            </>
                          ) : (
                            <Text fontSize="10pt">Public</Text>
                          )}
                        </>
                      )}
                      {communityData.privacyType === "restricted" && (
                        <>
                          {md ? (
                            <>
                              <Icon
                                as={FaEyeSlash}
                                color="gray.500"
                                fontSize={13}
                                mr={1}
                              />
                              <Text fontSize="10pt">Restricted Community</Text>
                            </>
                          ) : (
                            <Text fontSize="10pt">Restricted</Text>
                          )}
                        </>
                      )}
                      {communityData.privacyType === "private" && (
                        <>
                          {md ? (
                            <>
                              <Icon
                                as={FaLock}
                                color="gray.500"
                                fontSize={13}
                                mr={1}
                              />
                              <Text fontSize="10pt">Private Community</Text>
                            </>
                          ) : (
                            <Text fontSize="10pt">Private</Text>
                          )}
                        </>
                      )}
                    </Flex>
                    <Text color="gray.500" mx={1}>
                      &middot;
                    </Text>
                    <Text color="gray.500" fontSize="10pt" fontWeight={600}>
                      {communityData.numberOfMembers} members
                    </Text>
                  </Flex>
                </Flex>
                <Flex>
                  <Button
                    variant={isJoined ? "outline" : "solid"}
                    height="30px"
                    pr={6}
                    pl={6}
                    onClick={() =>
                      onJoinLeaveCommunity(communityData, isJoined)
                    }
                    isLoading={loading}
                  >
                    {isJoined ? "Joined" : "Join"}
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <HStack
        spacing={9}
        p="0px 10px 0px 10px"
        justifyContent={md ? "" : "center"}
        ml={md ? "100px" : ""}
        fontSize="11pt"
        fontWeight={700}
      >
        <Text
          onClick={goToCommunity}
          _hover={{
            cursor: "pointer",
            color: "blue.500",
          }}
          color={
            router.pathname === "/tumindig/[community]"
              ? "blue.500"
              : "gray.500"
          }
          borderBottom={
            router.pathname === "/tumindig/[community]" ? "2px" : "none"
          }
          pb={1}
        >
          Post
        </Text>
        <Text
          onClick={goToEventPage}
          _hover={{
            cursor: "pointer",
            color: "blue.500",
          }}
          color={router.pathname.includes("events") ? "blue.500" : "gray.500"}
          borderBottom={router.pathname.includes("events") ? "2px" : "none"}
          pb={1}
        >
          Events
        </Text>
        {!md && (
          <Text
            onClick={goToAboutPage}
            _hover={{
              cursor: "pointer",
              color: "blue.500",
            }}
            color={router.pathname.includes("about") ? "blue.500" : "gray.500"}
            borderBottom={router.pathname.includes("about") ? "2px" : "none"}
            pb={1}
          >
            About
          </Text>
        )}
      </HStack>
    </Flex>
  );
};
export default Header;
