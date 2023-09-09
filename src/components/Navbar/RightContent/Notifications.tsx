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
  Skeleton,
  SkeletonCircle,
  Stack,
  Box,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { IoNotificationsOutline, IoPeopleCircleSharp } from "react-icons/io5";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { auth, firestore } from "../../../firebase/clientApp";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";
import moment from "moment";

type UserNotification = {
  userDisplayText: string;
  userId: string;
  triggerDocumentId: string;
  creatorId: string;
  communityId: string;
  userProfile: string;
  createdAt: {
    seconds: number;
  };
  notificationType: "post" | "comment" | "reply" | "community";
  isRead: boolean;
  notificationId: string;
};

type NotificationsProps = {};

const Notifications: React.FC<NotificationsProps> = () => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  const [pageLoading, setPageLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [user] = useAuthState(auth);

  // Define a function to fetch user notifications
  const getUserNotifications = async () => {
    if (user) {
      try {
        const notificationsCollection = collection(
          firestore,
          `users/${user.uid}/userNotification`
        );

        const q = query(
          notificationsCollection,
          orderBy("createdAt", "desc"),
          limit(10 * currentPage)
        );

        const querySnapshot = await getDocs(q);

        const fetchedNotifications: UserNotification[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as UserNotification;
          fetchedNotifications.push(data);
        });

        setNotifications(fetchedNotifications);

        setPageLoading(false);
        setLoadMoreLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(
        firestore,
        `users/${user?.uid}/userNotification/${notificationId}`
      );

      await updateDoc(notificationRef, {
        isRead: true,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadNotificationsFilter = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const handleLoadMore = () => {
    setLoadMoreLoading(true); // Set loadMoreLoading state to true
    try {
      setCurrentPage((prevPage) => prevPage + 1);
    } catch (error: any) {
      console.log("Load More Error", error);
    }
  };

  useEffect(() => {
    setLoadMoreLoading(true);
    getUserNotifications(); // Call the function to fetch user notifications
  }, [currentPage, user]);

  useEffect(() => {
    setPageLoading(true);
  }, [user]);

  return (
    <Menu>
      <MenuButton as={IconButton} variant="ghost">
        <Icon as={IoNotificationsOutline} fontSize={22} />
        {/* Red dot indicator */}
        {unreadNotificationsFilter > 0 && (
          <Box
            w="8px" // Increased width for better alignment
            h="8px" // Increased height for better alignment
            bgColor="red.500"
            position="absolute"
            top="5px"
            right="5px"
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          />
        )}
      </MenuButton>
      <MenuList
        maxHeight="500px"
        overflowY="auto"
        css={{
          "::-webkit-scrollbar": {
            width: "6px", // Width of the scrollbar
          },
          "::-webkit-scrollbar-thumb": {
            background: "transparent", // Hide the thumb when not hovering
          },
          "::-webkit-scrollbar-thumb:hover": {
            background: "#888", // Show the thumb on hover
          },
        }}
      >
        <Text ml={4} mb={2} mt={2} fontSize="11pt" fontWeight={600}>
          Notifications
        </Text>
        {pageLoading ? (
          <Stack mt={2} p={3} minW="0" w={"300px"}>
            {/* Loading skeleton */}{" "}
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Flex width="80%" flexDirection="column">
                <Skeleton height="10px" width="100%" mb={1} />
                <Skeleton height="10px" width="30%" />
              </Flex>
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Flex width="80%" flexDirection="column">
                <Skeleton height="10px" width="100%" mb={1} />
                <Skeleton height="10px" width="30%" />
              </Flex>
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Flex width="80%" flexDirection="column">
                <Skeleton height="10px" width="100%" mb={1} />
                <Skeleton height="10px" width="30%" />
              </Flex>
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Flex width="80%" flexDirection="column">
                <Skeleton height="10px" width="100%" mb={1} />
                <Skeleton height="10px" width="30%" />
              </Flex>
            </Flex>
            <Flex justify="space-between" align="center">
              <SkeletonCircle size="10" />
              <Flex width="80%" flexDirection="column">
                <Skeleton height="10px" width="100%" mb={1} />
                <Skeleton height="10px" width="30%" />
              </Flex>
            </Flex>
          </Stack>
        ) : (
          <>
            {notifications.length === 0 ? (
              // Display "No Notifications" when there are no notifications
              <Flex
                justifyContent="center"
                minW="0"
                w={"300px"}
                alignItems="center"
                direction="column"
                p={4}
              >
                <Icon
                  color="gray.300"
                  as={IoNotificationsOutline}
                  fontSize={180}
                  border="8px solid"
                  borderColor="gray.300"
                  borderRadius="50%"
                  mb={3}
                />
                <Text color="gray.500" fontSize="15pt" fontWeight={800}>
                  No Notification!
                </Text>
                <Text color="gray.500" fontSize="11pt" fontWeight={500}>
                  You're up to date
                </Text>
              </Flex>
            ) : (
              // Render notifications
              notifications.map((notification) => (
                <MenuItem
                  key={notification.notificationId}
                  onClick={() =>
                    markNotificationAsRead(notification.notificationId)
                  }
                  minW="0"
                  w={"300px"}
                  display="flex"
                  flexDirection="row"
                >
                  <Link
                    href={
                      notification.notificationType === "community"
                        ? `/tumindig/${notification.communityId}`
                        : `/tumindig/${notification.communityId}/comments/${notification.triggerDocumentId}`
                    }
                  >
                    <Flex alignItems="flex-start">
                      {notification.userProfile ? (
                        <Flex>
                          <Image
                            borderRadius="full"
                            boxSize="35px"
                            src={notification.userProfile}
                            mt={1}
                            mr={2}
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
                      <Flex flexDirection="column" width="80%">
                        <Flex
                          flexDirection="row"
                          fontSize="10pt"
                          fontWeight={600}
                        >
                          <Text>
                            {`${notification.userDisplayText} ${
                              notification.notificationType === "post"
                                ? "Upvoted your post in"
                                : notification.notificationType === "comment"
                                ? "Commented to your post in"
                                : notification.notificationType === "reply"
                                ? "Replied to your post in"
                                : notification.notificationType === "community"
                                ? "Joined"
                                : ""
                            } ${notification.communityId}`}
                          </Text>
                        </Flex>

                        <Text color="blue.500" fontWeight={600} fontSize="10pt">
                          {moment(
                            new Date(notification.createdAt.seconds * 1000)
                          ).fromNow()}
                        </Text>
                      </Flex>
                    </Flex>
                  </Link>
                  {!notification.isRead && (
                    <Box boxSize={2} p={1} bg="blue.500" borderRadius="full" />
                  )}
                </MenuItem>
              ))
            )}
            {notifications.length >= currentPage * 10 ? (
              <Button
                p={1}
                mt={2}
                ml={4}
                variant="link"
                color="blue.500"
                fontSize="10pt"
                fontWeight={800}
                onClick={handleLoadMore} // Add onClick event handler
              >
                Load More
              </Button>
            ) : (
              loadMoreLoading && (
                <Flex
                  p={1}
                  ml={4}
                  align="center"
                  color="blue.500"
                  fontWeight={800}
                >
                  <Spinner size="xs" mr={2} />
                  <Text fontSize="10pt">Loading</Text>
                </Flex>
              )
            )}
          </>
        )}
      </MenuList>
    </Menu>
  );
};

export default Notifications;
