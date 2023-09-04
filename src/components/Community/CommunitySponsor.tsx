import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import {
  query,
  collection,
  where,
  orderBy,
  limit,
  startAt,
  endAt,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { AiOutlineHeart } from "react-icons/ai";
import { BiDonateHeart } from "react-icons/bi";
import { FaDonate } from "react-icons/fa";
import { IoPeopleCircleSharp } from "react-icons/io5";
import { useRecoilState } from "recoil";
import { Community, communityState } from "../../atoms/communitiesAtom";
import { auth, firestore } from "../../firebase/clientApp";
import useCommunityData from "../../hooks/useCommunityData";
import Loader from "./About/Loader";

type CommunitySponsorProps = { communityData: Community };

const CommunitySponsor: React.FC<CommunitySponsorProps> = ({
  communityData,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [showAllSponsorModal, setShowAllSponsorModal] = useState(false);
  const [sponsorCommunities, setSponsorCommunities] = useState<Community[]>([]);
  const [addedCommunitySponsors, setAddedCommunitySponsors] = useState<
    Community[]
  >([]);
  const carouselRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState);
  const { onAddRemoveSponsor, loadingSponsorMap } = useCommunityData();
  const [user] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: Unsubscribe;

    const getAddedSponsorCommunity = async () => {
      const communityId = communityData.id;
      const sponsorQuery = query(
        collection(firestore, "communities", communityId, "sponsorSnippets"),
        where("communityId", "==", communityData.id)
      );

      unsubscribe = onSnapshot(sponsorQuery, (querySnapshot) => {
        const sponsorSnippets = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];

        setCommunityStateValue((prev) => ({
          ...prev,
          sponsorSnippets: sponsorSnippets,
        }));
      });
    };

    getAddedSponsorCommunity();

    // Clean up the subscription when the component unmounts or when the dependency array changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [communityData.id, setCommunityStateValue, user]); // Add setCommunityStateValue to the dependency array

  const getAddedCommunitySponsor = async () => {
    try {
      let sponsorQuery = query(
        collection(firestore, "communities"),
        where("communityCategory", "==", "Sponsor"),
        orderBy("numberOfMembers", "desc")
      );

      if (searchQuery) {
        const startAtKeyword = searchQuery.toUpperCase();
        const endAtKeyword = searchQuery.toLowerCase() + "\uf8ff";

        sponsorQuery = query(
          collection(firestore, "communities"),
          orderBy("communityName"),
          where("communityCategory", "==", "Sponsor"),
          startAt(startAtKeyword),
          endAt(endAtKeyword)
        );
      }

      const sponsorDocs = await getDocs(sponsorQuery);
      const addedCommunitySponsors = sponsorDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Community[];

      setAddedCommunitySponsors(addedCommunitySponsors);
    } catch (error: any) {
      console.log("getSponsorCommunity error", error.message);
    }
    setSearchLoading(false);
    setLoadMoreLoading(false);
  };

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

      setSponsorCommunities(sponsorCommunities);
    } catch (error: any) {
      console.log("getSponsorCommunity error", error.message);
    }
    setSearchLoading(false);
    setLoadMoreLoading(false);
  };

  useEffect(() => {
    getSponsorCommunity();
    getAddedCommunitySponsor();
  }, [currentPage, communityStateValue.sponsorSnippets]);

  const handleSearchSponsorEnter = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      setSearchLoading(true);
      setCurrentPage(1); // Reset page to 1 when searching
      getSponsorCommunity();
      getAddedCommunitySponsor();
    }
  };

  const handleSearchSponsor = () => {
    setSearchLoading(true);
    setCurrentPage(1); // Reset page to 1 when searching
    getSponsorCommunity();
    getAddedCommunitySponsor();
  };

  const handleOpenSponsorModal = () => {
    setShowSponsorModal(true);
  };

  const handleCloseSponsorModal = () => {
    setShowSponsorModal(false);
  };

  const handleOpenShowAllSponsorModal = () => {
    setShowAllSponsorModal(true);
  };

  const handleCloseShowAllSponsorModal = () => {
    setShowAllSponsorModal(false);
  };

  const handleLoadMore = () => {
    setLoadMoreLoading(true); // Set loadMoreLoading state to true
    try {
      setCurrentPage((prevPage) => prevPage + 1);
    } catch (error: any) {
      console.log("Load More Error", error);
    }
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) => {
      const newSlide =
        prevSlide === 0 ? sponsorCommunities.length - 2 : prevSlide - 2;
      return newSlide;
    });
  };

  const handleNextSlide = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    const length = filteredSponsoredCommunities.length;
    const nextIndex = (currentSlide + 2) % length;
    setCurrentSlide(nextIndex);
  };

  const filteredSponsoredCommunities = sponsorCommunities.filter((item) => {
    const isSponsor = !!communityStateValue.sponsorSnippets.find(
      (snippet) =>
        snippet.sponsorId === item.id &&
        snippet.communityId === communityData.id &&
        snippet.isSponsor === true
    );
    return isSponsor;
  });

  const isUserModerator = !!communityStateValue.moderatorSnippets.find(
    (snippet) =>
      snippet.communityId === communityData.id &&
      snippet.isModerator === true &&
      snippet.userUid === user?.uid
  );

  const totalSponsoredCommunities = filteredSponsoredCommunities.length;

  const carouselItemWidth = 186; // Set the width of each carousel item

  return (
    <>
      <Flex
        bg="white"
        borderRadius="sm"
        flexDirection="column"
        p={totalSponsoredCommunities > 0 ? "5px 5px 5px 5px" : ""}
        mb={4}
      >
        <Flex
          flexDirection="row"
          justifyContent="space-between"
          bg="white"
          borderTopRadius={2}
          alignItems="center"
        >
          <Flex flexDirection="column" p="10px 0px 10px 10px">
            <Flex alignItems="center">
              <Icon as={AiOutlineHeart} fontSize={20} mr={1} />
              <Text fontSize="11pt" fontWeight={600} mb={1}>
                Sponsors
              </Text>
            </Flex>
            <Text fontSize="9pt" color="gray.600">
              Sponsors will be displayed here
            </Text>
          </Flex>
          <Flex>
            {user &&
              (user.uid === communityData.creatorId || isUserModerator) && (
                <Button
                  size="sm"
                  variant="ghost"
                  fontSize="10pt"
                  mr="10px"
                  onClick={handleOpenSponsorModal}
                >
                  <Text fontSize="10pt" color="blue.600">
                    Manage Sponsor
                  </Text>
                </Button>
              )}
          </Flex>
        </Flex>
        <Flex
          flexDirection="row"
          justifyContent="space-between"
          position="relative"
          bg="white"
          ref={carouselRef}
          overflow="hidden"
        >
          <Flex
            transition="transform 0.3s ease"
            transform={`translateX(-${currentSlide * carouselItemWidth}px)`}
            ref={carouselRef}
          >
            {sponsorCommunities.map((item, index) => {
              const isSponsor = !!communityStateValue.sponsorSnippets.find(
                (snippet) =>
                  snippet.sponsorId === item.id &&
                  snippet.communityId === communityData.id &&
                  snippet.isSponsor === true
              );

              return (
                isSponsor && (
                  <Flex
                    key={item.id}
                    flexDirection="column"
                    borderRadius={4}
                    borderWidth="1px"
                    borderColor="gray.300"
                    _hover={{ borderColor: "gray.400" }}
                    cursor="pointer"
                    boxShadow="md"
                    width="176px"
                    mr="10px"
                  >
                    {/* Your sponsor community card code */}
                    {item.bannerURL ? (
                      <Image
                        height="100%"
                        src={item.bannerURL}
                        objectFit="cover"
                      />
                    ) : (
                      <Flex
                        height="100%"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Icon
                          as={IoPeopleCircleSharp}
                          fontSize={130}
                          color="gray.300"
                        />
                      </Flex>
                    )}
                    <Flex direction="column" textAlign="center" p={2}>
                      <Text margin="auto" fontSize="11pt" fontWeight={600}>
                        {`${item.id}`}
                      </Text>

                      <Button
                        borderRadius="md"
                        m={2}
                        size="sm"
                        onClick={() => {
                          router.push(`/tumindig/${item.id}`); // Set isSponsor to true for leave operation
                        }}
                        variant="outline"
                      >
                        <Text fontSize="10pt">Visit Sponsor</Text>
                      </Button>
                    </Flex>
                  </Flex>
                )
              );
            })}
          </Flex>
          {currentSlide < totalSponsoredCommunities - 2 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNextSlide}
              position="absolute"
              backgroundColor="white"
              right="3%"
              top="50%"
              transform="translateY(-50%)"
              zIndex="2"
            >
              <ChevronRightIcon fontSize="14pt" position="absolute" />
            </Button>
          )}
          {currentSlide > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handlePrevSlide}
              position="absolute"
              backgroundColor="white"
              left="3%"
              top="50%"
              transform="translateY(-50%)"
              zIndex="2"
            >
              <ChevronLeftIcon fontSize="14pt" position="absolute" />
            </Button>
          )}
        </Flex>
        {totalSponsoredCommunities > 3 && (
          <Text
            fontSize="10pt"
            cursor="pointer"
            fontWeight={800}
            color="blue.600"
            onClick={handleOpenShowAllSponsorModal}
            textAlign="center"
            mt={3}
            mb={1}
          >
            See All Sponsors <ChevronRightIcon fontSize="14pt" />
          </Text>
        )}
      </Flex>

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

                <Tabs position="relative" variant="unstyled">
                  <TabList>
                    <Tab _focus={{ border: "none" }}>
                      <Text fontSize="11pt" fontWeight={600} color="gray.500">
                        Sponsors
                      </Text>
                    </Tab>
                    <Tab _focus={{ border: "none" }}>
                      <Text fontSize="11pt" fontWeight={600} color="gray.500">
                        Community Sponsors
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
                      {searchLoading ? (
                        <Loader />
                      ) : (
                        sponsorCommunities.map((item, index) => {
                          const isSponsor =
                            !!communityStateValue.sponsorSnippets.find(
                              (snippet) =>
                                snippet.sponsorId === item.id &&
                                snippet.communityId === communityData.id &&
                                snippet.isSponsor === true
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
                                </Flex>
                              </Flex>

                              <Box position="absolute" right="10px">
                                <Button
                                  height="22px"
                                  fontSize="8pt"
                                  isLoading={loadingSponsorMap[item.id]}
                                  onClick={() => {
                                    onAddRemoveSponsor(
                                      communityData,
                                      item,
                                      isSponsor
                                    );
                                  }}
                                >
                                  {isSponsor ? "Added" : "Add"}
                                </Button>
                              </Box>
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
                    </TabPanel>
                    <TabPanel>
                      {searchLoading ? (
                        <Loader />
                      ) : (
                        addedCommunitySponsors.map((item, index) => {
                          const isSponsor =
                            !!communityStateValue.sponsorSnippets.find(
                              (snippet) =>
                                snippet.sponsorId === item.id &&
                                snippet.communityId === communityData.id &&
                                snippet.isSponsor === true
                            );

                          return (
                            isSponsor && (
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
                                  </Flex>
                                </Flex>

                                <Box position="absolute" right="10px">
                                  <Button
                                    height="22px"
                                    fontSize="8pt"
                                    isLoading={loadingSponsorMap[item.id]}
                                    onClick={() => {
                                      onAddRemoveSponsor(
                                        communityData,
                                        item,
                                        isSponsor
                                      );
                                    }}
                                    variant="outline"
                                  >
                                    Remove
                                  </Button>
                                </Box>
                              </Flex>
                            )
                          );
                        })
                      )}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </>
            </ModalBody>
          </Box>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showAllSponsorModal}
        onClose={handleCloseShowAllSponsorModal}
      >
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
                {searchLoading ? (
                  <Loader />
                ) : (
                  sponsorCommunities.map((item, index) => {
                    return (
                      <Flex
                        position="relative"
                        align="center"
                        fontSize="10pt"
                        borderColor="gray.200"
                        p="10px 18px"
                        bg="white"
                        borderRadius={4}
                        cursor="pointer"
                        fontWeight={600}
                      >
                        <Flex align="center" width="80%">
                          {item.imageURL ? (
                            <Image
                              borderRadius="full"
                              boxSize="45px"
                              src={item.imageURL}
                              mr={2}
                              objectFit="cover"
                            />
                          ) : (
                            <Icon
                              as={IoPeopleCircleSharp}
                              fontSize={40}
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
                            handleCloseShowAllSponsorModal(); // Add this line to close the modal
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
    </>
  );
};
export default CommunitySponsor;
