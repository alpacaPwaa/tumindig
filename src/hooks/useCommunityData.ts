import { useEffect, useState } from "react";
import {
  collection,
  collectionGroup,
  doc,
  endAt,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAt,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useSetRecoilState } from "recoil";
import { authModalState } from "../atoms/authModalAtom";
import {
  Community,
  CommunitySnippet,
  communityState,
  defaultCommunity,
  ModeratorSnippet,
  SponsorSnippet,
} from "../atoms/communitiesAtom";
import { auth, firestore } from "../firebase/clientApp";
import { getMySnippets } from "../helpers/firestore";
import { User } from "firebase/auth";
import { UserNotification } from "../atoms/notificationAtom";

// Add ssrCommunityData near end as small optimization
const useCommunityData = (ssrCommunityData?: boolean) => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState);
  const setAuthModalState = useSetRecoilState(authModalState);
  const [loading, setLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadingModeratorMap, setLoadingModeratorMap] = useState<{
    [userId: string]: boolean;
  }>({});
  const [loadingCommunityMap, setLoadingCommunityMap] = useState<{
    [communityId: string]: boolean;
  }>({});
  const [loadingSponsorMap, setLoadingSponsorMap] = useState<{
    [sponsorId: string]: boolean;
  }>({});
  const [error, setError] = useState("");
  const [isModerator, setIsModerator] = useState<boolean>(false);
  const [isSponsor, setIsSponsor] = useState<boolean>(false);
  const [userList, setUserList] = useState<User[]>([]);
  const [moderatorList, setModeratorList] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user || !!communityStateValue.mySnippets.length) return;

    getSnippets();
  }, [user]);

  useEffect(() => {
    if (!user || !!communityStateValue.moderatorSnippets.length) return;

    getModeratorSnippets();
  }, [user]);

  const getAllUsersSnippets = async () => {
    const snippetsCollection = collectionGroup(firestore, "moderatorSnippets");
    const snippetsDocs = await getDocs(snippetsCollection);
    const snippets: ModeratorSnippet[] = [];

    snippetsDocs.forEach((doc) => {
      const snippet = doc.data() as ModeratorSnippet;

      if (snippet.isModerator === true) {
        snippets.push({ ...snippet });
      }
    });

    return snippets;
  };

  const getModeratorSnippets = async () => {
    setLoading(true);
    try {
      const snippets = await getAllUsersSnippets();
      setCommunityStateValue((prev) => ({
        ...prev,
        moderatorSnippets: [...snippets], // Replace the existing snippets with the new ones
        initSnippetsFetched: true,
      }));
      setLoading(false);
    } catch (error: any) {
      console.log("Error getting snippets", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const getSnippets = async () => {
    setLoading(true);
    try {
      const snippets = await getMySnippets(user?.uid!);
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: snippets as CommunitySnippet[],
        initSnippetsFetched: true,
      }));
      setLoading(false);
    } catch (error: any) {
      console.log("Error getting user snippets", error);
      setError(error.message);
    }
    setLoading(false);
  };

  const fetchUserList = async () => {
    setLoadMoreLoading(true);
    const list: User[] = [];
    try {
      let querySnapshot;
      if (searchQuery) {
        const startAtKeyword = searchQuery.toUpperCase();
        const endAtKeyword = searchQuery.toLowerCase() + "\uf8ff";

        const queryRef = query(
          collection(firestore, "users"),
          orderBy("displayName"),
          startAt(startAtKeyword),
          endAt(endAtKeyword),
          limit(10 * currentPage)
        );
        querySnapshot = await getDocs(queryRef);
      } else {
        querySnapshot = await getDocs(
          query(collection(firestore, "users"), limit(10 * currentPage))
        );
      }

      querySnapshot.forEach((doc) => {
        list.push(doc.data() as User);
      });
      setUserList(list);
    } catch (error: any) {
      console.log("error", error);
    }
    setSearchLoading(false);
    setLoadMoreLoading(false);
  };

  const fetchModeratorList = async () => {
    setLoadMoreLoading(true);
    const list: User[] = [];
    try {
      let querySnapshot;
      if (searchQuery) {
        const startAtKeyword = searchQuery.toUpperCase();
        const endAtKeyword = searchQuery.toLowerCase() + "\uf8ff";

        const queryRef = query(
          collection(firestore, "users"),
          orderBy("displayName"),
          startAt(startAtKeyword),
          endAt(endAtKeyword)
        );
        querySnapshot = await getDocs(queryRef);
      } else {
        querySnapshot = await getDocs(query(collection(firestore, "users")));
      }

      querySnapshot.forEach((doc) => {
        list.push(doc.data() as User);
      });
      setModeratorList(list);
    } catch (error: any) {
      console.log("error", error);
    }
    setSearchLoading(false);
    setLoadMoreLoading(false);
  };

  useEffect(() => {
    fetchUserList();
    fetchModeratorList();
  }, [currentPage]);

  const onSearchUser = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setSearchLoading(true);
      setCurrentPage(1); // Reset page to 1 when searching
      fetchModeratorList();
      fetchUserList();
    }
  };

  const handleSearch = () => {
    setSearchLoading(true);
    setCurrentPage(1); // Reset page to 1 when searching
    fetchModeratorList();
    fetchUserList();
  };

  const onLoadMore = () => {
    setLoadMoreLoading(true);
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const getCommunityData = async (communityId: string) => {
    // this causes weird memory leak error - not sure why
    // setLoading(true);
    console.log("GETTING COMMUNITY DATA");

    try {
      const communityDocRef = doc(
        firestore,
        "communities",
        communityId as string
      );
      const communityDoc = await getDoc(communityDocRef);
      // setCommunityStateValue((prev) => ({
      //   ...prev,
      //   visitedCommunities: {
      //     ...prev.visitedCommunities,
      //     [communityId as string]: {
      //       id: communityDoc.id,
      //       ...communityDoc.data(),
      //     } as Community,
      //   },
      // }));
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          id: communityDoc.id,
          ...communityDoc.data(),
        } as Community,
      }));
    } catch (error: any) {
      console.log("getCommunityData error", error.message);
    }
    setLoading(false);
  };

  const onJoinLeaveCommunity = (community: Community, isJoined?: boolean) => {
    console.log("ON JOIN LEAVE", community.id);

    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    setLoading(true);
    setLoadingCommunityMap((prevLoadingMap) => ({
      ...prevLoadingMap,
      [community.id]: true, // Set loading state to true for the specific community
    }));
    if (isJoined) {
      leaveCommunity(community.id, community);
      return;
    }
    joinCommunity(community);
  };

  const joinCommunity = async (community: Community) => {
    console.log("JOINING COMMUNITY: ", community.id);

    const isCreatorJoining = user?.uid === community.creatorId;

    try {
      const batch = writeBatch(firestore);

      const newSnippet: CommunitySnippet = {
        communityId: community.id,
        imageURL: community.imageURL || "",
        isAdmin: user?.uid === community.creatorId,
        userUid: user?.uid,
      };
      batch.set(
        doc(
          firestore,
          `users/${user?.uid}/communitySnippets`,
          community.id // will for sure have this value at this point
        ),
        newSnippet
      );

      batch.update(doc(firestore, "communities", community.id), {
        numberOfMembers: increment(1),
      });

      //New Notification
      if (!isCreatorJoining) {
        const communityNotificationRef = doc(
          collection(
            firestore,
            "users",
            `${community.creatorId}/userNotification`
          )
        );

        const newNotification: UserNotification = {
          userDisplayText: user?.displayName || user?.email!.split("@")[0],
          userProfile: user?.photoURL || "",
          userId: user?.uid,
          creatorId: community.creatorId,
          createdAt: serverTimestamp() as Timestamp,
          communityId: community.id,
          notificationId: communityNotificationRef.id,
          notificationType: "community",
          isRead: false,
        };

        console.log("NEW Notification!!!", newNotification);

        batch.set(communityNotificationRef, newNotification);
      }

      // perform batch writes
      await batch.commit();

      // Add current community to snippet
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [...prev.mySnippets, newSnippet],
      }));
      setLoadingCommunityMap((prevLoadingMap) => ({
        ...prevLoadingMap,
        [community.id]: false, // Set loading state to true for the specific user
      }));
    } catch (error) {
      console.log("joinCommunity error", error);
    }
    setLoading(false);
  };

  const leaveCommunity = async (communityId: string, community: Community) => {
    try {
      const batch = writeBatch(firestore);

      batch.delete(
        doc(firestore, `users/${user?.uid}/communitySnippets/${communityId}`)
      );

      batch.update(doc(firestore, "communities", communityId), {
        numberOfMembers: increment(-1),
      });

      await batch.commit();

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter(
          (item) => item.communityId !== communityId
        ),
      }));
      setLoadingCommunityMap((prevLoadingMap) => ({
        ...prevLoadingMap,
        [community.id]: false, // Set loading state to true for the specific user
      }));
    } catch (error) {
      console.log("leaveCommunity error", error);
    }
    setLoading(false);
  };

  const onAddRemoveSponsor = async (
    community: Community,
    sponsor: Community,
    isSponsor?: boolean
  ) => {
    try {
      setLoadingSponsorMap((prevLoadingMap) => ({
        ...prevLoadingMap,
        [sponsor.id]: true, // Set loading state to true for the specific sponsor
      }));

      if (!isSponsor) {
        // Sponsor is not in the sponsorSnippets array, add them
        const newSnippet: SponsorSnippet = {
          communityId: community.id,
          sponsorId: sponsor.id,
          isSponsor: true,
          userUid: user?.uid,
        };

        const batch = writeBatch(firestore);
        batch.set(
          doc(
            firestore,
            `communities/${community.id}/sponsorSnippets`,
            sponsor.id
          ),
          newSnippet
        );
        await batch.commit();

        setCommunityStateValue((prev) => ({
          ...prev,
          sponsorSnippets: [...prev.sponsorSnippets, newSnippet], // Add the newSnippet to sponsorSnippets
        }));

        setIsSponsor(true);
      } else {
        // Sponsor is already in the sponsorSnippets array, remove them
        const batch = writeBatch(firestore);
        batch.delete(
          doc(
            firestore,
            `communities/${community.id}/sponsorSnippets/${sponsor.id}`
          )
        );
        await batch.commit();

        setCommunityStateValue((prev) => ({
          ...prev,
          sponsorSnippets: prev.sponsorSnippets.filter(
            (snippet) => snippet.sponsorId !== sponsor.id // Remove the sponsor snippet from sponsorSnippets
          ),
        }));

        setIsSponsor(false);
      }

      setLoadingSponsorMap((prevLoadingMap) => ({
        ...prevLoadingMap,
        [sponsor.id]: false, // Set loading state to false for the specific sponsor
      }));
    } catch (error) {
      console.log("onAddRemoveSponsor error", error);
    }
  };

  const onAddRemoveModerator = async (
    user: User,
    communityData: Community,
    isModerator?: boolean
  ) => {
    try {
      setLoadingModeratorMap((prevLoadingMap) => ({
        ...prevLoadingMap,
        [user.uid]: true, // Set loading state to true for the specific user
      }));

      if (!isModerator) {
        // Change the condition here
        // User is not a moderator, add them
        const newSnippet: ModeratorSnippet = {
          communityId: communityData.id,
          isModerator: true,
          userUid: user.uid,
        };

        const batch = writeBatch(firestore);
        batch.set(
          doc(
            firestore,
            `users/${user?.uid}/moderatorSnippets`,
            communityData.id
          ),
          newSnippet
        );
        await batch.commit();

        setCommunityStateValue((prev) => ({
          ...prev,
          moderatorSnippets: [...prev.moderatorSnippets, newSnippet],
        }));

        setIsModerator(true);
      } else {
        // User is already a moderator, remove them
        const batch = writeBatch(firestore);
        batch.delete(
          doc(
            firestore,
            `users/${user?.uid}/moderatorSnippets/${communityData.id}`
          )
        );
        await batch.commit();

        setCommunityStateValue((prev) => ({
          ...prev,
          moderatorSnippets: prev.moderatorSnippets.filter(
            (snippet) =>
              snippet.communityId !== communityData.id ||
              snippet.userUid !== user.uid
          ),
        }));

        setIsModerator(false);
      }

      setLoadingModeratorMap((prevLoadingMap) => ({
        ...prevLoadingMap,
        [user.uid]: false, // Set loading state to false for the specific user
      }));
    } catch (error) {
      console.log("handleAddRemoveModerator error", error);
    }
  };

  // useEffect(() => {
  //   if (ssrCommunityData) return;
  //   const { community } = router.query;
  //   if (community) {
  //     const communityData =
  //       communityStateValue.visitedCommunities[community as string];
  //     if (!communityData) {
  //       getCommunityData(community as string);
  //       return;
  //     }
  //   }
  // }, [router.query]);

  useEffect(() => {
    // if (ssrCommunityData) return;
    const { community } = router.query;
    if (community) {
      const communityData = communityStateValue.currentCommunity;

      if (!communityData.id) {
        getCommunityData(community as string);
        return;
      }
      // console.log("this is happening", communityStateValue);
    } else {
      /**
       * JUST ADDED THIS APRIL 24
       * FOR NEW LOGIC OF NOT USING visitedCommunities
       */
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: defaultCommunity,
      }));
    }
  }, [router.query, communityStateValue.currentCommunity]);

  // console.log("LOL", communityStateValue);

  return {
    communityStateValue,
    setCommunityStateValue,
    onJoinLeaveCommunity,
    onAddRemoveModerator,
    onAddRemoveSponsor,
    onLoadMore,
    onSearchUser,
    handleSearch,
    setSearchQuery,
    loadingModeratorMap,
    loadingCommunityMap,
    loadingSponsorMap,
    loadMoreLoading,
    searchLoading,
    loading,
    userList,
    moderatorList,
    currentPage,
  };
};

export default useCommunityData;
