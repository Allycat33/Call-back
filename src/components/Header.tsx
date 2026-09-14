import React, { useState } from 'react';
import {
  Bell,
  PhoneForwarded,
  FileSpreadsheet,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { BusinessProfile } from '../types';

interface HeaderProps {
  currentTabName: string;
  businessProfile: BusinessProfile;
  isGoogleConnected: boolean;
  googleUserEmail?: string;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onOpenSimulator: () => void;
  onQuickSearch: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTabName,
  businessProfile,
  isGoogleConnected,
  googleUserEmail,
  onGoogleSignIn,
  onGoogleSignOut,
  onOpenSimulator,
  onQuickSearch,
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Appointment Booked via AI',
      desc: 'Marcus Vance confirmed for 2:00 PM today (Emergency Leak)',
      time: '12m ago',
      type: 'success',
    },
    {
      id: 'notif-2',
      title: 'Missed Call Recovered',
      desc: 'Sarah Jenkins qualified. SMS sequence step 1 dispatched.',
      time: '1h ago',
      type: 'info',
    },
    {
      id: 'notif-3',
      title: 'Emergency Filter Alert',
      desc: 'Main shut-off safety instructions delivered automatically.',
      time: '3h ago',
      type: 'warning',
    },
  ];

  return (
    <header
      id="main-app-header"
      className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 shrink-0"
    >
      {/* View Title & Context */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight capitalize">
            {currentTabName.replace('-', ' ')}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {businessProfile.name} • {businessProfile.phone}
          </p>
        </div>
      </div>

      {/* Global Search & Integrations & Actions */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search leads, calls, transcripts..."
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              onQuickSearch(e.target.value);
            }}
            className="w-64 pl-9 pr-3 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-lg border border-transparent focus:border-blue-400 focus:outline-none transition-all"
          />
        </div>

        {/* Google Workspace Integration Badge & Button */}
        {isGoogleConnected ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-[11px]">Google Workspace Synced</span>
            <span className="text-[10px] text-emerald-700/80 hidden lg:inline">
              ({googleUserEmail || 'Connected'})
            </span>
            <button
              onClick={onGoogleSignOut}
              className="text-[10px] text-emerald-700 underline hover:text-emerald-900 ml-1"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            id="btn-connect-google-workspace"
            onClick={onGoogleSignIn}
            className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-all"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>Connect Sheets & Calendar</span>
          </button>
        )}

        {/* Live Call Simulator Action */}
        <button
          id="header-btn-simulate"
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <PhoneForwarded className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Test Call Flow</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="btn-notifications-toggle"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Live Dispatch Feed
                </span>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                  Real-time
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 text-left transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-blue-600 font-medium hover:underline"
                >
                  Close notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
