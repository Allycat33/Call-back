import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  FileSpreadsheet,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  X,
  Edit2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Lead, LeadStatus, Conversation, CallLog, Appointment } from '../types';

interface LeadsViewProps {
  leads: Lead[];
  onUpdateLeadStatus: (leadId: string, newStatus: LeadStatus) => void;
  onUpdateLeadNotes: (leadId: string, notes: string) => void;
  onAddLead: (lead: Lead) => void;
  conversations: Conversation[];
  calls: CallLog[];
  appointments: Appointment[];
  onExportToGoogleSheets: () => void;
  isExportingSheets: boolean;
  sheetsUrl?: string;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  onUpdateLeadStatus,
  onUpdateLeadNotes,
  onAddLead,
  conversations,
  calls,
  appointments,
  onExportToGoogleSheets,
  isExportingSheets,
  sheetsUrl,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Lead form state
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    serviceRequested: '',
    address: '',
    status: 'New' as LeadStatus,
    urgency: 'Medium' as const,
    source: 'Direct' as const,
    estimatedValue: 250,
    notes: '',
  });

  const statuses: LeadStatus[] = [
    'New',
    'Contacted',
    'Qualified',
    'Appointment Booked',
    'Won',
    'Lost',
  ];

  const filteredLeads = leads.filter((lead) => {
    const matchSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.serviceRequested.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchUrgency = urgencyFilter === 'All' || lead.urgency === urgencyFilter;

    return matchSearch && matchStatus && matchUrgency;
  });

  const handleOpenLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setNotesDraft(lead.notes);
    setIsEditingNotes(false);
  };

  const handleSaveNotes = () => {
    if (selectedLead) {
      onUpdateLeadNotes(selectedLead.id, notesDraft);
      setSelectedLead({ ...selectedLead, notes: notesDraft });
      setIsEditingNotes(false);
    }
  };

  const handleCreateLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) return;

    const created: Lead = {
      id: 'lead-' + Date.now(),
      name: newLeadForm.name,
      phone: newLeadForm.phone,
      email: newLeadForm.email || `${newLeadForm.name.toLowerCase().replace(' ', '.')}@gmail.com`,
      serviceRequested: newLeadForm.serviceRequested || 'General Diagnostic',
      address: newLeadForm.address || 'Austin, TX',
      status: newLeadForm.status,
      urgency: newLeadForm.urgency,
      source: newLeadForm.source,
      estimatedValue: Number(newLeadForm.estimatedValue) || 200,
      notes: newLeadForm.notes || 'Manually added lead.',
      createdDate: new Date().toISOString(),
      lastContactedDate: new Date().toISOString(),
      conversationId: 'conv-' + Date.now(),
      callHistoryIds: [],
    };

    onAddLead(created);
    setIsCreateModalOpen(false);
    setNewLeadForm({
      name: '',
      phone: '',
      email: '',
      serviceRequested: '',
      address: '',
      status: 'New',
      urgency: 'Medium',
      source: 'Direct',
      estimatedValue: 250,
      notes: '',
    });
  };

  // Associated conversation & call logs for active selected lead
  const leadConversation = selectedLead
    ? conversations.find((c) => c.customerPhone === selectedLead.phone || c.id === selectedLead.conversationId)
    : null;

  const leadCalls = selectedLead
    ? calls.filter((c) => c.customerPhone === selectedLead.phone || selectedLead.callHistoryIds.includes(c.id))
    : [];

  const leadAppointment = selectedLead && selectedLead.appointmentId
    ? appointments.find((a) => a.id === selectedLead.appointmentId || a.leadId === selectedLead.id)
    : null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Lead Management System
          </h2>
          <p className="text-xs text-slate-500">
            {leads.length} total captured leads across phone, missed calls, and AI conversations
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {sheetsUrl && (
            <a
              href={sheetsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Google Sheets
            </a>
          )}

          <button
            id="btn-export-sheets"
            onClick={onExportToGoogleSheets}
            disabled={isExportingSheets}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-60"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{isExportingSheets ? 'Exporting to Sheets...' : 'Sync to Google Sheets'}</span>
          </button>

          <button
            id="btn-create-lead"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leads by name, phone, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="All">All Statuses ({leads.length})</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s} ({leads.filter((l) => l.status === s).length})
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Urgency:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="All">All Urgencies</option>
              <option value="Emergency">Emergency</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Customer Name & Contact</th>
                <th className="py-3 px-4">Service Requested</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Est. Value</th>
                <th className="py-3 px-4">Captured Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No leads found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => handleOpenLeadDetails(lead)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {lead.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                        <span>{lead.phone}</span>
                        {lead.email && <span className="text-slate-400">• {lead.email}</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 max-w-[220px] truncate">
                      {lead.serviceRequested}
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border focus:outline-none transition-all cursor-pointer ${
                          lead.status === 'Won'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : lead.status === 'Appointment Booked'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : lead.status === 'Qualified'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                            : lead.status === 'Contacted'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : lead.status === 'Lost'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {statuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          lead.urgency === 'Emergency'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : lead.urgency === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {lead.urgency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {lead.source}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      ${lead.estimatedValue}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(lead.createdDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenLeadDetails(lead)}
                        className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md font-medium text-xs transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Lead Details Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{selectedLead.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedLead.status === 'Won'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedLead.status === 'Appointment Booked'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {selectedLead.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Captured via {selectedLead.source} on {new Date(selectedLead.createdDate).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Scroll */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Contact & Job Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Lead Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-blue-600" />
                      {selectedLead.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5 truncate">
                      <Mail className="w-3 h-3 text-blue-600" />
                      {selectedLead.email}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Service Requested</span>
                    <span className="font-bold text-blue-700 block mt-0.5">
                      {selectedLead.serviceRequested}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[11px]">Service Address</span>
                    <span className="font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {selectedLead.address}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Estimated Value</span>
                    <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">
                      ${selectedLead.estimatedValue}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Urgency</span>
                    <span className="font-semibold text-rose-700 mt-0.5 block">
                      {selectedLead.urgency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Change Bar */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Update Pipeline Status:</span>
                <select
                  value={selectedLead.status}
                  onChange={(e) => {
                    const newSt = e.target.value as LeadStatus;
                    onUpdateLeadStatus(selectedLead.id, newSt);
                    setSelectedLead({ ...selectedLead, status: newSt });
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Linked Appointment (if booked) */}
              {leadAppointment && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      Confirmed Appointment
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                      Google Calendar Synced
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    {new Date(leadAppointment.startDateTime).toLocaleDateString()} at{' '}
                    {new Date(leadAppointment.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[11px] text-slate-600">{leadAppointment.service}</p>
                </div>
              )}

              {/* Notes Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Staff & AI Notes
                  </h4>
                  {!isEditingNotes ? (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit Notes
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveNotes}
                      className="text-xs text-emerald-600 hover:underline font-bold"
                    >
                      Save Notes
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <textarea
                    rows={4}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white"
                  />
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                    {selectedLead.notes || 'No notes added yet.'}
                  </div>
                )}
              </div>

              {/* Conversation History */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>SMS Follow-Up Thread</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    {leadConversation?.messages.length || 0} messages
                  </span>
                </h4>

                {leadConversation && leadConversation.messages.length > 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 max-h-60 overflow-y-auto">
                    {leadConversation.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`text-xs p-2.5 rounded-xl ${
                          m.sender === 'customer'
                            ? 'bg-blue-600 text-white ml-6'
                            : 'bg-white border border-slate-200 text-slate-800 mr-6'
                        }`}
                      >
                        <div className="text-[10px] opacity-75 mb-0.5">
                          {m.sender === 'ai' ? 'CallBack AI' : selectedLead.name} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {m.text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No SMS conversation history.</p>
                )}
              </div>

              {/* Call History */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Call Logs ({leadCalls.length})
                </h4>
                {leadCalls.length > 0 ? (
                  <div className="space-y-2">
                    {leadCalls.map((call) => (
                      <div
                        key={call.id}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="capitalize">{call.direction} Call ({call.status})</span>
                          <span className="text-slate-400 font-normal">
                            {new Date(call.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{call.summary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No direct call logs registered.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Create Lead Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Add New Lead Manually</h3>
              <button onClick={() => setIsCreateModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleCreateLeadSubmit} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    placeholder="e.g. Rachel Adams"
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    placeholder="(512) 555-0144"
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    placeholder="customer@gmail.com"
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Est. Job Value ($)</label>
                  <input
                    type="number"
                    value={newLeadForm.estimatedValue}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedValue: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Requested</label>
                <input
                  type="text"
                  value={newLeadForm.serviceRequested}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, serviceRequested: e.target.value })}
                  placeholder="e.g. Tankless water heater check"
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address</label>
                <input
                  type="text"
                  value={newLeadForm.address}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, address: e.target.value })}
                  placeholder="123 Main St, Austin, TX"
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initial Status</label>
                  <select
                    value={newLeadForm.status}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Urgency</label>
                  <select
                    value={newLeadForm.urgency}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, urgency: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="Additional context from customer"
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
