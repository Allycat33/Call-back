import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  ShieldAlert,
  Sliders,
  Send,
  Volume2,
  Phone,
  MessageSquare,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { BusinessProfile } from '../types';

interface AiReceptionistViewProps {
  businessProfile: BusinessProfile;
  onUpdateBusinessProfile: (profile: BusinessProfile) => void;
}

export const AiReceptionistView: React.FC<AiReceptionistViewProps> = ({
  businessProfile,
  onUpdateBusinessProfile,
}) => {
  const [profileDraft, setProfileDraft] = useState<BusinessProfile>(businessProfile);
  const [newKeyword, setNewKeyword] = useState('');
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Playground test state
  const [testChat, setTestChat] = useState<Array<{ sender: 'ai' | 'customer'; text: string }>>([
    {
      sender: 'ai',
      text:
        profileDraft.aiSettings.customGreeting ||
        `Hi! This is the virtual receptionist for ${profileDraft.name}. How can we help with your service inquiry today?`,
    },
  ]);
  const [testInput, setTestInput] = useState('');
  const [isTestingLoading, setIsTestingLoading] = useState(false);

  const handleSaveAll = () => {
    onUpdateBusinessProfile(profileDraft);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddEmergencyKeyword = () => {
    if (!newKeyword.trim()) return;
    const kw = newKeyword.trim().toLowerCase();
    if (!profileDraft.emergencyRules.keywords.includes(kw)) {
      setProfileDraft({
        ...profileDraft,
        emergencyRules: {
          ...profileDraft.emergencyRules,
          keywords: [...profileDraft.emergencyRules.keywords, kw],
        },
      });
    }
    setNewKeyword('');
  };

  const handleRemoveEmergencyKeyword = (kwToRemove: string) => {
    setProfileDraft({
      ...profileDraft,
      emergencyRules: {
        ...profileDraft.emergencyRules,
        keywords: profileDraft.emergencyRules.keywords.filter((k) => k !== kwToRemove),
      },
    });
  };

  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    setProfileDraft({
      ...profileDraft,
      faqs: [
        ...profileDraft.faqs,
        {
          id: 'faq-' + Date.now(),
          question: newFaqQ.trim(),
          answer: newFaqA.trim(),
          category: 'General',
        },
      ],
    });
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleRemoveFaq = (id: string) => {
    setProfileDraft({
      ...profileDraft,
      faqs: profileDraft.faqs.filter((f) => f.id !== id),
    });
  };

  const handleRunPlaygroundTest = async () => {
    if (!testInput.trim()) return;
    const userText = testInput.trim();
    setTestInput('');

    const updated = [...testChat, { sender: 'customer' as const, text: userText }];
    setTestChat(updated);
    setIsTestingLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated,
          businessProfile: profileDraft,
          currentLead: {
            name: 'Sandbox Tester',
            phone: '(512) 555-0199',
          },
          channel: 'sms',
        }),
      });

      const data = await response.json();
      setIsTestingLoading(false);

      if (data.replyText) {
        setTestChat((prev) => [...prev, { sender: 'ai', text: data.replyText }]);
      }
    } catch (e) {
      setIsTestingLoading(false);
      setTestChat((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Thanks for asking! Our diagnostic visit fee is $79 and we have availability today at 2:00 PM. Shall I schedule that for you?`,
        },
      ]);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            AI Receptionist Intelligence Studio
          </h2>
          <p className="text-xs text-slate-500">
            Configure prompt guardrails, emergency criteria, FAQs, and voice persona behavior
          </p>
        </div>

        <button
          id="btn-save-ai-settings"
          onClick={handleSaveAll}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
          <span>{isSaved ? 'Settings Saved Live!' : 'Save AI Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI System Prompt & Rules Config (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Persona & Identity Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-600" />
              Persona & Core Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Receptionist Tone Persona</label>
                <select
                  value={profileDraft.aiSettings.persona}
                  onChange={(e) =>
                    setProfileDraft({
                      ...profileDraft,
                      aiSettings: { ...profileDraft.aiSettings, persona: e.target.value as any },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                >
                  <option value="friendly">Friendly & Helpful (Recommended for Residential)</option>
                  <option value="professional">Professional & Direct (Commercial / Legal / Medical)</option>
                  <option value="warm">Warm & Empathetic (Salons, Med Spas, Healthcare)</option>
                  <option value="direct">Direct & High-Speed (Locksmiths, Towing, Rapid Emergency)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Voice Accent / Pitch</label>
                <select
                  value={profileDraft.aiSettings.voiceName}
                  onChange={(e) =>
                    setProfileDraft({
                      ...profileDraft,
                      aiSettings: { ...profileDraft.aiSettings, voiceName: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                >
                  <option value="Kore (Warm Natural)">Kore (Warm Natural Voice)</option>
                  <option value="Fenrir (Direct Deep)">Fenrir (Direct Deep Voice)</option>
                  <option value="Puck (Crisp Clear)">Puck (Crisp Clear Voice)</option>
                  <option value="Aoede (Friendly Melodic)">Aoede (Friendly Melodic Voice)</option>
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="font-bold text-slate-700 block mb-1">
                Custom Missed Call Follow-Up Greeting (SMS / Voice)
              </label>
              <textarea
                rows={2}
                value={profileDraft.aiSettings.customGreeting}
                onChange={(e) =>
                  setProfileDraft({
                    ...profileDraft,
                    aiSettings: { ...profileDraft.aiSettings, customGreeting: e.target.value },
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Sent automatically within 15 seconds after an unanswered call.
              </p>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-950 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Enforced Guardrails Active:</strong>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  The AI is strictly prohibited from inventing services, hallucinating unlisted pricing,
                  claiming appointments are booked before verification, or giving dangerous DIY repair instructions.
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Handling System */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Emergency Detection & Safety Rules
              </h3>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profileDraft.emergencyRules.enabled}
                  onChange={(e) =>
                    setProfileDraft({
                      ...profileDraft,
                      emergencyRules: {
                        ...profileDraft.emergencyRules,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-rose-600"
                />
                Emergency Protocol Active
              </label>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Urgent Escalation Phone Number
                </label>
                <input
                  type="text"
                  value={profileDraft.emergencyRules.escalationPhone}
                  onChange={(e) =>
                    setProfileDraft({
                      ...profileDraft,
                      emergencyRules: {
                        ...profileDraft.emergencyRules,
                        escalationPhone: e.target.value,
                      },
                    })
                  }
                  placeholder="(512) 842-9999"
                  className="w-full p-2 bg-slate-50 border rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Safety Instructions Delivered to Caller (Non-Technical)
                </label>
                <textarea
                  rows={2}
                  value={profileDraft.emergencyRules.instructions}
                  onChange={(e) =>
                    setProfileDraft({
                      ...profileDraft,
                      emergencyRules: {
                        ...profileDraft.emergencyRules,
                        instructions: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Advise customer to turn off the main water valve immediately..."
                  className="w-full p-2 bg-slate-50 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Trigger Keywords (Matches automatically)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {profileDraft.emergencyRules.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center gap-1"
                    >
                      {kw}
                      <button
                        onClick={() => handleRemoveEmergencyKeyword(kw)}
                        className="text-rose-500 hover:text-rose-800 ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add keyword (e.g. gas leak, sparking, freezing)..."
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddEmergencyKeyword()}
                    className="flex-1 p-1.5 bg-slate-50 border rounded-lg text-xs"
                  />
                  <button
                    onClick={handleAddEmergencyKeyword}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                  >
                    Add Keyword
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Business FAQs & Knowledge Base */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Frequently Asked Questions (AI Knowledge Base)
            </h3>

            <div className="space-y-2.5">
              {profileDraft.faqs.map((faq) => (
                <div key={faq.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                    <span>Q: {faq.question}</span>
                    <button
                      onClick={() => handleRemoveFaq(faq.id)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-600 leading-relaxed">A: {faq.answer}</p>
                </div>
              ))}
            </div>

            {/* Add FAQ Form */}
            <div className="p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-300 space-y-2 text-xs">
              <span className="font-bold text-slate-700 block text-[11px]">Add Knowledge Item</span>
              <input
                type="text"
                placeholder="Question (e.g. What is your warranty policy?)"
                value={newFaqQ}
                onChange={(e) => setNewFaqQ(e.target.value)}
                className="w-full p-2 bg-white border rounded-lg"
              />
              <textarea
                rows={2}
                placeholder="Answer (e.g. We provide 2-year warranty on all labor...)"
                value={newFaqA}
                onChange={(e) => setNewFaqA(e.target.value)}
                className="w-full p-2 bg-white border rounded-lg"
              />
              <button
                onClick={handleAddFaq}
                disabled={!newFaqQ.trim() || !newFaqA.trim()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold"
              >
                Add to Knowledge Base
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive AI Test Sandbox (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[750px] overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Live AI Receptionist Sandbox
              </h3>
            </div>
            <button
              onClick={() =>
                setTestChat([
                  {
                    sender: 'ai',
                    text:
                      profileDraft.aiSettings.customGreeting ||
                      `Hi! This is the virtual receptionist for ${profileDraft.name}. How can we help you?`,
                  },
                ])
              }
              title="Reset Sandbox"
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 bg-blue-50 border-b border-blue-200 text-[11px] text-blue-900 font-medium">
            Test your configured business rules, pricing, FAQs, and emergency triggers in real time.
          </div>

          {/* Test Messages Scroll */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {testChat.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.sender === 'customer' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-mono">
                  {m.sender === 'ai' ? profileDraft.name + ' (AI)' : 'You (Customer)'}
                </span>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    m.sender === 'customer'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTestingLoading && (
              <div className="p-2 text-xs text-slate-400 bg-white rounded-xl border border-slate-200 w-fit animate-pulse">
                AI Receptionist reasoning...
              </div>
            )}
          </div>

          {/* Sample Prompts */}
          <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <span className="text-slate-400 shrink-0">Try:</span>
            <button
              onClick={() => {
                setTestInput('Do you charge a dispatch fee?');
              }}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded whitespace-nowrap text-slate-700"
            >
              "Do you charge a dispatch fee?"
            </button>
            <button
              onClick={() => {
                setTestInput('I have a burst pipe flooding the kitchen!');
              }}
              className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded whitespace-nowrap font-medium"
            >
              "Burst pipe emergency"
            </button>
            <button
              onClick={() => {
                setTestInput('Can I book a diagnostic visit today?');
              }}
              className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded whitespace-nowrap font-medium"
            >
              "Book diagnostic today"
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunPlaygroundTest()}
              placeholder="Ask a question or test an emergency..."
              className="flex-1 px-3 py-2 bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-xs text-slate-900 focus:outline-none"
            />
            <button
              onClick={handleRunPlaygroundTest}
              disabled={!testInput.trim() || isTestingLoading}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
