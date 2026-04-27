export type CompetitionStatus =
  | "open"
  | "judging"
  | "announced";

export type CompetitionType =
  | "open"
  | "student"
  | "ideas"
  | "invite_only"
  | "awards";

export type EligibilityType =
  | "open_to_all"
  | "students_only"
  | "licensed_professionals"
  | "regional";

export type IPTermsType =
  | "retain_all"
  | "non_exclusive_license"
  | "winning_license"
  | "winning_transfer"
  | "custom";

export interface PrizeBreakdown {
  place: string;
  amount: number;
  recipientName?: string;
}

export interface PrizePool {
  totalAmount: number;
  currency: string;
  breakdown: PrizeBreakdown[];
  isOpenPool: boolean;
  contributorCount: number;
  platformFeePercent: number;
  netToWinners: number;
  fundingStatus: "funded" | "partially_funded" | "paid_out";
  paidOutDate?: string;
}

export interface Organizer {
  id: string;
  name: string;
  logo?: string;
  description: string;
  website?: string;
  isVerified: boolean;
  competitionsCount: number;
  payoutCompletionRate: number;
}

export interface JuryMember {
  name: string;
  title: string;
  organization: string;
  photo?: string;
  bio: string;
}

export interface EvaluationCriterion {
  name: string;
  weight: number;
  description?: string;
}

export interface Deliverable {
  type: string;
  format: string;
  maxSize?: string;
  dimensions?: string;
  description?: string;
}

export interface IPTerms {
  type: IPTermsType;
  summary: string;
  fullText: string;
  appliesToAllEntries: boolean;
  isDefault: boolean;
  warningLevel: "none" | "info" | "caution";
}

export interface WinnerEntry {
  place: string;
  designerName: string;
  designerOrg?: string;
  submitterSlug?: string;
  projectTitle: string;
  description: string;
  images: string[];
  juryStatement?: string;
  prizeAmount: number;
  paidOut: boolean;
  paidOutDate?: string;
}

export interface Submitter {
  id: string;
  slug: string;
  name: string;
  type: "individual" | "studio";
  photo?: string;
  country: string;
  city?: string;
  bio: string;
  specialties: string[];
  website?: string;
  yearEstablished?: number;
}

export interface CompetitionResults {
  winners: WinnerEntry[];
  jurySummary?: string;
}

export interface LifecycleUpdate {
  date: string;
  author: string;
  title: string;
  content: string;
  images?: string[];
  newStatus?: CompetitionStatus;
}

export interface Competition {
  id: string;
  slug: string;
  escrowAddress?: string;
  chainId?: number;
  prizeShareBps?: number[];
  title: string;
  shortDescription: string;
  brief: string;
  designObjectives: string[];
  siteContext: string;
  background: string;
  type: CompetitionType;
  status: CompetitionStatus;
  eligibility: EligibilityType;
  tags: string[];
  location: string;
  region: string;
  language: string;
  heroImage: string;
  thumbnailImage: string;
  registrationDeadline: string;
  submissionDeadline: string;
  judgingStart: string;
  judgingEnd: string;
  announcementDate: string;
  prizePool: PrizePool;
  organizer: Organizer;
  jury: JuryMember[];
  evaluationCriteria: EvaluationCriterion[];
  deliverables: Deliverable[];
  ipTerms: IPTerms;
  results?: CompetitionResults;
  updates?: LifecycleUpdate[];
  createdAt: string;
}
