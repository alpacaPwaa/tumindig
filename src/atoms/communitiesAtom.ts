import { atom } from "recoil";
import { FieldValue, Timestamp } from "firebase/firestore";

export interface Community {
  rules: { title: string; body: string }[];
  creatorId: string | undefined;
  communityName?: string;
  id: string;
  creatorName: string;
  numberOfMembers: number;
  privacyType: "public" | "restricted" | "private";
  createdAt?: Timestamp;
  imageURL?: string;
  communityCategory: "Volunteer" | "Organization" | "Sponsor";
  description: string;
  bannerURL: string;
  organizationVolunteerType?:
    | "Non-Profit"
    | "Education"
    | "Environment"
    | "Advocacy"
    | "Religion"
    | "Charity"
    | "Others";
  emailContact?: string;
  phoneContact?: number;
  websiteContact?: string;
}

export interface CommunitySnippet {
  communityId: string;
  isAdmin?: boolean;
  imageURL?: string;
  userUid?: string;
}

export interface ModeratorSnippet {
  communityId: string;
  isModerator?: boolean;
  userUid?: string;
}

export interface SponsorSnippet {
  communityId: string;
  sponsorId: string;
  isSponsor?: boolean;
  userUid?: string;
}

interface CommunityState {
  [key: string]:
    | ModeratorSnippet[]
    | CommunitySnippet[]
    | SponsorSnippet[]
    | { [key: string]: Community }
    | Community
    | boolean
    | undefined;
  mySnippets: CommunitySnippet[];
  moderatorSnippets: ModeratorSnippet[];
  sponsorSnippets: SponsorSnippet[];
  initSnippetsFetched: boolean;
  visitedCommunities: {
    [key: string]: Community;
  };
  currentCommunity: Community;
}

export const defaultCommunity: Community = {
  rules: [{ title: "", body: "" }],
  id: "",
  creatorId: "",
  creatorName: "",
  numberOfMembers: 0,
  privacyType: "public",
  communityCategory: "Volunteer",
  organizationVolunteerType: "Others",
  description: "",
  bannerURL: "",
};

export const defaultCommunityState: CommunityState = {
  mySnippets: [],
  moderatorSnippets: [],
  sponsorSnippets: [],
  initSnippetsFetched: false,
  visitedCommunities: {},
  currentCommunity: defaultCommunity,
};

export const communityState = atom<CommunityState>({
  key: "communitiesState",
  default: defaultCommunityState,
});
