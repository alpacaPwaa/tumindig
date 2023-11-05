import {
  Box,
  Divider,
  Flex,
  Icon,
  Stack,
  Text,
  Image,
  AspectRatio,
  useMediaQuery,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { communityState } from "../../../atoms/communitiesAtom";
import { auth } from "../../../firebase/clientApp";
import useDirectory from "../../../hooks/useDirectory";
import CreateCommunityModal from "../../Modal/CreateCommunity";
import { AiFillCompass } from "react-icons/ai";
import { IoPeopleCircleSharp } from "react-icons/io5";
import { TiHome } from "react-icons/ti";
import { defaultMenuItem } from "../../../atoms/directoryMenuAtom";
import { useRouter } from "next/router";
import { FaUserCircle } from "react-icons/fa";
import { MdPeopleAlt } from "react-icons/md";
import { authModalState } from "../../../atoms/authModalAtom";

type SideBarProps = { onClose?: () => void };

const SideBar: React.FC<SideBarProps> = ({ onClose }) => {
  const [user] = useAuthState(auth);
  const [open, setOpen] = useState(false);
  const mySnippets = useRecoilValue(communityState).mySnippets;
  const setAuthModalState = useSetRecoilState(authModalState);
  const { onSelectMenuItem } = useDirectory();
  const router = useRouter();
  const [md] = useMediaQuery("(min-width: 768px)");

  const goToCommunityList = () => {
    router.push(`/communities`); // Use router.push to navigate to the profile page
  };

  const goToProfile = () => {
    router.push(`/user/${user?.email?.split("@")[0]}`); // Use router.push to navigate to the profile page
  };

  const handleOpenModal = () => {
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    setOpen(true);
  };

  const handleSidebarItemClick = () => {
    if (onClose) {
      onClose(); // Close the drawer when an item is clicked
    }
  };

  return (
    <Flex
      flexDirection="column"
      bg="white"
      p={md ? 2 : 0}
      boxShadow={md ? "base" : "none"}
      width={md ? "20%" : "95%"}
      position="fixed"
      zIndex="998"
    >
      <CreateCommunityModal
        isOpen={open}
        handleClose={() => setOpen(false)}
        userId={user?.uid!}
      />
      <Box
        height="600px"
        overflowY="auto"
        bg="white"
        css={{
          "&::-webkit-scrollbar": {
            width: "0.4em",
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "transparent",
          },
        }}
      >
        <Stack spacing={1}>
          <Stack spacing={2} mb={2} mt={2}>
            {user && (
              <Flex
                alignItems="center"
                _hover={{ bg: "gray.100" }}
                backgroundColor={
                  router.pathname === "/user/[profile]" ? "gray.100" : ""
                }
                onClick={() => {
                  if (!md) {
                    // Check if it's not a medium or large screen
                    handleSidebarItemClick();
                    goToProfile();
                  }
                  goToProfile();
                }}
                cursor="pointer"
                p={2}
                mt={3}
              >
                {user?.photoURL ? (
                  <Box
                    borderRadius="full"
                    overflow="hidden"
                    boxSize="30px"
                    mr={3}
                  >
                    <AspectRatio ratio={1 / 1}>
                      <Image
                        src={user.photoURL}
                        alt="User Photo"
                        objectFit="cover"
                        boxSize="100%"
                      />
                    </AspectRatio>
                  </Box>
                ) : (
                  <Icon
                    as={FaUserCircle}
                    fontSize="30px"
                    color="gray.300"
                    mr={3}
                  />
                )}
                <Text fontWeight={700} fontSize="10pt">
                  {user?.displayName || user?.email?.split("@")[0]}
                </Text>
              </Flex>
            )}
            <Box
              as="button"
              width="100%"
              fontSize="10pt"
              fontWeight={600}
              p={2}
              _hover={{ bg: "gray.100" }}
              backgroundColor={router.pathname === "/" ? "gray.100" : ""}
              onClick={() => {
                if (!md) {
                  // Check if it's not a medium or large screen
                  handleSidebarItemClick();
                  onSelectMenuItem(defaultMenuItem);
                }
                onSelectMenuItem(defaultMenuItem);
              }}
            >
              <Flex alignItems="center">
                <Icon
                  fontSize={32}
                  mr={2}
                  as={TiHome}
                  bg="gray.200"
                  p={1}
                  borderRadius="full"
                />
                Home
              </Flex>
            </Box>
            <Box
              as="button"
              width="100%"
              fontSize="10pt"
              fontWeight={600}
              p={2}
              _hover={{ bg: "gray.100" }}
              backgroundColor={
                router.pathname === "/communities" ? "gray.100" : ""
              }
              onClick={() => {
                if (!md) {
                  // Check if it's not a medium or large screen
                  handleSidebarItemClick();
                  goToCommunityList();
                }
                goToCommunityList();
              }}
            >
              <Flex alignItems="center">
                <Icon
                  fontSize={32}
                  mr={2}
                  as={AiFillCompass}
                  bg="gray.200"
                  p="5px"
                  borderRadius="full"
                />
                Discover
              </Flex>
            </Box>
            <Box
              as="button"
              fontSize="10pt"
              fontWeight={600}
              p={2}
              _hover={{ bg: "gray.100" }}
              onClick={handleOpenModal}
              mb={1}
            >
              <Flex alignItems="center">
                <Icon
                  fontSize={32}
                  mr={2}
                  as={MdPeopleAlt}
                  bg="gray.200"
                  p="5px"
                  borderRadius="full"
                />
                Create Community
              </Flex>
            </Box>
          </Stack>
          {mySnippets.find((item) => item.isAdmin) && (
            <>
              <Divider width="95%" m="auto" />
              <Box mt={3} mb={1}>
                <Text
                  pl={3}
                  mb={1}
                  fontSize="7pt"
                  fontWeight={700}
                  color="gray.500"
                >
                  COMMUNITIES YOU MANAGE
                </Text>
                {mySnippets
                  .filter((item) => item.isAdmin)
                  .map((snippet, index) => (
                    <Flex
                      key={index}
                      position="relative"
                      align="center"
                      fontSize="10pt"
                      p={2}
                      fontWeight={600}
                      cursor="pointer"
                      _hover={{ bg: "gray.100" }}
                      onClick={() => {
                        if (!md) {
                          // Check if it's not a medium or large screen
                          handleSidebarItemClick();
                          router.push(`/tumindig/${snippet.communityId}`);
                        }
                        router.push(`/tumindig/${snippet.communityId}`);
                      }}
                    >
                      <Flex width="80%" align="center">
                        <Flex align="center" width="20%">
                          {snippet.imageURL ? (
                            <Image
                              borderRadius="md"
                              boxSize="28px"
                              src={snippet.imageURL}
                              mr={2}
                              objectFit="cover"
                              alt="Image"
                            />
                          ) : (
                            <Icon
                              as={IoPeopleCircleSharp}
                              fontSize={30}
                              color="gray.300"
                              mr={2}
                            />
                          )}
                        </Flex>
                        <Flex>
                          <Text
                            maxWidth="100%" // Adjust the maximum width as needed
                            wordBreak="break-word"
                          >
                            {snippet.communityId}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  ))}
              </Box>
            </>
          )}
          <Divider width="95%" m="auto" />
          <Box mt={3} mb={4}>
            <Text
              pl={3}
              mb={1}
              fontSize="7pt"
              fontWeight={700}
              color="gray.500"
            >
              YOUR SHORTCUTS
            </Text>
            {mySnippets.map((snippet, index) => (
              <Flex
                position="relative"
                align="center"
                fontSize="10pt"
                p={2}
                fontWeight={600}
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                onClick={() => {
                  if (!md) {
                    // Check if it's not a medium or large screen
                    handleSidebarItemClick();
                    router.push(`/tumindig/${snippet.communityId}`);
                  }
                  router.push(`/tumindig/${snippet.communityId}`);
                }}
              >
                <Flex width="80%" align="center">
                  <Flex
                    align="center"
                    width="100%"
                    onClick={() => `/tumindig/${snippet.communityId}`}
                  >
                    {snippet.imageURL ? (
                      <Image
                        borderRadius="md"
                        boxSize="28px"
                        src={snippet.imageURL}
                        mr={2}
                        objectFit="cover"
                      />
                    ) : (
                      <Icon
                        as={IoPeopleCircleSharp}
                        fontSize={30}
                        color="gray.300"
                        mr={2}
                      />
                    )}
                    <Text
                      maxWidth="100%" // Adjust the maximum width as needed
                      wordBreak="break-word"
                    >
                      {snippet.communityId}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            ))}
          </Box>
        </Stack>
      </Box>
    </Flex>
  );
};

export default SideBar;
