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
  useMediaQuery,
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
import { HiUserGroup } from "react-icons/hi2";

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
  const [communityCategory, setCommunityCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [organizationVolunteerType, setOrganizationVolunteerType] =
    useState("");
  const [user] = useAuthState(auth);
  const isNameEmpty = name.trim() === "";
  const [md] = useMediaQuery("(min-width: 768px)");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > 50) return;
    setName(event.target.value);
    setCharsRemaining(50 - event.target.value.length);
  };

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
      <Divider />
      <ModalCloseButton _focus={{ border: "none" }} />
      <ModalBody
        display="flex"
        flexDirection="column"
        padding="10px 0px"
        pl={3}
        pr={3}
      >
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
        <Box mt={2}>
          <Menu autoSelect={false} matchWidth>
            <Text fontWeight={600} fontSize={15}>
              Community Advocacy
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
              maxHeight="250px"
              overflowY="auto"
            >
              <MenuItem
                onClick={() =>
                  setOrganizationVolunteerType("Hunger & Homelessness")
                }
              >
                Hunger & Homelessness
              </MenuItem>
              <MenuItem
                onClick={() =>
                  setOrganizationVolunteerType("Health & Wellness")
                }
              >
                Health & Wellness
              </MenuItem>
              <MenuItem
                onClick={() =>
                  setOrganizationVolunteerType("Faith & Spirituality")
                }
              >
                Faith & Spirituality
              </MenuItem>
              <MenuItem
                onClick={() =>
                  setOrganizationVolunteerType("Animal & Wildlife")
                }
              >
                Animal & Wildlife
              </MenuItem>
              <MenuItem
                onClick={() =>
                  setOrganizationVolunteerType("Childrean & Youth")
                }
              >
                Childrean & Youth
              </MenuItem>
              <MenuItem
                onClick={() =>
                  setOrganizationVolunteerType("Environment & Conservation")
                }
              >
                Environment & Conservation
              </MenuItem>
              <MenuItem
                onClick={() =>
                  setOrganizationVolunteerType("Human & Social Services")
                }
              >
                Human & Social Services
              </MenuItem>
              <MenuItem
                onClick={() =>
                  setOrganizationVolunteerType("International Development")
                }
              >
                International Development
              </MenuItem>
              <MenuItem
                onClick={() => setOrganizationVolunteerType("Arts & Culture")}
              >
                Arts & Culture
              </MenuItem>
              <MenuItem
                onClick={() => setOrganizationVolunteerType("Women & Girls")}
              >
                Women & Girls
              </MenuItem>
              <MenuItem onClick={() => setOrganizationVolunteerType("Others")}>
                Others
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
        <Box mt={4} mb={4}>
          <Text fontWeight={600} fontSize={15}>
            Community Visibility
          </Text>
          <Stack spacing={2} pt={1}>
            <Flex
              flexDirection={md ? "row" : "column"}
              alignItems={md ? "center" : ""}
            >
              <Checkbox
                colorScheme="blue"
                name="public"
                isChecked={communityType === "public"}
                onChange={onCommunityTypeChange}
              >
                <Flex alignItems="center">
                  <Icon as={FaGlobeAmericas} mr={2} color="gray.500" />
                  <Text fontSize="10pt" fontWeight={600} mr={1}>
                    Public
                  </Text>
                </Flex>
              </Checkbox>
              <Text fontSize="8pt" color="gray.500" ml={md ? "" : 5}>
                Anyone can view, post, and comment to this community
              </Text>
            </Flex>
            <Flex
              flexDirection={md ? "row" : "column"}
              alignItems={md ? "center" : ""}
            >
              <Checkbox
                colorScheme="blue"
                name="restricted"
                isChecked={communityType === "restricted"}
                onChange={onCommunityTypeChange}
              >
                <Flex flexDirection="row" align="center">
                  <Icon as={BsFillEyeFill} color="gray.500" mr={2} />
                  <Text fontSize="10pt" fontWeight={600} mr={1}>
                    Restricted
                  </Text>
                </Flex>
              </Checkbox>
              <Text fontSize="8pt" color="gray.500" ml={md ? "" : 5}>
                Anyone can view this community, but only approved users can post
              </Text>
            </Flex>
          </Stack>
        </Box>

        <Box mt={3}>
          <Text fontWeight={600} fontSize={15} mb={1}>
            Others
          </Text>
          <Flex
            flexDirection={md ? "row" : "column"}
            alignItems={md ? "center" : ""}
          >
            <Checkbox
              colorScheme="blue"
              name="Organization"
              isChecked={communityCategory === "Organization"}
              onChange={() =>
                setCommunityCategory(
                  communityCategory === "Organization" ? "" : "Organization"
                )
              }
            >
              <Flex flexDirection="row" align="center">
                <Icon as={HiUserGroup} color="gray.500" mr={2} />
                <Text fontSize="10pt" fontWeight={600} mr={1}>
                  Organization
                </Text>
              </Flex>
            </Checkbox>
            <Text fontSize="8pt" color="gray.500" ml={md ? "" : 5}>
              Check if your community is an organization.
            </Text>
          </Flex>
        </Box>
      </ModalBody>

      <ModalFooter bg="gray.100" borderRadius="0px 0px 10px 10px">
        <Button variant="outline" height="30px" mr={2} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="solid"
          height="30px"
          onClick={handleCreateCommunity}
          disabled={isNameEmpty || loading}
          isLoading={loading}
        >
          Create Community
        </Button>
      </ModalFooter>
    </ModalWrapper>
  );
};
export default CreateCommunityModal;
