import React, { useState } from "react";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Icon,
  Image,
  Text,
} from "@chakra-ui/react";
import { User } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { defaultMenuItem } from "../../atoms/directoryMenuAtom";
import { auth } from "../../firebase/clientApp";
import { FaAngry } from "react-icons/fa";
import RightContent from "./RightContent";
import SearchInput from "./SearchInput";
import useDirectory from "../../hooks/useDirectory";
import { HamburgerIcon } from "@chakra-ui/icons";
import SideBar from "./Directory/SideBar";

type NavbarProps = {};

const Navbar: React.FC<NavbarProps> = () => {
  const [user] = useAuthState(auth);
  const { onSelectMenuItem } = useDirectory();
  const [showSideBar, setShowSideBar] = useState(false);

  return (
    <Flex
      bg="white"
      padding="3px 14px"
      justifyContent={{ md: "space-between" }}
      alignItems="center"
      boxShadow="base"
      position="fixed"
      top="0"
      left="0"
      right="0"
    >
      <Flex
        align="center"
        height="46px"
        width={{ base: "40px", md: "auto" }}
        mr={{ base: 0, md: 2 }}
        cursor="pointer"
        onClick={() => onSelectMenuItem(defaultMenuItem)}
      >
        <Box
          bg="deeppink"
          boxSize="30px"
          borderRadius="full"
          display={{ base: "none", md: "unset" }}
        >
          <Icon fontSize="30px" p="4px" color="white" as={FaAngry} />
        </Box>
        <Flex display={{ base: "unset", md: "none" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              setShowSideBar(!showSideBar);
            }}
          >
            <HamburgerIcon fontSize="15pt" position="absolute" />
          </Button>
        </Flex>
        <Flex
          display={{ base: "none", md: "unset" }}
          fontWeight={700}
          color="deeppink"
          ml={2}
        >
          <Text fontWeight={700} color="deeppink" ml={2}>
            Test
          </Text>
        </Flex>
      </Flex>
      {/* {user && <Directory />} */}
      <SearchInput user={user as User} />
      <RightContent user={user as User} />

      {showSideBar && (
        <Drawer
          placement="left"
          isOpen={showSideBar}
          onClose={() => setShowSideBar(false)}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton _focus={{ border: "none" }} />
            <DrawerHeader>Profile</DrawerHeader>
            <DrawerBody p={1} m={0}>
              <SideBar />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </Flex>
  );
};
export default Navbar;
