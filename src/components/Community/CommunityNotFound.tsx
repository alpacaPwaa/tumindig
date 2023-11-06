import React from "react";
import { Flex, Button, Icon, Text } from "@chakra-ui/react";
import Link from "next/link";
import { BiFileFind } from "react-icons/bi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { FaUsers } from "react-icons/fa";

const CommunityNotFound: React.FC = () => {
  return (
    <Flex
      direction="column"
      justifyContent="center"
      alignItems="center"
      minHeight="60vh"
      fontWeight={600}
    >
      <Icon
        color="gray.300"
        as={FaUsers}
        fontSize={200}
        border="8px solid"
        borderColor="gray.300"
        borderRadius="50%"
        mb={3}
        mt={6}
      />
      <Text color="gray.500" fontSize="15pt" fontWeight={800}>
        Community Not Found
      </Text>
      <Text color="gray.500" fontSize="11pt" fontWeight={500}>
        We&apos;re still growing our community directory, but we don&apos;t have
        a community for that yet.
      </Text>
      <Link href="/">
        <Button mt={4}>GO HOME</Button>
      </Link>
    </Flex>
  );
};
export default CommunityNotFound;
