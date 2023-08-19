import React, { useState } from "react";
import { Button, Divider, Flex, Icon, Image, Text } from "@chakra-ui/react";
import { IconType } from "react-icons";
import useDirectory from "../../../hooks/useDirectory";
import { Community } from "../../../atoms/communitiesAtom";

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
      p="10px 0px 10px 0px"
      cursor="pointer"
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
        <Text fontWeight={600} fontSize="10pt">
          {displayText}
        </Text>
      </Flex>
      <Flex>
        <Button
          size="sm"
          fontSize="10pt"
          variant="outline"
          onClick={() =>
            onSelectMenuItem({ displayText, icon, iconColor, imageURL, link })
          }
        >
          Post
        </Button>
      </Flex>
    </Flex>
  );
};
export default MenuListPost;
