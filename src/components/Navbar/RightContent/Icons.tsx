import React from "react";
import { AddIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Icon } from "@chakra-ui/react";
import { BsArrowUpRightCircle, BsChatDots } from "react-icons/bs";
import { GrAdd } from "react-icons/gr";
import {
  IoFilterCircleOutline,
  IoNotificationsOutline,
  IoVideocamOutline,
} from "react-icons/io5";
import useDirectory from "../../../hooks/useDirectory";

type ActionIconsProps = {};

const ActionIcons: React.FC<ActionIconsProps> = () => {
  const { toggleMenuOpen } = useDirectory();
  return (
    <Flex alignItems="center" flexGrow={1}>
      <>
        <Button variant="ghost" position="relative">
          <Icon as={IoNotificationsOutline} fontSize={22} position="absolute" />
        </Button>
      </>
    </Flex>
  );
};
export default ActionIcons;
