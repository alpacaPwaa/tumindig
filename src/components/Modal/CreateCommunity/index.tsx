import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Icon,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Stack,
  Text,
} from "@chakra-ui/react";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/router";
import { BsFillEyeFill } from "react-icons/bs";
import { useSetRecoilState } from "recoil";
import { communityState } from "../../../atoms/communitiesAtom";
import { auth, firestore } from "../../../firebase/clientApp";
import ModalWrapper from "../ModalWrapper";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import { User } from "firebase/auth";
import { FaGlobeAmericas } from "react-icons/fa";

type CreateCommunityModalProps = {
  isOpen: boolean;
  handleClose: () => void;
  userId: string;
  user?: User | null;
};

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  handleClose,
  userId,
}) => {
  const setSnippetState = useSetRecoilState(communityState);
  const [name, setName] = useState("");
  const [charsRemaining, setCharsRemaining] = useState(50);
  const [nameError, setNameError] = useState("");
  const [communityType, setCommunityType] = useState("public");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState("");
  const [
    showOrganizationVolunteerSubMenu,
    setShowOrganizationVolunteerSubMenu,
  ] = useState(false);
  const [organizationVolunteerType, setOrganizationVolunteerType] =
    useState("");
  const [user] = useAuthState(auth);
  const isNameEmpty = name.trim() === "";

  const handleItemClick = (text: string) => {
    setSelectedItem(text);
    if (text !== "Sponsor") {
      setShowOrganizationVolunteerSubMenu(true);
    } else {
      setShowOrganizationVolunteerSubMenu(false);
      setOrganizationVolunteerType(""); // reset the organization type when user selects another category
    }
    if (
      text === "Non-Profit" ||
      text === "Charity" ||
      text === "Other" ||
      text === "Education" ||
      text === "Environment" ||
      text === "Advocacy" ||
      text === "Religion"
    ) {
      setOrganizationVolunteerType(text); // set the organization type when user selects a relevant option
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > 50) return;
    setName(event.target.value);
    setCharsRemaining(50 - event.target.value.length);
  };

  const communityCategory =
    selectedItem === "Volunteer" ||
    selectedItem === "Organization" ||
    selectedItem === "Sponsor"
      ? selectedItem
      : "";

  const handleCreateCommunity = async () => {
    if (nameError) setNameError("");
    const format = /[`!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;

    if (format.test(name) || name.length < 3) {
      return setNameError(
        "Community names must be between 3–50 characters, and can only contain letters, numbers, or underscores."
      );
    }

    setLoading(true);
    try {
      // Create community document and communitySnippet subcollection document on user
      const communityDocRef = doc(firestore, "communities", name);
      await runTransaction(firestore, async (transaction) => {
        const communityDoc = await transaction.get(communityDocRef);
        if (communityDoc.exists()) {
          throw new Error(`Sorry, /r${name} is taken. Try another.`);
        }

        transaction.set(communityDocRef, {
          communityName: name,
          creatorId: userId,
          creatorName: user?.email!.split("@")[0],
          createdAt: serverTimestamp(),
          numberOfMembers: 1,
          privacyType: communityType, // set the privacy type based on user selection
          communityCategory: communityCategory,
          organizationVolunteerType: organizationVolunteerType,
          description: "",
          bannerURL: "",
          rules: [{ title: "", body: "" }],
        });

        transaction.set(
          doc(firestore, `users/${userId}/communitySnippets`, name),
          {
            communityId: name,
            isAdmin: true,
            numberOfMembers: 1,
            userUid: user?.uid,
          }
        );
      });
    } catch (error: any) {
      console.log("Transaction error", error);
      setNameError(error.message);
    }
    setSnippetState((prev) => ({
      ...prev,
      mySnippets: [],
    }));
    handleClose();
    router.push(`/tumindig/${name}`);
    setLoading(false);
  };

  const onCommunityTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const {
      target: { name },
    } = event;
    if (name === communityType) return;
    setCommunityType(name);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} user={user}>
      <ModalHeader
        display="flex"
        flexDirection="column"
        fontSize={15}
        padding={3}
      >
        Create a community
      </ModalHeader>
      <Box pr={3} pl={3}>
        <Divider />
        <ModalCloseButton _focus={{ border: "none" }} />
        <ModalBody display="flex" flexDirection="column" padding="10px 0px">
          <Text fontWeight={600} fontSize={15}>
            Name
          </Text>
          <Text fontSize={11} color="gray.500">
            Community names including capitalization cannot be changed
          </Text>
          <Input
            position="relative"
            name="name"
            value={name}
            onChange={handleChange}
            pl="12px"
            type={""}
            size="sm"
          />
          <Text
            fontSize="9pt"
            color={charsRemaining === 0 ? "red" : "gray.500"}
            pt={2}
          >
            {charsRemaining} Characters remaining
          </Text>
          <Text fontSize="9pt" color="red" pt={1}>
            {nameError}
          </Text>
          <Box mt={4}>
            <Text fontWeight={600} fontSize={15}>
              Choose a Category
            </Text>
            <Menu autoSelect={false} matchWidth>
              <MenuButton
                mt={"1"}
                width="100%"
                as={Button}
                rightIcon={<ChevronDownIcon />}
                textAlign="left"
                borderRadius="md"
                variant={"outline"}
                border="1px solid gray"
                borderColor="gray.200"
                backgroundColor="white"
                color="gray.500"
                fontWeight="semibold"
              >
                {selectedItem ? selectedItem : "Select Category"}
              </MenuButton>
              <MenuList
                textAlign="left"
                color="gray.800"
                fontSize="14"
                fontWeight="semibold"
              >
                <MenuItem onClick={() => handleItemClick("Volunteer")}>
                  Volunteer
                </MenuItem>
                <MenuItem onClick={() => handleItemClick("Organization")}>
                  Organization
                </MenuItem>
                <MenuItem onClick={() => handleItemClick("Sponsor")}>
                  Sponsor
                </MenuItem>
              </MenuList>
            </Menu>
            {showOrganizationVolunteerSubMenu && (
              <Menu autoSelect={false} matchWidth>
                <Text fontWeight={600} fontSize={15} mt={"3"}>
                  Choose Organization Type
                </Text>
                <MenuButton
                  mt={"1"}
                  width="100%"
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  textAlign="left"
                  borderRadius="md"
                  variant={"outline"}
                  border="1px solid gray"
                  borderColor="gray.200"
                  backgroundColor="white"
                  color="gray.500"
                  fontWeight="semibold"
                >
                  {organizationVolunteerType
                    ? organizationVolunteerType
                    : "Select Tags"}
                </MenuButton>
                <MenuList
                  textAlign="left"
                  color="gray.800"
                  fontSize="14"
                  fontWeight="semibold"
                >
                  <MenuItem
                    onClick={() => setOrganizationVolunteerType("Non-Profit")}
                  >
                    Non-profit
                  </MenuItem>
                  <MenuItem
                    onClick={() => setOrganizationVolunteerType("Charity")}
                  >
                    Charity
                  </MenuItem>
                  <MenuItem
                    onClick={() => setOrganizationVolunteerType("Education")}
                  >
                    Education
                  </MenuItem>
                  <MenuItem
                    onClick={() => setOrganizationVolunteerType("Environment")}
                  >
                    Environment
                  </MenuItem>
                  <MenuItem
                    onClick={() => setOrganizationVolunteerType("Advocacy")}
                  >
                    Advocacy
                  </MenuItem>
                  <MenuItem
                    onClick={() => setOrganizationVolunteerType("Religion")}
                  >
                    Religion
                  </MenuItem>
                  <MenuItem
                    onClick={() => setOrganizationVolunteerType("Others")}
                  >
                    Others
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </Box>
          <Box mt={4} mb={4}>
            <Text fontWeight={600} fontSize={15}>
              Community Visibility
            </Text>
            <Stack spacing={2} pt={1}>
              <Checkbox
                colorScheme="blue"
                name="public"
                isChecked={communityType === "public"}
                onChange={onCommunityTypeChange}
              >
                <Flex alignItems="center">
                  <Icon as={FaGlobeAmericas} mr={2} color="gray.500" />
                  <Text fontSize="10pt" mr={1}>
                    Public
                  </Text>
                  <Text fontSize="8pt" color="gray.500">
                    Anyone can view, post, and comment to this community
                  </Text>
                </Flex>
              </Checkbox>
              <Checkbox
                colorScheme="blue"
                name="restricted"
                isChecked={communityType === "restricted"}
                onChange={onCommunityTypeChange}
              >
                <Flex flexDirection="row" align="center">
                  <Icon as={BsFillEyeFill} color="gray.500" mr={2} />
                  <Text fontSize="10pt" mr={1}>
                    Restricted
                  </Text>
                  <Text fontSize="8pt" color="gray.500">
                    Anyone can view this community, but only approved users can
                    post
                  </Text>
                </Flex>
              </Checkbox>
              {/* <Checkbox
                colorScheme="blue"
                name="private"
                isChecked={communityType === "private"}
                onChange={onCommunityTypeChange}
              >
                <Flex alignItems="center">
                  <Icon as={HiLockClosed} color="gray.500" mr={2} />
                  <Text fontSize="10pt" mr={1}>
                    Private
                  </Text>
                  <Text fontSize="8pt" color="gray.500">
                    Only approved users can view and submit to this community
                  </Text>
                </Flex>
              </Checkbox> */}
            </Stack>
          </Box>
        </ModalBody>
      </Box>
      <ModalFooter bg="gray.100" borderRadius="0px 0px 10px 10px">
        <Button variant="outline" height="30px" mr={2} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="solid"
          height="30px"
          onClick={handleCreateCommunity}
          disabled={!communityCategory || isNameEmpty || loading}
          isLoading={loading}
        >
          Create Community
        </Button>
      </ModalFooter>
    </ModalWrapper>
  );
};
export default CreateCommunityModal;
