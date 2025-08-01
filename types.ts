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
  // Page 1 - Customer (usually from Lead, but can be confirmed/overridden)
  customerName?: string; // Auto-fill from lead.firstName + lead.lastName
  // Page 1 - Company Representative
  companyRepresentativeName: string;
  companyRepresentativePhone: string;
  companyRepresentativeEmail: string;

  // Page 1 - Main Services (Roofing, Gutters, Windows)
  roofingItems: ContractLineItem[];
  gutterItems: ContractLineItem[];
  windowItems: ContractLineItem[];
  // Calculated Subtotal and Total can be derived or entered if complex
  subtotal?: string;
  total?: string;
  grandTotal: string;

  // Page 1 - Payment Schedule
  paymentSchedule: PaymentScheduleItem[];

  // Page 2 - Contract Worksheet
  deductible?: string;
  nonRecoverableDepreciation?: string;
  upgrades?: string; // e.g., "OC TRU DEF DURATION CLASS 3 IR, SYNTHETIC UL, I&W, LIFETIME WARRANTY"
  discounts?: string; // e.g., "STORM"
  workNotDoing?: string; // e.g., "GUTTERS, BEADING"
  remainingBalanceOnDeductibleAndUpgrades?: string;

  // Page 4 - Please Review and Initial the Below Items
  shingleTypeColorDelivery: string;
  existingPropertyDamage: string; // e.g., "Fascia Rot, Driveway Cracks, etc."

  // Page 4 - Liability Disclosure Addendum Initials
  initialsConstructionSiteCaution: boolean;
  initialsDrivewayUsage: boolean;
  initialsPuncturedLines: boolean;
  initialsTermsOnReverseSide: boolean;

  // Page 4 - Right of Rescission and Property Disclosure
  initialsRightOfRescissionConfirmation: boolean;
  initialsDisclosureConfirmation: boolean;
  cancellationSignature?: string; // Placeholder for image or typed name
  cancellationDate?: string; // ISO Date string

  // Page 6 - Third Party Authorization Form
  thirdPartyAuthHomeownerName?: string; // Could be customerName
  thirdPartyAuthPropertyAddress?: string; // Could be lead.address
  thirdPartyAuthInsuranceCompany?: string;
  thirdPartyAuthClaimNumber?: string;
  thirdPartyAuthRequestInspections: boolean;
  thirdPartyAuthDiscussSupplements: boolean;
  thirdPartyAuthIssuedPaymentDiscussions: boolean;
  thirdPartyAuthRequestClaimPaymentStatus: boolean;

  // Other signature placeholders (visual in PrintableContract, not data fields for e-sign)
  companyAuthorizedSignatureDate?: string; // ISO Date string
  customerSignature1Date?: string; // ISO Date string
  customerSignature2Date?: string; // ISO Date string
  customerSignature3Date?: string; // ISO Date string
  customerSignature4Date?: string; // ISO Date string
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
