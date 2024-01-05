import React from "react";
import { Flex, HStack, useMediaQuery } from "@chakra-ui/react";
import { User } from "firebase/auth";
import AuthModal from "../../Modal/Auth";
import AuthButtons from "./AuthButtons";
import MenuWrapper from "./ProfileMenu/MenuWrapper";
import Notifications from "./Notifications";
import Support from "./Support";

type RightContentProps = {
  user: User;
};

const RightContent: React.FC<RightContentProps> = ({ user }) => {
  const [md] = useMediaQuery("(min-width: 768px)");

  return (
    <>
      <AuthModal />
      <Flex justifyContent="space-between" alignItems="center">
        {user ? (
          <HStack>
            {md ? <Support /> : ""}
            <Notifications />
          </HStack>
        ) : (
          <AuthButtons />
        )}
        <MenuWrapper />
      </Flex>
    </>
  );
};
export default RightContent;
