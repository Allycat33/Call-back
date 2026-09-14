import React from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquareText,
  PhoneCall,
  CalendarDays,
  UserCheck,
  Bot,
  Zap,
  Calendar,
  BarChart3,
  CreditCard,
  Settings,
  ShieldAlert,
  Sparkles,
  PhoneIncoming,
  Radio,
} from 'lucide-react';
import { BusinessProfile } from '../types';

export type NavTab =
  | 'dashboard'
  | 'leads'
  | 'conversations'
  | 'calls'
  | 'appointments'
  | 'customers'
  | 'ai-receptionist'
  | 'automations'
  | 'calendar'
  | 'analytics'
  | 'billing'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  businessProfile: BusinessProfile;
  leadsCount: number;
  unreadConversations: number;
  missedCallsCount: number;
  onOpenSimulator: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  businessProfile,
  leadsCount,
  unreadConversations,
  missedCallsCount,
  onOpenSimulator,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number | string; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users, badge: leadsCount, badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 'conversations', label: 'Conversations', icon: MessageSquareText, badge: unreadConversations, badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'calls', label: 'Calls', icon: PhoneCall, badge: missedCallsCount ? `${missedCallsCount} missed` : undefined, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays },
    { id: 'customers', label: 'Customers', icon: UserCheck },
    { id: 'ai-receptionist', label: 'AI Receptionist', icon: Bot, badge: 'Active', badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="main-sidebar"
      className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 select-none border-r border-slate-800 z-20"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-lg">CallBack</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
              {businessProfile.name}
            </p>
          </div>
        </div>

        {/* Live Receptionist Status Pill */}
        <div className="mt-4 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-200">AI Guard Active</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">24/7</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        <div className="px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>
        {navItems.slice(0, 6).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    isActive ? 'bg-blue-700 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          AI & Automation
        </div>
        {navItems.slice(6, 10).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    isActive ? 'bg-blue-700 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 px-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Management
        </div>
        {navItems.slice(10).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Simulator Quick Action Trigger */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button
          id="btn-trigger-missed-call-sim"
          onClick={onOpenSimulator}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-medium text-xs rounded-lg shadow transition-all duration-150 active:scale-[0.98]"
        >
          <PhoneIncoming className="w-4 h-4 animate-bounce" />
          <span>Simulate Missed Call</span>
        </button>
        <p className="text-[10px] text-slate-400 text-center mt-1.5">
          Test live SMS recovery & AI booking
        </p>
      </div>
    </aside>
  );
};
