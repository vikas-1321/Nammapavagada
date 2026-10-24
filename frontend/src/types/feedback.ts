export type FeedbackCategory =
  | 'GENERAL'
  | 'INCORRECT_INFO'
  | 'MISSING_PLACE_OR_SERVICE'
  | 'WEBSITE_BUG'
  | 'SUGGESTION'
  | 'OTHER';

export type FeedbackStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'REJECTED';

export interface FeedbackCategoryOption {
  value: FeedbackCategory;
  label: string;
  description: string;
}

export const FEEDBACK_CATEGORIES: FeedbackCategoryOption[] = [
  {
    value: 'GENERAL',
    label: 'General Feedback',
    description: 'General thoughts or compliments about Namma Pavagada',
  },
  {
    value: 'INCORRECT_INFO',
    label: 'Incorrect Information',
    description: 'Outdated bus timing, wrong contact, address, or service detail',
  },
  {
    value: 'MISSING_PLACE_OR_SERVICE',
    label: 'Missing Place or Service',
    description: 'Suggest a landmark, hospital, school, or business to add',
  },
  {
    value: 'WEBSITE_BUG',
    label: 'Website Bug',
    description: 'Something looks broken, slow, or not working as expected',
  },
  {
    value: 'SUGGESTION',
    label: 'Suggestion',
    description: 'Ideas to make Namma Pavagada more useful for our taluk',
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Anything else you would like to share with our team',
  },
];

export interface FeedbackSubmissionPayload {
  category: FeedbackCategory;
  message: string;
  name?: string;
  email?: string;
  pagePath: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  relatedEntityName?: string;
  hp?: string; // Honeypot spam defense field
}

export interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  category: FeedbackCategory;
  categoryLabel: string;
  message: string;
  pagePath: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  relatedEntityName?: string | null;
  status: FeedbackStatus;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface FeedbackContextData {
  category?: FeedbackCategory;
  relatedEntityType?: string;
  relatedEntityId?: string;
  relatedEntityName?: string;
  defaultMessage?: string;
}
