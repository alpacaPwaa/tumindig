import { SearchIcon } from "@chakra-ui/icons";
import {
  AspectRatio,
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Image,
  Stack,
  Input,
  Spinner,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { updateDoc, doc } from "firebase/firestore";
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  FaUserCheck,
  FaUserCircle,
  FaPen,
  FaPhone,
  FaEnvelope,
  FaGlobe,
} from "react-icons/fa";
import { IoMdAddCircleOutline } from "react-icons/io";
import { IoPersonAddSharp, IoPersonRemoveSharp } from "react-icons/io5";
import { useRecoilState } from "recoil";
import {
  Community,
  CommunitySnippet,
  communityState,
} from "../../../atoms/communitiesAtom";
import { auth, firestore } from "../../../firebase/clientApp";
import useCommunityData from "../../../hooks/useCommunityData";
import Loader from "./Loader";

type ModeratorProps = {
  communityData: Community;
  communitySnippets: CommunitySnippet[];
};

const Moderator: React.FC<ModeratorProps> = ({ communityData }) => {
  const [user] = useAuthState(auth);
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState);
  const {
    userList,
    moderatorList,
    loadingModeratorMap,
    loadMoreLoading,
    searchLoading,
    currentPage,
    onAddRemoveModerator,
    onLoadMore,
    onSearchUser,
    handleSearch,
    setSearchQuery,
  } = useCommunityData(!!communityData);
  const [isModalOpen, setModalOpen] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [editedEmail, setEditedEmail] = useState(communityData.emailContact);
  const [originalEmail, setOriginalEmail] = useState(
    communityData.emailContact
  );
  const [isEditingEmail, setEditingEmail] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [editedPhone, setEditedPhone] = useState(communityData.phoneContact);
  const [originalSite, setOriginalSite] = useState(
    communityData.websiteContact
  );
  const [isEditingPhone, setEditingPhone] = useState(false);
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [siteError, setSiteError] = useState("");
  const [editedSite, setEditedSite] = useState(communityData.websiteContact);
  const [originalPhone, setOriginalPhone] = useState(
    communityData.phoneContact
  );
  const [isEditingSite, setEditingSite] = useState(false);
  const [loadingSite, setLoadingSite] = useState(false);

  const handleAddModeratorClick = () => {
    setModalOpen(true);
  };

  const handleEmailEditClick = () => {
    setEditingEmail(!isEditingEmail);
    if (!isEditingEmail) {
      setOriginalEmail(editedEmail); // Store the current edited value as the original value
    }
  };

  const handleEmailSave = async () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(editedEmail!)) {
      setEmailError("Invalid email, please try Again");
      return;
    }

    setLoadingEmail(true);
    try {
      await updateDoc(doc(firestore, "communities", communityData.id), {
        emailContact: editedEmail,
      });
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          emailContact: editedEmail,
        },
      }));
      console.log("Email saved successfully");
      setEditingEmail(false);
      setEmailError("");
    } catch (error: any) {
      console.error("Error saving email:", error.message);
    }
    setLoadingEmail(false);
  };

  const handleEmailCancel = () => {
    setEditingEmail(false);
    setEditedEmail(originalEmail); // Reset the edited email back to its original value when canceled
  };

  const handlePhoneEditClick = () => {
    setEditingPhone(!isEditingPhone);
    if (!isEditingPhone) {
      setOriginalPhone(editedPhone); // Store the current edited value as the original value
    }
  };

  const handlePhoneSave = async () => {
    setLoadingPhone(true);
    try {
      await updateDoc(doc(firestore, "communities", communityData.id), {
        phoneContact: editedPhone,
      });
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          phoneContact: editedPhone,
        },
      }));
      console.log("Phone saved successfully");
      setEditingPhone(false); // Move this line inside the try block
    } catch (error: any) {
      console.error("Error saving phone:", error.message);
    }
    setLoadingPhone(false);
  };

  const handlePhoneCancel = () => {
    setEditingPhone(false);
    setEditedPhone(originalPhone); // Reset the edited phone back to its original value when canceled
  };

  const handleSiteEditClick = () => {
    setEditingSite(!isEditingPhone);
    if (!isEditingSite) {
      setOriginalSite(editedSite); // Store the current edited value as the original value
    }
  };

  const handleSiteSave = async () => {
    const websitePattern =
      /^(https?:\/\/)?([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})(\/[\w\.-]*)*\/?$/;
    if (!websitePattern.test(editedSite!)) {
      setSiteError("Invalid website, please try again");
      return;
    }

    setLoadingSite(true);
    try {
      await updateDoc(doc(firestore, "communities", communityData.id), {
        websiteContact: editedSite,
      });
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          websiteContact: editedSite,
        },
      }));
      console.log("Site saved successfully");
      setEditingSite(false);
      setSiteError("");
    } catch (error: any) {
      console.error("Error saving site:", error.message);
    }
    setLoadingSite(false);
  };

  const handleSiteCancel = () => {
    setEditingSite(false);
    setEditedSite(originalSite); // Reset the edited website URL back to its original value when canceled
  };

  const isUserModerator = !!communityStateValue.moderatorSnippets.find(
    (snippet) =>
      snippet.communityId === communityData.id &&
      snippet.isModerator === true &&
      snippet.userUid === user?.uid
  );

  return (
    <>
      <Box>
        <Flex
          direction="column"
          p="5px 12px 16px 12px"
          bg="white"
          borderRadius="0px 0px 4px 4px"
          mt={5}
        >
          <Flex
            justify="space-between"
            align="center"
            p={3}
            borderRadius="4px 4px 0px 0px"
          >
            <Text fontSize="11pt" fontWeight={600}>
              Contact Us
            </Text>
          </Flex>
          <Divider />
          <Text fontSize="10pt" color="gray.500" p={1} mt={1}>
            Reach out to us for any inquiries, feedback, or support regarding
            our community.
          </Text>
          <Flex flexDirection="column" fontWeight={600}>
            <Flex justifyContent="space-between">
              <Flex
                justifyContent={isEditingEmail ? "center" : ""}
                width="100%"
              >
                {isEditingEmail ? (
                  <Flex flexDirection="column" width="90%" mt={5}>
                    <Input
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      size="sm"
                      _focus={{
                        outline: "none",
                        bg: "white",
                        border: "1px solid",
                        borderColor: "black",
                      }}
                    />
                    {emailError && (
                      <Text color="red.500" fontSize="10pt" p={1}>
                        {emailError}
                      </Text>
                    )}
                    <Text fontSize="10pt" color="gray.600" p={2}>
                      Please enter a valid email address
                    </Text>
                    <Divider />
                    <Flex flexDirection="row" justifyContent="flex-end" mt={2}>
                      <Button
                        position="relative"
                        size="sm"
                        borderRadius="md"
                        fontSize="12px"
                        isLoading={loadingEmail}
                        onClick={handleEmailSave}
                      >
                        <Text>Save</Text>
                      </Button>
                      <Button
                        variant="outline"
                        position="relative"
                        ml={2}
                        borderRadius="md"
                        size="sm"
                        fontSize="12px"
                        onClick={handleEmailCancel}
                      >
                        <Text>Cancel</Text>
                      </Button>
                    </Flex>
                  </Flex>
                ) : (
                  <>
                    {editedEmail ||
                    user?.uid === communityData.creatorId ||
                    isUserModerator ? (
                      <Flex alignItems="flex-start" mt={5}>
                        <Icon
                          as={FaEnvelope}
                          fontSize={35}
                          p={2}
                          color="gray.500"
                        />
                        <Flex flexDirection="column" ml={1}>
                          <Text
                            fontSize="10pt"
                            color="blue.600"
                            cursor="pointer"
                            fontWeight="bold"
                            _hover={{ textDecoration: "underline" }}
                            onClick={handleEmailEditClick}
                          >
                            {!editedEmail && "Add Email"}
                          </Text>
                          <Text fontSize="10pt">{editedEmail}</Text>
                          <Text fontSize="8pt" color="gray.600">
                            Email
                          </Text>
                        </Flex>
                      </Flex>
                    ) : null}
                  </>
                )}
              </Flex>
              {user &&
                !isEditingEmail &&
                (user.uid === communityData.creatorId || isUserModerator) && (
                  <Flex mt={5}>
                    <Button
                      variant="ghost"
                      position="relative"
                      color="blue.500"
                      ml={2}
                      size="xs"
                      onClick={handleEmailEditClick}
                    >
                      <Icon
                        position="absolute"
                        fontSize={editedEmail ? "" : "12pt"}
                        as={editedEmail ? FaPen : IoMdAddCircleOutline}
                      />
                    </Button>
                  </Flex>
                )}
            </Flex>
            <Flex>
              <Flex
                justifyContent={isEditingPhone ? "center" : ""}
                width="100%"
              >
                {isEditingPhone ? (
                  <Flex flexDirection="column" width="90%" mt={5}>
                    <Input
                      value={editedPhone}
                      type="number"
                      onChange={(e) => setEditedPhone(+e.target.value)}
                      size="sm"
                      flexGrow={1}
                      _focus={{
                        outline: "none",
                        bg: "white",
                        border: "1px solid",
                        borderColor: "black",
                      }}
                    />
                    <Text fontSize="10pt" color="gray.600" p={2}>
                      Please enter a valid phone number
                    </Text>
                    <Divider />
                    <Flex flexDirection="row" justifyContent="flex-end" mt={2}>
                      <Button
                        size="sm"
                        borderRadius="md"
                        fontSize="12px"
                        isLoading={loadingPhone}
                        onClick={handlePhoneSave}
                      >
                        <Text>Save</Text>
                      </Button>
                      <Button
                        variant="outline"
                        borderRadius="md"
                        ml={2}
                        size="sm"
                        fontSize="12px"
                        onClick={handlePhoneCancel}
                      >
                        <Text>Cancel</Text>
                      </Button>
                    </Flex>
                  </Flex>
                ) : (
                  <>
                    {editedPhone ||
                    user?.uid === communityData.creatorId ||
                    isUserModerator ? (
                      <Flex alignItems="flex-start" mt={5}>
                        <Icon
                          fontSize={35}
                          p={2}
                          as={FaPhone}
                          color="gray.500"
                        />
                        <Flex flexDirection="column" ml={1}>
                          <Text
                            fontSize="10pt"
                            color="blue.600"
                            cursor="pointer"
                            fontWeight="bold"
                            _hover={{ textDecoration: "underline" }}
                            onClick={handlePhoneEditClick}
                          >
                            {!editedPhone && "Add Phone"}
                          </Text>
                          <Text fontSize="10pt">{editedPhone}</Text>
                          <Text fontSize="9pt" color="gray.600">
                            Phone
                          </Text>
                        </Flex>
                      </Flex>
                    ) : null}
                  </>
                )}
              </Flex>
              {user &&
                !isEditingPhone &&
                (user.uid === communityData.creatorId || isUserModerator) && (
                  <Flex mt={5}>
                    <Button
                      variant="ghost"
                      position="relative"
                      color="blue.500"
                      ml={2}
                      size="xs"
                      onClick={handlePhoneEditClick}
                    >
                      <Icon
                        position="absolute"
                        fontSize={editedPhone ? "" : "12pt"}
                        as={editedPhone ? FaPen : IoMdAddCircleOutline}
                      />
                    </Button>
                  </Flex>
                )}
            </Flex>
            <Flex flexDirection="column">
              <Flex>
                <Flex
                  width="100%"
                  justifyContent={isEditingSite ? "center" : ""}
                >
                  {isEditingSite ? (
                    <Flex flexDirection="column" width="90%" mt={5}>
                      <Input
                        value={editedSite}
                        onChange={(e) => setEditedSite(e.target.value)}
                        size="sm"
                        flexGrow={1}
                        _focus={{
                          outline: "none",
                          bg: "white",
                          border: "1px solid",
                          borderColor: "black",
                        }}
                      />
                      {siteError && (
                        <Text color="red.500" fontSize="10pt" p={1}>
                          {siteError}
                        </Text>
                      )}
                      <Text fontSize="10pt" color="gray.600" p={2}>
                        https://www.sample.com
                      </Text>
                      <Divider />
                      <Flex
                        flexDirection="row"
                        justifyContent="flex-end"
                        mt={2}
                      >
                        <Button
                          position="relative"
                          borderRadius="md"
                          size="sm"
                          fontSize="12px"
                          isLoading={loadingSite}
                          onClick={handleSiteSave}
                        >
                          <Text>Save</Text>
                        </Button>
                        <Button
                          borderRadius="md"
                          variant="outline"
                          ml={2}
                          size="sm"
                          fontSize="12px"
                          onClick={handleSiteCancel}
                        >
                          <Text>Cancel</Text>
                        </Button>
                      </Flex>
                    </Flex>
                  ) : (
                    <>
                      {editedSite ||
                      user?.uid === communityData.creatorId ||
                      isUserModerator ? (
                        <Flex alignItems="flex-start" mt={5}>
                          <Icon
                            fontSize={35}
                            p={2}
                            as={FaGlobe}
                            color="gray.500"
                          />
                          <Flex flexDirection="column" ml={1}>
                            <Text
                              fontSize="10pt"
                              color="blue.600"
                              cursor="pointer"
                              fontWeight="bold"
                              _hover={{ textDecoration: "underline" }}
                              onClick={handleSiteEditClick}
                            >
                              {!editedSite && "Add Website"}
                            </Text>
                            <a
                              href={editedSite}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: "10pt" }}
                            >
                              {editedSite}
                            </a>
                            <Text fontSize="9pt" color="gray.600">
                              Website
                            </Text>
                          </Flex>
                        </Flex>
                      ) : null}
                    </>
                  )}
                </Flex>
                {user &&
                  !isEditingSite &&
                  (user.uid === communityData.creatorId || isUserModerator) && (
                    <Flex mt={5}>
                      <Button
                        variant="ghost"
                        position="relative"
                        color="blue.500"
                        ml={2}
                        size="xs"
                        onClick={handleSiteEditClick}
                      >
                        <Icon
                          position="absolute"
                          fontSize={editedSite ? "" : "12pt"}
                          as={editedSite ? FaPen : IoMdAddCircleOutline}
                        />
                      </Button>
                    </Flex>
                  )}
              </Flex>
            </Flex>
          </Flex>
          {user &&
            (user.uid === communityData.creatorId || isUserModerator) && (
              <>
                <Divider mt={3} />
                <Button
                  mt={2}
                  variant="ghost"
                  color="blue.500"
                  fontSize="10pt"
                  onClick={handleAddModeratorClick}
                >
                  <Icon
                    as={IoMdAddCircleOutline}
                    mr={2}
                    fontSize="12pt"
                    color="blue.500"
                    cursor="pointer"
                  />
                  ADD MODERATOR
                </Button>
              </>
            )}
        </Flex>
      </Box>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="11pt">Add Moderator</ModalHeader>
          <Box
            maxHeight="400px"
            overflowY="auto"
            css={{
              "&::-webkit-scrollbar": {
                width: "0.4em",
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "transparent",
              },
            }}
          >
            <ModalBody>
              <ModalCloseButton _focus={{ border: "none" }} />
              <Divider />

              <Flex mb={5} mt={5}>
                <InputGroup>
                  <InputLeftElement
                    top="50%"
                    transform="translateY(-50%)"
                    color="gray.400"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      position="relative"
                      onClick={handleSearch}
                    >
                      <SearchIcon fontSize="md" position="absolute" />
                    </Button>
                  </InputLeftElement>
                  <Input
                    pl="2.5rem"
                    variant="flushed"
                    placeholder="Search Users"
                    fontSize="10pt"
                    _placeholder={{ color: "gray.500" }}
                    height="40px"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={onSearchUser}
                  />
                </InputGroup>
              </Flex>

              <Tabs position="relative" variant="unstyled">
                <TabList>
                  <Tab _focus={{ border: "none" }}>
                    <Text fontSize="11pt" fontWeight={600} color="gray.500">
                      Users
                    </Text>
                  </Tab>
                  <Tab _focus={{ border: "none" }}>
                    <Text fontSize="11pt" fontWeight={600} color="gray.500">
                      Moderators
                    </Text>
                  </Tab>
                </TabList>
                <TabIndicator
                  mt="-1.5px"
                  height="2px"
                  bg="blue.500"
                  borderRadius="1px"
                />
                <TabPanels>
                  <TabPanel>
                    <Stack spacing={4} mt={2}>
                      {searchLoading ? (
                        <Loader />
                      ) : (
                        userList.map((user) => {
                          const isModerator =
                            !!communityStateValue.moderatorSnippets.find(
                              (snippet) =>
                                snippet.communityId === communityData.id &&
                                snippet.isModerator === true &&
                                snippet.userUid === user.uid // Add this condition to match the current user
                            );

                          return (
                            <Flex
                              key={user.uid}
                              cursor="pointer"
                              flexDirection="column"
                            >
                              <Flex justifyContent="space-between">
                                <Flex alignItems="center">
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
                                          style={{
                                            borderRadius: "50%",
                                            mask: "url(#circle-mask)",
                                          }}
                                        />
                                      </AspectRatio>
                                    </Box>
                                  ) : (
                                    <Icon
                                      as={FaUserCircle}
                                      fontSize={36}
                                      color="gray.300"
                                      mr={3}
                                    />
                                  )}
                                  {user?.displayName ? (
                                    <Text fontSize="10pt" fontWeight={600}>
                                      {user.displayName}
                                    </Text>
                                  ) : (
                                    <Text fontSize="10pt" fontWeight={600}>
                                      {user?.email?.split("@")[0]}
                                    </Text>
                                  )}
                                </Flex>

                                <Flex>
                                  {isModerator ? (
                                    <Button
                                      key={user.uid}
                                      size="sm"
                                      fontSize="10pt"
                                      isLoading={loadingModeratorMap[user.uid]}
                                      onClick={() =>
                                        onAddRemoveModerator(
                                          user,
                                          communityData,
                                          isModerator
                                        )
                                      }
                                    >
                                      <Icon
                                        as={FaUserCheck}
                                        mr={1}
                                        fontSize="md"
                                      />
                                      Added
                                    </Button>
                                  ) : (
                                    <Button
                                      key={user.uid}
                                      size="sm"
                                      fontSize="10pt"
                                      isLoading={loadingModeratorMap[user.uid]}
                                      onClick={() =>
                                        onAddRemoveModerator(
                                          user,
                                          communityData,
                                          isModerator
                                        )
                                      }
                                    >
                                      <Icon
                                        as={IoPersonAddSharp}
                                        mr={1}
                                        fontSize="sm"
                                      />
                                      Add
                                    </Button>
                                  )}
                                </Flex>
                              </Flex>
                            </Flex>
                          );
                        })
                      )}

                      {userList.length >= currentPage * 10 ? (
                        <Button
                          mt={2}
                          variant="ghost"
                          size="sm"
                          width="100%"
                          fontSize="10pt"
                          fontWeight={800}
                          onClick={onLoadMore} // Add onClick event handler
                        >
                          Load More
                        </Button>
                      ) : loadMoreLoading ? (
                        <Flex
                          justifyContent="center"
                          fontSize="10pt"
                          fontWeight={800}
                        >
                          <Text>Loading...</Text>
                        </Flex>
                      ) : (
                        <Flex
                          justifyContent="center"
                          fontSize="10pt"
                          fontWeight={800}
                        >
                          <Text>You've reached the end of users</Text>
                        </Flex>
                      )}
                    </Stack>
                  </TabPanel>
                  <TabPanel>
                    <Stack spacing={4} mt={2}>
                      {searchLoading ? (
                        <Loader />
                      ) : (
                        moderatorList.map((user) => {
                          const isModerator =
                            !!communityStateValue.moderatorSnippets.find(
                              (snippet) =>
                                snippet.communityId === communityData.id &&
                                snippet.isModerator === true &&
                                snippet.userUid === user.uid // Add this condition to match the current user
                            );

                          return isModerator ? (
                            <Flex
                              key={user.uid}
                              cursor="pointer"
                              flexDirection="column"
                            >
                              <Flex
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Flex alignItems="center">
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
                                      fontSize={36}
                                      color="gray.300"
                                      mr={3}
                                    />
                                  )}
                                  {user?.displayName ? (
                                    <Text fontSize="10pt" fontWeight={600}>
                                      {user.displayName}
                                    </Text>
                                  ) : (
                                    <Text fontSize="10pt" fontWeight={600}>
                                      {user?.email?.split("@")[0]}
                                    </Text>
                                  )}
                                </Flex>

                                <Flex>
                                  {isModerator ? (
                                    <Button
                                      key={user.uid}
                                      size="sm"
                                      fontSize="10pt"
                                      variant="outline"
                                      isLoading={loadingModeratorMap[user.uid]}
                                      onClick={() =>
                                        onAddRemoveModerator(
                                          user,
                                          communityData,
                                          isModerator
                                        )
                                      }
                                    >
                                      <Icon
                                        as={IoPersonRemoveSharp}
                                        mr={1}
                                        fontSize="sm"
                                      />
                                      Remove
                                    </Button>
                                  ) : (
                                    <Button
                                      key={user.uid}
                                      size="sm"
                                      fontSize="10pt"
                                      isLoading={loadingModeratorMap[user.uid]}
                                      onClick={() =>
                                        onAddRemoveModerator(
                                          user,
                                          communityData,
                                          isModerator
                                        )
                                      }
                                    >
                                      <Icon
                                        as={IoPersonAddSharp}
                                        mr={1}
                                        fontSize="sm"
                                      />
                                      Add
                                    </Button>
                                  )}
                                </Flex>
                              </Flex>
                            </Flex>
                          ) : null;
                        })
                      )}
                    </Stack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Moderator;
