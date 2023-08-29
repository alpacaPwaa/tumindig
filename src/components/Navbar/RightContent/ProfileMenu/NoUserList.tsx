import React from "react";
import { MenuItem, Flex, Icon } from "@chakra-ui/react";
import { MdOutlineLogin } from "react-icons/md";
import { AuthModalState } from "../../../../atoms/authModalAtom";

type NoUserListProps = {
  setModalState: (value: AuthModalState) => void;
};

const NoUserList: React.FC<NoUserListProps> = ({ setModalState }) => {
  return (
    <>
      <MenuItem
        fontSize="10pt"
        _hover={{ bg: "blue.500", color: "white" }}
        fontWeight={600}
        onClick={() => setModalState({ open: true, view: "login" })}
      >
        <Flex alignItems="center">
          <Icon fontSize={20} mr={2} as={MdOutlineLogin} />
          Log In / Sign Up
        </Flex>
      </MenuItem>
    </>
  );
};
export default NoUserList;
