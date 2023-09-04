import React, { useEffect, useState } from "react";
import {
  Flex,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Image,
  Box,
} from "@chakra-ui/react";
import { IoNotificationsOutline, IoPeopleCircleSharp } from "react-icons/io5";
import { Post } from "../../../atoms/postsAtom";
import { collection, doc, onSnapshot, query } from "firebase/firestore";
import { auth, firestore } from "../../../firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { FaUser } from "react-icons/fa";
import Link from "next/link";
import moment from "moment";

type ActionIconsProps = {};

const ActionIcons: React.FC<ActionIconsProps> = () => {
  const [postNotification, setPostNotification] = useState<Post[]>([]);
  const [user] = useAuthState(auth);

  const getPostNotification = async () => {
    try {
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        const notificationQuery = query(
          collection(userDocRef, "postNotification")
        );

        const unsubscribe = onSnapshot(notificationQuery, (snapshot) => {
          const addedPostNotification = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Post[];

          setPostNotification(addedPostNotification);
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
      }
    } catch (error: any) {
      console.log(error, "getPostNotification error");
    }
  };

  useEffect(() => {
    // Fetch post notifications when the component mounts
    getPostNotification();
  }, [user]);

  return (
    <Menu>
      <MenuButton as={IconButton} variant="ghost">
        <Icon as={IoNotificationsOutline} fontSize={22} />
      </MenuButton>
      <MenuList>
        <Text ml={4} mb={2} mt={2} fontSize="11pt" fontWeight={600}>
          Notifications
        </Text>
        {postNotification.map((notification) => (
          <MenuItem
            alignItems="center"
            justifyContent="center"
            key={notification.id}
            minW="0"
            w={"300px"}
          >
            <Link
              href={`tumindig/${notification.communityId}/comments/${notification.id}`}
            >
              <Flex alignItems="flex-start">
                {notification.userProfile ? (
                  <Flex>
                    <Image
                      borderRadius="full"
                      boxSize="35px"
                      src={notification.userProfile}
                      mr={8}
                      mt={1}
                      objectFit="cover"
                    />
                  </Flex>
                ) : (
                  <Icon
                    as={IoPeopleCircleSharp}
                    boxSize="43px"
                    mr={1}
                    mt={1}
                    color="gray.300"
                  />
                )}
                <Flex flexDirection="column">
                  <Flex flexDirection="row" fontSize="10pt" fontWeight={600}>
                    <Text>
                      {notification.userDisplayText} Upvoted your post in{" "}
                      {notification.communityId}{" "}
                    </Text>
                  </Flex>
                  <Text color="blue.500" fontWeight={600} fontSize="10pt">
                    {moment(
                      new Date(notification.createdAt?.seconds * 1000)
                    ).fromNow()}
                  </Text>
                </Flex>
              </Flex>
            </Link>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
export default ActionIcons;
