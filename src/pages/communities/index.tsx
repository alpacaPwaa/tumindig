import React, { useEffect, useState } from "react";
import {
  Flex,
  Stack,
  Icon,
  Button,
  Box,
  Text,
  Image,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Menu,
  MenuButton,
  MenuList,
  Input,
  InputGroup,
  InputLeftElement,
  MenuItemOption,
  MenuOptionGroup,
  Spinner,
  useMediaQuery,
  MenuItem,
  Tag,
} from "@chakra-ui/react";
import {
  query,
  collection,
  orderBy,
  limit,
  getDocs,
  where,
  startAt,
  endAt,
} from "firebase/firestore";
import Link from "next/link";
import { IoPeopleCircleSharp } from "react-icons/io5";
import { auth, firestore } from "../../firebase/clientApp";
import useCommunityData from "../../hooks/useCommunityData";
import {
  Community,
  CommunitySnippet,
  communityState,
} from "../../atoms/communitiesAtom";
import PageContentLayout from "../../components/Layout/PageContent";
import { useAuthState } from "react-firebase-hooks/auth";
import CreateCommunityModal from "../../components/Modal/CreateCommunity";
import { useRecoilValue, useSetRecoilState } from "recoil";
import MenuListPost from "../../components/Navbar/Directory/MenuListPost";
import { MdGroupOff } from "react-icons/md";
import { ChevronDownIcon, SearchIcon } from "@chakra-ui/icons";
import CommunitiesLoader from "../../components/Community/CommunitiesLoader";
import { FaUsers } from "react-icons/fa";
import { authModalState } from "../../atoms/authModalAtom";

type CommunityListProps = {
  communityData: Community;
  snippets: CommunitySnippet[];
};

