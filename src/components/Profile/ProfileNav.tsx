import { Flex, Text, useMediaQuery } from "@chakra-ui/react";
import router, { useRouter } from "next/router";
import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/clientApp";

type ProfileNavProps = {};

const ProfileNav: React.FC<ProfileNavProps> = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [md] = useMediaQuery("(min-width: 768px)");

  const goToProfile = () => {
    router.push(`/user/${user?.email?.split("@")[0]}`); // Use router.push to navigate to the profile page
  };

  const goToSavePost = () => {
    router.push(`/user/${user?.email?.split("@")[0]}/save`); // Use router.push to navigate to the profile page
  };

  const goToHiddenPost = () => {
    router.push(`/user/${user?.email?.split("@")[0]}/hidden`); // Use router.push to navigate to the profile page
  };

  const goToUpvotedPost = () => {
    router.push(`/user/${user?.email?.split("@")[0]}/upvote`); // Use router.push to navigate to the profile page
  };

  const goToDownvotedPost = () => {
    router.push(`/user/${user?.email?.split("@")[0]}/downvote`); // Use router.push to navigate to the profile page
  };

  return (
    <Flex
      cursor="pointer"
      direction="column" // Set parent container as column
      minHeight="40px"
      bg="white"
      boxShadow="sm"
      position="relative"
    >
      <Flex
        width={["100%", "70%"]}
        direction="row"
        justifyContent="space-between"
        fontWeight={600}
        px={[4, 8, 12, 100]}
        fontSize={md ? "10pt" : "9pt"}
        position="absolute"
        bottom="0"
      >
        <Text
          _hover={{
            cursor: "pointer",
            color: "blue.500",
          }}
          color={
            router.pathname === "/user/[profile]" ? "blue.500" : "gray.500"
          }
          borderBottom={router.pathname === "/user/[profile]" ? "2px" : "none"}
          onClick={goToProfile}
        >
          OVERVIEW
        </Text>
        <Text
          _hover={{
            cursor: "pointer",
            color: "blue.500",
          }}
          color={router.pathname.includes("save") ? "blue.500" : "gray.500"}
          borderBottom={router.pathname.includes("save") ? "2px" : "none"}
          onClick={goToSavePost}
        >
          SAVED
        </Text>
        <Text
          _hover={{
            cursor: "pointer",
            color: "blue.500",
          }}
          color={router.pathname.includes("hidden") ? "blue.500" : "gray.500"}
          borderBottom={router.pathname.includes("hidden") ? "2px" : "none"}
          onClick={goToHiddenPost}
        >
          HIDDEN
        </Text>
        <Text
          _hover={{
            cursor: "pointer",
            color: "blue.500",
          }}
          color={router.pathname.includes("upvote") ? "blue.500" : "gray.500"}
          borderBottom={router.pathname.includes("upvote") ? "2px" : "none"}
          onClick={goToUpvotedPost}
        >
          UPVOTED
        </Text>
        <Text
          _hover={{
            cursor: "pointer",
            color: "blue.500",
          }}
          color={router.pathname.includes("downvote") ? "blue.500" : "gray.500"}
          borderBottom={router.pathname.includes("downvote") ? "2px" : "none"}
          onClick={goToDownvotedPost}
        >
          DOWNVOTED
        </Text>
      </Flex>
    </Flex>
  );
};
export default ProfileNav;
