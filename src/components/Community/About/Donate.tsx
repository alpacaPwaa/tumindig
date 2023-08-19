import { useState, useEffect } from "react";
import {
  Box,
  Button,
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
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from "@chakra-ui/react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Community } from "../../../atoms/communitiesAtom";
import { auth, firestore } from "../../../firebase/clientApp";
import {
  collection,
  endAt,
  getDocs,
  limit,
  orderBy,
  query,
  startAt,
  where,
} from "firebase/firestore";
import { IoPeopleCircleSharp } from "react-icons/io5";
import useCommunityData from "../../../hooks/useCommunityData";
import { useRouter } from "next/router";
import { SearchIcon, ChevronDownIcon } from "@chakra-ui/icons";
import Loader from "./Loader";

type DonateProps = { communityData: Community };

const Donate: React.FC<DonateProps> = ({ communityData }) => {
  const [user] = useAuthState(auth);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [
    showVolunteerOrganizationCommunityModal,
    setShowVolunteerOrganizationCommunityModal,
  ] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [sponsorCommunities, setSponsorCommunities] = useState<Community[]>([]); // Add a new state variable for sponsor communities
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [
    selectedOrganizationVolunteerType,
    setSelectedOrganizationVolunteerType,
  ] = useState<string>("");
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadingCommunityChange, setLoadingCommunityChange] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { communityStateValue } = useCommunityData();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const getVolunteerOrganizationCommunity = async () => {
    try {
      let communityQuery = query(
        collection(firestore, "communities"),
        where("communityCategory", "in", [
          "Volunteer",
          "Organization",
          "OrganizationType",
        ]),
        orderBy("numberOfMembers", "desc"),
        limit(10 * currentPage)
      );

      // Apply filters if category is selected
      if (selectedCategory) {
        communityQuery = query(
          collection(firestore, "communities"),
          where("communityCategory", "==", selectedCategory),
          where("communityCategory", "in", [
            "Volunteer",
            "Organization",
            "OrganizationType",
          ]),
          orderBy("numberOfMembers", "desc"),
          limit(10 * currentPage)
        );
      }

      // Apply filters if category is "Organization" and organization type is selected
      if (
        (selectedCategory === "Organization" &&
          selectedOrganizationVolunteerType) ||
        (selectedCategory === "Volunteer" && selectedOrganizationVolunteerType)
      ) {
        communityQuery = query(
          collection(firestore, "communities"),
          where("communityCategory", "==", selectedCategory),
          where(
            "organizationVolunteerType",
            "==",
            selectedOrganizationVolunteerType
          ),
          where("communityCategory", "in", [
            "Volunteer",
            "Organization",
            "OrganizationType",
          ]),
          orderBy("numberOfMembers", "desc"),
          limit(10 * currentPage)
        );
      }

      if (searchQuery) {
        const startAtKeyword = searchQuery.toUpperCase();
        const endAtKeyword = searchQuery.toLowerCase() + "\uf8ff";

        communityQuery = query(
          collection(firestore, "communities"),
          orderBy("communityName"),
          where("communityCategory", "in", ["Organization", "Volunteer"]),
          startAt(startAtKeyword),
          endAt(endAtKeyword),
          limit(10 * currentPage)
        );
      }

      const communityDocs = await getDocs(communityQuery);
      const communities = communityDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Community[];

      localStorage.setItem("communities", JSON.stringify(communities));
      setCommunities(communities);
    } catch (error: any) {
      console.log("getCommunityRecommendations error", error.message);
    }
    setSearchLoading(false);
    setLoadMoreLoading(false);
    setLoadingCommunityChange(false);
  };

  useEffect(() => {
    getVolunteerOrganizationCommunity();
  }, [selectedCategory, selectedOrganizationVolunteerType, currentPage]);

  const getSponsorCommunity = async () => {
    try {
      let sponsorQuery = query(
        collection(firestore, "communities"),
        where("communityCategory", "==", "Sponsor"),
        orderBy("numberOfMembers", "desc"),
        limit(10 * currentPage)
      );

      if (searchQuery) {
        const startAtKeyword = searchQuery.toUpperCase();
        const endAtKeyword = searchQuery.toLowerCase() + "\uf8ff";

        sponsorQuery = query(
          collection(firestore, "communities"),
          orderBy("communityName"),
          where("communityCategory", "==", "Sponsor"),
          startAt(startAtKeyword),
          endAt(endAtKeyword),
          limit(10 * currentPage)
        );
      }

      const sponsorDocs = await getDocs(sponsorQuery);
      const sponsorCommunities = sponsorDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Community[];

      localStorage.setItem("communities", JSON.stringify(sponsorCommunities));
      setSponsorCommunities(sponsorCommunities);
    } catch (error: any) {
      console.log("getSponsorCommunity error", error.message);
    }
    setSearchLoading(false);
    setLoadMoreLoading(false);
  };

  useEffect(() => {
    getSponsorCommunity();
  }, [currentPage]);

  useEffect(() => {
    // Retrieve stored communities from local storage
    const storedCommunities = localStorage.getItem("communities");
    if (storedCommunities) {
      setCommunities(JSON.parse(storedCommunities));
    }
  }, []);

  const handleLoadMore = () => {
    setLoadMoreLoading(true); // Set loadMoreLoading state to true
    try {
      setCurrentPage((prevPage) => prevPage + 1);
    } catch (error: any) {
      console.log("Load More Error", error);
    }
  };

  const handleCategoryChange = (value: string | string[]) => {
    setLoadingCommunityChange(true);
    if (typeof value === "string") {
      setSelectedCategory(value);
    } else if (Array.isArray(value) && value.length > 0) {
      setSelectedCategory(value[0]);
    }
  };

  const handleOrganizationVolunteerTypeChange = (value: string | string[]) => {
    setLoadingCommunityChange(true);
    if (typeof value === "string") {
      setSelectedOrganizationVolunteerType(value);
    } else if (Array.isArray(value) && value.length > 0) {
      setSelectedOrganizationVolunteerType(value[0]);
    }
  };

  const handleSearchSponsorEnter = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      setSearchLoading(true);
      setCurrentPage(1); // Reset page to 1 when searching
      getSponsorCommunity();
    }
  };

  const handleSearchSponsor = () => {
    setSearchLoading(true);
    setCurrentPage(1); // Reset page to 1 when searching
    getSponsorCommunity();
  };

  const handleSearchCommunitiesEnter = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      setSearchLoading(true);
      setCurrentPage(1); // Reset page to 1 when searching
      getVolunteerOrganizationCommunity();
    }
  };

  const handleSearchCommunities = () => {
    setSearchLoading(true);
    setCurrentPage(1); // Reset page to 1 when searching
    getVolunteerOrganizationCommunity();
  };

  const isUserModerator = !!communityStateValue.moderatorSnippets.find(
    (snippet) =>
      snippet.communityId === communityData.id &&
      snippet.isModerator === true &&
      snippet.userUid === user?.uid
  );

  const handleOpenSponsorModal = () => {
    setShowSponsorModal(true);
  };

  const handleCloseSponsorModal = () => {
    setShowSponsorModal(false);
  };

  const handleOpenVolunteerOrganizationCommunity = () => {
    setShowVolunteerOrganizationCommunityModal(true);
  };

  const handleCloseVolunteerOrganizationCommunity = () => {
    setShowVolunteerOrganizationCommunityModal(false);
  };

  return (
    <>
      <Flex
        direction="column"
        p="5px 12px 12px 12px"
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
            Community Options
          </Text>
        </Flex>
        <Divider />
        <Button mt={2} size="sm" width="100%" fontSize="10pt">
          Donate Now
        </Button>
        {user && (user.uid === communityData.creatorId || isUserModerator) && (
          <Flex mt={2}>
            {communityData.communityCategory === "Sponsor" ? (
              <Button
                variant="outline"
                width="100%"
                size="sm"
                fontSize="10pt"
                onClick={handleOpenVolunteerOrganizationCommunity}
              >
                Sponsor a Community
              </Button>
            ) : (
              <Button
                variant="outline"
                width="100%"
                size="sm"
                fontSize="10pt"
                onClick={handleOpenSponsorModal}
              >
                Find a Sponsor
              </Button>
            )}
          </Flex>
        )}
      </Flex>

      {/* Sponsor List Modal */}
      <Modal isOpen={showSponsorModal} onClose={handleCloseSponsorModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="12pt" fontWeight={600}>
            Sponsors
          </ModalHeader>
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
            <ModalCloseButton _focus={{ border: "none" }} />
            <Divider />
            <ModalBody pb={4}>
              <>
                <Flex mb={5}>
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
                        onClick={handleSearchSponsor}
                      >
                        <SearchIcon fontSize="md" position="absolute" />
                      </Button>
                    </InputLeftElement>
                    <Input
                      pl="2.5rem"
                      variant="flushed"
                      placeholder="Search All Sponsor"
                      fontSize="10pt"
                      _placeholder={{ color: "gray.500" }}
                      height="40px"
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchSponsorEnter}
                    />
                  </InputGroup>
                </Flex>

                {searchLoading ? (
                  <Loader />
                ) : (
                  sponsorCommunities.map((item, index) => {
                    const isJoined = !!communityStateValue.mySnippets.find(
                      (snippet) => snippet.communityId === item.id
                    );

                    return (
                      <Flex
                        position="relative"
                        align="center"
                        fontSize="10pt"
                        borderColor="gray.200"
                        p="10px 12px"
                        bg="white"
                        borderRadius={4}
                        cursor="pointer"
                        fontWeight={600}
                      >
                        <Flex width="5%">
                          <Text mr={2}>{index + 1}</Text>
                        </Flex>
                        <Flex align="center" width="80%">
                          {item.imageURL ? (
                            <Image
                              borderRadius="full"
                              boxSize="35px"
                              src={item.imageURL}
                              mr={2}
                              objectFit="cover"
                            />
                          ) : (
                            <Icon
                              as={IoPeopleCircleSharp}
                              fontSize={30}
                              color="gray.300"
                              mr={2}
                            />
                          )}
                          <Flex direction="column">
                            <Flex alignItems="center">
                              <span
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {`${item.id}`}
                              </span>
                              <Text color="gray.500" mx={1}>
                                &middot;
                              </Text>
                              <Text
                                fontSize="11px"
                                fontWeight={600}
                                color="gray.600"
                              >
                                {`${item.numberOfMembers}`} Members
                              </Text>
                            </Flex>
                          </Flex>
                        </Flex>
                        <Button
                          ml={4}
                          size="sm"
                          variant="outline"
                          fontSize="10pt"
                          width="20%"
                          key={item.id}
                          onClick={() => {
                            router.push(`/tumindig/${item.id}`);
                            handleCloseSponsorModal(); // Add this line to close the modal
                          }}
                        >
                          Visit
                        </Button>
                      </Flex>
                    );
                  })
                )}
                {sponsorCommunities.length >= currentPage * 10 ? (
                  <Button
                    mt={2}
                    variant="ghost"
                    size="sm"
                    width="100%"
                    fontSize="10pt"
                    fontWeight={800}
                    onClick={handleLoadMore} // Add onClick event handler
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
                    <Text>You've reached the end of the communities</Text>
                  </Flex>
                )}
              </>
            </ModalBody>
          </Box>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showVolunteerOrganizationCommunityModal}
        onClose={handleCloseVolunteerOrganizationCommunity}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="12pt" fontWeight={600}>
            Sponsor a Community
          </ModalHeader>
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
            <ModalCloseButton _focus={{ border: "none" }} />
            <Divider />
            <ModalBody pb={4}>
              <>
                <Flex
                  mb={2}
                  borderRadius="sm"
                  justifyContent="space-between"
                  direction="column"
                  bg="white"
                >
                  <Flex>
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
                          onClick={handleSearchCommunities}
                        >
                          <SearchIcon fontSize="md" position="absolute" />
                        </Button>
                      </InputLeftElement>
                      <Input
                        pl="2.5rem"
                        variant="flushed"
                        placeholder="Search All Communities"
                        fontSize="10pt"
                        _placeholder={{ color: "gray.500" }}
                        height="40px"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchCommunitiesEnter}
                      />
                    </InputGroup>
                  </Flex>
                  <Text
                    p={1}
                    mt={2}
                    textAlign="left"
                    color="gray.500"
                    fontSize="10pt"
                    fontWeight="semibold"
                  >
                    Apply Filters
                  </Text>

                  <Flex justifyContent="space-between">
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        mt={1}
                        size="md"
                        width="49%"
                        textAlign="left"
                        borderRadius="md"
                        variant="outline"
                        border="1px solid gray"
                        borderColor="gray.200"
                        backgroundColor="white"
                        color="gray.500"
                        fontWeight="semibold"
                      >
                        {selectedCategory || "All Communities"}
                      </MenuButton>
                      <MenuList
                        textAlign="left"
                        color="gray.800"
                        fontSize="14"
                        fontWeight="semibold"
                      >
                        <MenuOptionGroup
                          defaultValue=""
                          value={selectedCategory}
                          type="radio"
                          onChange={handleCategoryChange}
                        >
                          <MenuItemOption value="">
                            All Categories
                          </MenuItemOption>
                          <MenuItemOption value="Volunteer">
                            Volunteer
                          </MenuItemOption>
                          <MenuItemOption value="Organization">
                            Organization
                          </MenuItemOption>
                        </MenuOptionGroup>
                      </MenuList>
                    </Menu>
                    {(selectedCategory === "Organization" ||
                      selectedCategory === "Volunteer") && (
                      <Menu>
                        <MenuButton
                          as={Button}
                          rightIcon={<ChevronDownIcon />}
                          mt={1}
                          width="49%"
                          textAlign="left"
                          borderRadius="md"
                          variant="outline"
                          border="1px solid gray"
                          borderColor="gray.200"
                          backgroundColor="white"
                          color="gray.500"
                          fontWeight="semibold"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          {selectedOrganizationVolunteerType ||
                            "Filter Communities"}
                        </MenuButton>
                        <MenuList
                          textAlign="left"
                          color="gray.800"
                          fontSize="14"
                          fontWeight="semibold"
                        >
                          <MenuOptionGroup
                            type="radio"
                            value={selectedOrganizationVolunteerType}
                            onChange={handleOrganizationVolunteerTypeChange}
                          >
                            <MenuItemOption value="">
                              All Organizations
                            </MenuItemOption>
                            <MenuItemOption value="Non-Profit">
                              Non-Profit
                            </MenuItemOption>
                            <MenuItemOption value="Charity">
                              Charity
                            </MenuItemOption>
                            <MenuItemOption value="Education">
                              Education
                            </MenuItemOption>
                            <MenuItemOption value="Environment">
                              Environment
                            </MenuItemOption>
                            <MenuItemOption value="Advocacy">
                              Advocacy
                            </MenuItemOption>
                            <MenuItemOption value="Religion">
                              Religion
                            </MenuItemOption>
                            <MenuItemOption value="Others">
                              Others
                            </MenuItemOption>
                            {/* Add more options for organization types if needed */}
                          </MenuOptionGroup>
                        </MenuList>
                      </Menu>
                    )}
                  </Flex>
                </Flex>

                {searchLoading || loadingCommunityChange ? (
                  <Loader />
                ) : (
                  communities.map((item, index) => {
                    const isJoined = !!communityStateValue.mySnippets.find(
                      (snippet) => snippet.communityId === item.id
                    );

                    return (
                      <Flex
                        position="relative"
                        align="center"
                        fontSize="10pt"
                        borderColor="gray.200"
                        p="10px 12px"
                        bg="white"
                        borderRadius={4}
                        cursor="pointer"
                        fontWeight={600}
                      >
                        <Flex width="5%">
                          <Text mr={2}>{index + 1}</Text>
                        </Flex>
                        <Flex align="center" width="80%">
                          {item.imageURL ? (
                            <Image
                              borderRadius="full"
                              boxSize="35px"
                              src={item.imageURL}
                              mr={2}
                              objectFit="cover"
                            />
                          ) : (
                            <Icon
                              as={IoPeopleCircleSharp}
                              fontSize={30}
                              color="gray.300"
                              mr={2}
                            />
                          )}
                          <Flex direction="column">
                            <Flex alignItems="center">
                              <span
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {`${item.id}`}
                              </span>
                              <Text color="gray.500" mx={1}>
                                &middot;
                              </Text>
                              <Text
                                fontSize="11px"
                                fontWeight={600}
                                color="gray.600"
                              >
                                {`${item.numberOfMembers}`} Members
                              </Text>
                            </Flex>
                          </Flex>
                        </Flex>
                        <Button
                          ml={4}
                          size="sm"
                          variant="outline"
                          fontSize="10pt"
                          width="20%"
                          key={item.id}
                          onClick={() => {
                            router.push(`/tumindig/${item.id}`);
                            handleCloseVolunteerOrganizationCommunity();
                          }}
                        >
                          Visit
                        </Button>
                      </Flex>
                    );
                  })
                )}
                {communities.length >= currentPage * 10 ? (
                  <Button
                    mt={2}
                    variant="ghost"
                    size="sm"
                    width="100%"
                    fontSize="10pt"
                    fontWeight={800}
                    onClick={handleLoadMore} // Add onClick event handler
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
                    <Text>You've reached the end of the communities</Text>
                  </Flex>
                )}
              </>
            </ModalBody>
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Donate;
