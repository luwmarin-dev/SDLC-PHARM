export interface NotificationSettings {
  emailReplies: boolean;
  emailSessions: boolean;
  emailCourses: boolean;
  emailNewsletter: boolean;
}

export interface PrivacySettings {
  publicProfile: boolean;
  showRegion: boolean;
  allowMessages: boolean;
}

export default interface UserSettings {
  contentLanguages: ("ru" | "ky" | "en")[];
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  contentLanguages: ["ru"],
  notifications: {
    emailReplies: true,
    emailSessions: true,
    emailCourses: false,
    emailNewsletter: false,
  },
  privacy: {
    publicProfile: true,
    showRegion: true,
    allowMessages: true,
  },
};
