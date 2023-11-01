import React, { useState } from "react";
import { Button, Divider, Flex, Icon, Image, Text } from "@chakra-ui/react";
import { IconType } from "react-icons";
import useDirectory from "../../../hooks/useDirectory";
import { Community } from "../../../atoms/communitiesAtom";
import { IoIosArrowForward } from "react-icons/io";

type DirectoryItemProps = {
  displayText: string;
  link: string;
  icon: IconType;
  iconColor: string;
  imageURL?: string;
  linkToPost?: string;
};

const MenuListPost: React.FC<DirectoryItemProps> = ({
  displayText,
  link,
  icon,
  iconColor,
  imageURL,
}) => {
  const { onSelectMenuItem } = useDirectory();

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      fontSize="10pt"
      borderRadius="md"
      p="5px"
      cursor="pointer"
      _hover={{ bg: "gray.100" }}
      onClick={() =>
        onSelectMenuItem({
          displayText,
          icon,
          iconColor,
          imageURL,
          link,
        })
      }
    >
      <Flex alignItems="center">
        {imageURL ? (
          <Image
            borderRadius="full"
            boxSize="36px"
            src={imageURL}
            mr={2}
            objectFit="cover"
          />
        ) : (
          <Icon fontSize={36} mr={2} as={icon} color={iconColor} />
        )}
        <Text
          maxWidth="100%" // Adjust the maximum width as needed
          wordBreak="break-word"
          fontWeight={600}
          fontSize="10pt"
        >
          {displayText}
        </Text>
      </Flex>
      <Icon color="gray.500" fontSize="13pt" as={IoIosArrowForward} />
    </Flex>
  );
};
export default MenuListPost;
