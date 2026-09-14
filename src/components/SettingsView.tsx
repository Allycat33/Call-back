import React, { useState } from 'react';
import {
  Building2,
  Clock,
  Wrench,
  MapPin,
  CalendarCheck,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  Sparkles,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { BusinessProfile, BusinessService } from '../types';

interface SettingsViewProps {
  businessProfile: BusinessProfile;
  onUpdateBusinessProfile: (profile: BusinessProfile) => void;
  isGoogleConnected: boolean;
  onConnectGoogle: () => void;
  sheetsUrl?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  businessProfile,
  onUpdateBusinessProfile,
  isGoogleConnected,
  onConnectGoogle,
  sheetsUrl,
}) => {
  const [profile, setProfile] = useState<BusinessProfile>(businessProfile);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'hours' | 'services' | 'area' | 'integrations'>('profile');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // New service state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePriceMin, setNewServicePriceMin] = useState(150);
  const [newServicePriceMax, setNewServicePriceMax] = useState(350);
  const [newServiceDuration, setNewServiceDuration] = useState(60);

  const businessCategories = [
    'Plumbing',
    'HVAC',
    'Electrical',
    'Roofing',
    'Locksmith',
    'Auto Repair',
    'Cleaning',
    'Landscaping',
    'Salon',
    'Med Spa',
    'Dental',
  ];

  const handleSave = () => {
    onUpdateBusinessProfile(profile);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    const newService: BusinessService = {
      id: 'srv-' + Date.now(),
      name: newServiceName.trim(),
      description: newServiceDesc.trim(),
      durationMinutes: Number(newServiceDuration),
      estimatedDurationMinutes: Number(newServiceDuration),
      priceType: 'range',
      priceMin: Number(newServicePriceMin),
      priceMax: Number(newServicePriceMax),
    };
    setProfile({
      ...profile,
      services: [...profile.services, newService],
    });
    setNewServiceName('');
    setNewServiceDesc('');
  };

  const handleRemoveService = (id: string) => {
    setProfile({
      ...profile,
      services: profile.services.filter((s) => s.id !== id),
    });
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Business Profile & Workspace Settings
          </h2>
          <p className="text-xs text-slate-500">
            Configure your company operations, operating hours, dispatch radius, and integrations
          </p>
        </div>

        <button
          id="btn-save-settings"
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          {isSavedNotice ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{isSavedNotice ? 'Changes Saved!' : 'Save All Changes'}</span>
        </button>
      </div>

      {/* Settings Sub-nav Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto text-xs font-semibold text-slate-600 gap-6">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`pb-3 transition-colors border-b-2 ${
            activeSubTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Company Information
        </button>
        <button
          onClick={() => setActiveSubTab('hours')}
          className={`pb-3 transition-colors border-b-2 ${
            activeSubTab === 'hours' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Business Hours & Rules
        </button>
        <button
          onClick={() => setActiveSubTab('services')}
          className={`pb-3 transition-colors border-b-2 ${
            activeSubTab === 'services' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Services & Pricing ({profile.services.length})
        </button>
        <button
          onClick={() => setActiveSubTab('area')}
          className={`pb-3 transition-colors border-b-2 ${
            activeSubTab === 'area' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Service Territory
        </button>
        <button
          onClick={() => setActiveSubTab('integrations')}
          className={`pb-3 transition-colors border-b-2 ${
            activeSubTab === 'integrations' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Google Workspace Integrations
        </button>
      </div>

      {/* Sub-Tab 1: Profile Info */}
      {activeSubTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-3xl">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Core Business Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Business Name *</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full p-2 bg-slate-50 border rounded-lg"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Business Category *</label>
              <select
                value={profile.category}
                onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                className="w-full p-2 bg-slate-50 border rounded-lg font-semibold"
              >
                {businessCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Inbound Business Phone *</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full p-2 bg-slate-50 border rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Forwarding / Missed Target Phone</label>
              <input
                type="text"
                value={profile.forwardingPhone}
                onChange={(e) => setProfile({ ...profile, forwardingPhone: e.target.value })}
                className="w-full p-2 bg-slate-50 border rounded-lg font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Physical Business Address *</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full p-2 bg-slate-50 border rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Business Hours & Booking Rules */}
      {activeSubTab === 'hours' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-3xl">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              Standard Operating Hours
            </h3>
            <p className="text-xs text-slate-500">
              When callers ring outside these hours, CallBack AI will identify after-hours rules and book future slots.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {daysOfWeek.map((day) => {
              const schedule = profile.hours[day];
              return (
                <div key={day} className="py-2.5 flex items-center justify-between">
                  <div className="w-28 font-bold text-slate-800 capitalize">{day}</div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!schedule.closed}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          hours: {
                            ...profile.hours,
                            [day]: { ...schedule, closed: !e.target.checked },
                          },
                        })
                      }
                      className="rounded text-blue-600"
                    />
                    <span className="text-xs text-slate-600">Open</span>
                  </label>

                  {!schedule.closed ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={schedule.open}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            hours: {
                              ...profile.hours,
                              [day]: { ...schedule, open: e.target.value },
                            },
                          })
                        }
                        className="p-1 bg-slate-50 border rounded text-xs"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="time"
                        value={schedule.close}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            hours: {
                              ...profile.hours,
                              [day]: { ...schedule, close: e.target.value },
                            },
                          })
                        }
                        className="p-1 bg-slate-50 border rounded text-xs"
                      />
                    </div>
                  ) : (
                    <span className="text-rose-500 font-semibold italic text-xs">Closed</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Appointment Availability Rules
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Buffer Time (Mins)</label>
                <input
                  type="number"
                  value={profile.availabilityRules.bufferMinutes}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      availabilityRules: {
                        ...profile.availabilityRules,
                        bufferMinutes: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Min Notice (Hours)</label>
                <input
                  type="number"
                  value={profile.availabilityRules.minNoticeHours}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      availabilityRules: {
                        ...profile.availabilityRules,
                        minNoticeHours: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Max Days in Advance</label>
                <input
                  type="number"
                  value={profile.availabilityRules.maxDaysInAdvance}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      availabilityRules: {
                        ...profile.availabilityRules,
                        maxDaysInAdvance: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Services & Pricing */}
      {activeSubTab === 'services' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-4xl">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-blue-600" />
              Service Catalog & Configured Pricing
            </h3>
            <p className="text-xs text-slate-500">
              The AI will strictly quote within these configured ranges and never hallucinate unlisted prices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.services.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="text-sm">{s.name}</span>
                    <button
                      onClick={() => handleRemoveService(s.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed">{s.description}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-slate-700">
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    ${s.priceMin} - ${s.priceMax}
                  </span>
                  <span className="text-slate-500 font-medium">{s.estimatedDurationMinutes} mins</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Service Box */}
          <div className="p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-300 space-y-3 text-xs">
            <span className="font-bold text-slate-800 block text-xs">Add New Service to Catalog</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Service Title (e.g. Sump Pump Replacement)"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="w-full p-2 bg-white border rounded-lg"
              />
              <input
                type="text"
                placeholder="Description of work included"
                value={newServiceDesc}
                onChange={(e) => setNewServiceDesc(e.target.value)}
                className="w-full p-2 bg-white border rounded-lg"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min $"
                  value={newServicePriceMin}
                  onChange={(e) => setNewServicePriceMin(Number(e.target.value))}
                  className="w-1/2 p-2 bg-white border rounded-lg"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max $"
                  value={newServicePriceMax}
                  onChange={(e) => setNewServicePriceMax(Number(e.target.value))}
                  className="w-1/2 p-2 bg-white border rounded-lg"
                />
              </div>
              <input
                type="number"
                placeholder="Est Duration (Mins)"
                value={newServiceDuration}
                onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                className="w-full p-2 bg-white border rounded-lg"
              />
            </div>
            <button
              onClick={handleAddService}
              disabled={!newServiceName.trim()}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Territory */}
      {activeSubTab === 'area' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-3xl">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Service Area & Dispatch Radius
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Primary Operating City *</label>
              <input
                type="text"
                value={profile.serviceArea.primaryCity}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    serviceArea: { ...profile.serviceArea, primaryCity: e.target.value },
                  })
                }
                className="w-full p-2 bg-slate-50 border rounded-lg"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Dispatch Radius (Miles) *</label>
              <input
                type="number"
                value={profile.serviceArea.radiusMiles}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    serviceArea: { ...profile.serviceArea, radiusMiles: Number(e.target.value) },
                  })
                }
                className="w-full p-2 bg-slate-50 border rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                Serviced Zip Codes (Comma Separated)
              </label>
              <input
                type="text"
                value={profile.serviceArea.zipCodes.join(', ')}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    serviceArea: {
                      ...profile.serviceArea,
                      zipCodes: e.target.value.split(',').map((z) => z.trim()),
                    },
                  })
                }
                className="w-full p-2 bg-slate-50 border rounded-lg font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 5: Workspace Integrations */}
      {activeSubTab === 'integrations' && (
        <div className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Sheets Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                {isGoogleConnected ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    Not Connected
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">Google Sheets Lead Export</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Automatically sync every captured lead, caller contact info, requested services, and status updates directly into your business spreadsheet.
                </p>
              </div>

              <div className="pt-2">
                {isGoogleConnected ? (
                  <div className="space-y-2">
                    {sheetsUrl && (
                      <a
                        href={sheetsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open "CallBack AI - Live Leads" Spreadsheet
                      </a>
                    )}
                    <button
                      onClick={onConnectGoogle}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      Re-authorize Google Sheets
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onConnectGoogle}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all"
                  >
                    Connect Google Sheets
                  </button>
                )}
              </div>
            </div>

            {/* Google Calendar Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                {isGoogleConnected ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                    Not Connected
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">Google Calendar 2-Way Sync</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Real-time event creation on your Google Calendar when appointments are confirmed by CallBack AI.
                </p>
              </div>

              <div className="pt-2">
                {isGoogleConnected ? (
                  <button
                    onClick={onConnectGoogle}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Re-authorize Google Calendar
                  </button>
                ) : (
                  <button
                    onClick={onConnectGoogle}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all"
                  >
                    Connect Google Calendar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
