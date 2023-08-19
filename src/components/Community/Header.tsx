import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Icon, Text, Image } from "@chakra-ui/react";
import { FaEyeSlash, FaGlobeAmericas, FaLock, FaUsers } from "react-icons/fa";
import { Community } from "../../atoms/communitiesAtom";
import useCommunityData from "../../hooks/useCommunityData";
import { firestore } from "../../firebase/clientApp";
import { doc, onSnapshot } from "firebase/firestore";

type HeaderProps = {
  communityData: Community;
};

const Header: React.FC<HeaderProps> = ({ communityData }) => {
  /**
   * !!!Don't pass communityData boolean until the end
   * It's a small optimization!!!
   */
  const { communityStateValue, loading, onJoinLeaveCommunity } =
    useCommunityData(!!communityData);
  const [bannerURL, setBannerURL] = useState<string | null>(
    communityData.bannerURL
  );
  const [shouldShowBanner, setShouldShowBanner] = useState<boolean>(false);
  const isJoined = !!communityStateValue.mySnippets.find(
    (item) => item.communityId === communityData.id
  );

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
    <Flex flexDirection="row">
      <Flex direction="column" width="100%" maxHeight="220px">
        {!shouldShowBanner ? (
          <Box height="75px" bg="blue.400" />
        ) : (
          <Box
            height="220px"
            bg={`url(${bannerURL})`}
            bgSize="cover"
            bgPosition="center"
          />
        )}
        <Flex justifyContent="center" bg="white" height="50%">
          <Flex width="95%" maxWidth="860px">
            {/* IMAGE URL IS ADDED AT THE VERY END BEFORE DUMMY DATA - USE ICON AT FIRST */}
            {communityStateValue.currentCommunity.imageURL ? (
              <Image
                borderRadius="full"
                boxSize="75px"
                src={communityStateValue.currentCommunity.imageURL}
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
                <Text fontWeight={800} fontSize="16pt">
                  {communityData.id}
                </Text>
                <Flex flexDirection="row" align="center">
                  <Flex fontSize="11pt" color="gray.500" align="center">
                    {communityData.privacyType === "public" && (
                      <>
                        <Icon
                          as={FaGlobeAmericas}
                          color="gray.500"
                          fontSize={13}
                          mr={1}
                        />
                        <Text fontSize="10pt">Public Community</Text>
                      </>
                    )}
                    {communityData.privacyType === "restricted" && (
                      <>
                        <Icon
                          as={FaEyeSlash}
                          color="gray.500"
                          fontSize={13}
                          mr={1}
                        />
                        <Text fontSize="10pt">Restricted Community</Text>
                      </>
                    )}
                    {communityData.privacyType === "private" && (
                      <>
                        <Icon
                          as={FaLock}
                          color="gray.500"
                          fontSize={13}
                          mr={1}
                        />
                        <Text fontSize="10pt">Private Community</Text>
                      </>
                    )}
                  </Flex>
                  <Text color="gray.500" mx={1}>
                    &middot;
                  </Text>
                  <Text color="gray.500" fontSize="10pt" fontWeight={600}>
                    {communityData.numberOfMembers} Members
                  </Text>
                </Flex>
              </Flex>
              <Flex>
                <Button
                  variant={isJoined ? "outline" : "solid"}
                  height="30px"
                  pr={6}
                  pl={6}
                  onClick={() => onJoinLeaveCommunity(communityData, isJoined)}
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
  );
};
export default Header;
