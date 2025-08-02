export enum LeadStage {
  NEW_LEAD = "New Lead",
  CONTACTED = "Contacted",
  INSPECTION_SCHEDULED = "Inspection Scheduled",
  PROPOSAL_SENT = "Proposal Sent",
  CLOSED_WON = "Closed - Won",
  CLOSED_LOST = "Closed - Lost",
}

export interface LeadDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string; // Data URL
}

export interface ContractLineItem {
  id: string;
  description: string;
  quantity: string;
  price: string;
}

export interface PaymentScheduleItem {
  id: string;
  description: string; // e.g., "First Payment (Due upon Start of Job/Material Delivery)"
  amount: string;
}

export interface ContractDetails {
  contractDate: string; // ISO Date string
  
  // Page 1 - Customer Information
  customerName?: string; // Auto-fill from lead.firstName + lead.lastName
  customerAddress?: string; // Property address
  
  // Page 1 - Company Representative (Default: Justin Cox)
  companyRepresentativeName: string; // Default: "Justin Cox"
  companyRepresentativePhone: string; // Default: "(737) 414-1929"
  companyRepresentativeEmail: string; // Default: "Justin@JJroofers.com"

  // Page 1 - Main Services
  roofingItems: ContractLineItem[];
  gutterItems: ContractLineItem[];
  windowItems: ContractLineItem[];
  
  // Page 1 - Financial Summary
  subtotal?: string;
  total?: string;
  grandTotal: string;

  // Page 1 - Payment Schedule (3 standard payments)
  paymentSchedule: PaymentScheduleItem[];

  // Page 2 - Contract Worksheet
  deductible?: string;
  nonRecoverableDepreciation?: string;
  upgrades?: string; // Default: "Standing Seam Metal, SYNTHETIC UL, I&W, LIFETIME WARRANTY"
  discounts?: string;
  workNotDoing?: string; // Default: "GUTTERS, BEADING"
  remainingBalanceOnDeductibleAndUpgrades?: string;

  // Page 4 - Review and Initial Items
  shingleTypeColorDelivery?: string; // Default: "Shingles | Lifetime | IKO Dynasty | Duration Class 3 / None / None"
  existingPropertyDamage?: string; // Default: "None"

  // Page 4 - Liability Disclosure Addendum Initials
  initialsConstructionSiteCaution?: string; // Customer initials
  initialsDrivewayUsage?: string; // Customer initials
  initialsPuncturedLines?: string; // Customer initials
  initialsTermsOnReverseSide?: string; // Customer initials

  // Page 4 - Right of Rescission and Property Disclosure
  initialsRightOfRescissionConfirmation?: string; // Customer initials
  initialsDisclosureConfirmation?: string; // Customer initials
  cancellationSignature?: string;
  cancellationDate?: string;

  // Page 6 - Third Party Authorization Form
  thirdPartyAuthHomeownerName?: string;
  thirdPartyAuthPropertyAddress?: string;
  thirdPartyAuthInsuranceCompany?: string;
  thirdPartyAuthClaimNumber?: string;
  thirdPartyAuthRequestInspections?: boolean;
  thirdPartyAuthDiscussSupplements?: boolean;
  thirdPartyAuthIssuedPaymentDiscussions?: boolean;
  thirdPartyAuthRequestClaimPaymentStatus?: boolean;

  // Signature dates for all pages
  companyAuthorizedSignatureDate?: string; // Page 1
  customerSignature1Date?: string; // Page 1
  customerSignature2Date?: string; // Page 3
  customerSignature3Date?: string; // Page 5
  customerSignature4Date?: string; // Page 6
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber?: string; // Customer phone number
  time?: string; // Appointment time
  claimInfo?: string;
  claimNumber?: string; // Insurance claim number
  claimCompany?: string; // Insurance company name
  nextSetDate?: string; // Date mentioned by sales rep for follow-up
  originalMessage?: string; // Raw text input or GroupMe message
  sender?: string; // Name of person who added/sent lead (Sales rep)
  timestamp: string; // ISO string of creation date
  stage: LeadStage;
  lastStageUpdateTimestamp: string; // ISO string of when the stage was last updated
  documents?: LeadDocument[];
  contract?: ContractDetails;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  retrievedContext?: {
    uri?: string;
    title?: string;
  };
}

// Google Calendar Types
export interface CalendarListEntry {
  kind: "calendar#calendarListEntry";
  etag: string;
  id: string;
  summary: string;
  description?: string;
  location?: string;
  timeZone?: string;
  summaryOverride?: string;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  hidden?: boolean;
  selected?: boolean;
  accessRole: "none" | "freeBusyReader" | "reader" | "writer" | "owner";
  defaultReminders: Array<{ method: string; minutes: number }>;
  notificationSettings?: {
    notifications: Array<{ type: string; method: string }>;
  };
  primary?: boolean;
  deleted?: boolean;
  conferenceProperties?: {
    allowedConferenceSolutionTypes: string[];
  };
}
