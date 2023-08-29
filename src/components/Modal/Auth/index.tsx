import React, { useEffect } from "react";
import {
  Flex,
  ModalBody,
  ModalCloseButton,
  Text,
  ModalHeader,
} from "@chakra-ui/react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useRecoilValue } from "recoil";
import { authModalState } from "../../../atoms/authModalAtom";
import { userState } from "../../../atoms/userAtom";
import { auth } from "../../../firebase/clientApp";
import AuthInputs from "./Inputs";
import OAuthButtons from "./OAuthButtons";
import ResetPassword from "./ResetPassword";
import ModalWrapper from "../ModalWrapper";

type AuthModalProps = {};

const AuthModal: React.FC<AuthModalProps> = () => {
  const [modalState, setModalState] = useRecoilState(authModalState);
  const handleClose = () =>
    setModalState((prev) => ({
      ...prev,
      open: false,
    }));

  const [user, error] = useAuthState(auth);

  const toggleView = (view: string) => {
    setModalState({
      ...modalState,
      view: view as typeof modalState.view,
    });
  };

  useEffect(() => {
    if (user) handleClose();
  }, [user]);

  return (
    <ModalWrapper isOpen={modalState.open} onClose={handleClose}>
      <ModalHeader display="flex" flexDirection="column" alignItems="center">
        {modalState.view === "login" && "Login"}
        {modalState.view === "signup" && "Sign Up"}
        {modalState.view === "resetPassword" && "Reset Password"}
      </ModalHeader>
      <ModalCloseButton _focus={{ border: "none" }} />
      <ModalBody
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        pb={6}
      >
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          width="70%"
        >
          {modalState.view === "login" || modalState.view === "signup" ? (
            <>
              <OAuthButtons />
              <Text fontSize="11pt" fontWeight={600}>
                OR
              </Text>
              <AuthInputs toggleView={toggleView} />
            </>
          ) : (
            <ResetPassword toggleView={toggleView} />
          )}
          {/* // Will implement at end of tutorial */}
          {/* {user && !currentUser && (
                <>
                  <Spinner size="lg" mt={2} mb={2} />
                  <Text fontSize="8pt" textAlign="center" color="blue.500">
                    You are logged in. You will be redirected soon
                  </Text>
                </>
              )} */}
          {/* {false ? (
                <Flex
                  direction="column"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                </Flex>
              ) : (
              )} */}
        </Flex>
      </ModalBody>
    </ModalWrapper>
  );
};
export default AuthModal;