const CommunityList: React.FC<CommunityListProps> = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMoreCommunity, setLoadingMoreCommunity] = useState(false);
  const [
    selectedOrganizationVolunteerType,
    setSelectedOrganizationVolunteerType,
  ] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { communityStateValue, loadingCommunityMap, onJoinLeaveCommunity } =
    useCommunityData();
  const [open, setOpen] = useState(false);
  const [user] = useAuthState(auth);
  const [openPostModal, setOpenPostModal] = useState(false);
  const mySnippets = useRecoilValue(communityState).mySnippets;
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [md] = useMediaQuery("(min-width: 768px)");
  const setAuthModalState = useSetRecoilState(authModalState);

  const handleOpenPostModal = () => {
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }
    setOpenPostModal(true);
  };

  const handleclosePostModal = () => {
    setOpenPostModal(false);
  };

  const handleOpenModal = () => {
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    setOpen(true);
  };

  const getCommunityRecommendations = async () => {
    setLoadingMoreCommunity(true);
    try {
      let communityQuery = query(
        collection(firestore, "communities"),
        orderBy("numberOfMembers", "desc"),
        limit(10 * currentPage)
      );

      // Apply filters if category is selected
      if (selectedCategory) {
        communityQuery = query(
          collection(firestore, "communities"),
          where("communityCategory", "==", selectedCategory),
          orderBy("numberOfMembers", "desc"),
          limit(10 * currentPage)
        );
      }

      if (
        selectedOrganizationVolunteerType &&
        selectedCategory === "Organization"
      ) {
        // Apply both filters when selectedCategory is "Organization" and selectedOrganizationVolunteerType is specified
        communityQuery = query(
          collection(firestore, "communities"),
          where("communityCategory", "==", "Organization"),
          where(
            "organizationVolunteerType",
            "==",
            selectedOrganizationVolunteerType
          ),
          orderBy("numberOfMembers", "desc"),
          limit(10 * currentPage)
        );
      } else if (selectedOrganizationVolunteerType) {
        // Apply only organizationVolunteerType filter when selectedOrganizationVolunteerType is specified
        communityQuery = query(
          collection(firestore, "communities"),
          where(
            "organizationVolunteerType",
            "==",
            selectedOrganizationVolunteerType
          ),
          orderBy("numberOfMembers", "desc"),
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
    setLoading(false);
    setLoadingMoreCommunity(false);
  };

  useEffect(() => {
    // Retrieve stored communities from local storage
    const storedCommunities = localStorage.getItem("communities");
    if (storedCommunities) {
      setCommunities(JSON.parse(storedCommunities));
    }
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    setLoading(true);
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.scrollHeight;
      const scrollThreshold = 0.8;

      if (
        scrollPosition >= scrollThreshold * pageHeight &&
        hasMore &&
        !loading
      ) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    //eslint-disable-next-line
  }, [hasMore, currentPage]);

  useEffect(() => {
    getCommunityRecommendations();
    //eslint-disable-next-line
  }, [selectedOrganizationVolunteerType, currentPage, selectedCategory]);

  const handleOrganizationVolunteerTypeChange = (value: string | string[]) => {
    setLoading(true);
    if (typeof value === "string") {
      setSelectedOrganizationVolunteerType(value);
    } else if (Array.isArray(value) && value.length > 0) {
      setSelectedOrganizationVolunteerType(value[0]);
    }
  };

  const handleCategoryChange = (value: string | string[]) => {
    setLoading(true);
    if (typeof value === "string") {
      setSelectedCategory(value);
    } else if (Array.isArray(value) && value.length > 0) {
      setSelectedCategory(value[0]);
    }
  };

  return (
    <PageContentLayout>
      <></>
      <>
        <Flex
          mb={2}
          borderRadius={4}
          p="10px 15px 10px 15px"
          justifyContent="space-between"
          direction="column"
          bg="white"
          width="100%"
        >
          <CreateCommunityModal
            isOpen={open}
            handleClose={() => setOpen(false)}
            userId={user?.uid!}
          />

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
                  type="radio"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                >
                  <MenuItemOption value="">All Communities</MenuItemOption>
                  <MenuItemOption value="Organization">
                    Organization
                  </MenuItemOption>
                </MenuOptionGroup>
              </MenuList>
            </Menu>
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
                {selectedOrganizationVolunteerType || "Filter Communities"}
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
                  <MenuItemOption value="">All</MenuItemOption>
                  <MenuItemOption value="Hunger & Homelessness">
                    Hunger & Homelessness
                  </MenuItemOption>
                  <MenuItemOption value="Health & Wellness">
                    Health & Wellness
                  </MenuItemOption>
                  <MenuItemOption value="Faith & Spirituality">
                    Faith & Spirituality
                  </MenuItemOption>
                  <MenuItemOption value="Animal & Wildlife">
                    Animal & Wildlife
                  </MenuItemOption>
                  <MenuItemOption value="Childrean & Youth">
                    Childrean & Youth
                  </MenuItemOption>
                  <MenuItemOption value="Environment & Conservation">
                    Environment & Conservation
                  </MenuItemOption>
                  <MenuItemOption value="Human & Social Services">
                    Human & Social Services
                  </MenuItemOption>
                  <MenuItemOption value="International Development">
                    International Development
                  </MenuItemOption>
                  <MenuItemOption value="Arts & Culture">
                    Arts & Culture
                  </MenuItemOption>
                  <MenuItemOption value="Others">Others</MenuItemOption>
                  {/* Add more options for organization types if needed */}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        <Stack spacing={2}>
          {loading ? (
            <CommunitiesLoader />
          ) : (
            communities.map((item, index) => {
              const isJoined = !!communityStateValue.mySnippets.find(
                (snippet) => snippet.communityId === item.id
              );

              const isBanned = !!communityStateValue.bannedSnippet.find(
                (snippet) =>
                  snippet.communityId === item.id &&
                  snippet.isBanned === true &&
                  snippet.userUid === user?.uid // Add this condition to match the current user
              );

              const maxDescriptionLength = 100;
              const truncatedDescription =
                item.description?.length > maxDescriptionLength
                  ? `${item.description.slice(0, maxDescriptionLength)}...`
                  : item.description;

              return (
                <Link key={item.id} href={`/tumindig/${item.id}`}>
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
                    <Flex width="80%">
                      <Flex width="20%" align="center" justifyContent="center">
                        {item.imageURL ? (
                          <Image
                            borderRadius="md"
                            boxSize="50px"
                            src={item.imageURL}
                            mr={2}
                            objectFit="cover"
                            alt="Image"
                          />
                        ) : (
                          <Icon
                            as={IoPeopleCircleSharp}
                            fontSize={50}
                            color="gray.300"
                            mr={2}
                          />
                        )}
                      </Flex>
                      <Flex direction="column" width="80%">
                        <Flex direction="row">
                          <Text
                            wordBreak="break-word"
                            fontWeight={600}
                            fontSize="12px"
                          >
                            {item.id}
                          </Text>
                          {item.communityCategory == "Organization" && (
                            <Tag size="sm" ml={1}>
                              Organization
                            </Tag>
                          )}
                        </Flex>
                        <Text fontSize="11px" fontWeight={600} color="gray.600">
                          {`${item.numberOfMembers}`} Members
                        </Text>
                        {md && (
                          <Text
                            fontWeight={600}
                            fontSize="11px"
                            color="gray.600"
                            maxWidth="100%"
                            wordBreak="break-word"
                          >
                            {truncatedDescription}
                          </Text>
                        )}
                      </Flex>
                    </Flex>
                    <Box position="absolute" right="10px">
                      <Button
                        height="26px"
                        fontSize="10pt"
                        isLoading={!!loadingCommunityMap[item.id]}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onJoinLeaveCommunity(item, isJoined);
                        }}
                        isDisabled={isBanned}
                        variant={isJoined ? "outline" : "solid"}
                        size={md ? "md" : "sm"}
                      >
                        {isBanned ? "Banned" : isJoined ? "Joined" : "Join"}
                      </Button>
                    </Box>
                  </Flex>
                </Link>
              );
            })
          )}
          {!loadingMoreCommunity ? (
            <Flex justifyContent="center" flexDirection="row">
              <Text justifyContent="center" fontSize="10pt" fontWeight={800}>
                You&apos;ve reached the end of the communities
              </Text>
            </Flex>
          ) : (
            <Flex justifyContent="center">
              <Spinner size="sm" mr={2} />
              <Text justifyContent="center" fontSize="10pt" fontWeight={800}>
                Loading Communities
              </Text>
            </Flex>
          )}
        </Stack>

        <Modal isOpen={openPostModal} onClose={handleclosePostModal}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontSize="11pt">Choose Community</ModalHeader>
            <Box pr={3} pl={3} maxHeight="400px" overflowY="auto">
              <Divider />
              <ModalCloseButton _focus={{ border: "none" }} />
              <ModalBody p="10px 0px 10px 0px">
                {mySnippets.length === 0 ? (
                  <Flex
                    justifyContent="center"
                    alignItems="center"
                    direction="column"
                    p={4}
                  >
                    <Icon
                      color="gray.300"
                      as={FaUsers}
                      fontSize={180}
                      border="8px solid"
                      borderColor="gray.300"
                      borderRadius="50%"
                      mb={3}
                    />
                    <Text color="gray.500" fontSize="15pt" fontWeight={800}>
                      No Community Yet
                    </Text>
                    <Text color="gray.500" fontSize="11pt" fontWeight={500}>
                      Join community to get started
                    </Text>
                  </Flex>
                ) : (
                  mySnippets.map((snippet, index) => (
                    <Flex
                      key={index}
                      flexDirection="row"
                      alignItems="center"
                      fontSize="10pt"
                      fontWeight={600}
                    >
                      <MenuListPost
                        icon={IoPeopleCircleSharp}
                        displayText={`${snippet.communityId}`}
                        link={`/tumindig/${snippet.communityId}/submit`}
                        iconColor="gray.300"
                        imageURL={snippet.imageURL}
                      />
                    </Flex>
                  ))
                )}
              </ModalBody>
            </Box>
          </ModalContent>
        </Modal>
      </>

      <Flex
        direction="column"
        p="5px 12px 12px 12px"
        bg="white"
        borderRadius={4}
        cursor="pointer"
        border="1px solid"
        borderColor="gray.300"
        position="fixed"
      >
        <Flex p={3} borderRadius="4px 4px 0px 0px">
          <Text fontWeight={600} fontSize="11pt">
            Communities
          </Text>
        </Flex>
        <Divider />
        <Flex direction="column">
          <Stack spacing={2} mt={3}>
            <Text fontSize="9pt">
              Welcome to the Tumindig Community List Page
            </Text>
            <Button size="sm" fontSize="10pt" onClick={handleOpenPostModal}>
              Create Post
            </Button>
            <Button
              size="sm"
              fontSize="10pt"
              variant="outline"
              onClick={handleOpenModal}
            >
              Create Community
            </Button>
          </Stack>
        </Flex>
      </Flex>
    </PageContentLayout>
  );
};

export default CommunityList;
