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
  useMediaQuery,
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
  BsFillPinAngleFill,
  BsPencilFill,
} from "react-icons/bs";
import { Post, postState } from "../../../atoms/postsAtom";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { RxCross2 } from "react-icons/rx";
import { Community, communityState } from "../../../atoms/communitiesAtom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../../firebase/clientApp";
import { BiArrowBack, BiHide } from "react-icons/bi";
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
import TumblrShareButton from "react-share/lib/TumblrShareButton";
import TumblrIcon from "react-share/lib/TumblrIcon";
import PostOptions from "./PostOptions";
import Comments from "../Comments";
import MoreDetails from "./MoreDetails";

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
  onHidePost,
  onSavePost,
  onReportPost,
  onDeletePost,
  userVoteValue,
  isDisableVote,
  homePage,
}) => {
  const [user] = useAuthState(auth);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const singlePostView = !onSelectPost; // function not passed to [pid]
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullPost, setShowFullPost] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedPostBody, setEditedPostBody] = useState(post.body);
  const [originalPostBody, setOriginalPostBody] = useState(post.body);
  const [bodyUpdateLoading, setBodyUpdateLoading] = useState(false);
  const [postStateValue, setPostStateValue] = useRecoilState(postState);
  const [pinPost, setPinPost] = useState(post.isPinned);
  const [pinLoading, setPinLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const link = `https://www.tumindig.com/tumindig/${post.communityId}/comments/${post.id}`;
  const { mediaTypes } = post;
  const [communityStateValue] = useRecoilState(communityState);
  const [md] = useMediaQuery("(min-width: 768px)");

  const onUpdatePostBody = useCallback(
    async (postId: string, newBody: string) => {
      setBodyUpdateLoading(true);
      try {
        const postRef = doc(firestore, "posts", postId);
        await updateDoc(postRef, {
          body: newBody,
          isEdited: true,
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

  const onUpdatePostPin = useCallback(
    async (postId: string, isPinned: boolean | undefined) => {
      setPinLoading(true);
      try {
        const postRef = doc(firestore, "posts", postId);
        await updateDoc(postRef, {
          isPinned: !isPinned,
        });
        setPostStateValue((prev) => ({
          ...prev,
          posts: prev.posts.map((item) => {
            if (item.id === postId) {
              return {
                ...item,
                isPinned: !isPinned,
              };
            }
            return item;
          }),
        }));

        setPinLoading(false);
        setPinPost(!pinPost);
      } catch (error: any) {
        console.log("Error pinning post", error.message);
        setPinLoading(false);
      }
    },
    [setPostStateValue, pinPost]
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

  const handleCopyClick = () => {
    // Show "Copied!" message for a short duration
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSharePostModal = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setShowShareModal(true);
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
    <>
      <Flex
        border="1px solid"
        flexDirection="column"
        bg="white"
        borderColor={singlePostView ? "white" : "gray.300"}
        borderRadius={singlePostView ? "4px 4px 0px 0px" : 4}
        cursor={singlePostView ? "unset" : "pointer"}
        _hover={{ borderColor: singlePostView ? "none" : "gray.500" }}
        onClick={() => {
          if (!singlePostView) {
            setShowComments(true);
          }
        }}
        width="100%"
      >
        <Flex direction="column">
          <Flex flexDirection="column">
            {post.createdAt && (
              <Flex
                justifyContent="space-between"
                align="center"
                p="10px 10px 0px 10px"
              >
                <Flex
                  flexDirection="column"
                  fontSize="10pt"
                  width={md ? "" : "100%"}
                >
                  {homePage ? (
                    <Flex alignItems="center">
                      {post.communityImageURL ? (
                        <Flex width={md ? "" : "20%"}>
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
                            maxWidth="100%" // Adjust the maximum width as needed
                            wordBreak="break-word"
                            _hover={{ textDecoration: "underline" }}
                            onClick={(event) => event.stopPropagation()}
                          >{`${post.communityId}`}</Text>
                        </Link>
                        <HStack color="gray.500" alignItems="flex-start">
                          <Text
                            maxWidth={md ? "100%" : "50%"} // Adjust the maximum width as needed
                            wordBreak="break-word"
                          >
                            {md && "Posted by"} {post.creatorDisplayText}
                          </Text>
                          <Text mx={1}>&middot;</Text>
                          <Text position="relative">
                            {moment(
                              new Date(post.createdAt.seconds * 1000)
                            ).fromNow(true)}
                            {post.isEdited && (
                              <Icon
                                position="absolute"
                                top="2px"
                                ml={2}
                                textAlign="center"
                                as={BsPencilFill}
                              />
                            )}
                          </Text>
                        </HStack>
                      </Flex>
                    </Flex>
                  ) : (
                    <HStack color="gray.500" alignItems="flex-start">
                      <Text
                        maxWidth={md ? "100%" : "60%"} // Adjust the maximum width as needed
                        wordBreak="break-word"
                      >
                        Posted by {post.creatorDisplayText}
                      </Text>
                      <Text mx={1}>&middot;</Text>
                      <Text position="relative">
                        {moment(
                          new Date(post.createdAt.seconds * 1000)
                        ).fromNow(true)}
                        {post.isEdited && (
                          <Icon
                            position="absolute"
                            top="2px"
                            ml={2}
                            textAlign="center"
                            as={BsPencilFill}
                          />
                        )}
                      </Text>
                    </HStack>
                  )}
                </Flex>
                <Flex alignItems="center">
                  {user &&
                  (user.uid === communityData?.creatorId || isUserModerator) ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      borderRadius="full"
                      position="relative"
                      ml="auto"
                      isLoading={pinLoading}
                      onClick={(event) => {
                        event.stopPropagation(); // Stop event propagation
                        onUpdatePostPin(post.id, post.isPinned);
                      }}
                    >
                      <Flex align="center" justify="center">
                        <Icon
                          fontSize="18px"
                          position="absolute"
                          color={pinPost ? "blue.500" : "gray.500"}
                          as={BsFillPinAngleFill}
                        />
                      </Flex>
                    </Button>
                  ) : pinPost && !homePage ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      borderRadius="full"
                      position="relative"
                      ml="auto"
                      onClick={(event) => {
                        event.stopPropagation(); // Stop event propagation
                      }}
                    >
                      <Flex align="center" justify="center">
                        <Icon
                          fontSize="18px"
                          position="absolute"
                          color="blue.500"
                          as={BsFillPinAngleFill}
                        />
                      </Flex>
                    </Button>
                  ) : null}
                  <PostOptions
                    hidePost={
                      postStateValue.postOptions.find(
                        (item) => item.postId === post.id
                      )?.isHidden
                    }
                    savePost={
                      postStateValue.postOptions.find(
                        (item) => item.postId === post.id
                      )?.isSaved
                    }
                    reportPost={
                      postStateValue.postOptions.find(
                        (item) => item.postId === post.id
                      )?.isReported
                    }
                    userIsCreator={user?.uid === post.creatorId}
                    onHidePost={onHidePost}
                    onSavePost={onSavePost}
                    onReportPost={onReportPost}
                    onDeletePost={onDeletePost}
                    onSelectPost={onSelectPost}
                    editMode={toggleEditMode}
                    communityData={communityData}
                    post={post}
                  />
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
                        disabled={!editedPostBody}
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
                    <Icon
                      as={BsExclamationCircleFill}
                      mr={2}
                      color="gray.400"
                    />
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
          <MoreDetails post={post} community={communityData} />
          <Flex
            color="gray.500"
            fontWeight={600}
            justifyContent="space-around"
            alignItems="center"
            m={3}
          >
            <Flex alignItems="center">
              <Button
                size="sm"
                variant="ghost"
                position="relative"
                isDisabled={isDisableVote}
                onClick={(event) => onVote(event, post, 1, post.communityId)}
              >
                <Icon
                  as={
                    userVoteValue === 1
                      ? IoIosArrowDropupCircle
                      : IoIosArrowDropup
                  }
                  color={userVoteValue === 1 ? "blue.500" : "gray.500"}
                  fontSize={24}
                  position="absolute"
                />
              </Button>
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
                {post.voteStatus} {md ? "Upvotes" : null}
              </Text>
              <Button
                size="sm"
                variant="ghost"
                position="relative"
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
                  position="absolute"
                />
              </Button>
            </Flex>
            <Button
              variant="ghost"
              size="sm"
              onClick={(event) => {
                if (!singlePostView) {
                  event.stopPropagation();
                  setShowComments(true);
                }
              }}
            >
              <Icon as={BsChat} mr={2} fontSize={20} />
              <Text fontSize="10pt">
                {post.numberOfComments} {md ? "Comments" : null}
              </Text>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSharePostModal}>
              <Icon as={FiShare} mr={2} fontSize={20} />
              <Text fontSize="10pt">Share</Text>
            </Button>
          </Flex>
        </Flex>
        {/* Import Comments */}
      </Flex>

      <Modal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        size={md ? "xl" : "full"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={md ? "14pt" : "11pt"}
            fontWeight={700}
            width="100%"
          >
            <Flex alignItems="center">
              <Button
                variant="ghost"
                position="relative"
                onClick={() => setShowComments(false)}
              >
                <Icon
                  fontSize="20pt"
                  as={BiArrowBack}
                  cursor="pointer"
                  position="absolute"
                />
              </Button>

              <Text
                width="85%"
                align="center"
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
                onClick={() =>
                  onSelectPost && post && onSelectPost(post, postIdx!)
                }
              >
                Go to {post.creatorDisplayText}'s post
              </Text>
            </Flex>
          </ModalHeader>
          <Divider />

          <ModalBody>
            <>
              <PostItem
                post={post}
                onHidePost={onHidePost}
                onSavePost={onSavePost}
                onReportPost={onReportPost}
                onVote={onVote}
                onDeletePost={onDeletePost}
                userVoteValue={
                  postStateValue.postVotes.find(
                    (item) => item.postId === post.id
                  )?.voteValue
                }
                hidePost={
                  postStateValue.postOptions.find(
                    (item) => item.postId === post.id
                  )?.isHidden
                }
                savePost={
                  postStateValue.postOptions.find(
                    (item) => item.postId === post.id
                  )?.isSaved
                }
                reportPost={
                  postStateValue.postOptions.find(
                    (item) => item.postId === post.id
                  )?.isReported
                }
                userIsCreator={user?.uid === post.creatorId}
                mediaURLs={[]}
                communityData={communityData} // Add communityData prop
              />
              <Comments community={post.communityId} selectedPost={post} />
            </>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        isCentered
        size={md ? "md" : "xs"}
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
                <HStack
                  mt={md ? 5 : 2}
                  mb={md ? 5 : 2}
                  p={2}
                  justifyContent="space-evenly"
                >
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
    </>
  );
};

export default PostItem;
