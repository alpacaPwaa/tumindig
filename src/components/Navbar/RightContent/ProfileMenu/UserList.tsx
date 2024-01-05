import React from "react";
import {
  AspectRatio,
  Box,
  Flex,
  Icon,
  MenuDivider,
  MenuItem,
  Text,
  Image,
} from "@chakra-ui/react";
import { signOut } from "firebase/auth";
import { CgProfile } from "react-icons/cg";
import { MdOutlineLogin } from "react-icons/md";
import { useResetRecoilState } from "recoil";
import { communityState } from "../../../../atoms/communitiesAtom";
import { auth } from "../../../../firebase/clientApp";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { FaUserCircle } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";
import { RxDotFilled } from "react-icons/rx";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { BiDonateHeart } from "react-icons/bi";

type UserListProps = {};

const UserList: React.FC<UserListProps> = () => {
  const resetCommunityState = useResetRecoilState(communityState);
  const [user] = useAuthState(auth);
  const router = useRouter();

  const logout = async () => {
    await signOut(auth);
    resetCommunityState();
  };

  const goToProfile = () => {
    router.push(`/user/${user?.email?.split("@")[0]}`); // Use router.push to navigate to the profile page
  };

  const goToSupportPage = () => {
    router.push(`/support`); // Use router.push to navigate to the profile page
  };

  return (
    <>
      <MenuItem>
        <Flex alignItems="center" width="220px">
          {user ? (
            <>
              {user?.photoURL ? (
                <Box
                  borderRadius="full"
                  overflow="hidden"
                  boxSize="36px"
                  mr={3}
                >
                  <AspectRatio ratio={1 / 1}>
                    <Image
                      src={user.photoURL}
                      alt="User Photo"
                      objectFit="cover"
                      boxSize="100%"
                    />
                  </AspectRatio>
                </Box>
              ) : (
                <Icon
                  as={FaUserCircle}
                  fontSize="36px"
                  color="gray.300"
                  mr={3}
                />
              )}
            </>
          ) : (
            <Icon fontSize={24} mr={1} color="gray.400" as={VscAccount} />
          )}
          <Flex flexDirection="column">
            <Text fontWeight={700} fontSize="10pt">
              {user?.displayName || user?.email?.split("@")[0]}
            </Text>
          </Flex>
        </Flex>
      </MenuItem>
      <MenuDivider />
      <MenuItem
        fontSize="10pt"
        fontWeight={600}
        _hover={{ bg: "blue.500", color: "white" }}
        onClick={goToProfile}
      >
        <Flex alignItems="center">
          <Icon fontSize={22} mr="8px" ml="7px" as={CgProfile} />
          Profile
        </Flex>
      </MenuItem>
      <MenuDivider />
      <MenuItem
        fontSize="10pt"
        fontWeight={600}
        _hover={{ bg: "blue.500", color: "white" }}
        onClick={goToSupportPage}
      >
        <Flex alignItems="center">
          <Icon fontSize={22} mr="8px" ml="7px" as={BiDonateHeart} />
          Support
        </Flex>
      </MenuItem>
      <MenuDivider />
      <MenuItem
        fontSize="10pt"
        fontWeight={600}
        _hover={{ bg: "blue.500", color: "white" }}
        onClick={logout}
      >
        <Flex alignItems="center">
          <Icon fontSize={22} mr="8px" ml="7px" as={RiLogoutBoxRLine} />
          Log Out
        </Flex>
      </MenuItem>
    </>
  );
};
export default UserList;
