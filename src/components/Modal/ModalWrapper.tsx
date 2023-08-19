import { Modal, ModalOverlay, ModalContent } from "@chakra-ui/react";
import { User } from "firebase/auth";
import React from "react";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  user?: User | null;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  children,
  isOpen,
  onClose,
}) => {
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent width={{ base: "sm", md: "xl" }}>{children}</ModalContent>
      </Modal>
    </>
  );
};
export default ModalWrapper;
