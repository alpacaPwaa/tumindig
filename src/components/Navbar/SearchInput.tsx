import React from "react";
import { Flex, InputGroup, InputLeftElement, Input } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { User } from "firebase/auth";

type SearchInputProps = {
  user: User;
};

const SearchInput: React.FC<SearchInputProps> = ({ user }) => {
  return (
    <Flex flexGrow={1} maxWidth={user ? "auto" : "600px"} align="center">
      <InputGroup m="auto" width="80%">
        <InputLeftElement
          position="absolute"
          top="50%"
          left="0.5rem"
          transform="translateY(-50%)"
          color="gray.400"
        >
          <SearchIcon />
        </InputLeftElement>
        <Input
          isDisabled
          pl="2.5rem"
          placeholder="Search Unavailable"
          fontSize="10pt"
          _placeholder={{ color: "gray.500" }}
          _hover={{
            bg: "white",
            border: "1px solid",
            borderColor: "blue.500",
          }}
          _focus={{
            outline: "none",
            border: "1px solid",
            borderColor: "blue.500",
          }}
          height="40px"
          bg="gray.50"
          borderRadius="full"
        />
      </InputGroup>
    </Flex>
  );
};

export default SearchInput;
