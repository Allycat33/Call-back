import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneCall,
  PhoneOff,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  X,
  Volume2,
  VolumeX,
  Bot,
  User,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { BusinessProfile, Lead, Appointment, CallLog } from '../types';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessProfile: BusinessProfile;
  onLeadCaptured: (lead: Lead) => void;
  onAppointmentBooked: (appointment: Appointment) => void;
  onCallLogged: (call: CallLog) => void;
}

export const MissedCallSimulatorModal: React.FC<SimulatorModalProps> = ({
  isOpen,
  onClose,
  businessProfile,
  onLeadCaptured,
  onAppointmentBooked,
  onCallLogged,
}) => {
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'missed' | 'sms_active' | 'call_connected'>('idle');
  const [customerName, setCustomerName] = useState('Brandon Cole');
  const [customerPhone, setCustomerPhone] = useState('(512) 893-4102');
  const [customerAddress, setCustomerAddress] = useState('1805 Evergreen Ave, Austin, TX 78704');
  const [scenario, setScenario] = useState<'leak' | 'hvac' | 'emergency' | 'pricing'>('leak');
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'customer'; text: string; time: string }>>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [leadExtracted, setLeadExtracted] = useState<Partial<Lead>>({
    name: customerName,
    phone: customerPhone,
    status: 'New',
    urgency: 'Medium',
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'leak',
      title: 'Water Pipe Leak',
      desc: 'Pipe dripping under cabinet, needs same-day plumber.',
      initialMsg: 'Hi! I have a leaking pipe under my kitchen sink that is getting worse. Can someone come by today?',
    },
    {
      id: 'emergency',
      title: 'Active Flooding Emergency',
      desc: 'Main line burst, triggers emergency escalation protocol.',
      initialMsg: 'EMERGENCY! A pipe just burst in my laundry room and water is flooding across the floor!! Help!',
    },
    {
      id: 'hvac',
      title: 'AC Blowing Warm Air',
      desc: 'Thermostat set to 72, house is 84 degrees.',
      initialMsg: 'Hello, our air conditioner is blowing warm air and the outside unit makes a buzzing noise.',
    },
    {
      id: 'pricing',
      title: 'Pricing & Service Inquiry',
      desc: 'Customer wants quote and questions diagnostic fee.',
      initialMsg: 'How much do you guys charge for a water heater inspection and diagnostic?',
    },
  ];

  const handleStartCall = () => {
    setCallState('ringing');
    setMessages([]);
    setBookingConfirmed(false);
  };

  const handleSimulateMissedCall = () => {
    setCallState('missed');
    // Log missed call
    const newCall: CallLog = {
      id: 'call-sim-' + Date.now(),
      direction: 'inbound',
      status: 'missed',
      durationSeconds: 15,
      customerName,
      customerPhone,
      timestamp: new Date().toISOString(),
      aiOutcome: 'Follow-Up Scheduled',
      recordingStatus: 'none',
      summary: `Missed call from ${customerName}. Immediate SMS recovery initiated automatically by CallBack AI.`,
      transcript: [{ speaker: 'customer', text: '[Customer called and line was not answered by human]', time: '0:00' }],
    };
    onCallLogged(newCall);

    // After 1 second, simulate automated SMS recovery
    setTimeout(() => {
      setCallState('sms_active');
      const greeting = businessProfile.aiSettings.customGreeting || 
        `Hi! This is the virtual receptionist for ${businessProfile.name}. Sorry we missed your call just now! How can our team help you today?`;
      
      setMessages([
        {
          sender: 'ai',
          text: greeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      speakText(greeting);
    }, 1200);
  };

  const speakText = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputVal.trim();
    if (!text) return;
    setInputVal('');

    const newMsgs = [
      ...messages,
      {
        sender: 'customer' as const,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(newMsgs);
    setIsTyping(true);

    try {
      // Call server AI endpoint
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs,
          businessProfile,
          currentLead: {
            name: customerName,
            phone: customerPhone,
            address: customerAddress,
          },
          channel: 'sms',
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.replyText) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        speakText(data.replyText);
      }

      // Update extracted lead info
      if (data.isEmergency) {
        setLeadExtracted((prev) => ({
          ...prev,
          urgency: 'Emergency',
          status: 'Qualified',
          notes: 'EMERGENCY: Customer reported urgent issue. Safety shut-off instructions provided.',
        }));
      }

      if (data.extractedInfo?.serviceNeeded) {
        setLeadExtracted((prev) => ({
          ...prev,
          serviceRequested: data.extractedInfo.serviceNeeded,
        }));
      }

      if (data.appointmentReadyToBook || data.intent === 'book_appointment') {
        setLeadExtracted((prev) => ({
          ...prev,
          status: 'Appointment Booked',
        }));
      }
    } catch (e) {
      setIsTyping(false);
      const fallbackReply = `Thanks for the details! I have an opening with our senior technician today at 2:00 PM. Our diagnostic visit fee is $79 (waived with service). Shall I book that slot for you at ${customerAddress}?`;
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: fallbackReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      speakText(fallbackReply);
    }
  };

  const handleConfirmAndSaveBooking = () => {
    const newLead: Lead = {
      id: 'lead-sim-' + Date.now(),
      name: customerName,
      phone: customerPhone,
      email: `${customerName.toLowerCase().replace(' ', '.')}@example.com`,
      serviceRequested: leadExtracted.serviceRequested || businessProfile.services[0]?.name || 'Standard Service',
      address: customerAddress,
      status: 'Appointment Booked',
      urgency: leadExtracted.urgency || 'High',
      source: 'Missed Call',
      estimatedValue: businessProfile.services[0]?.priceMin || 249,
      notes: 'Captured via CallBack AI missed call flow. Customer confirmed 2:00 PM service slot.',
      createdDate: new Date().toISOString(),
      lastContactedDate: new Date().toISOString(),
      conversationId: 'conv-sim-' + Date.now(),
      callHistoryIds: ['call-sim-' + Date.now()],
      appointmentId: 'apt-sim-' + Date.now(),
    };

    const newApt: Appointment = {
      id: 'apt-sim-' + Date.now(),
      leadId: newLead.id,
      customerName,
      customerPhone,
      customerEmail: newLead.email,
      service: newLead.serviceRequested,
      startDateTime: new Date(Date.now() + 3600 * 1000 * 4).toISOString(),
      endDateTime: new Date(Date.now() + 3600 * 1000 * 5.5).toISOString(),
      address: customerAddress,
      status: 'confirmed',
      price: newLead.estimatedValue,
      notes: 'Booked by CallBack AI virtual receptionist.',
    };

    onLeadCaptured(newLead);
    onAppointmentBooked(newApt);
    setBookingConfirmed(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Live Missed Call & AI Follow-Up Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Experience how CallBack AI catches a lost customer in under 15 seconds
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? 'Voice Synthesis Active' : 'Enable Voice Speech Audio'}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 ${
                voiceEnabled
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[11px] font-medium hidden sm:inline">
                {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two Column Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Panel: Call Trigger & Scenario Setup (5 cols) */}
          <div className="md:col-span-5 bg-slate-50 p-5 border-r border-slate-200 overflow-y-auto space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                1. Select Customer Scenario
              </label>
              <div className="space-y-1.5">
                {scenarios.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setScenario(sc.id as any);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs ${
                      scenario === sc.id
                        ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600'
                        : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-slate-900">{sc.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{sc.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Customer Info */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                Simulated Customer
              </span>
              <div>
                <span className="text-slate-400 block text-[10px]">Name</span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border rounded text-slate-900 text-xs mt-0.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">Phone</span>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border rounded text-slate-900 text-xs mt-0.5"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Location</span>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border rounded text-slate-900 text-xs mt-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Live Extracted Lead Card */}
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Real-Time Lead Extraction
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    leadExtracted.urgency === 'Emergency'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {leadExtracted.urgency || 'Normal'}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-1">
                <div>
                  <strong className="text-slate-800">Service:</strong>{' '}
                  {leadExtracted.serviceRequested || 'Detecting from chat...'}
                </div>
                <div>
                  <strong className="text-slate-800">Status:</strong>{' '}
                  <span className="font-semibold text-blue-700">{leadExtracted.status}</span>
                </div>
              </div>

              {bookingConfirmed ? (
                <div className="p-2 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-800 font-semibold text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Appointment & Lead Saved into CRM!
                </div>
              ) : (
                <button
                  onClick={handleConfirmAndSaveBooking}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save Lead & Book Slot Now
                </button>
              )}
            </div>
          </div>

          {/* Right Panel: Simulated Phone & SMS Interface (7 cols) */}
          <div className="md:col-span-7 bg-white flex flex-col h-full overflow-hidden">
            {callState === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 animate-pulse">
                  <PhoneCall className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Ready to test CallBack AI?
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
                  Simulate an incoming phone call from {customerName}. You can intentionally miss it
                  to see CallBack AI’s instant SMS follow-up and appointment booking engine in action.
                </p>
                <button
                  id="btn-simulate-ring"
                  onClick={handleStartCall}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  Trigger Inbound Call
                </button>
              </div>
            )}

            {callState === 'ringing' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-white text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mb-4 animate-ping">
                  <PhoneCall className="w-8 h-8" />
                </div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                  INCOMING CALL
                </p>
                <h3 className="text-xl font-bold mt-1">{customerName}</h3>
                <p className="text-sm text-slate-300 font-mono mt-0.5">{customerPhone}</p>
                <p className="text-xs text-amber-400 mt-2 font-medium">
                  Ringing dispatch desk...
                </p>

                <div className="flex items-center gap-4 mt-8">
                  <button
                    id="btn-miss-the-call"
                    onClick={handleSimulateMissedCall}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
                  >
                    <PhoneOff className="w-4 h-4" />
                    Simulate Missed Call (Auto-Followup)
                  </button>
                </div>
              </div>
            )}

            {(callState === 'missed' || callState === 'sms_active') && (
              <div className="flex-1 flex flex-col h-full bg-slate-100">
                {/* Simulated SMS Phone Screen Top Bar */}
                <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {businessProfile.name}
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-medium">
                          Virtual Receptionist
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Automated SMS Callback Thread
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Live Connected
                  </span>
                </div>

                {/* Messages Scroll Area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {callState === 'missed' && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-800">
                      📞 Missed Call detected from {customerPhone}. CallBack AI is drafting instant SMS...
                    </div>
                  )}

                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${
                        m.sender === 'customer' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 mb-0.5 px-1 font-mono">
                        {m.sender === 'ai' ? 'CallBack AI' : customerName} • {m.time}
                      </div>
                      <div
                        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          m.sender === 'customer'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 p-2 bg-white rounded-xl w-fit border border-slate-200">
                      <Bot className="w-3.5 h-3.5 text-blue-600" />
                      <span className="animate-pulse">AI Receptionist typing reply...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Scenario Replies Prompt Pills */}
                <div className="p-2 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                  <span className="text-slate-400 font-medium whitespace-nowrap text-[10px] pl-1">
                    Customer quick replies:
                  </span>
                  <button
                    onClick={() => {
                      const sc = scenarios.find((s) => s.id === scenario);
                      if (sc) handleSendMessage(sc.initialMsg);
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg whitespace-nowrap border border-slate-200 transition-colors"
                  >
                    State Problem ({scenario})
                  </button>
                  <button
                    onClick={() => handleSendMessage('Yes, today at 2:00 PM works perfectly. Please book it.')}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg whitespace-nowrap border border-blue-200 font-medium transition-colors"
                  >
                    Confirm 2:00 PM Slot
                  </button>
                  <button
                    onClick={() => handleSendMessage('How much will the visit cost?')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg whitespace-nowrap border border-slate-200 transition-colors"
                  >
                    Ask Price
                  </button>
                </div>

                {/* Message Input Bar */}
                <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Reply as ${customerName}...`}
                    className="flex-1 px-3.5 py-2 bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-xs text-slate-900 focus:outline-none"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputVal.trim()}
                    className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-sm transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
