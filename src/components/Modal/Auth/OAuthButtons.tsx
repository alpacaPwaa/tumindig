import { Button, Flex, Image, Text } from "@chakra-ui/react";
import { User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect } from "react";
import { useAuthState, useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../../firebase/clientApp";

type OAuthButtonsProps = {};

const OAuthButtons: React.FC<OAuthButtonsProps> = () => {
  const [signInWithGoogle, userCred, loading, error] =
    useSignInWithGoogle(auth);

  const createUserDocument = async (user: User) => {
    const userDocRef = doc(firestore, "users", user.uid);
    await setDoc(userDocRef, JSON.parse(JSON.stringify(user)));
  };

  useEffect(() => {
    if (userCred) {
      createUserDocument(userCred.user);
    }
  }, [userCred]);

  return (
    <Flex direction="column" mb={4} width="100%">
      <Button
        variant="oauth"
        onClick={() => signInWithGoogle()}
        isLoading={loading}
      >
        <Image src="/images/googlelogo.png" boxSize="13pt" mr={3} />
        Continue with Google
      </Button>
      {error && (
        <Text textAlign="center" fontSize="10pt" color="red" mt={2}>
          {error && <Text>{error.message}</Text>}
        </Text>
      )}
    </Flex>
  );
};
export default OAuthButtons;
