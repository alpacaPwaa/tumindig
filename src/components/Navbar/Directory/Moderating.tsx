import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { FaReddit } from "react-icons/fa";
import { CommunitySnippet } from "../../../atoms/communitiesAtom";
import MenuListItem from "./MenuListItem";
import { IoPeopleCircleSharp } from "react-icons/io5";

type ModeratingProps = {
  snippets: CommunitySnippet[];
};

const Moderating: React.FC<ModeratingProps> = ({ snippets }) => {
  return (
    <Box mt={3} mb={3}>
      <Text pl={3} mb={1} fontSize="7pt" fontWeight={500} color="gray.500">
        MODERATING
      </Text>
      {snippets.map((snippet) => (
        <MenuListItem
          key={snippet.communityId}
          displayText={`${snippet.communityId}`}
          link={`tumindig/${snippet.communityId}`}
          icon={IoPeopleCircleSharp}
          iconColor="gray.300"
        />
      ))}
    </Box>
  );
};
export default Moderating;
