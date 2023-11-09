import React, { useRef, useState } from "react";
import { Community, communityState } from "../../../atoms/communitiesAtom";
import { auth, firestore, storage } from "../../../firebase/clientApp";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import {
  doc,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  Box,
  Divider,
  Flex,
  Icon,
  Stack,
  Text,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalFooter,
  Button,
  useMediaQuery,
} from "@chakra-ui/react";
import { useAuthState } from "react-firebase-hooks/auth";
import { BiCustomize } from "react-icons/bi";
import { IoPeopleCircleSharp } from "react-icons/io5";
import { Post } from "../../../atoms/postsAtom";

type CommunityCustomizationProps = {
  post: Post;
  communityData: Community;
  pt?: number;
  onCreatePage?: boolean;
  loading?: boolean;
};

const CommunityCustomization: React.FC<CommunityCustomizationProps> = ({
  communityData,
}) => {
  const [user] = useAuthState(auth); // will revisit how 'auth' state is passed
  const setCommunityStateValue = useSetRecoilState(communityState);
  const [communityStateValue] = useRecoilState(communityState);
  const [selectedFile, setSelectedFile] = useState<string>();
  const selectFileRef = useRef<HTMLInputElement>(null);
  const [selectedBanner, setSelectedBanner] = useState<string>();
  const selectBannerRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false); // State to control the modal visibility
  const [md] = useMediaQuery("(min-width: 768px)");
  const [saveLoading, setSaveLoading] = useState(false);

  const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (event.target.files?.[0]) {
      reader.readAsDataURL(event.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      if (readerEvent.target?.result) {
        setSelectedFile(readerEvent.target?.result as string);
      }
    };
  };

  const onSelectBanner = (event: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (event.target.files?.[0]) {
      reader.readAsDataURL(event.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      if (readerEvent.target?.result) {
        setSelectedBanner(readerEvent.target?.result as string);
      }
    };
  };

  const updateBanner = async () => {
    try {
      if (selectedBanner && selectedBanner.startsWith("data:image/")) {
        const bannerRef = ref(
          storage,
          `communities/${communityData.id}/banner`
        );

        // Upload the banner as a data URL
        await uploadString(bannerRef, selectedBanner, "data_url");
        const downloadURL = await getDownloadURL(bannerRef);

        // Update the community bannerURL
        await updateDoc(doc(firestore, "communities", communityData.id), {
          bannerURL: downloadURL,
        });

        // Update the Recoil state for bannerURL
        setCommunityStateValue((prev) => ({
          ...prev,
          currentCommunity: {
            ...prev.currentCommunity,
            bannerURL: downloadURL,
          },
        }));

        // Update the bannerURL for associated posts (if necessary)
        const postQuery = query(
          collection(firestore, "posts"),
          where("communityId", "==", communityData.id)
        );
        const postSnapshot = await getDocs(postQuery);
        postSnapshot.forEach(async (postDoc) => {
          const postId = postDoc.id;
          await updateDoc(doc(firestore, "posts", postId), {
            communityBannerURL: downloadURL,
          });
        });
      }
    } catch (error: any) {
      console.error("Banner update error", error.message);
    }
  };

  const updateProfileImage = async () => {
    try {
      if (selectedFile) {
        const imageRef = ref(storage, `communities/${communityData.id}/image`);
        await uploadString(imageRef, selectedFile, "data_url");
        const downloadURL = await getDownloadURL(imageRef);

        // Update the communityImageURL for the current community
        await updateDoc(doc(firestore, "communities", communityData.id), {
          imageURL: downloadURL,
        });

        // Update the communityImageURL for each post associated with the community
        const postQuery = query(
          collection(firestore, "posts"),
          where("communityId", "==", communityData.id)
        );
        const postSnapshot = await getDocs(postQuery);
        postSnapshot.forEach(async (postDoc) => {
          const postId = postDoc.id;
          await updateDoc(doc(firestore, "posts", postId), {
            communityImageURL: downloadURL,
          });
        });

        // Update the Recoil state for imageURL
        setCommunityStateValue((prev) => ({
          ...prev,
          currentCommunity: {
            ...prev.currentCommunity,
            imageURL: downloadURL,
          },
        }));
      }
    } catch (error: any) {
      console.error("Profile image update error", error.message);
    }
  };

  const saveChanges = async () => {
    try {
      setSaveLoading(true);

      // Call the update functions separately
      await updateBanner();
      await updateProfileImage();

      handleCloseModal();
    } catch (error: any) {
      console.error("saveChanges error", error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleModal = () => {
    setSelectedFile(communityData?.imageURL || undefined); // Set selectedFile based on communityData
    setSelectedBanner(communityData?.bannerURL || undefined); // Set selectedBanner based on communityData
    setShowModal(!showModal); // Toggle the modal visibility
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };

  const isUserModerator = !!communityStateValue.moderatorSnippets.find(
    (snippet) =>
      snippet.communityId === communityData.id &&
      snippet.isModerator === true &&
      snippet.userUid === user?.uid
  );

  return (
    <Box>
      {user && (user.uid === communityData.creatorId || isUserModerator) && (
        <>
          <Divider />
          <Stack spacing={1}>
            <Flex
              align="center"
              justifyContent="space-between"
              cursor="pointer"
            >
              <Button
                fontSize="10pt"
                variant="ghost"
                width="100%"
                color="blue.500"
                mt={2}
                onClick={handleToggleModal}
              >
                <Icon
                  as={BiCustomize}
                  mr={2}
                  fontSize="10pt"
                  color="blue.500"
                  cursor="pointer"
                />
                COMMUNITY CUSTOMIZATION
              </Button>
            </Flex>

            <Modal
              isOpen={showModal}
              onClose={handleCloseModal}
              size={md ? "md" : "xs"}
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader fontSize={15}>Community Customization</ModalHeader>
                <ModalCloseButton _focus={{ border: "none" }} />
                <Divider />
                <ModalBody>
                  <Flex
                    justifyContent="center"
                    flexDirection="column"
                    mb={2}
                    mt={2}
                  >
                    <Flex
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Text fontSize="11pt" fontWeight={600}>
                        Community Profile
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        color="blue.500"
                        fontWeight={700}
                        fontSize="10pt"
                        mt={1}
                        onClick={() => selectFileRef.current?.click()}
                      >
                        EDIT
                      </Button>
                    </Flex>
                    <Text fontSize="10pt" color="gray.500" mb={1}>
                      Profile Image might not appear across the the entire
                      website.
                    </Text>
                    <Flex flexDirection="column" alignItems="center">
                      <Box
                        borderRadius="md"
                        mb={2}
                        bg="gray.100"
                        w="100%"
                        h="180px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {communityData?.imageURL || selectedFile ? (
                          <Image
                            borderRadius="full"
                            boxSize="160px"
                            src={selectedFile || communityData?.imageURL}
                            alt="Dan Abramov"
                            objectFit="cover"
                          />
                        ) : (
                          <Icon
                            fontSize="180px"
                            color="gray.300"
                            as={IoPeopleCircleSharp}
                          />
                        )}
                      </Box>
                    </Flex>
                    <Flex
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Text fontSize="11pt" fontWeight={600}>
                        Community Banner
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        color="blue.500"
                        fontWeight={700}
                        fontSize="10pt"
                        mt={1}
                        onClick={() => selectBannerRef.current?.click()}
                      >
                        EDIT
                      </Button>
                    </Flex>
                    <Text fontSize="10pt" color="gray.500" mb={1}>
                      Choose a banner that represent your community.
                    </Text>
                    <Flex
                      flexDirection="column"
                      alignContent="center"
                      alignItems="center"
                    >
                      {communityData?.bannerURL || selectedBanner ? (
                        <Image
                          borderRadius="md"
                          boxSize="100%"
                          maxHeight="150px"
                          src={selectedBanner || communityData?.bannerURL}
                          alt="Community Banner"
                          objectFit="cover"
                        />
                      ) : (
                        <Box
                          borderRadius="md"
                          bg="gray.200"
                          w="100%"
                          h="150px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        />
                      )}
                    </Flex>
                  </Flex>
                </ModalBody>
                <Divider />
                <ModalFooter width="100%">
                  <Flex width={md ? "40%" : "60%"}>
                    <Button
                      size="sm"
                      mr={1}
                      variant="outline"
                      width="48%"
                      fontSize="10pt"
                    >
                      <Text onClick={handleCloseModal}>Cancel</Text>
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveChanges}
                      width="48%"
                      fontSize="10pt"
                      isLoading={saveLoading}
                    >
                      <Text fontWeight={600}>Save</Text>
                    </Button>
                  </Flex>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <input
              id="file-upload"
              type="file"
              accept="image/x-png,image/gif,image/jpeg"
              hidden
              ref={selectFileRef}
              onChange={onSelectImage}
            />
            <input
              id="banner-upload"
              type="file"
              accept="image/x-png,image/gif,image/jpeg"
              hidden
              ref={selectBannerRef}
              onChange={onSelectBanner}
            />
          </Stack>
        </>
      )}
    </Box>
  );
};
export default CommunityCustomization;
