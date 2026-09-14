import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // API routes FIRST
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // AI Receptionist Chat Endpoint
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const {
        messages,
        businessProfile,
        currentLead,
        channel = "sms", // "sms" or "voice"
      } = req.body;

      const ai = getGenAI();

      // Formulate detailed system prompt tailored to the business
      const emergencyKeywords = (businessProfile?.emergencyRules?.keywords || []).join(", ");
      const servicesList = (businessProfile?.services || [])
        .map(
          (s: any) =>
            `- ${s.name}: ${s.description} (Duration: ${s.durationMinutes}m, Price: ${
              s.priceType === "fixed"
                ? "$" + s.priceMin
                : s.priceType === "range"
                ? "$" + s.priceMin + " - $" + (s.priceMax || "")
                : "Starts at $" + s.priceMin
            })`
        )
        .join("\n");

      const faqsList = (businessProfile?.faqs || [])
        .map((f: any) => `Q: ${f.question}\nA: ${f.answer}`)
        .join("\n\n");

      const hoursList = (businessProfile?.hours || [])
        .map((h: any) => `${h.day}: ${h.isOpen ? `${h.open} - ${h.close}` : "Closed"}`)
        .join(", ");

      const systemPrompt = `You are the virtual AI receptionist for "${businessProfile?.name || "Local Services"}" (${businessProfile?.category || "Service Business"}).
You communicate via ${channel.toUpperCase()} with customers.

CRITICAL RULES:
1. Always identify as an AI/virtual assistant if asked or in initial introduction.
2. NEVER invent services, prices, or business policies not listed below.
3. NEVER promise exact prices outside configured brackets. Diagnostic fee is $79 (waived with service).
4. Respect business hours: ${hoursList}.
5. Emergency Protocol: If customer mentions urgent emergencies (such as: ${emergencyKeywords || "flooding, burst pipe, sparks, gas leak"}), follow these instructions strictly:
   "${businessProfile?.emergencyRules?.instructions || "Advise safe shut-off immediately and provide emergency dispatch."}"
   Offer human escalation phone: ${businessProfile?.emergencyRules?.escalationPhone || businessProfile?.phone}.
   NEVER provide hazardous technical repair instructions to customers.
6. Booking protocol: Collect Customer Name, Phone, Service needed, Address/Location, Preferred appointment time, and Urgency.
7. Only confirm an appointment if the customer explicitly provides a preferred time and address, and you have offered an available slot.
8. Be warm, concise, professional, and efficient. Because this is ${channel.toUpperCase()}, keep messages brief (1-3 sentences maximum).

BUSINESS DETAILS:
Phone: ${businessProfile?.phone || ""}
Address: ${businessProfile?.address || ""}
Service Area: ${businessProfile?.serviceArea?.primaryCity || ""} within ${businessProfile?.serviceArea?.radiusMiles || 25} miles (Zip codes: ${(businessProfile?.serviceArea?.zipCodes || []).join(", ")})

SERVICES OFFERED:
${servicesList || "Standard home & commercial service repairs"}

FREQUENTLY ASKED QUESTIONS:
${faqsList || "Licensed and insured professional service technicians."}

CURRENT LEAD CONTEXT:
Name: ${currentLead?.name || "Unknown"}
Phone: ${currentLead?.phone || ""}
Service: ${currentLead?.serviceRequested || "Not yet specified"}
Address: ${currentLead?.address || "Not yet provided"}

RESPONSE FORMAT:
You MUST return your answer as a JSON object with this exact schema:
{
  "replyText": "Your natural text or voice response to the customer",
  "isEmergency": true/false,
  "emergencyNote": "Brief reason if emergency detected",
  "intent": "emergency" | "book_appointment" | "inquire_service" | "reschedule" | "cancel" | "general_faq",
  "extractedInfo": {
    "name": "extracted customer name or null",
    "phone": "extracted phone or null",
    "serviceNeeded": "extracted service or null",
    "address": "extracted address or null",
    "preferredTime": "extracted ISO date-time or description or null",
    "urgency": "Emergency" | "High" | "Medium" | "Low"
  },
  "appointmentReadyToBook": true/false,
  "bookingDetails": {
    "service": "Service name",
    "proposedDateTime": "2026-09-14T14:00:00Z or similar",
    "notes": "Relevant job notes"
  }
}`;

      if (ai) {
        const conversationHistory = (messages || []).map((m: any) => ({
          role: m.sender === "customer" ? "user" : "model",
          parts: [{ text: m.text }],
        }));

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                { text: systemPrompt },
                {
                  text: `Here is the conversation so far:\n${JSON.stringify(
                    conversationHistory,
                    null,
                    2
                  )}\n\nRespond to the latest customer message according to instructions. Output pure JSON only.`,
                },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const text = response.text || "{}";
        try {
          const parsed = JSON.parse(text);
          return res.json({ success: true, ...parsed });
        } catch (e) {
          return res.json({
            success: true,
            replyText: text,
            isEmergency: false,
            intent: "inquire_service",
            extractedInfo: {},
            appointmentReadyToBook: false,
          });
        }
      }

      // Fallback AI simulation if GEMINI_API_KEY is not configured
      const lastMessage = (messages?.[messages.length - 1]?.text || "").toLowerCase();
      const isEmergency = (businessProfile?.emergencyRules?.keywords || [
        "burst",
        "flood",
        "gas",
        "spark",
        "emergency",
      ]).some((kw: string) => lastMessage.includes(kw.toLowerCase()));

      let replyText = "";
      let appointmentReadyToBook = false;
      let intent = "inquire_service";

      if (isEmergency) {
        intent = "emergency";
        replyText = `⚠️ This sounds urgent! Please turn off your main water/gas shutoff valve immediately if safe to do so. Our emergency dispatch team is being alerted. You can also reach our urgent line directly at ${
          businessProfile?.emergencyRules?.escalationPhone || businessProfile?.phone
        }. What is your exact address?`;
      } else if (
        lastMessage.includes("book") ||
        lastMessage.includes("appointment") ||
        lastMessage.includes("today") ||
        lastMessage.includes("tomorrow") ||
        lastMessage.includes("pm") ||
        lastMessage.includes("am")
      ) {
        intent = "book_appointment";
        appointmentReadyToBook = true;
        replyText = `I have technician availability open today at 2:00 PM or tomorrow at 10:00 AM. Our diagnostic fee is $79, which is 100% credited toward your repair. Shall I lock in today at 2:00 PM for you?`;
      } else if (lastMessage.includes("price") || lastMessage.includes("cost") || lastMessage.includes("how much")) {
        intent = "inquire_service";
        const sampleService = businessProfile?.services?.[0];
        replyText = `Our ${sampleService?.name || "standard service"} typically starts at $${
          sampleService?.priceMin || 149
        }. We provide an upfront transparent quote before any work begins. Would you like us to schedule a diagnostic visit?`;
      } else {
        replyText = `Thanks for getting back to us! I can answer questions about our services, check technician availability, or book an appointment for you. What issue are you experiencing today?`;
      }

      return res.json({
        success: true,
        replyText,
        isEmergency,
        intent,
        extractedInfo: {
          urgency: isEmergency ? "Emergency" : "Medium",
        },
        appointmentReadyToBook,
      });
    } catch (error: any) {
      console.error("Error in /api/gemini/chat:", error);
      res.status(500).json({ error: error.message || "Failed to process chat" });
    }
  });

  // Call Transcript & Simulation Generator
  app.post("/api/gemini/simulate-call", async (req, res) => {
    try {
      const { customerName, customerPhone, issueType, businessProfile } = req.body;
      const ai = getGenAI();

      if (ai) {
        const prompt = `Generate a realistic 4-5 line dialogue between an AI Virtual Receptionist for "${
          businessProfile?.name || "Apex Flow Plumbing"
        }" and a customer named "${customerName || "Customer"}" who just had their call returned after a missed call.
The customer's problem is: "${issueType || "plumbing repair needed"}".
Include speaker ('ai' or 'customer'), text, and time offset (e.g. "0:04").
Also generate a 2-sentence summary and the outcome ('Lead Qualified' | 'Appointment Booked' | 'Emergency Escalated' | 'Info Provided').
Return JSON format:
{
  "summary": "...",
  "aiOutcome": "Appointment Booked",
  "transcript": [
    { "speaker": "ai", "text": "...", "time": "0:02" },
    { "speaker": "customer", "text": "...", "time": "0:10" }
  ]
}`;

        const result = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });

        const parsed = JSON.parse(result.text || "{}");
        return res.json({ success: true, ...parsed });
      }

      // Default mock simulation
      return res.json({
        success: true,
        summary: `Customer called regarding ${issueType || "urgent repair"}. AI receptionist reached out via SMS/callback, qualified customer requirements, and initiated scheduling.`,
        aiOutcome: "Appointment Booked",
        transcript: [
          { speaker: "ai", text: `Hello ${customerName || "there"}, this is Alex calling from ${businessProfile?.name || "Apex Flow"}. We noticed we missed your call. How can we help?`, time: "0:03" },
          { speaker: "customer", text: `Hi! Yes, I need help with ${issueType || "an issue at my home"}. Can someone take a look today?`, time: "0:12" },
          { speaker: "ai", text: `We certainly can. Our licensed technician can arrive between 2:00 PM and 4:00 PM today. Our diagnostic fee is $79 and waived with repairs. Does that work?`, time: "0:25" },
          { speaker: "customer", text: `Yes, that sounds great. Please send them out.`, time: "0:36" },
          { speaker: "ai", text: `Confirmed! We've scheduled your service. You will receive an SMS confirmation and a live GPS tracking link when the technician is en route.`, time: "0:48" },
        ],
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Google Sheets Export / Sync Endpoint (Using client-provided OAuth access token)
  app.post("/api/workspace/sync-sheets", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid OAuth access token" });
      }
      const token = authHeader.split(" ")[1];
      const { leads, businessName } = req.body;

      // Create or append to a Google Sheet using Google Sheets REST API v4
      // 1. Create spreadsheet if not exists or append rows
      const sheetTitle = `CallBack AI Leads - ${businessName || "My Business"}`;
      
      const createResponse = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: { title: sheetTitle },
          sheets: [
            {
              properties: { title: "Leads & Bookings" },
              data: [
                {
                  startRow: 0,
                  startColumn: 0,
                  rowData: [
                    {
                      values: [
                        { userEnteredValue: { stringValue: "Lead Name" } },
                        { userEnteredValue: { stringValue: "Phone" } },
                        { userEnteredValue: { stringValue: "Email" } },
                        { userEnteredValue: { stringValue: "Service Requested" } },
                        { userEnteredValue: { stringValue: "Status" } },
                        { userEnteredValue: { stringValue: "Urgency" } },
                        { userEnteredValue: { stringValue: "Address" } },
                        { userEnteredValue: { stringValue: "Est. Value ($)" } },
                        { userEnteredValue: { stringValue: "Captured Date" } },
                        { userEnteredValue: { stringValue: "Notes" } },
                      ],
                    },
                    ...(leads || []).map((lead: any) => ({
                      values: [
                        { userEnteredValue: { stringValue: lead.name || "" } },
                        { userEnteredValue: { stringValue: lead.phone || "" } },
                        { userEnteredValue: { stringValue: lead.email || "" } },
                        { userEnteredValue: { stringValue: lead.serviceRequested || "" } },
                        { userEnteredValue: { stringValue: lead.status || "" } },
                        { userEnteredValue: { stringValue: lead.urgency || "" } },
                        { userEnteredValue: { stringValue: lead.address || "" } },
                        { userEnteredValue: { numberValue: lead.estimatedValue || 0 } },
                        { userEnteredValue: { stringValue: lead.createdDate || "" } },
                        { userEnteredValue: { stringValue: lead.notes || "" } },
                      ],
                    })),
                  ],
                },
              ],
            },
          ],
        }),
      });

      if (!createResponse.ok) {
        const errText = await createResponse.text();
        return res.status(createResponse.status).json({ error: "Google Sheets API Error: " + errText });
      }

      const sheetData = await createResponse.json();
      res.json({
        success: true,
        spreadsheetId: sheetData.spreadsheetId,
        spreadsheetUrl: sheetData.spreadsheetUrl,
        rowCount: (leads || []).length,
      });
    } catch (e: any) {
      console.error("Sheets sync error:", e);
      res.status(500).json({ error: e.message || "Failed to sync with Google Sheets" });
    }
  });

  // Google Calendar Sync Endpoint (Using client-provided OAuth access token)
  app.post("/api/workspace/sync-calendar", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid OAuth access token" });
      }
      const token = authHeader.split(" ")[1];
      const { appointment, businessName } = req.body;

      // Insert event into Primary Google Calendar
      const eventPayload = {
        summary: `[CallBack AI] ${appointment.service} - ${appointment.customerName}`,
        description: `Customer: ${appointment.customerName}\nPhone: ${appointment.customerPhone}\nEmail: ${appointment.customerEmail}\nAddress: ${appointment.address}\n\nService: ${appointment.service}\nEstimated Price: $${appointment.price}\n\nNotes:\n${appointment.notes}\n\nBooked automatically by CallBack AI for ${businessName}.`,
        location: appointment.address,
        start: {
          dateTime: appointment.startDateTime,
          timeZone: "America/Chicago",
        },
        end: {
          dateTime: appointment.endDateTime,
          timeZone: "America/Chicago",
        },
        attendees: appointment.customerEmail ? [{ email: appointment.customerEmail }] : [],
      };

      const calResponse = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventPayload),
        }
      );

      if (!calResponse.ok) {
        const errData = await calResponse.text();
        return res.status(calResponse.status).json({ error: "Google Calendar API error: " + errData });
      }

      const calData = await calResponse.json();
      res.json({
        success: true,
        eventId: calData.id,
        htmlLink: calData.htmlLink,
      });
    } catch (e: any) {
      console.error("Calendar sync error:", e);
      res.status(500).json({ error: e.message || "Failed to create Google Calendar event" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CallBack AI server running on port ${PORT}`);
  });
}

startServer();
