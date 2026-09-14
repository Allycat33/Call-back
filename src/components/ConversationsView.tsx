import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  User,
  Bot,
  UserCheck,
  Send,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Clock,
  Phone,
  CheckCheck,
} from 'lucide-react';
import { Conversation, Message, BusinessProfile } from '../types';

interface ConversationsViewProps {
  conversations: Conversation[];
  onSendMessage: (conversationId: string, text: string, sender: 'human' | 'ai') => void;
  onToggleTakeover: (conversationId: string, isTakeover: boolean) => void;
  businessProfile: BusinessProfile;
}

export const ConversationsView: React.FC<ConversationsViewProps> = ({
  conversations,
  onSendMessage,
  onToggleTakeover,
  businessProfile,
}) => {
  const [selectedId, setSelectedId] = useState<string>(conversations[0]?.id || '');
  const [inputVal, setInputVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const activeConv = conversations.find((c) => c.id === selectedId) || conversations[0];

  const filteredConversations = conversations.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerPhone.includes(searchQuery) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!inputVal.trim() || !activeConv) return;
    const sender = activeConv.isTakeoverMode ? 'human' : 'ai';
    onSendMessage(activeConv.id, inputVal.trim(), sender);
    setInputVal('');
  };

  const handleAiSuggestReply = async () => {
    if (!activeConv) return;
    setIsGeneratingAi(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: activeConv.messages,
          businessProfile,
          currentLead: {
            name: activeConv.customerName,
            phone: activeConv.customerPhone,
          },
          channel: 'sms',
        }),
      });

      const data = await response.json();
      if (data.replyText) {
        setInputVal(data.replyText);
      }
    } catch (e) {
      setInputVal(
        `Hi ${activeConv.customerName}, thanks for following up! We have an opening with our dispatch technician today. Would 2:00 PM work for you?`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-5rem)] flex flex-col space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Unified Inbox</h2>
        <p className="text-xs text-slate-500">
          Real-time customer SMS threads with AI autonomous response and human takeover
        </p>
      </div>

      {/* Main Inbox Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Thread List (4 cols) */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          {/* Search Header */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-transparent rounded-lg text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Conversation Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConv?.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`p-3.5 cursor-pointer transition-colors text-left ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{conv.customerName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(conv.lastTimestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{conv.customerPhone}</div>

                  <p className="text-xs text-slate-600 line-clamp-1 mt-1 font-medium">
                    {conv.lastMessage}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        conv.leadStatus === 'Appointment Booked'
                          ? 'bg-emerald-100 text-emerald-800'
                          : conv.leadStatus === 'Qualified'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {conv.leadStatus}
                    </span>

                    {conv.isTakeoverMode ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                        <UserCheck className="w-3 h-3" /> Human Takeover
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                        <Bot className="w-3 h-3" /> AI Autopilot
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Active Conversation View (8 cols) */}
        {activeConv ? (
          <div className="md:col-span-8 flex flex-col h-full bg-slate-50/30">
            {/* Thread Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold text-sm flex items-center justify-center">
                  {activeConv.customerName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{activeConv.customerName}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium font-mono">
                      {activeConv.customerPhone}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Lead Status: <strong className="text-slate-800">{activeConv.leadStatus}</strong>
                  </p>
                </div>
              </div>

              {/* Human Takeover Toggle */}
              <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 block">Human Takeover</span>
                  <span className="text-[10px] text-slate-500">
                    {activeConv.isTakeoverMode ? 'Pause AI automated replies' : 'AI responding automatically'}
                  </span>
                </div>
                <button
                  onClick={() => onToggleTakeover(activeConv.id, !activeConv.isTakeoverMode)}
                  className="text-slate-700 hover:text-blue-600 transition-colors"
                >
                  {activeConv.isTakeoverMode ? (
                    <ToggleRight className="w-7 h-7 text-amber-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3">
              {activeConv.messages.map((m) => {
                const isCustomer = m.sender === 'customer';
                const isHuman = m.sender === 'human';

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                  >
                    <div className="text-[10px] text-slate-400 mb-0.5 px-1 flex items-center gap-1">
                      {isCustomer ? (
                        <>
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{activeConv.customerName}</span>
                        </>
                      ) : isHuman ? (
                        <>
                          <UserCheck className="w-3 h-3 text-amber-600" />
                          <span className="font-semibold text-amber-700">Business Owner (You)</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3 text-blue-600" />
                          <span className="font-semibold text-blue-700">CallBack AI Receptionist</span>
                        </>
                      )}
                      <span>•</span>
                      <span>
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isCustomer
                          ? 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-none'
                          : isHuman
                          ? 'bg-amber-600 text-white rounded-tr-none'
                          : 'bg-blue-600 text-white rounded-tr-none'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Suggest Reply & Input Footer */}
            <div className="p-3 bg-white border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleAiSuggestReply}
                  disabled={isGeneratingAi}
                  className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isGeneratingAi ? 'Drafting intelligent reply...' : 'AI Suggest Reply'}</span>
                </button>

                <span className="text-[11px] text-slate-400">
                  Sending as: <strong>{activeConv.isTakeoverMode ? 'Human Staff' : 'AI Assistant'}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <textarea
                  rows={2}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    activeConv.isTakeoverMode
                      ? 'Type human message to customer (Enter to send)...'
                      : 'Send message or suggest next response...'
                  }
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-xs text-slate-900 focus:outline-none resize-none"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputVal.trim()}
                  className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow transition-all self-end"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="md:col-span-8 flex items-center justify-center text-slate-400 text-xs">
            Select a conversation thread on the left.
          </div>
        )}
      </div>
    </div>
  );
};
