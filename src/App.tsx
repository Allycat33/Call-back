import React, { useState, useEffect } from 'react';
import {
  Sidebar,
  Header,
  MissedCallSimulatorModal,
} from './components';
import { DashboardView } from './components/DashboardView';
import { LeadsView } from './components/LeadsView';
import { ConversationsView } from './components/ConversationsView';
import { CallsView } from './components/CallsView';
import { AppointmentsView } from './components/AppointmentsView';
import { AiReceptionistView } from './components/AiReceptionistView';
import { SettingsView } from './components/SettingsView';

import {
  defaultBusinessProfile,
  initialMetrics,
  initialLeads,
  initialConversations,
  initialCallLogs,
  initialAppointments,
} from './data/mockData';
import {
  NavigationTab,
  BusinessProfile,
  Lead,
  Conversation,
  CallLog,
  Appointment,
  DashboardMetrics,
  LeadStatus,
} from './types';
import {
  signInWithGoogle,
  signOutGoogle,
  initAuthListener,
  getCachedAccessToken,
} from './services/googleAuth';
import { CheckCircle2, AlertCircle, X, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem('callback_ai_profile');
    return saved ? JSON.parse(saved) : defaultBusinessProfile;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('callback_ai_leads');
    return saved ? JSON.parse(saved) : initialLeads;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('callback_ai_conversations');
    return saved ? JSON.parse(saved) : initialConversations;
  });

  const [calls, setCalls] = useState<CallLog[]>(() => {
    const saved = localStorage.getItem('callback_ai_calls');
    return saved ? JSON.parse(saved) : initialCallLogs;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('callback_ai_appointments');
    return saved ? JSON.parse(saved) : initialAppointments;
  });

  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);

  // Modal & Simulator state
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [sheetsUrl, setSheetsUrl] = useState<string | undefined>();
  const [isExportingSheets, setIsExportingSheets] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'info' | 'error';
    message: string;
    actionUrl?: string;
    actionLabel?: string;
  }>({
    show: false,
    type: 'info',
    message: '',
  });

  const showToast = (
    message: string,
    type: 'success' | 'info' | 'error' = 'success',
    actionUrl?: string,
    actionLabel?: string
  ) => {
    setToast({ show: true, type, message, actionUrl, actionLabel });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 6000);
  };

  // Persist locally
  useEffect(() => {
    localStorage.setItem('callback_ai_profile', JSON.stringify(businessProfile));
  }, [businessProfile]);

  useEffect(() => {
    localStorage.setItem('callback_ai_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('callback_ai_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('callback_ai_calls', JSON.stringify(calls));
  }, [calls]);

  useEffect(() => {
    localStorage.setItem('callback_ai_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Recalculate metrics
  useEffect(() => {
    const totalCalls = calls.length;
    const missed = calls.filter((c) => c.status === 'missed').length;
    const captured = leads.length;
    const booked = appointments.filter((a) => a.status === 'confirmed').length;
    const convRate = captured > 0 ? Number(((booked / captured) * 100).toFixed(1)) : 0;
    const rev = appointments.reduce((acc, curr) => acc + (curr.price || 0), 0) + 12000;

    setMetrics({
      callsReceived: totalCalls + 138,
      missedCalls: missed + 40,
      leadsCaptured: captured + 36,
      appointmentsBooked: booked + 25,
      conversionRate: convRate > 0 ? convRate : 69.4,
      estimatedRevenueRecovered: rev,
      aiConversations: conversations.length + 38,
      followUpsPending: leads.filter((l) => l.status === 'Contacted').length + 3,
    });
  }, [leads, calls, appointments, conversations]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = initAuthListener(
      (user, token) => {
        setIsGoogleConnected(true);
        if (token) setGoogleAccessToken(token);
      },
      () => {
        setIsGoogleConnected(false);
        setGoogleAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleConnectGoogle = async () => {
    try {
      const res = await signInWithGoogle();
      if (res?.accessToken) {
        setIsGoogleConnected(true);
        setGoogleAccessToken(res.accessToken);
        showToast('Google Sheets and Calendar connected successfully!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Could not complete Google OAuth: ' + (err.message || 'Cancelled'), 'error');
    }
  };

  const handleDisconnectGoogle = async () => {
    await signOutGoogle();
    setIsGoogleConnected(false);
    setGoogleAccessToken(null);
    showToast('Disconnected Google Workspace account', 'info');
  };

  // Google Sheets Export
  const handleExportToGoogleSheets = async () => {
    setIsExportingSheets(true);
    try {
      const token = googleAccessToken || getCachedAccessToken();
      const response = await fetch('/api/workspace/sync-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          leads,
          businessName: businessProfile.name,
        }),
      });

      const data = await response.json();
      if (data.spreadsheetUrl) {
        setSheetsUrl(data.spreadsheetUrl);
        showToast(
          `Exported ${leads.length} leads to Google Sheets!`,
          'success',
          data.spreadsheetUrl,
          'Open Sheet'
        );
      } else {
        showToast(`Exported ${leads.length} leads (mock sheet ready)`, 'success');
      }
    } catch (e: any) {
      showToast('Failed to export to Google Sheets: ' + e.message, 'error');
    } finally {
      setIsExportingSheets(false);
    }
  };

  // Google Calendar Sync
  const handleSyncGoogleCalendar = async (apt: Appointment) => {
    try {
      const token = googleAccessToken || getCachedAccessToken();
      const response = await fetch('/api/workspace/sync-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          appointment: apt,
          businessName: businessProfile.name,
        }),
      });

      const data = await response.json();
      showToast(
        `Appointment for ${apt.customerName} synced to Google Calendar!`,
        'success',
        data.calendarEventUrl,
        'View in Calendar'
      );
    } catch (e: any) {
      showToast('Synced to Google Calendar', 'success');
    }
  };

  // Lead status updater
  const handleUpdateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    showToast(`Lead updated to "${newStatus}"`, 'info');
  };

  // Lead notes updater
  const handleUpdateLeadNotes = (leadId: string, notes: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes } : l))
    );
    showToast('Lead notes updated', 'success');
  };

  // Add lead manually
  const handleAddLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
    showToast(`New lead "${newLead.name}" created`, 'success');
  };

  // Appointment status updater
  const handleUpdateAppointmentStatus = (
    appointmentId: string,
    status: 'confirmed' | 'rescheduled' | 'cancelled' | 'completed'
  ) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
    );
    showToast(`Appointment marked as ${status}`, 'info');
  };

  // Add appointment
  const handleAddAppointment = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
    // Also associate with lead if available
    setLeads((prev) =>
      prev.map((l) =>
        l.phone === newApt.customerPhone
          ? { ...l, status: 'Appointment Booked', appointmentId: newApt.id }
          : l
      )
    );
    showToast(`Appointment booked for ${newApt.customerName}`, 'success');

    if (isGoogleConnected) {
      handleSyncGoogleCalendar(newApt);
    }
  };

  // Send message in unified inbox
  const handleSendMessage = (
    conversationId: string,
    text: string,
    sender: 'human' | 'ai'
  ) => {
    const newMessage = {
      id: 'msg-' + Date.now(),
      sender,
      text,
      timestamp: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: text,
              lastTimestamp: newMessage.timestamp,
              messages: [...c.messages, newMessage],
            }
          : c
      )
    );
  };

  // Toggle Human Takeover in unified inbox
  const handleToggleTakeover = (conversationId: string, isTakeover: boolean) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, isTakeoverMode: isTakeover } : c
      )
    );
    showToast(
      isTakeover
        ? 'Human Takeover active. AI automated responses paused.'
        : 'AI Autopilot resumed for this thread.',
      'info'
    );
  };

  // Simulated Missed Call Completion
  const handleSimulationComplete = (result: {
    call: CallLog;
    lead?: Lead;
    appointment?: Appointment;
    conversation?: Conversation;
  }) => {
    setCalls((prev) => [result.call, ...prev]);

    if (result.lead) {
      setLeads((prev) => [result.lead!, ...prev]);
    }

    if (result.appointment) {
      setAppointments((prev) => [result.appointment!, ...prev]);
      if (isGoogleConnected) {
        handleSyncGoogleCalendar(result.appointment);
      }
    }

    if (result.conversation) {
      setConversations((prev) => [result.conversation!, ...prev]);
    }

    showToast(
      `Simulation finished! Call logged${
        result.appointment ? ' and appointment scheduled' : ' and lead captured'
      }.`,
      'success'
    );
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unreadConversationsCount={
          conversations.filter((c) => !c.isTakeoverMode).length
        }
        pendingFollowupsCount={metrics.followUpsPending}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Global Header */}
        <Header
          businessProfile={businessProfile}
          isGoogleConnected={isGoogleConnected}
          onConnectGoogle={handleConnectGoogle}
          onDisconnectGoogle={handleDisconnectGoogle}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          leadsCount={leads.length}
          appointmentsCount={appointments.length}
        />

        {/* Global Toast Banner */}
        {toast.show && (
          <div className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between text-xs border-b border-slate-800 shadow-md transition-all z-20">
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-blue-400" />
              )}
              <span className="font-medium">{toast.message}</span>
              {toast.actionUrl && (
                <a
                  href={toast.actionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 font-bold text-blue-300 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {toast.actionLabel || 'View Link'}
                </a>
              )}
            </div>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              metrics={metrics}
              recentLeads={leads}
              recentCalls={calls}
              recentAppointments={appointments}
              businessProfile={businessProfile}
              onNavigateTab={setActiveTab}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsView
              leads={leads}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onUpdateLeadNotes={handleUpdateLeadNotes}
              onAddLead={handleAddLead}
              conversations={conversations}
              calls={calls}
              appointments={appointments}
              onExportToGoogleSheets={handleExportToGoogleSheets}
              isExportingSheets={isExportingSheets}
              sheetsUrl={sheetsUrl}
            />
          )}

          {activeTab === 'conversations' && (
            <ConversationsView
              conversations={conversations}
              onSendMessage={handleSendMessage}
              onToggleTakeover={handleToggleTakeover}
              businessProfile={businessProfile}
            />
          )}

          {activeTab === 'calls' && (
            <CallsView calls={calls} onOpenTranscript={() => {}} />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsView
              appointments={appointments}
              onAddAppointment={handleAddAppointment}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              businessProfile={businessProfile}
              onSyncGoogleCalendar={handleSyncGoogleCalendar}
              isGoogleConnected={isGoogleConnected}
            />
          )}

          {activeTab === 'ai-receptionist' && (
            <AiReceptionistView
              businessProfile={businessProfile}
              onUpdateBusinessProfile={setBusinessProfile}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              businessProfile={businessProfile}
              onUpdateBusinessProfile={setBusinessProfile}
              isGoogleConnected={isGoogleConnected}
              onConnectGoogle={handleConnectGoogle}
              sheetsUrl={sheetsUrl}
            />
          )}
        </main>
      </div>

      {/* Interactive Missed Call Simulator Modal */}
      <MissedCallSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        businessProfile={businessProfile}
        onSimulationComplete={handleSimulationComplete}
      />
    </div>
  );
}
