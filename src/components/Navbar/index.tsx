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
import { BsFillHouseFill } from "react-icons/bs";
import RightContent from "./RightContent";
import SearchInput from "./SearchInput";
import useDirectory from "../../hooks/useDirectory";
import { HamburgerIcon } from "@chakra-ui/icons";
import SideBar from "./Directory/SideBar";
import { AiFillHeart } from "react-icons/ai";

type NavbarProps = {};

const Navbar: React.FC<NavbarProps> = () => {
  const [user] = useAuthState(auth);
  const { onSelectMenuItem } = useDirectory();
  const [showSideBar, setShowSideBar] = useState(false);

  const closeSideBar = () => {
    setShowSideBar(false);
  };

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
        alignItems="center"
      >
        <Flex justifyContent="center" alignItems="center">
          <Icon
            display={{ base: "none", md: "unset" }}
            fontSize="30px"
            color="deeppink"
            as={BsFillHouseFill}
            position="relative"
          />
          <Icon
            display={{ base: "none", md: "unset" }}
            fontSize="14px"
            bottom="15px"
            color="white"
            as={AiFillHeart}
            position="absolute"
          />
        </Flex>

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
          <Text fontWeight={700} color="deeppink">
            Volunteerverse
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
            <DrawerHeader>
              <Flex alignItems="center" justifyContent="flex-start">
                <Flex
                  position="relative"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Icon fontSize="25px" color="deeppink" as={BsFillHouseFill} />
                  <Icon
                    fontSize="10px"
                    top="12px"
                    color="white"
                    as={AiFillHeart}
                    position="absolute"
                  />
                </Flex>
                <Flex fontWeight={700} color="deeppink" ml={2}>
                  <Text fontSize="13pt" fontWeight={700} color="deeppink">
                    Volunteerverse
                  </Text>
                </Flex>
              </Flex>
            </DrawerHeader>
            <DrawerBody p={1} m={0}>
              <SideBar onClose={closeSideBar} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </Flex>
  );
};
export default Navbar;
