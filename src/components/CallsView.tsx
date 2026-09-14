import React, { useState } from 'react';
import {
  PhoneCall,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  Search,
  Play,
  Pause,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CalendarCheck,
  Users,
  Volume2,
  X,
} from 'lucide-react';
import { CallLog } from '../types';

interface CallsViewProps {
  calls: CallLog[];
  onOpenTranscript: (call: CallLog) => void;
}

export const CallsView: React.FC<CallsViewProps> = ({ calls }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'missed' | 'answered' | 'completed'>('all');
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.customerPhone.includes(searchTerm) ||
      call.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.transcript.some((t) => t.text.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Call Intelligence Log</h2>
          <p className="text-xs text-slate-500">
            Recorded inbound, outbound, and AI callback voice calls with transcripts and generated outcomes
          </p>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search transcripts, summary, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg text-xs text-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          {(['all', 'missed', 'answered', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Calls Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Direction & Type</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">AI Outcome</th>
                <th className="py-3 px-4">Generated Artifacts</th>
                <th className="py-3 px-4">Recording</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Transcript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCalls.map((call) => (
                <tr
                  key={call.id}
                  onClick={() => setSelectedCall(call)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          call.status === 'missed'
                            ? 'bg-rose-50 text-rose-600'
                            : call.direction === 'inbound'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        {call.status === 'missed' ? (
                          <PhoneMissed className="w-3.5 h-3.5" />
                        ) : call.direction === 'inbound' ? (
                          <PhoneIncoming className="w-3.5 h-3.5" />
                        ) : (
                          <PhoneOutgoing className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 capitalize">
                          {call.direction}
                        </span>
                        <span
                          className={`block text-[10px] uppercase font-bold ${
                            call.status === 'missed' ? 'text-rose-600' : 'text-slate-500'
                          }`}
                        >
                          {call.status}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {call.customerName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {call.customerPhone}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {formatDuration(call.durationSeconds)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${
                        call.aiOutcome === 'Appointment Booked'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : call.aiOutcome === 'Emergency Escalated'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : call.aiOutcome === 'Lead Qualified'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {call.aiOutcome}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {call.leadId && (
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px] border border-blue-200 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Lead Created
                        </span>
                      )}
                      {call.appointmentId && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px] border border-emerald-200 flex items-center gap-1">
                          <CalendarCheck className="w-3 h-3" /> Apt Booked
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-[11px] text-slate-600">
                      <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                      <span className="capitalize">{call.recordingStatus}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {new Date(call.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedCall(call)}
                      className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 font-semibold rounded-md transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Details & Transcript Drawer / Modal */}
      {selectedCall && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Call Record: {selectedCall.customerName}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {selectedCall.customerPhone} • {new Date(selectedCall.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Audio Simulation Player */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-blue-400" />
                    Audio Recording Player
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDuration(selectedCall.durationSeconds)}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow"
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  {/* Visual simulated sound waves */}
                  <div className="flex-1 flex items-center gap-1 h-6">
                    {[12, 24, 18, 8, 20, 16, 26, 14, 22, 10, 28, 12, 18, 24, 14, 20, 8, 16, 22, 12].map(
                      (h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}px` }}
                          className={`flex-1 rounded-full ${
                            isPlayingAudio ? 'bg-blue-400 animate-pulse' : 'bg-slate-700'
                          }`}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* AI Summary Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
                <span className="font-bold text-blue-900 uppercase tracking-wider text-[10px] block">
                  AI Call Summary & Disposition
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {selectedCall.summary}
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="font-bold text-slate-700">Outcome:</span>
                  <span className="px-2 py-0.5 rounded bg-blue-200 text-blue-900 font-bold text-[10px]">
                    {selectedCall.aiOutcome}
                  </span>
                </div>
              </div>

              {/* Transcript Section */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                  Full Verbatim Transcript
                </h4>

                <div className="space-y-2.5">
                  {selectedCall.transcript.map((t, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl ${
                        t.speaker === 'customer'
                          ? 'bg-slate-100 text-slate-900'
                          : 'bg-blue-50/70 border border-blue-200 text-blue-950'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                        <span className={t.speaker === 'ai' ? 'text-blue-700' : 'text-slate-700'}>
                          {t.speaker === 'ai' ? 'CallBack AI Receptionist' : selectedCall.customerName}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{t.time}</span>
                      </div>
                      <p className="leading-relaxed">{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
