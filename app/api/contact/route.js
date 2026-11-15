import axios from 'axios';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { isValidEmail } from '@/utils/check-email';
import { personalData } from '@/utils/data/personal-data';

// Limits mirror the form's maxLength — enforced here too, since the API can be called directly.
// (Telegram also rejects messages over 4096 chars, so the message cap keeps us well under it.)
const LIMITS = { name: 100, email: 100, message: 1000 };

// Nodemailer transporter for Gmail (uses a Google App Password, not the account password).
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.GMAIL_PASSKEY,
  },
});

const escapeHtml = (str = '') =>
  String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Public fallback address shown to visitors (never the sending account from env).
const fallback = `Please email ${personalData.email} directly.`;

async function sendTelegramMessage(token, chat_id, message) {
  try {
    const res = await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      { chat_id, text: message },
      { timeout: 10000 }
    );
    return Boolean(res.data?.ok);
  } catch (error) {
    console.error('Error sending Telegram message:', error.response?.data || error.message);
    return false;
  }
}

const generateEmailTemplate = (name, email, userMessage) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #ff6b2c;">New Message Received</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #ff6b2c; padding-left: 10px; white-space: pre-wrap;">${escapeHtml(userMessage)}</blockquote>
      <p style="font-size: 12px; color: #888;">Click reply to respond to the sender.</p>
    </div>
  </div>
`;

async function sendEmail({ name, email, message: userMessage }, text) {
  try {
    await transporter.sendMail({
      from: `"Mayank Portfolio" <${process.env.EMAIL_ADDRESS}>`,
      to: process.env.EMAIL_ADDRESS,
      subject: `New Message From ${name}`,
      text,
      html: generateEmailTemplate(name, email, userMessage),
      replyTo: email,
    });
    return true;
  } catch (error) {
    console.error('Error while sending email:', error.message);
    return false;
  }
}

// Coerce to a trimmed string; collapse newlines for single-line fields (subject/header safety).
const clean = (v, singleLine) => {
  if (typeof v !== 'string') return '';
  const s = v.trim();
  return singleLine ? s.replace(/[\r\n]+/g, ' ') : s;
};

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
  }

  const name = clean(payload?.name, true);
  const email = clean(payload?.email, true);
  const message = clean(payload?.message, false);

  if (!name || !email || !message) {
    return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
  }
  if (name.length > LIMITS.name || email.length > LIMITS.email || message.length > LIMITS.message) {
    return NextResponse.json({ success: false, message: 'Message is too long.' }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat_id = process.env.TELEGRAM_CHAT_ID;
  const gmailReady = Boolean(process.env.EMAIL_ADDRESS && process.env.GMAIL_PASSKEY);
  const telegramReady = Boolean(token && chat_id);

  if (!gmailReady && !telegramReady) {
    console.error('No delivery channel configured (set Gmail and/or Telegram env vars).');
    return NextResponse.json({ success: false, message: `Contact form is not configured. ${fallback}` }, { status: 500 });
  }

  // Plain text (no parse_mode) so user input can't break Telegram's Markdown parser.
  const text = `🧾 New Message From Portfolio\n\n👤 Name: ${name}\n📧 Email: ${email}\n📝 Message:\n${message}`;
  const fields = { name, email, message };

  // Gmail is the primary inbox; Telegram is an optional instant ping. Send both in parallel.
  const [emailSuccess, telegramSuccess] = await Promise.all([
    gmailReady ? sendEmail(fields, text) : false,
    telegramReady ? sendTelegramMessage(token, chat_id, text) : false,
  ]);

  // Succeed if the message reached at least one channel — otherwise the visitor retries and you get duplicates.
  if (emailSuccess || telegramSuccess) {
    if (gmailReady && !emailSuccess) console.error('Gmail delivery failed; message only reached Telegram.');
    return NextResponse.json({ success: true, message: 'Message sent!' }, { status: 200 });
  }

  return NextResponse.json({ success: false, message: `Couldn't send right now. ${fallback}` }, { status: 502 });
}
