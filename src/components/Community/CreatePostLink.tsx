import {
  Flex,
  Text,
  Icon,
  Input,
  Image,
  AspectRatio,
  Box,
  Divider,
  Button,
  HStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { FaUserCircle } from "react-icons/fa";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { ImArrowUp } from "react-icons/im";
import { IoMdImages } from "react-icons/io";
import { MdNewReleases } from "react-icons/md";
import { useSetRecoilState } from "recoil";
import { authModalState } from "../../atoms/authModalAtom";
import { auth } from "../../firebase/clientApp";

type CreatePostProps = {};

const CreatePostLink: React.FC<CreatePostProps> = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const setAuthModalState = useSetRecoilState(authModalState);

  const onClick = () => {
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    const { community } = router.query;
    if (community) {
      router.push(`/tumindig/${router.query.community}/submit`);
      return;
    }
    // Open directory menu to select community to post to
  };

  const goToCommunity = () => {
    router.push(`/tumindig/${router.query.community}`); // Use router.push to navigate to the profile page
    return;
  };

  const goToTopPage = () => {
    router.push(`/tumindig/${router.query.community}/top`); // Use router.push to navigate to the profile page
    return;
  };

  return (
    <>
      <Flex
        justifyContent="center"
        bg="white"
        borderRadius={4}
        border="1px solid"
        borderColor="gray.300"
        mb={2}
        p="10px 15px"
        boxShadow="sm"
      >
        <Flex flexDirection="column" width="100%">
          <Flex alignItems="center" flexDirection="row" mb={2}>
            {user?.photoURL ? (
              <Box borderRadius="full" boxSize="50px">
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
              <Icon as={FaUserCircle} fontSize={36} color="gray.300" />
            )}
            <Input
              placeholder="Create Post"
              fontSize="10pt"
              _placeholder={{ color: "gray.500" }}
              _hover={{
                bg: "white",
                border: "1px solid",
                borderColor: "blue.500",
              }}
              _focus={{
                outline: "none",
                bg: "white",
                border: "1px solid",
                borderColor: "blue.500",
              }}
              bg="gray.50"
              borderColor="gray.200"
              height="36px"
              borderRadius="full"
              onClick={onClick}
              ml={2}
            />
          </Flex>
          <Divider />
          <Flex justifyContent="space-between" alignItems="center" mt={2}>
            <Button variant="ghost" size="sm" width="100%" onClick={onClick}>
              <Icon as={HiOutlinePencilAlt} fontSize={28} color="gray.500" />
              <Text color="gray.500" fontSize="10pt" ml={1}>
                Post
              </Text>
            </Button>
            <Button variant="ghost" size="sm" width="100%" onClick={onClick}>
              <Icon as={IoMdImages} fontSize={28} color="gray.500" />
              <Text color="gray.500" fontSize="10pt" ml={1}>
                Photo/Video
              </Text>
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <HStack
        bg="white"
        color="gray.500"
        p="15px 10px 15px 10px"
        mb={2}
        borderRadius="sm"
      >
        <Button
          size="sm"
          variant="ghost"
          fontWeight={700}
          fontSize="14px"
          onClick={goToCommunity}
          color={
            router.pathname === "/tumindig/[community]"
              ? "blue.500"
              : "gray.500"
          }
        >
          <Icon
            alignItems="center"
            justifyContent="center"
            fontSize={20}
            mr={1}
            as={MdNewReleases}
          />
          Newest
        </Button>
        <Button
          size="sm"
          variant="ghost"
          fontWeight={700}
          fontSize="14px"
          onClick={goToTopPage}
          color={router.pathname.includes("top") ? "blue.500" : "gray.500"}
        >
          <Icon
            alignItems="center"
            justifyContent="center"
            fontSize={18}
            mr={1}
            as={ImArrowUp}
          />
          Top
        </Button>
      </HStack>
    </>
  );
};
export default CreatePostLink;
