import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
  Spinner,
  Textarea,
  Divider,
  Tag,
} from "@chakra-ui/react";
import {
  FaClock,
  FaEyeSlash,
  FaGlobeAmericas,
  FaLock,
  FaTag,
} from "react-icons/fa";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../../../firebase/clientApp";
import ResizeTextarea from "react-textarea-autosize";
import { Community, communityState } from "../../../atoms/communitiesAtom";
import moment from "moment";
import { useSetRecoilState } from "recoil";
import { doc, updateDoc } from "firebase/firestore";
import Rules from "./Rules";
import Moderator from "./Moderator";
import CommunityCustomization from "./CommunityCustomization";
import useCommunityData from "../../../hooks/useCommunityData";
import { Post } from "../../../atoms/postsAtom";

type AboutProps = {
  post: Post;
  communityData: Community;
  pt?: number;
  onCreatePage?: boolean;
  loading?: boolean;
};

const About: React.FC<AboutProps> = ({ post, communityData, pt, loading }) => {
  const [user] = useAuthState(auth); // will revisit how 'auth' state is passed
  const setCommunityStateValue = useSetRecoilState(communityState);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [savingDescription, setSavingDescription] = useState(false);
  const [description, setDescription] = useState<string>(
    communityData.description
  );
  const [originalDescription, setOriginalDescription] = useState(
    communityData.description
  );
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { communityStateValue } = useCommunityData();

  const handleCancelDescription = () => {
    setIsEditingDescription(false);
    setDescription(originalDescription); // Reset the description to the original value
  };

  useEffect(() => {
    setOriginalDescription(communityData.description);
  }, [communityData]);

  const handleSaveDescription = async () => {
    if (description.length > 200) {
      console.log("Description must be at least 150 characters long.");
      return;
    }

    setSavingDescription(true);
    try {
      await updateDoc(doc(firestore, "communities", communityData.id), {
        description: description,
      });
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          description: description,
        },
      }));
      setIsEditingDescription(false);
    } catch (error: any) {
      console.log("handleSaveDescription error", error.message);
    }
    setSavingDescription(false);
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  const isUserModerator = !!communityStateValue.moderatorSnippets.find(
    (snippet) =>
      snippet.communityId === communityData.id &&
      snippet.isModerator === true &&
      snippet.userUid === user?.uid
  );

  return (
    <Box pt={pt}>
      <Flex
        direction="column"
        p="5px 12px 12px 12px"
        bg="white"
        borderRadius="0px 0px 4px 4px"
      >
        <Flex
          align="center"
          p={3}
          bg="white"
          borderRadius="4px 4px 0px 0px"
          alignItems="center"
        >
          <Text fontSize="11pt" fontWeight={600}>
            About Community
          </Text>
        </Flex>
        <Divider mb={2} />
        {loading ? (
          <Stack mt={3}>
            <Skeleton height="10px" />
            <Skeleton height="10px" />
            <Flex direction="row" align="center">
              <SkeletonCircle size="7" mr={2} />
              <Skeleton height="10px" width="20%" />
            </Flex>
            <Skeleton height="10px" />
            <Flex direction="row" align="center">
              <SkeletonCircle size="7" mr={2} />
              <Skeleton height="10px" width="20%" />
            </Flex>
            <Skeleton height="10px" />
            <Flex direction="row" align="center">
              <SkeletonCircle size="7" mr={2} />
              <Skeleton height="10px" width="20%" />
            </Flex>
            <Skeleton height="10px" />
          </Stack>
        ) : (
          <>
            {isEditingDescription ? (
              <>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the Community"
                  fontSize="11pt"
                  as={ResizeTextarea}
                  isDisabled={savingDescription}
                  _focus={{
                    outline: "none",
                    bg: "white",
                    border: "1px solid",
                    borderColor: "black",
                  }}
                  css={{
                    "&::-webkit-scrollbar": {
                      width: "0.4em",
                      background: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "transparent",
                    },
                  }}
                />
                <Box mt={2} display="flex">
                  <Text
                    fontSize="10pt"
                    width="100%"
                    color={description?.length > 200 ? "red.500" : "gray.500"}
                  >
                    Remaining characters: {200 - description?.length}
                  </Text>
                  {description?.length > 200 && (
                    <Text fontSize="10pt" color="red.500">
                      Description exceeds the character limit (200 characters).
                    </Text>
                  )}
                </Box>
                <Box display="flex" flexDirection="row" mt={2} p={1}>
                  <Button
                    size="sm"
                    variant={"solid"}
                    width="50%"
                    fontWeight={600}
                    fontSize="10pt"
                    isLoading={savingDescription}
                    mr={2}
                    ml={2}
                    onClick={handleSaveDescription}
                  >
                    <Text fontWeight={600} fontSize="10pt">
                      Save
                    </Text>
                  </Button>
                  <Button
                    mr={2}
                    size="sm"
                    variant={"outline"}
                    width="50%"
                    fontWeight={600}
                    fontSize="10pt"
                    onClick={handleCancelDescription}
                  >
                    Cancel
                  </Button>
                </Box>
              </>
            ) : (
              <Flex flexDirection="column">
                {!showFullDescription && description?.length > 100 ? (
                  <Text fontSize="11pt">
                    {description.slice(0, 100)}
                    <Button
                      variant="link"
                      fontSize="10pt"
                      color="blue.500"
                      onClick={toggleDescription}
                    >
                      ...See More
                    </Button>
                  </Text>
                ) : (
                  <Text fontSize="11pt">
                    {description}
                    {description?.length > 100 && (
                      <Button
                        variant="link"
                        fontSize="10pt"
                        color="blue.500"
                        onClick={toggleDescription}
                      >
                        Hide
                      </Button>
                    )}
                  </Text>
                )}
              </Flex>
            )}
            {user &&
              !isEditingDescription &&
              (user.uid === communityData.creatorId || isUserModerator) && (
                <Box mt={2} mb={1}>
                  <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onClick={() => setIsEditingDescription(true)}
                  >
                    <Text
                      _hover={{ textDecoration: "underline" }}
                      fontSize="10pt"
                      color="blue.500"
                      textAlign="center"
                      fontWeight="700"
                    >
                      {description ? "EDIT DESCRIPTION" : "ADD DESCRIPTION"}
                    </Text>
                  </Box>
                </Box>
              )}
            <Stack spacing={2} mt={2}>
              <Flex flexDirection="column">
                {communityData.privacyType === "public" && (
                  <>
                    <Flex alignItems="flex-start">
                      <Icon
                        as={FaGlobeAmericas}
                        color="gray.500"
                        fontSize={35}
                        p={2}
                      />
                      <Flex flexDirection="column">
                        <Text fontWeight={600} fontSize="11pt">
                          Public
                        </Text>
                        <Text fontSize="10pt" color="gray.500">
                          Anyone can view, post, and comment to this community.
                        </Text>
                      </Flex>
                    </Flex>
                  </>
                )}
                {communityData.privacyType === "restricted" && (
                  <>
                    <Flex alignItems="flex-start">
                      <Icon
                        as={FaEyeSlash}
                        color="gray.500"
                        fontSize={35}
                        p={2}
                      />
                      <Flex flexDirection="column">
                        <Text fontWeight={600} fontSize="11pt">
                          Restricted
                        </Text>
                        <Text fontSize="10pt" color="gray.500">
                          Anyone can view this community, but only approved
                          users can post
                        </Text>
                      </Flex>
                    </Flex>
                  </>
                )}
                {communityData.privacyType === "private" && (
                  <>
                    <Flex alignItems="flex-start">
                      <Icon as={FaLock} color="gray.500" fontSize={35} p={2} />
                      <Flex flexDirection="column">
                        <Text fontWeight={600} fontSize="11pt">
                          Private
                        </Text>
                        <Text fontSize="10pt" color="gray.500">
                          Only approved users can view and submit to this
                          community
                        </Text>
                      </Flex>
                    </Flex>
                  </>
                )}
              </Flex>
              <Flex width="100%" flexDirection="row" alignItems="flex-start">
                <Icon as={FaClock} color="gray.500" fontSize={35} p={2} />
                <Flex flexDirection="column">
                  <Text fontWeight={600} fontSize="11pt">
                    History
                  </Text>
                  {communityData?.createdAt && (
                    <Text fontSize="10pt" color="gray.500">
                      Community created at{" "}
                      {moment(
                        new Date(communityData.createdAt!.seconds * 1000)
                      ).format("MMM DD, YYYY")}
                    </Text>
                  )}
                </Flex>
              </Flex>
              <Flex alignItems="flex-start" width="100%" flexDirection="row">
                <Icon as={FaTag} color="gray.500" fontSize={35} p={2} />
                <Flex flexDirection="column">
                  <Text fontWeight={600} fontSize="11pt">
                    Tags
                  </Text>
                  <Flex mt={1} cursor="pointer">
                    {communityData.organizationVolunteerType && (
                      <Tag size="sm" ml={1}>
                        {communityData.organizationVolunteerType}
                      </Tag>
                    )}
                  </Flex>
                </Flex>
              </Flex>
              <CommunityCustomization
                post={post}
                communityData={communityData}
              />
            </Stack>
          </>
        )}
      </Flex>
      {/* <Box>
        <Donate communityData={communityData} />
      </Box> */}
      <Box>
        <Moderator communityData={communityData} />
      </Box>
      <Box>
        <Rules communityData={communityData} />
      </Box>
    </Box>
  );
};
export default About;
