import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  Image,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Stack,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import moment from "moment";
import { NextRouter } from "next/router";
import { AiOutlineDelete } from "react-icons/ai";
import {
  BsBookmark,
  BsBookmarkCheck,
  BsChat,
  BsExclamationCircleFill,
} from "react-icons/bs";
import { Post, postState } from "../../../atoms/postsAtom";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { RxCross2 } from "react-icons/rx";
import { Community, communityState } from "../../../atoms/communitiesAtom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../../firebase/clientApp";
import { BiHide } from "react-icons/bi";
import { TbMessageReport, TbTrashX } from "react-icons/tb";
import { FiShare } from "react-icons/fi";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ResizeTextarea from "react-textarea-autosize";
import {
  FacebookShareButton,
  FacebookIcon,
  RedditShareButton,
  RedditIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from "react-share";
import {
  IoIosArrowDropdown,
  IoIosArrowDropdownCircle,
  IoIosArrowDropup,
  IoIosArrowDropupCircle,
} from "react-icons/io";
import { IoPeopleCircleSharp } from "react-icons/io5";
import { doc, updateDoc } from "firebase/firestore";
import { useRecoilState } from "recoil";
import { RiEditLine } from "react-icons/ri";
import TumblrShareButton from "react-share/lib/TumblrShareButton";
import TumblrIcon from "react-share/lib/TumblrIcon";

export type PostItemContentProps = {
  isDisableVote?: boolean;
  communityData: Community;
  post: Post;
  onVote: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string,
    postIdx?: number
  ) => void;
  onHidePost: (post: Post, communityId: string) => Promise<void>;
  onSavePost: (post: Post, communityId: string) => Promise<void>;
  onReportPost: (post: Post, communityId: string) => Promise<void>;
  onDeletePost: (post: Post) => Promise<boolean>;
  userIsCreator: boolean;
  onSelectPost?: (value: Post, postIdx: number) => void;
  router?: NextRouter;
  postIdx?: number;
  userVoteValue?: number;
  hidePost?: boolean;
  savePost?: boolean;
  reportPost?: boolean;
  homePage?: boolean;
  profilePage?: boolean;
  mediaURLs: string[];
};

