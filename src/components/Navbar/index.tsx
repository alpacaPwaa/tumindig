import React from "react";
import { Flex, Icon, Image, Text } from "@chakra-ui/react";
import { User } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { defaultMenuItem } from "../../atoms/directoryMenuAtom";
import { auth } from "../../firebase/clientApp";
import { FaAngry } from "react-icons/fa";
import RightContent from "./RightContent";
import SearchInput from "./SearchInput";
import useDirectory from "../../hooks/useDirectory";

const Navbar: React.FC = () => {
  const [user] = useAuthState(auth);
  const { onSelectMenuItem } = useDirectory();

  return (
    <Flex
      bg="white"
      padding="3px 14px"
      justifyContent={{ md: "space-between" }}
      boxShadow="base"
      sx={{ position: "sticky", top: "0" }}
      zIndex="999"
    >
      <Flex
        align="center"
        height="46px"
        width={{ base: "40px", md: "auto" }}
        mr={{ base: 0, md: 2 }}
        cursor="pointer"
        onClick={() => onSelectMenuItem(defaultMenuItem)}
      >
        <Flex bg="deeppink" borderRadius="full">
          <Icon fontSize="30px" p="4px" color="white" as={FaAngry} />
        </Flex>
        <Flex
          display={{ base: "none", md: "unset" }}
          fontWeight={700}
          color="deeppink"
          ml={2}
        >
          <Text>Test</Text>
        </Flex>
      </Flex>
      {/* {user && <Directory />} */}
      <SearchInput user={user as User} />
      <RightContent user={user as User} />
    </Flex>
  );
};
export default Navbar;
