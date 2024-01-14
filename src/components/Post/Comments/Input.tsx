import {
  Flex,
  Textarea,
  Button,
  Text,
  Stack,
  Icon,
  Image,
  AspectRatio,
  Box,
} from "@chakra-ui/react";
import { User } from "firebase/auth";
import AuthButtons from "../../Navbar/RightContent/AuthButtons";
import ResizeTextarea from "react-textarea-autosize";
import { FaUserCircle } from "react-icons/fa";

type CommentInputProps = {
  comment: string;
  setComment: (value: string) => void;
  loading: boolean;
  user?: User | null;
  onCreateComment: (comment: string) => void;
};

const CommentInput: React.FC<CommentInputProps> = ({
  comment,
  setComment,
  loading,
  user,
  onCreateComment,
}) => {
  return (
    <Flex direction="column" position="relative">
      {user ? (
        <>
          <Stack mb={1} spacing={1} direction="row">
            <Text>Comment as</Text>
            <Text style={{ color: "#3182CE" }}>
              {user?.email?.split("@")[0]}
            </Text>
          </Stack>
          <Flex>
            {user?.photoURL ? (
              <Box
                borderRadius="full"
                overflow="hidden"
                boxSize="43px"
                mr={2}
                mt={2}
              >
                <AspectRatio ratio={1 / 1}>
                  <Image
                    src={user.photoURL}
                    alt="User Photo"
                    objectFit="cover"
                    boxSize="100%"
                    borderRadius="full"
                  />
                </AspectRatio>
              </Box>
            ) : (
              <Icon as={FaUserCircle} fontSize={36} color="gray.300" mr={3} />
            )}
            <Textarea
              disabled={loading}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              fontSize="11pt"
              borderRadius={4}
              as={ResizeTextarea}
              pb={10}
              _placeholder={{ color: "gray.500" }}
              _focus={{
                outline: "none",
                bg: "white",
                border: "1px solid black",
              }}
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
          </Flex>
          <Flex
            position="absolute"
            left="1px"
            right={0.1}
            bottom="1px"
            justify="flex-end"
            p="6px 8px"
            borderRadius="0px 0px 4px 4px"
          >
            <Button
              size="sm"
              variant="ghost"
              disabled={!comment.length || loading}
              isLoading={loading}
              onClick={() => onCreateComment(comment)}
            >
              <Text fontSize="15px" color="gray.700">
                Comment
              </Text>
            </Button>
          </Flex>
        </>
      ) : (
        <Flex
          align="center"
          justify="space-between"
          borderRadius={2}
          border="1px solid"
          borderColor="gray.100"
          p={4}
        >
          <Text fontWeight={600}>Log in or sign up to leave a comment</Text>
          <AuthButtons />
        </Flex>
      )}
    </Flex>
  );
};
export default CommentInput;
