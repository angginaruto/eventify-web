// src/services/email.service.ts
import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const TICKET_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TICKET_TEMPLATE_ID;
const LOGIN_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_LOGIN_TEMPLATE_ID;

// ── Initialize EmailJS sekali saat app load ──────────────────
let isInitialized = false;

function initializeEmailJS() {
  if (!isInitialized && PUBLIC_KEY) {
    emailjs.init(PUBLIC_KEY);
    isInitialized = true;
    console.log("✅ EmailJS initialized");
  } else if (!PUBLIC_KEY) {
    console.error("❌ PUBLIC_KEY not found in environment variables");
  }
}

// ── kirim email konfirmasi tiket ──────────────────────────────

export interface TicketEmailParams {
  user_name: string;
  email: string;
  event_name: string;
  event_date: string;
  event_location: string;
  order_id: string;
  quantity: number;
  total_price: string;
  event_link: string;
}

export async function sendTicketConfirmationEmail(
  params: TicketEmailParams,
): Promise<void> {
  try {
    initializeEmailJS();

    if (!SERVICE_ID || !TICKET_TEMPLATE_ID || !PUBLIC_KEY) {
      throw new Error("Missing EmailJS configuration");
    }

    const response = await emailjs.send(
      SERVICE_ID,
      TICKET_TEMPLATE_ID,
      params as unknown as Record<string, unknown>,
    );

    console.log("✅ Ticket email sent:", response.status);
  } catch (error) {
    console.error("❌ Failed to send ticket confirmation email:", error);
  }
}

// ── kirim email notifikasi login ──────────────────────────────

export async function sendLoginNotificationEmail(
  toEmail: string,
): Promise<void> {
  try {
    initializeEmailJS();

    if (!SERVICE_ID || !LOGIN_TEMPLATE_ID || !PUBLIC_KEY) {
      throw new Error("Missing EmailJS configuration");
    }

    const response = await emailjs.send(SERVICE_ID, LOGIN_TEMPLATE_ID, {
      email: toEmail,
    });

    console.log("✅ Login email sent:", response.status);
  } catch (error) {
    console.error("❌ Failed to send login notification email:", error);
  }
}
