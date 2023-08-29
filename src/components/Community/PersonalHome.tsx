import React, { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import CreateCommunityModal from "../Modal/CreateCommunity";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/clientApp";
import {
  Community,
  CommunitySnippet,
  communityState,
} from "../../atoms/communitiesAtom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import MenuListPost from "../Navbar/Directory/MenuListPost";
import { IoPeopleCircleSharp } from "react-icons/io5";
import { MdGroupOff } from "react-icons/md";
import { authModalState } from "../../atoms/authModalAtom";

const PersonalHome: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [user] = useAuthState(auth);
  const [openPostModal, setOpenPostModal] = useState(false);
  const mySnippets = useRecoilValue(communityState).mySnippets;
  const setAuthModalState = useSetRecoilState(authModalState);

  const handleOpenPostModal = () => {
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    setOpenPostModal(true);
  };

  const handlecloseModal = () => {
    setOpenPostModal(false);
  };

  const handleOpenModal = () => {
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    setOpen(true);
  };

  return (
    <>
      <CreateCommunityModal
        isOpen={open}
        handleClose={() => setOpen(false)}
        userId={user?.uid!}
      />
      <Flex
        direction="column"
        p="5px 12px 12px 12px"
        bg="white"
        borderRadius={4}
        cursor="pointer"
        border="1px solid"
        borderColor="gray.300"
        position="sticky"
      >
        <Flex direction="column">
          <Flex p={3} borderRadius="4px 4px 0px 0px">
            <Text fontWeight={600} fontSize="11pt">
              Home
            </Text>
          </Flex>
          <Divider />
          <Stack spacing={2} mt={3}>
            <Text fontSize="9pt">
              Welcome to the Tumindig Personal Home Page
            </Text>
            <Button size="sm" fontSize="10pt" onClick={handleOpenPostModal}>
              Create Post
            </Button>
            <Button
              variant="outline"
              size="sm"
              fontSize="10pt"
              onClick={handleOpenModal}
            >
              Create Community
            </Button>
          </Stack>
        </Flex>
      </Flex>

      <Modal isOpen={openPostModal} onClose={handlecloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="11pt">Choose Community</ModalHeader>
          <Box pr={3} pl={3} maxHeight="400px" overflowY="auto">
            <Divider />
            <ModalCloseButton _focus={{ border: "none" }} />
            <ModalBody>
              {mySnippets.length === 0 ? (
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  direction="column"
                  p={4}
                >
                  <Icon
                    fontSize="70pt"
                    as={MdGroupOff}
                    color="gray.300"
                    mb={2}
                  />
                  <Text fontWeight={600} fontSize="17pt" color="gray.300">
                    No Communities Yet
                  </Text>
                </Flex>
              ) : (
                mySnippets.map((snippet, index) => (
                  <Flex
                    flexDirection="row"
                    alignItems="center"
                    fontSize="10pt"
                    fontWeight={600}
                  >
                    <Flex width="10%">
                      <Text mr={2}>{index + 1}</Text>
                    </Flex>
                    <MenuListPost
                      key={index}
                      icon={IoPeopleCircleSharp}
                      displayText={`${snippet.communityId}`}
                      link={`/tumindig/${snippet.communityId}/submit`}
                      iconColor="gray.300"
                      imageURL={snippet.imageURL}
                    />
                  </Flex>
                ))
              )}
            </ModalBody>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PersonalHome;
