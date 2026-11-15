"use client";

import axios from "axios";
import { useState } from "react";
import { FiArrowRight, FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";
import { isValidEmail } from "@/utils/check-email";

const field =
  "w-full rounded-xl border border-white/[0.08] bg-ink-950/60 px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-dim focus:border-signal/60";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return setError("All fields are required.");
    if (!isValidEmail(form.email)) return setError("Please enter a valid email address.");
    setError("");

    try {
      setLoading(true);
      await axios.post("/api/contact", form);
      toast.success("Message sent — thanks! I'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong. Try emailing me directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="card space-y-4 p-6 md:p-8">
      <div className="eyebrow mb-2">Send a message</div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs text-fg-muted">Name</span>
          <input className={field} value={form.name} onChange={update("name")} maxLength={100} placeholder="Jane Doe" autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs text-fg-muted">Email</span>
          <input className={field} type="email" value={form.email} onChange={update("email")} maxLength={100} placeholder="jane@company.com" autoComplete="email" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-xs text-fg-muted">Message</span>
        <textarea className={`${field} min-h-[9rem] resize-y`} value={form.message} onChange={update("message")} maxLength={1000} placeholder="Tell me about the role or project…" />
      </label>
      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="text-sm text-red-400" role="alert">{error}</p>
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? (
            <>
              Sending <FiLoader className="animate-spin" />
            </>
          ) : (
            <>
              Send message <FiArrowRight />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
