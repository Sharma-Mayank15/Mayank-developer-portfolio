import axios from 'axios';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// ✅ Nodemailer transporter setup for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.GMAIL_PASSKEY,
  },
});

const escapeHtml = (str = '') =>
  String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ✅ Send a Telegram message
async function sendTelegramMessage(token, chat_id, message) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const res = await axios.post(url, {
      chat_id,
      text: message,

    });
    
    return res.data.ok;
  } catch (error) {
    console.error("❌ Error sending Telegram message:", error.response?.data || error.message);
    return false;
  }
}

// ✅ Generate a clean, styled email template
const generateEmailTemplate = (name, email, userMessage) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #007BFF;">New Message Received</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #007BFF; padding-left: 10px;">${escapeHtml(userMessage)}</blockquote>
      <p style="font-size: 12px; color: #888;">Click reply to respond to the sender.</p>
    </div>
  </div>
`;

// ✅ Send an email using Nodemailer
async function sendEmail(payload, message) {
  const { name, email, message: userMessage } = payload;

  const mailOptions = {
    from: `"Mayank Portfolio" <${process.env.EMAIL_ADDRESS}>`,
    to: process.env.EMAIL_ADDRESS,
    subject: `New Message From ${String(name).slice(0, 100)}`,
    text: message,
    html: generateEmailTemplate(name, email, userMessage),
    replyTo: email,
  };

  try {
    console.log("📧 Sending email...");
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Error while sending email:", error.message);
    return false;
  }
}

// ✅ POST API handler
export async function POST(request) {
  try {
    const payload = await request.json();
    const { name, email, message: userMessage } = payload;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat_id = process.env.TELEGRAM_CHAT_ID;

    if (!name || !email || !userMessage) {
      return NextResponse.json({ success: false, message: "All fields are required." }, { status: 400 });
    }

    const gmailReady = Boolean(process.env.EMAIL_ADDRESS && process.env.GMAIL_PASSKEY);
    const telegramReady = Boolean(token && chat_id);

    if (!gmailReady && !telegramReady) {
      console.error("❌ No delivery channel configured (set Gmail and/or Telegram env vars).");
      return NextResponse.json({
        success: false,
        message: `Contact form is not configured. Please email ${process.env.EMAIL_ADDRESS || "me"} directly.`,
      }, { status: 500 });
    }

    // Plain text (no parse_mode) so user input can't break Telegram's Markdown parser
    const formattedMessage = `🧾 New Message From Portfolio\n\n👤 Name: ${name}\n📧 Email: ${email}\n📝 Message:\n${userMessage}`;

    // Gmail is the primary inbox; Telegram is an optional instant ping. Send both in parallel.
    const [emailSuccess, telegramSuccess] = await Promise.all([
      gmailReady ? sendEmail(payload, formattedMessage) : Promise.resolve(false),
      telegramReady ? sendTelegramMessage(token, chat_id, formattedMessage) : Promise.resolve(false),
    ]);

    // Succeed if the message reached at least one channel — otherwise the visitor retries and you get duplicates.
    if (emailSuccess || telegramSuccess) {
      if (gmailReady && !emailSuccess) console.error("⚠️ Gmail delivery failed; message only reached Telegram.");
      return NextResponse.json({ success: true, message: "Message sent!" }, { status: 200 });
    }

    return NextResponse.json({
      success: false,
      message: `Couldn't send right now. Please email ${process.env.EMAIL_ADDRESS} directly.`,
    }, { status: 502 });

  } catch (error) {
    console.error("❌ API Error:", error.message);
    return NextResponse.json({
      success: false,
      message: "Server error occurred.",
    }, { status: 500 });
  }
}
