import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Image,
  Icon,
  useMediaQuery,
} from "@chakra-ui/react";
import {
  writeBatch,
  doc,
  increment,
  collection,
  getDocs,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { AiFillCalendar, AiFillClockCircle, AiFillPhone } from "react-icons/ai";
import { FaGlobeAmericas } from "react-icons/fa";
import { IoPeopleCircleSharp } from "react-icons/io5";
import { MdEmail, MdEventAvailable } from "react-icons/md";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModalState } from "../../../atoms/authModalAtom";
import { Community } from "../../../atoms/communitiesAtom";
import { Post, postState, PostVolunteer } from "../../../atoms/postsAtom";
import { auth, firestore } from "../../../firebase/clientApp";

type MoreDetailsProps = { post: Post; community: Community };

const MoreDetails: React.FC<MoreDetailsProps> = ({ post, community }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuthModalState = useSetRecoilState(authModalState);
  const [postStateValue, setPostStateValue] = useRecoilState(postState);
  const [user] = useAuthState(auth);
  const isJoined = !!postStateValue.postVolunteer.find(
    (item) => item.postId === post.id && item.id === user?.uid
  );
  const [md] = useMediaQuery("(min-width: 768px)");

  const convertToStandardDateMobile = (date: string | undefined) => {
    if (date) {
      const [year, month] = date.split("-");
      const standardDate = new Date(Number(year), Number(month) - 1);

      // Use toLocaleDateString with options to format the date as "Day, Month Day, Year"
      const formattedDate = standardDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
      });

      return formattedDate;
    }
    return ""; // Return an empty string if date is undefined
  };

  const convertToStandardDate = (date: string | undefined) => {
    if (date) {
      const [year, month, day] = date.split("-");
      const standardDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );

      // Use toLocaleDateString with options to format the date as "Day, Month Day, Year"
      const formattedDate = standardDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return formattedDate;
    }
    return ""; // Return an empty string if date is undefined
  };

  const onJoinLeaveCommunity = (post: Post, isJoined: boolean) => {
    console.log("ON JOIN LEAVE", post.id);

    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    setLoading(true);

    if (isJoined) {
      leaveVolunteer(post.id);
    } else {
      joinVolunteer(post);
    }

    getVolunteers();
  };

  const joinVolunteer = async (post: Post) => {
    console.log("JOINING: ", post.id);

    try {
      const batch = writeBatch(firestore);

      const newSnippet: PostVolunteer = {
        communityId: post.communityId,
        postId: post.id,
        id: user?.uid,
      };

      batch.set(
        doc(
          firestore,
          `users/${user?.uid}/postVolunteer`,
          post.id // will for sure have this value at this point
        ),
        newSnippet
      );

      batch.update(doc(firestore, "posts", post.id), {
        eventVolunteer: increment(1),
      });

      // perform batch writes
      await batch.commit();

      // Add current community to snippet
      setPostStateValue((prev) => ({
        ...prev,
        mySnippets: [...prev.postVolunteer, newSnippet],
      }));
    } catch (error) {
      console.log("joinVolunteer error", error);
    }
    setLoading(false);
  };

  const leaveVolunteer = async (postId: string) => {
    try {
      const batch = writeBatch(firestore);

      batch.delete(
        doc(firestore, `users/${user?.uid}/postVolunteer/${postId}`)
      );

      batch.update(doc(firestore, "posts", postId), {
        eventVolunteer: increment(-1),
      });

      await batch.commit();

      setPostStateValue((prev) => ({
        ...prev,
        mySnippets: prev.postVolunteer.filter((item) => item.id !== postId),
      }));
    } catch (error) {
      console.log("leaveVolunteer error", error);
    }
    setLoading(false);
  };

  const getVolunteers = async () => {
    try {
      const volunteerDocs = await getDocs(
        collection(firestore, `users/${user?.uid}/postVolunteer`)
      );

      const volunteer = volunteerDocs.docs.map((doc) => ({ ...doc.data() }));
      setPostStateValue((prev) => ({
        ...prev,
        postVolunteer: volunteer as PostVolunteer[],
      }));

      console.log("here are the volunteers", volunteer);
    } catch (error: any) {
      console.log("getMySnippets error", error);
    }
  };

  useEffect(() => {
    if (!user) return;
    getVolunteers();
  }, [user]);

  return (
    <>
      <Flex justifyContent="center">
        {(post.date ||
          post.location ||
          post.phoneNumber ||
          post.timeEnd ||
          post.timeStart ||
          post.email ||
          post.eventTitle) && (
          <Flex
            width="95%"
            border="1px"
            bg="gray.50"
            borderColor="gray.100"
            shadow="sm"
            p={2}
            mb={2}
            mt={2}
            borderRadius="md"
            alignItems="center"
          >
            {post.communityImageURL ? (
              <Flex>
                <Image
                  boxSize="65px"
                  src={post.communityImageURL}
                  mr={2}
                  objectFit="cover"
                  borderRadius="md"
                />
              </Flex>
            ) : (
              <Icon
                as={IoPeopleCircleSharp}
                boxSize="35px"
                mr={1}
                color="gray.300"
              />
            )}
            <Flex
              alignItems="center"
              justifyContent="space-between"
              width="85%"
            >
              <Flex flexDirection="column" maxW="90%" pl={1}>
                <Text fontSize="10pt" fontWeight={600} color="gray.600">
                  {md
                    ? convertToStandardDate(post.date)
                    : convertToStandardDateMobile(post.date)}
                </Text>
                <Text fontSize="11pt" fontWeight={600}>
                  {post.eventTitle}
                </Text>
                <Text fontSize="10pt" fontWeight={600} color="gray.600">
                  {post.eventVolunteer ? post.eventVolunteer : "0"} event
                  volunteers
                </Text>
              </Flex>

              <Button
                variant="ghost"
                size="md"
                onClick={(event) => {
                  event.stopPropagation(), setShowDetails(true);
                }}
              >
                <Text>See Details</Text>
              </Button>
            </Flex>
          </Flex>
        )}
      </Flex>

      <Modal
        blockScrollOnMount={false}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        size={md ? "md" : "xs"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text textAlign="center"> {post.title} </Text>
          </ModalHeader>
          <ModalCloseButton _focus={{ border: "none" }} />
          <ModalBody>
            <Flex
              border="1px"
              bg="gray.50"
              borderColor="gray.100"
              shadow="sm"
              fontSize="10pt"
              borderRadius="md"
              p={2}
              mb={2}
            >
              <Text>
                Before clicking 'Volunteer,' know that you're reserving a spot
                for this volunteer opportunity. We're eager to see you soon!
              </Text>
            </Flex>
            <Stack fontSize="14px" p={2}>
              <Text fontWeight={600}>Details</Text>
              <Flex alignItems="center">
                <Icon
                  as={FaGlobeAmericas}
                  mr={2}
                  fontSize={20}
                  color="gray.400"
                />
                <Text>{post.location} </Text>
              </Flex>
              <Flex alignItems="center">
                <Icon
                  as={AiFillCalendar}
                  mr={2}
                  fontSize={20}
                  color="gray.400"
                />
                <Text>{convertToStandardDate(post.date)} </Text>
              </Flex>
              <Flex alignItems="center">
                <Icon
                  as={AiFillClockCircle}
                  mr={2}
                  fontSize={20}
                  color="gray.400"
                />
                <Text>
                  {post.timeStart} to {post.timeEnd}
                </Text>
              </Flex>
              <Flex alignItems="center">
                <Icon as={AiFillPhone} mr={2} fontSize={20} color="gray.400" />
                <Text> {post.phoneNumber} </Text>
              </Flex>
              <Flex alignItems="center">
                <Icon as={MdEmail} mr={2} fontSize={20} color="gray.400" />
                <Text> {post.email} </Text>
              </Flex>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={() => setShowDetails(false)}
            >
              Close
            </Button>
            <Button
              isLoading={loading}
              onClick={() => onJoinLeaveCommunity(post, isJoined)}
            >
              {isJoined ? "Leave" : "Volunteer"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default MoreDetails;
