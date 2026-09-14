export type BusinessCategory =
  | 'plumbing'
  | 'hvac'
  | 'electrical'
  | 'roofing'
  | 'locksmith'
  | 'auto'
  | 'cleaning'
  | 'landscaping'
  | 'salon'
  | 'medspa'
  | 'dental'
  | 'other';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  estimatedDurationMinutes?: number;
  priceType: 'fixed' | 'range' | 'starting_at';
  priceMin: number;
  priceMax?: number;
}

export interface BusinessHours {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface EmergencyRules {
  enabled: boolean;
  keywords: string[];
  escalationPhone: string;
  instructions: string;
  requireImmediateTransfer: boolean;
}

export interface BusinessProfile {
  name: string;
  phone: string;
  forwardingPhone?: string;
  address: string;
  category: BusinessCategory;
  hours: BusinessHours[];
  services: ServiceItem[];
  serviceArea: {
    primaryCity: string;
    radiusMiles: number;
    zipCodes: string[];
  };
  availabilityRules: {
    bufferMinutes: number;
    minNoticeHours: number;
    maxBookingDaysAhead: number;
    maxDaysInAdvance?: number;
    workingDays: string[];
  };
  faqs: FAQItem[];
  emergencyRules: EmergencyRules;
  calendarSettings: {
    provider: 'google' | 'internal';
    connected: boolean;
    calendarId?: string;
    calendarName?: string;
    syncEnabled: boolean;
  };
  sheetsSettings: {
    connected: boolean;
    spreadsheetId?: string;
    spreadsheetUrl?: string;
    sheetName?: string;
    syncEnabled: boolean;
  };
  notificationPreferences: {
    smsAlerts: boolean;
    emailAlerts: boolean;
    alertPhone: string;
    alertEmail: string;
    notifyOnMissedCall: boolean;
    notifyOnBookedAppointment: boolean;
    notifyOnEmergency: boolean;
  };
  aiSettings: {
    persona: 'friendly' | 'professional' | 'warm' | 'direct';
    identifyAsAI: boolean;
    systemPromptOverride: string;
    customGreeting: string;
    voiceName: string;
  };
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Appointment Booked' | 'Won' | 'Lost';
export type LeadUrgency = 'Emergency' | 'High' | 'Medium' | 'Low';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceRequested: string;
  address: string;
  status: LeadStatus;
  urgency: LeadUrgency;
  source: 'Missed Call' | 'Inbound Call' | 'Website SMS' | 'Direct';
  estimatedValue: number;
  notes: string;
  createdDate: string;
  lastContactedDate: string;
  conversationId: string;
  callHistoryIds: string[];
  appointmentId?: string;
}

export interface TranscriptLine {
  speaker: 'customer' | 'ai' | 'agent';
  text: string;
  time: string;
}

export interface CallLog {
  id: string;
  direction: 'inbound' | 'outbound';
  status: 'missed' | 'answered' | 'completed' | 'voicemail';
  durationSeconds: number;
  customerName: string;
  customerPhone: string;
  timestamp: string;
  aiOutcome:
    | 'Lead Qualified'
    | 'Appointment Booked'
    | 'Emergency Escalated'
    | 'Info Provided'
    | 'Follow-Up Scheduled'
    | 'Left Message'
    | 'Unresolved';
  recordingStatus: 'available' | 'transcribed' | 'processing' | 'none';
  transcript: TranscriptLine[];
  summary: string;
  leadId?: string;
  appointmentId?: string;
}

export interface Message {
  id: string;
  sender: 'customer' | 'ai' | 'human';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  leadId?: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  leadStatus: LeadStatus;
  isTakeoverMode: boolean;
  messages: Message[];
}

export interface Appointment {
  id: string;
  leadId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  service: string;
  startDateTime: string; // ISO string
  endDateTime: string;   // ISO string
  address: string;
  status: 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
  price: number;
  notes: string;
  googleEventId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalAppointments: number;
  totalSpent: number;
  lastServiceDate: string;
  notes: string;
  tags: string[];
}

export interface AutomationStep {
  id: string;
  delayText: string;
  delayMinutes: number;
  action: 'sms' | 'ai_call' | 'notification';
  messageTemplate: string;
}

export interface AutomationSequence {
  id: string;
  name: string;
  description: string;
  trigger: 'missed_call' | 'appointment_booked' | 'unbooked_lead' | 'emergency_followup';
  enabled: boolean;
  steps: AutomationStep[];
}

export interface DashboardMetrics {
  callsReceived: number;
  missedCalls: number;
  leadsCaptured: number;
  appointmentsBooked: number;
  conversionRate: number;
  estimatedRevenueRecovered: number;
  aiConversations: number;
  followUpsPending: number;
}

export type NavigationTab =
  | 'dashboard'
  | 'leads'
  | 'conversations'
  | 'calls'
  | 'appointments'
  | 'ai-receptionist'
  | 'settings';

export type BusinessService = ServiceItem;
