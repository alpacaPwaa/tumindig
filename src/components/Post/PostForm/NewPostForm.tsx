import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  Input,
  Stack,
  Textarea,
  Image,
} from "@chakra-ui/react";
import { User } from "firebase/auth";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useSetRecoilState } from "recoil";
import { firestore, storage } from "../../../firebase/clientApp";
import { postState } from "../../../atoms/postsAtom";
import {
  getDownloadURL,
  getMetadata,
  ref,
  uploadString,
} from "firebase/storage";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import ResizeTextarea from "react-textarea-autosize";
import { IoMdImages } from "react-icons/io";

export type TabItemType = {
  title: string;
  icon: typeof Icon.arguments;
};

type NewPostFormProps = {
  communityId: string;
  communityImageURL?: string;
  user: User;
};

const NewPostForm: React.FC<NewPostFormProps> = ({
  communityId,
  communityImageURL,
  user,
}) => {
  const [textInputs, setTextInputs] = useState({
    title: "",
    body: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const selectFileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const setPostItems = useSetRecoilState(postState);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const handleCreatePost = async () => {
    setLoading(true);
    const { title, body } = textInputs;
    try {
      const postDocRef = await addDoc(collection(firestore, "posts"), {
        communityId,
        communityImageURL: communityImageURL || "",
        creatorId: user.uid,
        userDisplayText: user.email!.split("@")[0],
        title,
        body,
        numberOfComments: 0,
        voteStatus: 0,
        createdAt: serverTimestamp(),
        editedAt: serverTimestamp(),
      });

      console.log("HERE IS NEW POST ID", postDocRef.id);

      // check if selectedFiles exists, if it does, do image processing
      let mediaURLs: string[] = [];
      let mediaTypes: string[] = [];

      if (selectedFiles && selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const mediaRef = ref(storage, `posts/${postDocRef.id}/media${i}`);
          await uploadString(mediaRef, selectedFiles[i], "data_url");
          const downloadURL = await getDownloadURL(mediaRef);
          const metadata = await getMetadata(mediaRef);
          const mediaType = metadata?.contentType || ""; // Use an empty string as fallback

          mediaURLs.push(downloadURL);
          mediaTypes.push(mediaType);
        }

        await updateDoc(postDocRef, {
          mediaURLs: mediaURLs,
          mediaTypes: mediaTypes,
        });
      }

      // Clear the cache to cause a refetch of the posts
      setPostItems((prev) => ({
        ...prev,
        postUpdateRequired: true,
      }));
      // router.events.on("routeChangeComplete", () => {
      //   // Reload the page after route change
      //   window.location.reload();
      // });

      // Navigate back to the previous page
      router.back();
    } catch (error) {
      console.log("createPost error", error);
      setError("Error creating post");
    }
    setLoading(false);
  };

  const onSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result;
          if (dataUrl) {
            urls.push(dataUrl.toString());
            if (i === files.length - 1) {
              setSelectedFiles(urls);
            }
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result;
          if (dataUrl) {
            urls.push(dataUrl.toString());
            if (i === files.length - 1) {
              setSelectedFiles(urls);
            }
          }
        };
        reader.readAsDataURL(files[i]);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onTextChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTextInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextSlide = () => {
    if (selectedFiles) {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % selectedFiles.length);
    }
  };

  const prevSlide = () => {
    if (selectedFiles) {
      setCurrentSlide((prevSlide) =>
        prevSlide === 0 ? selectedFiles.length - 1 : prevSlide - 1
      );
    }
  };

  const calculateSlideOffset = (index: number) => {
    if (slideContainerRef.current) {
      const slideWidth = slideContainerRef.current.clientWidth;
      return -index * slideWidth;
    }
    return 0;
  };

  return (
    <Flex bg="white" flexDirection="column" p={5} borderRadius="md" mt={6}>
      <Text fontWeight={600} fontSize="12pt">
        Create a Post
      </Text>
      <Flex width="100%" flexDirection="column" mt={3}>
        <Input
          name="title"
          value={textInputs.title}
          onChange={onTextChange}
          disabled={loading}
          _placeholder={{ color: "gray.500" }}
          _focus={{
            outline: "none",
            bg: "white",
            border: "1px solid",
            borderColor: "black",
          }}
          fontSize="10pt"
          borderRadius={4}
          placeholder="Title"
        />
        <Flex
          flexDirection="column"
          borderRadius={2}
          border="1px solid"
          borderColor="gray.100"
          mt={2}
          p={2}
        >
          <Textarea
            variant="unstyled"
            name="body"
            value={textInputs.body}
            onChange={onTextChange}
            fontSize="10pt"
            placeholder="Text (optional)"
            _placeholder={{ color: "gray.500" }}
            _focus={{
              outline: "none",
            }}
            as={ResizeTextarea}
            disabled={loading}
            pl={2}
            pb={2}
          />
          <Flex direction="column" justify="center" align="center" width="100%">
            {selectedFiles && selectedFiles.length > 0 ? (
              <>
                <Flex justify="center" align="center" position="relative">
                  {selectedFiles && selectedFiles.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Previous Slide"
                      onClick={prevSlide}
                      position="absolute"
                      backgroundColor="white"
                      left={3}
                      zIndex={1}
                    >
                      <ChevronLeftIcon fontSize="14pt" position="absolute" />
                    </Button>
                  )}
                  <Box
                    display="flex"
                    width="100%"
                    overflow="hidden"
                    position="relative"
                  >
                    <Flex
                      ref={slideContainerRef}
                      transition="transform 0.3s ease"
                      align="center"
                      transform={`translateX(${calculateSlideOffset(
                        currentSlide
                      )}px)`}
                    >
                      {selectedFiles.map((file, index) => (
                        <Box
                          key={file}
                          flex="0 0 100%"
                          maxWidth="100%"
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          pr={
                            index < selectedFiles.length - 1 ? "4px" : "0"
                          } /* Add spacing between images */
                        >
                          {file.startsWith("data:image/") ? (
                            <Image
                              src={file}
                              width="100%"
                              maxHeight="400px"
                              objectFit="contain"
                            />
                          ) : file.startsWith("data:video/") ? (
                            <video
                              src={file}
                              controls
                              style={{
                                maxHeight: "460px",
                                width: "auto",
                                height: "auto",
                                justifyContent: "center",
                                alignSelf: "center",
                              }}
                            />
                          ) : null}
                        </Box>
                      ))}
                    </Flex>
                  </Box>
                  {selectedFiles && selectedFiles.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Next Slide"
                      backgroundColor="white"
                      onClick={nextSlide}
                      position="absolute"
                      right={3}
                    >
                      <ChevronRightIcon fontSize="14pt" position="absolute" />
                    </Button>
                  )}
                </Flex>
              </>
            ) : (
              <Flex
                justify="center"
                align="center"
                flexDirection="column"
                p={20}
                border="1px"
                borderColor="gray.200"
                bg="gray.50"
                borderRadius={4}
                width="100%"
                cursor="pointer"
                onClick={() => selectFileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                _hover={{
                  bg: "gray.100",
                }}
              >
                <Flex bg="gray.100" borderRadius="full" p={3}>
                  <Icon as={IoMdImages} fontSize={40} color="gray.500" />
                </Flex>
                <Text fontSize="11pt" fontWeight={600}>
                  Upload Images/Videos
                </Text>
                <Text fontSize="10pt" fontWeight={600} color="gray.500">
                  or drag and drop
                </Text>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/x-png,image/gif,image/jpeg,video/mp4,video/mpeg,video/quicktime"
                  hidden
                  ref={selectFileRef}
                  onChange={onSelectImage}
                  multiple
                />
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
      <Flex justify="flex-end" mt={2}>
        {selectedFiles && selectedFiles.length > 0 && (
          <Button
            size="sm"
            mr={2}
            variant="outline"
            fontSize="10pt"
            onClick={() => setSelectedFiles([])}
          >
            Clear Media
          </Button>
        )}
        <Button
          size="sm"
          fontSize="10pt"
          padding="0px 30px"
          disabled={!textInputs.title || loading}
          isLoading={loading}
          onClick={handleCreatePost}
        >
          Post
        </Button>
      </Flex>
    </Flex>
  );
};
export default NewPostForm;
