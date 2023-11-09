import { HStack, Button } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";

type PostEventNavProps = {};

const PostEventNav: React.FC<PostEventNavProps> = () => {
  const router = useRouter();

  const goToEventList = () => {
    router.push(`/events`); // Use router.push to navigate to the events page
  };

  const goToJoinedCommunityEventList = () => {
    router.push(`/events/joined`); // Use router.push to navigate to the events page
  };

  return (
    <HStack bg="white" p={3} borderRadius="sm" boxShadow="sm">
      <Button
        size="sm"
        variant="ghost"
        fontSize="10pt"
        color="gray.500"
        onClick={goToEventList}
        backgroundColor={router.pathname === "/events" ? "gray.100" : ""}
      >
        All
      </Button>
      <Button
        size="sm"
        variant="ghost"
        fontSize="10pt"
        color="gray.500"
        onClick={goToJoinedCommunityEventList}
        backgroundColor={router.pathname.includes("joined") ? "gray.100" : ""}
      >
        Joined Communities
      </Button>
    </HStack>
  );
};
export default PostEventNav;
