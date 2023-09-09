import { atom } from "recoil";
import { Timestamp } from "firebase/firestore";

export type Post = {
  mediaTypes: string[];
  id: string;
  communityId: string;
  communityImageURL?: string;
  userDisplayText: string;
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

interface PostState {
  selectedPost: Post | null;
  posts: Post[];
  postOptions: PostOptions[];
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
  postVotes: [],
  postsCache: {},
  postUpdateRequired: true,
};

export const postState = atom({
  key: "postState",
  default: defaultPostState,
});
