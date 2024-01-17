import { atom } from "recoil";
import { Timestamp } from "firebase/firestore";

export type Post = {
  mediaTypes: string[];
  id: string;
  communityId: string;
  communityImageURL?: string;
  creatorEmail: string;
  creatorDisplayText: string;
  creatorId: string;
  title: string;
  body: string;
  numberOfComments: number;
  voteStatus: number;
  currentUserVoteStatus?: {
    id: string;
    voteValue: number;
  };
  mediaURLs?: string[];
  postIdx?: number;
  createdAt: Timestamp;
  editedAt?: Timestamp;
  location?: string;
  date?: string;
  timeStart?: string;
  timeEnd?: string;
  phoneNumber?: number;
  email?: string;
  eventTitle?: string;
  eventVolunteer?: number;
  isEdited?: boolean;
  isPinned: boolean;
  isVolunteer?: boolean;
  country?: string;
  postTags?: string;
  postLink?: string;
};

export type PostVote = {
  id?: string;
  postId: string;
  communityId: string;
  voteValue: number;
};

// Add a union type that includes PostVote and the partial object with postId and voteValue
type PostVoteOrPartial =
  | PostVote
  | { postId: any; voteValue: any; id?: string };

export type PostOptions = {
  id?: string;
  postId: string;
  communityId: string;
  isSaved: boolean;
  isHidden: boolean;
  isReported: boolean;
};

export type PostVolunteer = {
  id?: string;
  postId: string;
  communityId: string;
};

interface PostState {
  selectedPost: Post | null;
  posts: Post[];
  postOptions: PostOptions[];
  postVolunteer: PostVolunteer[];
  postVotes: PostVoteOrPartial[];
  postsCache: {
    [key: string]: Post[];
  };
  postUpdateRequired: boolean;
}

export const defaultPostState: PostState = {
  selectedPost: null,
  posts: [],
  postOptions: [],
  postVolunteer: [],
  postVotes: [],
  postsCache: {},
  postUpdateRequired: true,
};

export const postState = atom({
  key: "postState",
  default: defaultPostState,
});