const PostItem: React.FC<PostItemContentProps> = ({
  communityData,
  post,
  postIdx,
  onVote,
  onSelectPost,
  router,
  onHidePost,
  hidePost,
  onSavePost,
  savePost,
  onReportPost,
  reportPost,
  onDeletePost,
  userVoteValue,
  userIsCreator,
  isDisableVote,
  homePage,
}) => {
  const [user] = useAuthState(auth);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [removePostModalOpen, setRemovePostModalOplen] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);
  const singlePostView = !onSelectPost; // function not passed to [pid]
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullPost, setShowFullPost] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedPostBody, setEditedPostBody] = useState(post.body);
  const [originalPostBody, setOriginalPostBody] = useState(post.body);
  const [bodyUpdateLoading, setBodyUpdateLoading] = useState(false);
  const [postStateValue, setPostStateValue] = useRecoilState(postState);
  const [copied, setCopied] = useState(false);
  const [communityStateValue] = useRecoilState(communityState);
  const link = `https://www.tumindig.com/tumindig/${post.communityId}/comments/${post.id}`;
  const { mediaTypes } = post;
  const toast = useToast();

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
      if (router) router.back();

      toast({
        title: "Post Deleted",
        description: "The post has been deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.log("Error deleting post", error.message);
      toast({
        title: "Error",
        description: "Failed to delete the post.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingDelete(false); // Set loading to false after the deletion process (whether success or error)
      setShowDeleteConfirmationModal(false); // Close the confirmation modal
    }
  };

  const onUpdatePostBody = useCallback(
    async (postId: string, newBody: string) => {
      setBodyUpdateLoading(true);
      try {
        const postRef = doc(firestore, "posts", postId);
        await updateDoc(postRef, {
          body: newBody,
        });
        setPostStateValue((prev) => ({
          ...prev,
          posts: prev.posts.map((item) => {
            if (item.id === postId) {
              return {
                ...item,
                body: newBody,
              };
            }
            return item;
          }),
        }));

        setBodyUpdateLoading(false);
        setEditMode(false);
      } catch (error: any) {
        console.log("Error updating post body", error.message);
        setBodyUpdateLoading(false);
        setEditMode(false);
      }
    },
    [setPostStateValue]
  );

  const toggleEditMode = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setEditMode(!editMode);
    if (!editMode) {
      setOriginalPostBody(editedPostBody); // Store the current edited value as the original value
    }
  };

  const handlePostBodyCancel = () => {
    setEditMode(false);
    setEditedPostBody(originalPostBody); // Reset the edited email back to its original value when canceled
  };

  const nextImage = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (post.mediaURLs) {
      const length = post.mediaURLs.length;
      const nextIndex = (currentImageIndex + 1) % length;
      setCurrentImageIndex(nextIndex);
    }
  };

  const prevImage = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (post.mediaURLs) {
      const length = post.mediaURLs.length;
      const prevIndex = (currentImageIndex - 1 + length) % length;
      setCurrentImageIndex(prevIndex);
    }
  };

  const handleHidePost = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    try {
      await onHidePost(post, post.communityId);
      console.log("Post hidden successfully");
      toast({
        title: "Post Hidden",
        description: "The post has been hidden.",
        status: "success",
        duration: 3000, // The duration for which the toast will be displayed (in milliseconds)
        isClosable: true, // Whether the toast can be closed by the user
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to hide the post.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSavePost = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    try {
      await onSavePost(post, post.communityId);
      console.log("Post saved successfully");
      toast({
        title: "Post Saved",
        description: "The post has been saved.",
        status: "success",
        duration: 3000, // The duration for which the toast will be displayed (in milliseconds)
        isClosable: true, // Whether the toast can be closed by the user
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save the post.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleReportPostModal = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setIsReportModalOpen(true);
  };

  const handleConfirmReportModal = async () => {
    try {
      setReportLoading(true); // Set loading to true before starting the reporting process
      await onReportPost(post, post.communityId);
      console.log("Post reported successfully");
      setIsReportModalOpen(false);
      toast({
        title: "Post Reported",
        description: "The post has been reported.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to report the post.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setReportLoading(false); // Set loading to false after the reporting process (whether success or error)
    }
  };

  const handleCopyClick = () => {
    // Show "Copied!" message for a short duration
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelReportModal = () => {
    setIsReportModalOpen(false);
  };

  const handleSharePostModal = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setShowShareModal(true);
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

  const toggleShowMorePost = () => {
    setShowFullPost(!showFullPost);
  };

  const isUserModerator = !!communityStateValue.moderatorSnippets.find(
    (snippet) =>
      snippet.communityId === communityData?.id &&
      snippet.isModerator === true &&
      snippet.userUid === user?.uid
  );

  return (
    <Flex
      border="1px solid"
      bg="white"
      borderColor={singlePostView ? "white" : "gray.300"}
      borderRadius={singlePostView ? "4px 4px 0px 0px" : 4}
      cursor={singlePostView ? "unset" : "pointer"}
      _hover={{ borderColor: singlePostView ? "none" : "gray.500" }}
      onClick={() => onSelectPost && post && onSelectPost(post, postIdx!)}
    >
      <Flex direction="column" width="100%">
        <Flex flexDirection="column">
          {post.createdAt && (
            <Flex
              justifyContent="space-between"
              align="center"
              p="10px 10px 0px 10px"
            >
              <Stack direction="column" align="center" fontSize="10pt">
                {homePage ? (
                  <Flex alignItems="center">
                    {post.communityImageURL ? (
                      <Flex>
                        <Image
                          borderRadius="full"
                          boxSize="35px"
                          src={post.communityImageURL}
                          mr={2}
                          display={loadingMedia ? "none" : "unset"}
                          onLoad={() => {
                            setLoadingMedia(false);
                          }}
                          objectFit="cover"
                        />
                      </Flex>
                    ) : (
                      <Icon
                        as={IoPeopleCircleSharp}
                        boxSize="35px"
                        mr={1}
                        color="gray.300"
                      />
                    )}
                    <Flex flexDirection="column">
                      <Link href={`tumindig/${post.communityId}`}>
                        <Text
                          fontWeight={700}
                          _hover={{ textDecoration: "underline" }}
                          onClick={(event) => event.stopPropagation()}
                        >{`${post.communityId}`}</Text>
                      </Link>
                      <Flex flexDirection="row">
                        <Text color="gray.500">
                          Posted by {post.userDisplayText}
                        </Text>
                        <Text color="gray.500" mx={1}>
                          &middot;
                        </Text>
                        <Text color="gray.500">
                          {moment(
                            new Date(post.createdAt.seconds * 1000)
                          ).fromNow()}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                ) : (
                  <Flex>
                    <Text color="gray.500">
                      Posted by {post.userDisplayText}
                    </Text>
                    <Text color="gray.500" mx={1}>
                      &middot;
                    </Text>
                    <Text color="gray.500">
                      {moment(
                        new Date(post.createdAt.seconds * 1000)
                      ).fromNow()}
                    </Text>
                  </Flex>
                )}
              </Stack>
              <Flex align="center">
                <Menu closeOnSelect={false}>
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
                    <Divider />
                    {userIsCreator && (
                      <>
                        <MenuItem onClick={handleDelete}>
                          <Flex justifyContent="center" justifyItems="center">
                            <Icon as={AiOutlineDelete} fontSize="20px" />
                            <Text fontSize="10pt" pl={1} fontWeight={600}>
                              Delete
                            </Text>
                          </Flex>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={toggleEditMode} closeOnSelect={true}>
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
                    <Divider />
                    <MenuItem
                      onClick={handleReportPostModal}
                      color={reportPost ? "red.500" : ""}
                    >
                      <Icon as={TbMessageReport} fontSize="20px" />
                      <Text fontSize="10pt" pl={1} fontWeight={600}>
                        {reportPost ? "Reported" : "Report"}
                      </Text>
                    </MenuItem>
                    {user &&
                      (user.uid === communityData?.creatorId ||
                        isUserModerator) && ( // Compare community creator ID with the user's ID
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
                <Button
                  variant="ghost"
                  size="sm"
                  color="gray.500"
                  position="relative"
                  onClick={handleHidePost}
                >
                  <Icon as={RxCross2} fontSize="20px" position="absolute" />
                </Button>
              </Flex>
            </Flex>
          )}
          <Flex p="8px 10px 8px 10px" flexDirection="column">
            <Text fontSize="12pt" fontWeight={600}>
              {post.title}
            </Text>
            {editMode ? (
              <>
                <Flex position="relative">
                  <Textarea
                    width="100%"
                    fontSize="11pt"
                    size="lg"
                    pb={10}
                    mt={1}
                    borderRadius={4}
                    as={ResizeTextarea}
                    isDisabled={bodyUpdateLoading}
                    value={editedPostBody}
                    _focus={{
                      outline: "none",
                      bg: "white",
                      border: "1px solid black",
                    }}
                    onChange={(e) => setEditedPostBody(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    css={{
                      "&::-webkit-scrollbar": {
                        width: "0.4em",
                        background: "transparent",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "transparent",
                      },
                    }}
                  />
                  <Flex
                    left="1px"
                    position="absolute"
                    right={0.1}
                    bottom="1px"
                    justify="flex-end"
                    p="6px 8px"
                    borderRadius="0px 0px 4px 4px"
                  >
                    <Button
                      size="sm"
                      fontSize="10pt"
                      fontWeight={800}
                      mr={1}
                      variant="ghost"
                      isLoading={bodyUpdateLoading}
                      onClick={(event) => {
                        event.stopPropagation(); // Stop event propagation
                        onUpdatePostBody(post.id, editedPostBody);
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      fontSize="10pt"
                      fontWeight={800}
                      variant="ghost"
                      onClick={(event) => {
                        event.stopPropagation(); // Stop event propagation
                        handlePostBodyCancel();
                      }}
                    >
                      Cancel
                    </Button>
                  </Flex>
                </Flex>
                <Flex p={2}>
                  <Icon as={BsExclamationCircleFill} mr={2} color="gray.400" />
                  <Text fontSize="10pt" color="gray.500">
                    Only the post body can be edited. Other fields are not
                    editable.
                  </Text>
                </Flex>
              </>
            ) : !showFullPost && editedPostBody?.length > 350 ? (
              <Text fontSize="11pt">
                {editedPostBody.slice(0, 350)}
                <Button
                  variant="link"
                  fontSize="10pt"
                  color="blue.500"
                  onClick={(event) => {
                    event.stopPropagation(); // Stop event propagation
                    toggleShowMorePost();
                  }}
                >
                  ...See More
                </Button>
              </Text>
            ) : (
              <Text fontSize="11pt">
                {editedPostBody}
                {editedPostBody?.length > 350 && (
                  <Button
                    variant="link"
                    fontSize="10pt"
                    color="blue.500"
                    onClick={(event) => {
                      event.stopPropagation(); // Stop event propagation
                      toggleShowMorePost();
                    }}
                  >
                    Hide
                  </Button>
                )}
              </Text>
            )}
          </Flex>
          {post.mediaURLs && (
            <Flex
              direction="column"
              position="relative"
              width="100%"
              height="100%"
              justifyContent="center"
              alignItems="center"
              overflow="hidden"
            >
              {currentImageIndex > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={prevImage}
                  position="absolute"
                  backgroundColor="white"
                  left="3%"
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex="2"
                >
                  <ChevronLeftIcon fontSize="14pt" position="absolute" />
                </Button>
              )}
              {loadingMedia && <Skeleton height="350px" width="100%" />}
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                position="relative"
                overflow="hidden"
              >
                <Flex
                  width={`${post.mediaURLs.length}00%`}
                  transform={`translateX(-${currentImageIndex}00%)`}
                  transition="transform 0.3s ease-in-out"
                  align="center"
                >
                  {post.mediaURLs.map((url, index) => (
                    <Flex
                      flex="1 0 100%"
                      key={url}
                      justifyContent="center"
                      alignItems="center"
                      position="relative"
                      display={loadingMedia ? "none" : "unset"}
                      zIndex="1"
                    >
                      {["image/jpeg", "image/png"].includes(
                        mediaTypes[index]
                      ) && (
                        <Image
                          maxHeight={singlePostView ? "460px" : "400px"}
                          width="100%"
                          objectFit={singlePostView ? "contain" : "cover"}
                          alt="Post Media"
                          src={url}
                          onLoad={() => {
                            // Make sure the first image is loaded
                            if (index === 0) setLoadingMedia(false);
                          }}
                        />
                      )}
                      {mediaTypes[index] === "video/mp4" && (
                        <video
                          controls
                          style={{
                            maxHeight: "460px",
                            width: "auto",
                            height: "auto",
                          }}
                          onLoadedData={() => {
                            // Make sure the first video is loaded
                            if (index === 0) setLoadingMedia(false);
                          }}
                        >
                          <source src={url} type="video/mp4" />
                        </video>
                      )}
                    </Flex>
                  ))}
                </Flex>
                {post.mediaURLs.length > 1 && (
                  <div
                    style={{
                      right: "3%",
                      top: "3%",
                      position: "absolute",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      color: "#fff",
                      padding: "2px 5px",
                      borderRadius: "5px",
                      fontSize: "10pt",
                    }}
                  >
                    {`${currentImageIndex + 1}/${post.mediaURLs.length}`}
                  </div>
                )}
              </Box>
              {currentImageIndex < post.mediaURLs.length - 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={nextImage}
                  position="absolute"
                  backgroundColor="white"
                  right="3%"
                  top="50%"
                  transform="translateY(-50%)"
                  zIndex="2"
                >
                  <ChevronRightIcon fontSize="14pt" position="absolute" />
                </Button>
              )}
            </Flex>
          )}
        </Flex>
        <Flex color="gray.500" fontWeight={600} alignItems="center" m={3}>
          <Button
            size="sm"
            variant="ghost"
            borderEndRadius={0}
            isDisabled={isDisableVote}
            onClick={(event) => onVote(event, post, 1, post.communityId)}
          >
            <Icon
              as={
                userVoteValue === 1 ? IoIosArrowDropupCircle : IoIosArrowDropup
              }
              color={userVoteValue === 1 ? "blue.500" : "gray.500"}
              fontSize={24}
              cursor="pointer"
            />
            <Text
              fontSize="10pt"
              mr={1}
              ml={1}
              color={
                userVoteValue === 1
                  ? "blue.500"
                  : userVoteValue === -1
                  ? "red.500"
                  : "gray.500"
              }
            >
              {post.voteStatus} Upvotes
            </Text>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            borderStartRadius={0}
            isDisabled={isDisableVote}
            onClick={(event) => onVote(event, post, -1, post.communityId)}
          >
            <Icon
              as={
                userVoteValue === -1
                  ? IoIosArrowDropdownCircle
                  : IoIosArrowDropdown
              }
              color={userVoteValue === -1 ? "red.500" : "gray.500"}
              fontSize={24}
              cursor="pointer"
            />
          </Button>
          <Button variant="ghost" size="sm" flex={1}>
            <Icon as={BsChat} mr={2} fontSize={20} />
            <Text fontSize="10pt">{post.numberOfComments} Comments</Text>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            flex={1}
            onClick={handleSharePostModal}
          >
            <Icon as={FiShare} mr={2} fontSize={20} />
            <Text fontSize="10pt">Share</Text>
          </Button>
        </Flex>
      </Flex>

      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="14pt" fontWeight={700} width="100%">
            Share Post
          </ModalHeader>
          <Box pl={3} pr={3}>
            <Divider />
            <ModalCloseButton _focus={{ border: "none" }} />
            <ModalBody>
              <>
                <HStack mt={5} mb={5} p={2} justifyContent="space-evenly">
                  <FacebookShareButton
                    onClick={(e) => e.stopPropagation()}
                    quote={`${post.title}`}
                    url={link}
                  >
                    <FacebookIcon size={50} round={true} />
                  </FacebookShareButton>
                  <WhatsappShareButton
                    onClick={(e) => e.stopPropagation()}
                    title={`${post.title}`}
                    url={link}
                  >
                    <WhatsappIcon size={50} round={true} />
                  </WhatsappShareButton>
                  <TumblrShareButton
                    onClick={(e) => e.stopPropagation()}
                    title={`${post.title}`}
                    url={link}
                  >
                    <TumblrIcon size={50} round={true} />
                  </TumblrShareButton>
                  <RedditShareButton
                    onClick={(e) => e.stopPropagation()}
                    title={`${post.title}`}
                    url={link}
                  >
                    <RedditIcon size={50} round={true} />
                  </RedditShareButton>
                  <LinkedinShareButton
                    onClick={(e) => e.stopPropagation()}
                    title={`${post.title}`}
                    url={link}
                  >
                    <LinkedinIcon size={50} round={true} />
                  </LinkedinShareButton>
                </HStack>
                <Flex flexDirection="column">
                  <Text fontSize="11pt" fontWeight={700} width="100%">
                    Copy Link
                  </Text>
                  <Flex flexDirection="row" mt={3}>
                    <Input
                      borderRadius="4px 0px 0px 4px"
                      borderColor="gray.200"
                      readOnly
                      value={link}
                    />
                    <CopyToClipboard text={link} onCopy={handleCopyClick}>
                      <Button
                        variant="outline"
                        borderWidth="1px 1px 1px 0px"
                        borderRadius="0px 4px 4px 0px"
                        borderColor="gray.200"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </CopyToClipboard>
                  </Flex>
                </Flex>
              </>
            </ModalBody>
          </Box>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>

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
    </Flex>
  );
};

export default PostItem;
