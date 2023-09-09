import { Timestamp } from "firebase-admin/firestore";
import { atom } from "recoil";

export type UserNotification = {
  userDisplayText?: string;
  userId?: string;
  triggerDocumentId?: string;
  creatorId?: string;
  communityId: string;
  userProfile: string;
  createdAt: Timestamp;
  notificationType?: string;
  isRead?: boolean;
  notificationId: string;
};

const defaultUserNotificationState: UserNotification = {
  userDisplayText: "",
  userId: "",
  triggerDocumentId: "",
  creatorId: "",
  communityId: "",
  userProfile: "",
  createdAt: Timestamp.now(),
  notificationType: "",
  isRead: false,
  notificationId: "",
};

export const notificationState = atom({
  key: "notificationState",
  default: defaultUserNotificationState,
});
