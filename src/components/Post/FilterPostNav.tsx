import { HStack, Button, Icon } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { ImArrowUp } from "react-icons/im";
import { MdNewReleases } from "react-icons/md";

type FilterPostNavProps = {};

const FilterPostNav: React.FC<FilterPostNavProps> = () => {
  const router = useRouter();

  const goToNewPost = () => {
    router.push(`/`); // Use router.push to navigate to the events page
  };

  const goToTopPost = () => {
    router.push(`/top`); // Use router.push to navigate to the events page
  };
  return (
    <HStack bg="white" p="15px 10px 15px 10px" mt={2} mb={2} borderRadius="sm">
      <Button
        size="sm"
        variant="ghost"
        fontWeight={700}
        fontSize="14px"
        onClick={goToNewPost}
        color={router.pathname === "/" ? "blue.500" : "gray.500"}
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
        onClick={goToTopPost}
        color={router.pathname === "/top" ? "blue.500" : "gray.500"}
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
  );
};
export default FilterPostNav;
