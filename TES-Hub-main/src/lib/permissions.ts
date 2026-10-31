import type { Role } from "../types/role";

export const ACTIONS = [
  "comment",
  "like",

  "createStory",
  "createQuestion",
  "createArticle",
  "createCourse",
  "createSession",

  "editOwnContent",
  "deleteOwnContent",

  "submitForReview",
  "publishDirectly",

  "moderateContent",
  "manageUsers",
  "managePayments",
  "manageTaxonomy",
  "viewAnalytics",

  "editProfile",
  "uploadCredentials",
] as const;

export type Action = (typeof ACTIONS)[number];

export const PERMISSIONS: Record<Role, Record<Action, boolean>> = {
  guest: {
    comment: false,
    like: false,

    createStory: false,
    createQuestion: false,
    createArticle: false,
    createCourse: false,
    createSession: false,

    editOwnContent: false,
    deleteOwnContent: false,

    submitForReview: false,
    publishDirectly: false,

    moderateContent: false,
    manageUsers: false,
    managePayments: false,
    manageTaxonomy: false,
    viewAnalytics: false,

    editProfile: false,
    uploadCredentials: false,
  },
  member: {
    comment: true,
    like: true,

    createStory: false,
    createQuestion: false,
    createArticle: false,
    createCourse: false,
    createSession: false,

    editOwnContent: true,
    deleteOwnContent: true,

    submitForReview: false,
    publishDirectly: false,

    moderateContent: false,
    manageUsers: false,
    managePayments: false,
    manageTaxonomy: false,
    viewAnalytics: false,

    editProfile: true,
    uploadCredentials: true,
  },
  verified_farmer: {
    comment: true,
    like: true,

    createStory: true,
    createQuestion: true,
    createArticle: false,
    createCourse: false,
    createSession: false,

    editOwnContent: true,
    deleteOwnContent: true,

    submitForReview: true,
    publishDirectly: false,

    moderateContent: false,
    manageUsers: false,
    managePayments: false,
    manageTaxonomy: false,
    viewAnalytics: false,

    editProfile: true,
    uploadCredentials: true,
  },
  spac_consultant: {
    comment: true,
    like: true,

    createStory: true,
    createQuestion: true,
    createArticle: false,
    createCourse: true,
    createSession: true,

    editOwnContent: true,
    deleteOwnContent: true,

    submitForReview: true,
    publishDirectly: false,

    moderateContent: false,
    manageUsers: false,
    managePayments: false,
    manageTaxonomy: false,
    viewAnalytics: false,

    editProfile: true,
    uploadCredentials: true,
  },
  tes_author: {
    comment: true,
    like: true,

    createStory: false,
    createQuestion: false,
    createArticle: true,
    createCourse: true,
    createSession: true,

    editOwnContent: true,
    deleteOwnContent: true,

    submitForReview: false,
    publishDirectly: true,

    moderateContent: false,
    manageUsers: false,
    managePayments: false,
    manageTaxonomy: false,
    viewAnalytics: false,

    editProfile: true,
    uploadCredentials: true,
  },
  tes_admin: {
    comment: true,
    like: true,

    createStory: true,
    createQuestion: true,
    createArticle: true,
    createCourse: true,
    createSession: true,

    editOwnContent: true,
    deleteOwnContent: true,

    submitForReview: true,
    publishDirectly: true,

    moderateContent: true,
    manageUsers: true,
    managePayments: true,
    manageTaxonomy: true,
    viewAnalytics: true,

    editProfile: true,
    uploadCredentials: true,
  },
};

export const can = (role: Role, action: Action) => PERMISSIONS[role][action];
