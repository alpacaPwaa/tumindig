import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Flex,
  Stack,
  Text,
  Image,
  Icon,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  ModalFooter,
  Input,
} from "@chakra-ui/react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore, storage } from "../../firebase/clientApp";
import { FaUserCircle } from "react-icons/fa";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { RiCakeFill } from "react-icons/ri";
import { updateProfile } from "firebase/auth";
import { AiOutlineSetting } from "react-icons/ai";

type ProfilePageProps = {};

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const [user] = useAuthState(auth);
  const selectFileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<string>();
  const [imageLoading, setImageLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedPhotoURL, setUpdatedPhotoURL] = useState<string | undefined>(
    user?.photoURL || undefined
  );
  const [updatedDisplayName, setUpdatedDisplayName] = useState<
    string | undefined
  >(user?.displayName || undefined);
  const [createdAt, setCreatedAt] = useState<number | undefined>();
  const [lastLoginAt, setLastLoginAt] = useState<number | undefined>();
  const [displayNameLoading, setDisplayNameLoading] = useState(false);
  const [charsRemaining, setCharsRemaining] = useState(21);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(collection(firestore, "users"), user.uid);
          const userDocSnapshot = await getDoc(userDocRef);
          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            setCreatedAt(userData.createdAt);
            setLastLoginAt(userData.lastLoginAt); // Set the lastLoginAt value
          }
        } catch (error) {
          console.log("Error fetching user data:", error);
        }
      };

      fetchUserData();
    }
  }, [user]);

  const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (event.target.files?.[0]) {
      reader.readAsDataURL(event.target.files[0]);
      setImageLoading(true);
    }

    reader.onload = (readerEvent) => {
      if (readerEvent.target?.result) {
        setSelectedFile(readerEvent.target?.result as string);
        setImageLoading(false);
      }
    };
  };

  const handleSaveChanges = async () => {
    try {
      if (selectedFile) {
        // Save profile image changes
        setImageLoading(true);
        const imageRef = ref(storage, `users/${user?.uid}/profileImage`);
        await uploadString(imageRef, selectedFile, "data_url");
        const downloadURL = await getDownloadURL(imageRef);
        const userCollectionRef = collection(firestore, "users");
        const userDocRef = doc(userCollectionRef, user?.uid);
        await updateDoc(userDocRef, {
          photoURL: downloadURL,
        });

        // Update the creatorPhotoURL for each comment associated with the user
        const commentQuery = query(
          collection(firestore, "comments"),
          where("creatorId", "==", user?.uid)
        );
        const commentSnapshot = await getDocs(commentQuery);
        commentSnapshot.forEach(async (commentDoc) => {
          const commentId = commentDoc.id;
          await updateDoc(doc(firestore, "comments", commentId), {
            creatorPhotoURL: downloadURL,
          });
        });

        // Update the creatorDisplayText for each reply associated with the user
        const replyQuery = query(
          collection(firestore, "replies"),
          where("creatorId", "==", user?.uid)
        );
        const replySnapshot = await getDocs(replyQuery);
        replySnapshot.forEach(async (replyDoc) => {
          const replyId = replyDoc.id;
          await updateDoc(doc(firestore, "replies", replyId), {
            creatorPhotoURL: downloadURL,
          });
        });

        setUpdatedPhotoURL(downloadURL);
        if (user) {
          await updateProfile(user, {
            photoURL: downloadURL,
          });
        }
        setImageLoading(false);
      }

      if (updatedDisplayName) {
        // Save display name changes
        setDisplayNameLoading(true);
        const userCollectionRef = collection(firestore, "users");
        const userDocRef = doc(userCollectionRef, user?.uid);
        await updateDoc(userDocRef, {
          displayName: updatedDisplayName,
        });

        // Update the creatorDisplayText for each comment associated with the user
        const commentQuery = query(
          collection(firestore, "comments"),
          where("creatorId", "==", user?.uid)
        );
        const commentSnapshot = await getDocs(commentQuery);
        commentSnapshot.forEach(async (commentDoc) => {
          const commentId = commentDoc.id;
          await updateDoc(doc(firestore, "comments", commentId), {
            creatorDisplayText: updatedDisplayName,
          });
        });

        // Update the creatorDisplayText for each reply associated with the user
        const replyQuery = query(
          collection(firestore, "replies"),
          where("creatorId", "==", user?.uid)
        );
        const replySnapshot = await getDocs(replyQuery);
        replySnapshot.forEach(async (replyDoc) => {
          const replyId = replyDoc.id;
          await updateDoc(doc(firestore, "replies", replyId), {
            creatorDisplayText: updatedDisplayName,
          });
        });

        if (user) {
          await updateProfile(user, {
            displayName: updatedDisplayName,
          });
        }
        setDisplayNameLoading(false);
      }

      console.log("Changes saved successfully");
    } catch (error) {
      console.log("Error saving changes:", error);
    }
  };

  const handleUserNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > 21) return;
    setUpdatedDisplayName(event.target.value);
    setCharsRemaining(21 - event.target.value.length);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleDateString();
  };

  return (
    <Flex
      direction="column"
      width={300}
      borderRadius={4}
      cursor="pointer"
      bg="white"
      border="1px solid"
      borderColor="gray.300"
      position="sticky"
    >
      <Flex
        p="40px 12px"
        bg="blue.500"
        borderRadius="4px 4px 0px 0px"
        position="relative"
      >
        {/* <Flex position="absolute">
          <Button
            border="1px"
            borderColor="white"
            size="sm"
            onClick={openModal}
          >
            <Icon
              as={AiOutlineSetting}
              fontSize="14pt"
              color="white"
              position="absolute"
            />
          </Button>
        </Flex> */}
        <Flex mt={2} position="absolute" left="40%">
          {user?.displayName ? (
            <Text fontSize="11pt" color="white" fontWeight={700}>
              {user.displayName}
            </Text>
          ) : (
            <Text fontSize="11pt" color="white" fontWeight={700}>
              {user?.email?.split("@")[0]}
            </Text>
          )}
        </Flex>
      </Flex>
      <Flex
        p={5}
        position="absolute"
        flexDirection="column"
        alignItems="center"
      >
        {user?.photoURL ? (
          <Image
            borderRadius="md"
            boxSize="80px"
            src={updatedPhotoURL}
            alt="Dan Abramov"
            position="relative"
            border="4px solid white"
            objectFit="cover"
            onClick={openModal}
          />
        ) : (
          <Icon
            as={FaUserCircle}
            bg="white"
            borderRadius="full"
            fontSize="80px"
            color="gray.300"
            mr={3}
          />
        )}

        <Button
          alignItems="center"
          variant="ghost"
          position="absolute"
          right="15%"
          bottom="15%"
          border="1px"
          borderColor="blue.500"
          bg="white"
          size="sm"
          onClick={openModal}
        >
          <Icon
            as={AiOutlineSetting}
            fontSize="14pt"
            color="blue.500"
            position="absolute"
          />
        </Button>

        <input
          id="file-upload-modal"
          hidden
          type="file"
          accept="image/x-png,image/gif,image/jpeg"
          ref={selectFileRef}
          onChange={onSelectImage}
        />
      </Flex>
      <Stack p={2} mt="20px" flexDirection="column">
        <Text fontSize="10pt" fontWeight={600} mt={2}>
          Joined
        </Text>
        <Flex direction="row">
          <Icon as={RiCakeFill} mr={1} color="gray.600" />
          <Text fontSize="9pt" fontWeight={600} color="gray.500 ">
            {createdAt ? formatTimestamp(createdAt) : "Unknown"}
          </Text>
        </Flex>
      </Stack>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center" fontSize={16} fontWeight={800}>
            Edit Profile
          </ModalHeader>
          <ModalCloseButton _focus={{ border: "none" }} />
          <Divider />
          <ModalBody>
            <Stack spacing={1} mt={3} mb={3}>
              <Text fontSize="11pt" fontWeight={800}>
                Username
              </Text>
              <Text fontSize="10pt" color="gray.500">
                Set a username here.
              </Text>
              <Input
                value={updatedDisplayName}
                onChange={handleUserNameChange}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                fontSize="11pt"
                _focus={{
                  outline: "none",
                  bg: "white",
                  border: "1px solid black",
                }}
              />
              {inputFocused && (
                <Text
                  fontSize="10pt"
                  color={charsRemaining === 0 ? "red" : "gray.500"}
                  pt={2}
                >
                  {charsRemaining} Characters remaining
                </Text>
              )}

              <Flex
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                pt={4}
              >
                <Text fontSize="11pt" fontWeight={800}>
                  Profile
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  color="blue.500"
                  fontWeight={700}
                  fontSize="10pt"
                  onClick={() => selectFileRef.current?.click()}
                >
                  EDIT
                </Button>
              </Flex>
              <Text fontSize="10pt" color="gray.500">
                It's recommended to use JPEG or PNG image.
              </Text>
              <Box
                flexDirection="column"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <Box
                  borderRadius="md"
                  bg="gray.100"
                  w="100%"
                  h="180px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mt={3}
                  mb={3}
                >
                  {selectedFile ? (
                    <Image
                      borderRadius="full"
                      boxSize="160px"
                      src={selectedFile}
                      alt="Selected Image"
                      position="relative"
                      color="blue.500"
                      objectFit="cover"
                    />
                  ) : user?.photoURL ? (
                    <Image
                      borderRadius="full"
                      boxSize="160px"
                      src={user.photoURL}
                      alt="Dan Abramov"
                      position="relative"
                      color="blue.500"
                      objectFit="cover"
                    />
                  ) : (
                    <Icon as={FaUserCircle} fontSize="160px" color="gray.300" />
                  )}
                </Box>
              </Box>
            </Stack>
            <Flex justifyContent="center" alignItems="center">
              <input
                id="file-upload-modal"
                hidden
                type="file"
                accept="image/x-png,image/gif,image/jpeg"
                ref={selectFileRef}
                onChange={onSelectImage}
              />
            </Flex>
          </ModalBody>
          <Divider />
          <ModalFooter width="100%">
            <Flex width="40%">
              <Button
                variant="outline"
                size="sm"
                onClick={closeModal}
                width="48%"
              >
                <Text fontSize="10pt" fontWeight={600}>
                  Cancel
                </Text>
              </Button>
              <Button
                size="sm"
                ml={3}
                onClick={handleSaveChanges}
                width="48%"
                isLoading={imageLoading || displayNameLoading}
              >
                <Text fontSize="10pt" fontWeight={600}>
                  Save
                </Text>
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default ProfilePage;
