import React, { Ref, useRef, useState } from "react";
import {
  Flex,
  Stack,
  Button,
  Image,
  Box,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

type ImageUploadProps = {
  selectedFiles?: string[];
  setSelectedFiles: (value: string[]) => void;
  selectFileRef: React.RefObject<HTMLInputElement>;
  onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  selectedFiles,
  setSelectedFiles,
  selectFileRef,
  onSelectImage,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideContainerRef = useRef<HTMLDivElement>(null);

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
                        alt="Image"
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
          <Stack direction="row" mt={4} align="center">
            <Button height="28px">Back to Post</Button>
            <Button
              variant="outline"
              height="28px"
              onClick={() => setSelectedFiles([])}
            >
              Remove
            </Button>
          </Stack>
        </>
      ) : (
        <Flex
          justify="center"
          align="center"
          p={20}
          border="1px dashed"
          borderColor="gray.200"
          borderRadius={4}
          width="100%"
        >
          <Button
            variant="outline"
            height="28px"
            onClick={() => selectFileRef.current?.click()}
          >
            Upload
          </Button>
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
  );
};
export default ImageUpload;
