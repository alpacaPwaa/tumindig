import React from "react";

import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  AspectRatio,
  Box,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  Text,
  Image,
} from "@chakra-ui/react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState } from "recoil";
import { authModalState } from "../../../../atoms/authModalAtom";
import { auth } from "../../../../firebase/clientApp";

import NoUserList from "./NoUserList";
import UserList from "./UserList";

import { VscAccount } from "react-icons/vsc";
import { FaUserCircle } from "react-icons/fa";

type MenuWrapperProps = {};

const MenuWrapper: React.FC<MenuWrapperProps> = () => {
  const [authModal, setModalState] = useRecoilState(authModalState);
  const [user] = useAuthState(auth);
  return (
    <Menu>
      <MenuButton cursor="pointer" padding="0px 8px" borderRadius="4px">
        <Flex alignItems="center">
          {user ? (
            <>
              {user?.photoURL ? (
                <Box borderRadius="full" overflow="hidden" boxSize="36px">
                  <AspectRatio ratio={1 / 1}>
                    <Image
                      src={user.photoURL}
                      alt="User Photo"
                      objectFit="cover"
                      boxSize="100%"
                    />
                  </AspectRatio>
                </Box>
              ) : (
                <Icon as={FaUserCircle} fontSize="36px" color="gray.300" />
              )}
            </>
          ) : (
            <Icon fontSize={26} mr={1} color="gray.400" as={VscAccount} />
          )}
        </Flex>
      </MenuButton>
      <MenuList>
        {user ? <UserList /> : <NoUserList setModalState={setModalState} />}
      </MenuList>
    </Menu>
  );
};
export default MenuWrapper;
