import { atom } from "recoil";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  description: string;
  createdAt: number;
  notificationCount: number;
}

interface UserProfileState {
  [key: string]:
    | { [key: string]: UserProfile }
    | UserProfile
    | boolean
    | undefined;
  initSnippetsFetched: boolean;
  visitedProfile: {
    [key: string]: UserProfile;
  };
  currentProfile: UserProfile;
}

export const defaultProfile: UserProfile = {
  uid: "",
  email: "",
  displayName: "",
  photoURL: "",
  description: "",
  createdAt: 0,
  notificationCount: 0,
};

const defaultUserState: UserProfileState = {
  initSnippetsFetched: false,
  visitedProfile: {},
  currentProfile: defaultProfile,
};

export const userState = atom<UserProfileState>({
  key: "userState",
  default: defaultUserState,
});
