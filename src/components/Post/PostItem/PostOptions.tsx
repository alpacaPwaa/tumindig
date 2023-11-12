import {
  Flex,
  Menu,
  MenuButton,
  Button,
  Icon,
  MenuList,
  MenuItem,
  Divider,
  Text,
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useMediaQuery,
} from "@chakra-ui/react";
import { doc, updateDoc } from "firebase/firestore";
import router from "next/router";
import React, { useCallback, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { AiOutlineDelete } from "react-icons/ai";
import { BiHide } from "react-icons/bi";
import {
  BsBookmarkCheck,
  BsBookmark,
  BsFillPinAngleFill,
} from "react-icons/bs";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { RiEditLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { TbMessageReport, TbTrashX } from "react-icons/tb";
import { useRecoilState } from "recoil";
import { Community, communityState } from "../../../atoms/communitiesAtom";
import { Post, postState } from "../../../atoms/postsAtom";
import { auth, firestore } from "../../../firebase/clientApp";

type PostOptionsProps = {
  post: Post;
  communityData: Community;
  onHidePost: (post: Post, communityId: string) => Promise<void>;
  onSavePost: (post: Post, communityId: string) => Promise<void>;
  onReportPost: (post: Post, communityId: string) => Promise<void>;
  onDeletePost: (post: Post) => Promise<boolean>;
  editMode: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onSelectPost?: (value: Post, postIdx: number) => void;
  hidePost?: boolean;
  savePost?: boolean;
  reportPost?: boolean;
  userIsCreator: boolean;
};

const PostOptions: React.FC<PostOptionsProps> = ({
  post,
  communityData,
  userIsCreator,
  onSelectPost,
  onHidePost,
  hidePost,
  onSavePost,
  savePost,
  onReportPost,
  reportPost,
  onDeletePost,
  editMode,
}) => {
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [communityStateValue] = useRecoilState(communityState);
  const [user] = useAuthState(auth);
  const [removePostModalOpen, setRemovePostModalOplen] = useState(false);
  const singlePostView = !onSelectPost; // function not passed to [pid]
  const [md] = useMediaQuery("(min-width: 768px)");

  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setShowDeleteConfirmationModal(true);
  };

  const handleDeletePostConfirmation = async () => {
    try {
      setLoadingDelete(true); // Set loading to true before starting the deletion process

      const success = await onDeletePost(post);
      if (!success) throw new Error("Failed to delete post");
      console.log("Post successfully deleted");
    } catch (error: any) {
      console.log("Error deleting post", error.message);
    } finally {
      setLoadingDelete(false); // Set loading to false after the deletion process (whether success or error)
      setShowDeleteConfirmationModal(false); // Close the confirmation modal
    }
  };

  const handleRemovePostModal = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setRemovePostModalOplen(true);
  };

  const handleCancelRemovePostModal = () => {
    setRemovePostModalOplen(false);
  };

  const handleHidePost = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    try {
      await onHidePost(post, post.communityId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSavePost = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    try {
      await onSavePost(post, post.communityId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReportPostModal = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setIsReportModalOpen(true);
  };

  const handleCancelReportModal = () => {
    setIsReportModalOpen(false);
  };

  const handleConfirmReportModal = async () => {
    try {
      setReportLoading(true); // Set loading to true before starting the reporting process
      await onReportPost(post, post.communityId);
      console.log("Post reported successfully");
      setIsReportModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setReportLoading(false); // Set loading to false after the reporting process (whether success or error)
    }
  };

  const isUserModerator = !!communityStateValue.moderatorSnippets.find(
    (snippet) =>
      snippet.communityId === communityData?.id &&
      snippet.isModerator === true &&
      snippet.userUid === user?.uid
  );

  return (
    <>
      <Flex align="center">
        <Menu closeOnSelect={false}>
          {user && (
            <MenuButton
              as={Button}
              variant="ghost"
              size="sm"
              borderRadius="full"
              position="relative"
              ml="auto"
              onClick={(event) => event.stopPropagation()}
            >
              <Flex align="center" justify="center">
                <Icon
                  as={HiOutlineDotsHorizontal}
                  fontSize="20px"
                  position="absolute"
                  color="gray.500"
                />
              </Flex>
            </MenuButton>
          )}
          <MenuList>
            <MenuItem
              onClick={handleSavePost}
              color={savePost ? "blue.500" : ""}
            >
              <Icon
                as={savePost ? BsBookmarkCheck : BsBookmark}
                fontSize="20px"
              />
              <Text fontSize="10pt" pl={1} fontWeight={600}>
                {savePost ? "Saved" : "Save"}
              </Text>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={handleHidePost}
              color={hidePost ? "blue.500" : ""}
            >
              <Icon as={BiHide} fontSize="20px" />
              <Text fontSize="10pt" pl={1} fontWeight={600}>
                {hidePost ? "Hidden" : "Hide"}
              </Text>
            </MenuItem>
            {userIsCreator && (
              <>
                <Divider />
                <MenuItem onClick={handleDelete}>
                  <Flex justifyContent="center" justifyItems="center">
                    <Icon as={AiOutlineDelete} fontSize="20px" />
                    <Text fontSize="10pt" pl={1} fontWeight={600}>
                      Delete
                    </Text>
                  </Flex>
                </MenuItem>
                <Divider />
                <MenuItem onClick={editMode} closeOnSelect={true}>
                  <Flex>
                    <Icon as={RiEditLine} fontSize="20px" />
                    <Text fontSize="10pt" pl={1} fontWeight={600}>
                      Edit
                    </Text>
                  </Flex>
                </MenuItem>
                <Divider />
              </>
            )}
            {/* <Divider /> */}
            {/* <MenuItem
              onClick={handleReportPostModal}
              color={reportPost ? "red.500" : ""}
            >
              <Icon as={TbMessageReport} fontSize="20px" />
              <Text fontSize="10pt" pl={1} fontWeight={600}>
                {reportPost ? "Reported" : "Report"}
              </Text>
            </MenuItem> */}
            {user &&
              (user.uid === communityData?.creatorId || isUserModerator) && ( // Compare community creator ID with the user's ID
                <>
                  <Divider />
                  <Text
                    color="gray.500"
                    fontSize="10pt"
                    pl={3}
                    pt={1}
                    fontWeight={600}
                  >
                    Moderator
                  </Text>
                  <MenuItem
                    onClick={handleRemovePostModal}
                    color={reportPost ? "blue.500" : ""}
                  >
                    <Icon as={TbTrashX} fontSize="21px" />
                    <Text fontSize="10pt" pl={1} fontWeight={600}>
                      Remove Post
                    </Text>
                  </MenuItem>
                </>
              )}
          </MenuList>
        </Menu>
        {!singlePostView && user && (
          <Button
            variant="ghost"
            size="sm"
            color="gray.500"
            position="relative"
            onClick={handleHidePost}
          >
            <Icon as={RxCross2} fontSize="20px" position="absolute" />
          </Button>
        )}
      </Flex>

      <Modal
        isOpen={isReportModalOpen}
        onClose={handleCancelReportModal}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="14pt"
            fontWeight={700}
            width="100%"
          >
            Report Post
          </ModalHeader>
          <Box pl={3} pr={3}>
            <Divider />
            <ModalCloseButton _focus={{ border: "none" }} />
            <ModalBody
              display="flex"
              textAlign="center"
              fontSize="11pt"
              padding="10px 4px"
            >
              By fostering accountability and user participation, we strive to
              create a positive and inclusive online environment. We value user
              input and partnership in building a better online world for
              everyone.
            </ModalBody>
          </Box>
          <ModalFooter
            borderRadius="0px 0px 10px 10px"
            p={3}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.100"
          >
            <Button
              onClick={handleConfirmReportModal}
              isLoading={reportLoading}
              mr={2}
              height="30px"
              width="20%"
            >
              Report
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelReportModal}
              height="30px"
              width="20%"
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={removePostModalOpen}
        onClose={handleCancelRemovePostModal}
        isCentered
        size={md ? "sm" : "xs"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="14pt"
            fontWeight={700}
          >
            Remove Post
          </ModalHeader>
          <Box pl={3} pr={3}>
            <Divider />
            <ModalCloseButton _focus={{ border: "none" }} />
            <ModalBody
              display="flex"
              textAlign="center"
              fontSize="11pt"
              padding="10px 4px"
            >
              As a moderator, you have the authority to remove content that you
              find violates the community rules. Your role is to enforce and
              maintain the standards and guidelines set by the community or
              platform.
            </ModalBody>
          </Box>
          <ModalFooter
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.100"
            width="100%"
            borderRadius="0px 0px 10px 10px"
            p={3}
          >
            <Button
              isLoading={loadingDelete}
              onClick={() => {
                handleDeletePostConfirmation();
              }}
              mr={2}
              height="30px"
              width="20%"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelRemovePostModal}
              height="30px"
              width="20%"
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showDeleteConfirmationModal}
        onClose={() => setShowDeleteConfirmationModal(false)}
        isCentered
        size={md ? "sm" : "xs"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="14pt"
            fontWeight={700}
          >
            Delete Post
          </ModalHeader>
          <Box pl={3} pr={3}>
            <Divider />
            <ModalCloseButton _focus={{ border: "none" }} />
            <ModalBody
              display="flex"
              textAlign="center"
              fontSize="11pt"
              padding="10px 4px"
            >
              Are you sure you want to delete this post? This action cannot be
              undone.
            </ModalBody>
          </Box>
          <ModalFooter
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.100"
            width="100%"
            borderRadius="0px 0px 10px 10px"
            p={3}
          >
            <Button
              onClick={() => {
                handleDeletePostConfirmation();
              }}
              isLoading={loadingDelete}
              mr={2}
              height="30px"
              width="20%"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirmationModal(false)}
              height="30px"
              width="20%"
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default PostOptions;
