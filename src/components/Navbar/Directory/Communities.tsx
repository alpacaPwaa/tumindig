import React, { useState } from "react";
import { Box, Divider, Flex, Icon, MenuItem, Text } from "@chakra-ui/react";
import { useAuthState } from "react-firebase-hooks/auth";
import { GrAdd } from "react-icons/gr";
import { useRecoilValue } from "recoil";
import { communityState } from "../../../atoms/communitiesAtom";
import { auth } from "../../../firebase/clientApp";
import CreateCommunityModal from "../../Modal/CreateCommunity";
import MenuListItem from "./MenuListItem";
import { IoPeopleCircleSharp } from "react-icons/io5";
import { AiFillCompass } from "react-icons/ai";
import { TiHome } from "react-icons/ti";
import router from "next/router";
import useDirectory from "../../../hooks/useDirectory";
import { defaultMenuItem } from "../../../atoms/directoryMenuAtom";

type CommunitiesProps = {
  menuOpen: boolean;
};

const Communities: React.FC<CommunitiesProps> = ({ menuOpen }) => {
  const [user] = useAuthState(auth);
  const [open, setOpen] = useState(false);
  const mySnippets = useRecoilValue(communityState).mySnippets;
  const { onSelectMenuItem } = useDirectory();

  const goToCommunityList = () => {
    router.push(`/communities`); // Use router.push to navigate to the profile page
  };

  return (
    <>
      <CreateCommunityModal
        isOpen={open}
        handleClose={() => setOpen(false)}
        userId={user?.uid!}
      />
      <Text pl={3} mb={1} fontSize="7pt" fontWeight={600} color="gray.500">
        COMMUNITIES
      </Text>
      <MenuItem
        width="100%"
        fontSize="10pt"
        fontWeight={600}
        _hover={{ bg: "gray.100" }}
        onClick={() => onSelectMenuItem(defaultMenuItem)}
      >
        <Flex alignItems="center">
          <Icon fontSize={24} mr={2} as={TiHome} />
          Home
        </Flex>
      </MenuItem>
      <MenuItem
        width="100%"
        fontSize="10pt"
        fontWeight={600}
        _hover={{ bg: "gray.100" }}
        onClick={goToCommunityList}
      >
        <Flex alignItems="center">
          <Icon fontSize={20} mr={2} as={AiFillCompass} />
          Discover
        </Flex>
      </MenuItem>
      <MenuItem
        width="100%"
        fontSize="10pt"
        fontWeight={600}
        _hover={{ bg: "gray.100" }}
        onClick={() => setOpen(true)}
        mb={1}
      >
        <Flex alignItems="center">
          <Icon fontSize={20} mr={2} as={GrAdd} />
          Create Community
        </Flex>
      </MenuItem>

      {/* COULD DO THIS FOR CLEANER COMPONENTS */}
      {/* <Moderating snippets={snippetState.filter((item) => item.isModerator)} />
      <MyCommunities snippets={snippetState} setOpen={setOpen} /> */}
      {mySnippets.find((item) => item.isAdmin) && (
        <>
          <Divider width="95%" m="auto" />
          <Box mt={3} mb={1}>
            <Text
              pl={3}
              mb={1}
              fontSize="7pt"
              fontWeight={600}
              color="gray.500"
            >
              MODERATING
            </Text>
            {mySnippets
              .filter((item) => item.isAdmin)
              .map((snippet) => (
                <MenuListItem
                  key={snippet.communityId}
                  displayText={`${snippet.communityId}`}
                  link={`/tumindig/${snippet.communityId}`}
                  icon={IoPeopleCircleSharp}
                  iconColor="gray.300"
                  imageURL={snippet.imageURL}
                />
              ))}
          </Box>
        </>
      )}
      <Divider width="95%" m="auto" />
      <Box mt={3} mb={4}>
        <Text pl={3} mb={1} fontSize="7pt" fontWeight={600} color="gray.500">
          MY COMMUNITIES
        </Text>
        {mySnippets.map((snippet, index) => (
          <MenuListItem
            key={index}
            icon={IoPeopleCircleSharp}
            displayText={`${snippet.communityId}`}
            link={`/tumindig/${snippet.communityId}`}
            iconColor="gray.300"
            imageURL={snippet.imageURL}
          />
        ))}
      </Box>
    </>
  );
};

export default Communities;
