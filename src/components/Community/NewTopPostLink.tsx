import { HStack, Button, Icon } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { ImArrowUp } from "react-icons/im";
import { MdNewReleases } from "react-icons/md";

type NewTopPostLinkProps = {};

const NewTopPostLink: React.FC<NewTopPostLinkProps> = () => {
  const router = useRouter();

  const goToCommunity = () => {
    router.push(`/tumindig/${router.query.community}`); // Use router.push to navigate to the profile page
    return;
  };

  const goToTopPage = () => {
    router.push(`/tumindig/${router.query.community}/top`); // Use router.push to navigate to the profile page
    return;
  };

  return (
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
          router.pathname === "/tumindig/[community]" ? "blue.500" : "gray.500"
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
  );
};
export default NewTopPostLink;
