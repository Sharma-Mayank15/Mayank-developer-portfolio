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

// ✅ Send a Telegram message
async function sendTelegramMessage(token, chat_id, message) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    console.log("📨 Sending Telegram message...");
    console.log("🔐 Bot Token:", token ? "✅ loaded" : "❌ missing");
    console.log("👤 Chat ID:", chat_id || "❌ missing");
    console.log("📝 Message:", message);

    const res = await axios.post(url, {
      chat_id,
      text: message,
    });

    console.log("✅ Telegram response:", res.data);
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
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #007BFF; padding-left: 10px;">${userMessage}</blockquote>
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
    subject: `New Message From ${name}`,
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

    // 🚨 Check if all environment variables are available
    if (!token || !chat_id || !process.env.EMAIL_ADDRESS || !process.env.GMAIL_PASSKEY) {
      console.error("❌ Missing environment variables.");
      return NextResponse.json({
        success: false,
        message: "One or more environment variables are missing.",
      }, { status: 400 });
    }

    const formattedMessage = `🧾 *New Message From Portfolio*\n\n👤 *Name*: ${name}\n📧 *Email*: ${email}\n📝 *Message*:\n${userMessage}`;

    // 💬 Telegram
    const telegramSuccess = await sendTelegramMessage(token, chat_id, formattedMessage);

    // 📧 Email
    const emailSuccess = await sendEmail(payload, formattedMessage);

    if (telegramSuccess && emailSuccess) {
      return NextResponse.json({
        success: true,
        message: "Message sent via Telegram and Email!",
      }, { status: 200 });
    }

    return NextResponse.json({
      success: false,
      message: "Failed to send one or both messages.",
    }, { status: 500 });

  } catch (error) {
    console.error("❌ API Error:", error.message);
    return NextResponse.json({
      success: false,
      message: "Server error occurred.",
    }, { status: 500 });
  }
}
