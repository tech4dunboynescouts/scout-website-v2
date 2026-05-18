"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Send } from "lucide-react";
import { submitContactForm } from "@/app/contact/actions";

interface FormData {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>();
  const messageText = watch("message", "");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      await submitContactForm(data);
      setSubmitted(true);
    } catch {
      setError("Sorry, something went wrong sending your message. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <CheckCircle size={52} className="text-orange-main mb-4" />
        <h3 className="font-display font-bold text-navy-dark text-xl mb-2">Message Sent!</h3>
        <p className="font-body text-textMuted text-sm mb-6 max-w-sm">
          Thanks for getting in touch. We&apos;ll get back to you within 48 hours.
        </p>
        <button
          onClick={() => { setSubmitted(false); reset(); }}
          className="px-5 py-2.5 bg-navy-dark text-white font-body font-medium rounded-lg hover:bg-navy-mid transition-colors text-sm"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <>
      <div className="bg-navy-dark rounded-t-lg p-6 sm:p-8">
        <h2 className="font-display font-bold text-white text-2xl mb-2">Send a message</h2>
        <p className="font-body text-slate-200 text-sm">
          Please note, we are an organisation run by volunteers. We will get back to you as soon as we can. Thank you for your patience.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 bg-white rounded-b-lg p-6 sm:p-8">
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-body">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            {error}
          </div>
        )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
            Your Name <span className="text-orange-main">*</span>
          </label>
          <input
            {...register("name", { required: "Required" })}
            type="text"
            placeholder="Jane Smith"
            className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
            Email Address <span className="text-orange-main">*</span>
          </label>
          <input
            {...register("email", {
              required: "Required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
            })}
            type="email"
            placeholder="jane@example.com"
            className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
          Topic <span className="text-orange-main">*</span>
        </label>
        <select
          {...register("topic", { required: "Required" })}
          className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.topic ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
        >
          <option value="">Select a topic…</option>
          <option value="joining">Joining the Group</option>
          <option value="beavers">Beavers Section</option>
          <option value="cubs">Cubs Section</option>
          <option value="scouts">Scouts Section</option>
          <option value="ventures">Ventures Section</option>
          <option value="volunteering">Volunteering</option>
          <option value="fundraising">Fundraising</option>
          <option value="other">Other</option>
        </select>
        {errors.topic && <p className="mt-1 text-xs text-red-500">{errors.topic.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
          Message <span className="text-orange-main">*</span>
        </label>
        <textarea
          {...register("message", {
            required: "Required",
            minLength: { value: 20, message: "Please write at least 20 characters" },
            maxLength: { value: 2000, message: "Maximum 2000 characters" },
          })}
          maxLength={2000}
          rows={5}
          placeholder="How can we help you?"
          className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors resize-none ${errors.message ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
        />
        <p className="mt-1 text-xs text-textMuted text-right">{messageText.length}/2000</p>
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-orange-main hover:bg-orange-hover disabled:opacity-60 text-white font-body font-semibold rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Sending…
          </>
        ) : (
          <>
            <Send size={16} /> Send Message
          </>
        )}
      </button>
    </form>
    </>
  );
}
