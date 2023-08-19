import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Spinner,
  Stack,
  Text,
  Textarea,
  Image,
  AspectRatio,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { Timestamp } from "firebase-admin/firestore";
import { FaUserCircle } from "react-icons/fa";
import moment from "moment";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import ResizeTextarea from "react-textarea-autosize";

export type Reply = {
  reply: Reply;
  id: string;
  creatorId: string;
  creatorDisplayText: string;
  creatorPhotoURL: string;
  communityId: string;
  commentId: string;
  text: string;
  createdAt?: Timestamp;
  voteStatus: number;
  currentUserVoteStatus: {
    id?: string;
    voteValue: number;
  };
};

export type ReplyVotes = {
  id: string;
  repliesId: string;
  communityId: string;
  voteValue: number;
};

type ReplyItemProps = {
  reply: Reply;
  isLoadingUpdate: boolean;
  userId?: string;
  handleToggleVisibility: () => void;
  onUpdateReply: (replyId: string, newText: string) => void;
  onDeleteReply: (replyId: string) => void;
  isLoadingDelete: boolean;
  onVoteReply: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    reply: Reply,
    vote: number,
    communityId: string
  ) => void;
  communityId: string;
  userVoteValue?: number;
};

const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  userId,
  communityId,
  isLoadingUpdate,
  handleToggleVisibility,
  onUpdateReply,
  onDeleteReply,
  isLoadingDelete,
  onVoteReply,
  userVoteValue,
}) => {
  const [editedReplyText, setEditedReplyText] = useState(reply.text);
  const [editReplyMode, setEditReplyMode] = useState(false);
  const [showFullReply, setShowFullReply] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleEditMode = () => {
    setEditReplyMode(!editReplyMode);
    setEditedReplyText(reply.text);
  };

  const handleSaveEditReply = async () => {
    await onUpdateReply(reply.id, editedReplyText); // Call the onUpdateReply function and wait for it to complete
    setEditReplyMode(false);
  };

  const handleDeleteReply = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    onDeleteReply(reply.id);
  };

  const toggleReply = () => {
    setShowFullReply(!showFullReply);
  };

  const handleToggleDeleteModal = () => {
    setShowDeleteModal(true);
  };

  return (
    <Flex>
      <Box mr={2}>
        {reply.creatorPhotoURL ? (
          <Box borderRadius="full" overflow="hidden" boxSize="30px">
            <AspectRatio ratio={1 / 1}>
              <Image
                src={reply.creatorPhotoURL}
                alt="User Photo"
                objectFit="cover"
                boxSize="100%"
                style={{ borderRadius: "50%" }}
              />
            </AspectRatio>
          </Box>
        ) : (
          <Icon as={FaUserCircle} fontSize="30px" color="gray.300" />
        )}
      </Box>
      <Stack spacing={1} width="100%">
        <Stack direction="row" align="center" spacing={2} fontSize="8pt">
          <Text
            fontWeight={700}
            _hover={{ textDecoration: "underline", cursor: "pointer" }}
          >
            {reply.creatorDisplayText}
          </Text>
          {reply.createdAt?.seconds && (
            <Text color="gray.600">
              {moment(new Date(reply.createdAt?.seconds * 1000)).fromNow()}
            </Text>
          )}
        </Stack>
        {editReplyMode ? (
          <Textarea
            width="100%"
            fontSize="10pt"
            as={ResizeTextarea}
            borderRadius={4}
            disabled={isLoadingUpdate}
            value={editedReplyText}
            _focus={{
              outline: "none",
              bg: "white",
              border: "1px solid black",
            }}
            onChange={(e) => setEditedReplyText(e.target.value)}
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
        ) : !showFullReply && reply.text?.length > 350 ? (
          <Text fontSize="11pt">
            {reply.text.slice(0, 350)}
            <Button
              variant="link"
              fontSize="10pt"
              color="blue.500"
              onClick={toggleReply}
            >
              ...See More
            </Button>
          </Text>
        ) : (
          <Text fontSize="11pt">
            {reply.text}
            {reply.text?.length > 350 && (
              <Button
                variant="link"
                fontSize="10pt"
                color="blue.500"
                onClick={toggleReply}
              >
                Hide
              </Button>
            )}
          </Text>
        )}

        <Stack
          direction="row"
          align="center"
          cursor="pointer"
          fontWeight={600}
          color="gray.500"
        >
          <Button
            fontWeight={900}
            fontSize="11pt"
            position="relative"
            size="xs"
            variant="ghost"
            onClick={(event) => onVoteReply(event, reply, 1, communityId)}
          >
            <Icon
              position="absolute"
              color={userVoteValue === 1 ? "blue.500" : "gray.500"}
              as={IoIosArrowUp}
            />
          </Button>
          <Text
            fontWeight={800}
            fontSize="10pt"
            color={
              userVoteValue === 1
                ? "blue.500"
                : userVoteValue === -1
                ? "red.500"
                : "gray.500"
            }
          >
            {reply.voteStatus}
          </Text>
          <Button
            fontWeight={900}
            fontSize="11pt"
            position="relative"
            size="xs"
            variant="ghost"
            onClick={(event) => onVoteReply(event, reply, -1, communityId)}
          >
            <Icon
              position="absolute"
              color={userVoteValue === -1 ? "red.500" : "gray.500"}
              as={IoIosArrowDown}
            />
          </Button>
          {userId === reply.creatorId && (
            <>
              {editReplyMode ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!editedReplyText}
                    isLoading={isLoadingUpdate}
                    _hover={{ color: "blue.500" }}
                    onClick={handleSaveEditReply}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    _hover={{ color: "blue.500" }}
                    onClick={toggleEditMode}
                    ml={2}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    _hover={{ color: "blue.500" }}
                    onClick={toggleEditMode}
                    ml={2}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    _hover={{ color: "blue.500" }}
                    ml={2}
                    onClick={handleToggleDeleteModal}
                  >
                    Delete
                  </Button>
                </>
              )}
            </>
          )}
          {!editReplyMode && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleToggleVisibility}
              _hover={{ color: "blue.500" }}
              ml={2}
            >
              Reply
            </Button>
          )}
        </Stack>
      </Stack>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
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
            Delete Reply
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
              Are you sure you want to delete this reply? This action cannot be
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
              onClick={handleDeleteReply}
              isLoading={isLoadingDelete}
              mr={2}
              height="30px"
              width="20%"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
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

export default ReplyItem;
