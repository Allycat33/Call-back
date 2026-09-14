import React from 'react';
import {
  PhoneCall,
  PhoneMissed,
  Users,
  CalendarCheck,
  TrendingUp,
  DollarSign,
  MessageSquare,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  PhoneForwarded,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { DashboardMetrics, Lead, CallLog, Appointment, BusinessProfile } from '../types';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  recentLeads: Lead[];
  recentCalls: CallLog[];
  recentAppointments: Appointment[];
  businessProfile: BusinessProfile;
  onNavigateTab: (tab: any) => void;
  onOpenSimulator: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  recentLeads,
  recentCalls,
  recentAppointments,
  businessProfile,
  onNavigateTab,
  onOpenSimulator,
}) => {
  // Weekly call volume data for chart
  const weeklyData = [
    { day: 'Mon', total: 24, missed: 8, recovered: 7 },
    { day: 'Tue', total: 28, missed: 9, recovered: 8 },
    { day: 'Wed', total: 31, missed: 11, recovered: 10 },
    { day: 'Thu', total: 22, missed: 6, recovered: 5 },
    { day: 'Fri', total: 35, missed: 12, recovered: 11 },
    { day: 'Sat', total: 18, missed: 7, recovered: 6 },
    { day: 'Sun', total: 8, missed: 4, recovered: 3 },
  ];

  const maxTotal = Math.max(...weeklyData.map((d) => d.total));

  // Service breakdown
  const serviceDistribution = [
    { name: 'Leak & Burst Pipe Repair', percent: 38, count: 14, color: 'bg-blue-600' },
    { name: 'Water Heater Diagnostic', percent: 28, count: 10, color: 'bg-indigo-600' },
    { name: 'Drain Snaking / Jetting', percent: 20, count: 7, color: 'bg-emerald-500' },
    { name: 'AC / Tune-up & Fixtures', percent: 14, count: 5, color: 'bg-amber-500' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Recovery Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg border border-blue-800/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-300" />
              Autonomous Lead Recovery
            </span>
            <span className="text-xs text-blue-200">24/7 AI Receptionist Guard</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            ${metrics.estimatedRevenueRecovered.toLocaleString()} in Revenue Recovered This Month
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            CallBack AI captured <strong className="text-white">{metrics.leadsCaptured} qualified leads</strong> and booked{' '}
            <strong className="text-white">{metrics.appointmentsBooked} direct appointments</strong> from {metrics.missedCalls} missed inbound calls.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={onOpenSimulator}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-md transition-all duration-150 active:scale-95 flex items-center gap-2"
          >
            <PhoneForwarded className="w-4 h-4" />
            Simulate Missed Call
          </button>
          <button
            onClick={() => onNavigateTab('leads')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold rounded-xl transition-all"
          >
            View Leads
          </button>
        </div>
      </div>

      {/* 8 Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Calls Received */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Calls Received</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.callsReceived}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% vs last week</span>
          </div>
        </div>

        {/* Missed Calls */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Missed Calls</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <PhoneMissed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.missedCalls}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            28.3% total call rate
          </div>
        </div>

        {/* Leads Captured */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Leads Captured</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-2">{metrics.leadsCaptured}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>88.1% recovery rate</span>
          </div>
        </div>

        {/* Appointments Booked */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Appointments Booked</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{metrics.appointmentsBooked}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Synced with Google Calendar
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Conversion Rate</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-2">{metrics.conversionRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Industry avg: 18%
          </div>
        </div>

        {/* Revenue Recovered */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Est. Revenue Recovered</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            ${(metrics.estimatedRevenueRecovered / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Avg ticket: $548
          </div>
        </div>

        {/* AI Conversations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>AI Conversations</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{metrics.aiConversations}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Avg response time: 9 sec
          </div>
        </div>

        {/* Follow-ups Pending */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Follow-Ups Pending</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{metrics.followUpsPending}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Automated SMS sequence
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Call Recovery Weekly Trends (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Call Volume & AI Recovery Trend
              </h3>
              <p className="text-xs text-slate-500">
                Daily answered calls vs. missed calls recovered into booked appointments
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                Answered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                Missed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                AI Recovered
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100">
            {weeklyData.map((d, i) => {
              const totalHeight = (d.total / maxTotal) * 100;
              const missedHeight = (d.missed / maxTotal) * 100;
              const recoveredHeight = (d.recovered / maxTotal) * 100;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-full">
                    {/* Answered bar */}
                    <div
                      style={{ height: `${totalHeight}%` }}
                      className="w-3 bg-slate-200 rounded-t-sm group-hover:bg-slate-300 transition-all"
                      title={`${d.day}: ${d.total} total calls`}
                    ></div>
                    {/* Missed bar */}
                    <div
                      style={{ height: `${missedHeight}%` }}
                      className="w-3 bg-amber-300 rounded-t-sm group-hover:bg-amber-400 transition-all"
                      title={`${d.day}: ${d.missed} missed`}
                    ></div>
                    {/* AI Recovered bar */}
                    <div
                      style={{ height: `${recoveredHeight}%` }}
                      className="w-3 bg-blue-600 rounded-t-sm group-hover:bg-blue-700 transition-all"
                      title={`${d.day}: ${d.recovered} recovered`}
                    ></div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">{d.day}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2">
            <span>Total Calls this week: <strong>166</strong></span>
            <span>Total Recovered Bookings: <strong className="text-blue-600">49</strong></span>
            <span>Recovery Efficiency: <strong className="text-emerald-600">89.2%</strong></span>
          </div>
        </div>

        {/* Chart 2: Requested Services Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recovered Revenue by Service
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Breakdown of captured job categories
            </p>

            <div className="space-y-3">
              {serviceDistribution.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-800">{item.name}</span>
                    <span className="text-slate-500 font-mono">
                      {item.percent}% ({item.count} jobs)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">Primary Dispatch City:</span>
            <span className="font-semibold text-slate-900">
              {businessProfile.serviceArea.primaryCity} ({businessProfile.serviceArea.radiusMiles} mi radius)
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Leads & Live Call Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Leads (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Leads Captured</h3>
              <p className="text-xs text-slate-500">Autonomous captures from missed calls</p>
            </div>
            <button
              onClick={() => onNavigateTab('leads')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentLeads.slice(0, 4).map((lead) => (
              <div
                key={lead.id}
                onClick={() => onNavigateTab('leads')}
                className="p-3.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                    {lead.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{lead.name}</span>
                      {lead.urgency === 'Emergency' && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded border border-rose-200">
                          Emergency
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-[280px]">
                      {lead.serviceRequested}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                      lead.status === 'Appointment Booked'
                        ? 'bg-emerald-100 text-emerald-800'
                        : lead.status === 'Qualified'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {lead.status}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Est. ${lead.estimatedValue}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Upcoming Appointments & Call Activity (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Upcoming Appointments</h3>
              <p className="text-xs text-slate-500">Booked autonomously by AI Receptionist</p>
            </div>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Calendar <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {recentAppointments.slice(0, 3).map((apt) => (
              <div key={apt.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{apt.customerName}</span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {new Date(apt.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{apt.service}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{apt.address}</span>
                  <span className="font-semibold text-emerald-700">${apt.price}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Google Calendar Connection</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Active Auto-Sync
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
