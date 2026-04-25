"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { CheckCircle, Send } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (_data: FormData) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <CheckCircle size={56} className="text-orange-main mb-4" />
        <h3 className="font-display font-bold text-navy-dark text-2xl mb-2">
          Message Sent!
        </h3>
        <p className="font-body text-textMuted text-base mb-6">
          Thanks for getting in touch. We&apos;ll get back to you within 48 hours.
        </p>
        <button
          onClick={() => { setSubmitted(false); reset(); }}
          className="px-6 py-3 bg-navy-dark text-white font-body font-medium rounded-lg hover:bg-navy-mid transition-colors"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
            Your Name <span className="text-orange-main">*</span>
          </label>
          <input
            {...register("name", { required: "Name is required" })}
            type="text"
            placeholder="Jane Smith"
            className={`w-full px-4 py-3 rounded-lg border font-body text-sm text-navy-dark placeholder:text-textMuted/50 outline-none transition-colors ${
              errors.name ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-navy-light"
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
            Email Address <span className="text-orange-main">*</span>
          </label>
          <input
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
            })}
            type="email"
            placeholder="jane@example.com"
            className={`w-full px-4 py-3 rounded-lg border font-body text-sm text-navy-dark placeholder:text-textMuted/50 outline-none transition-colors ${
              errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-navy-light"
            }`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
          Topic <span className="text-orange-main">*</span>
        </label>
        <select
          {...register("topic", { required: "Please select a topic" })}
          className={`w-full px-4 py-3 rounded-lg border font-body text-sm text-navy-dark outline-none transition-colors ${
            errors.topic ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-navy-light"
          }`}
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
          {...register("message", { required: "Message is required", minLength: { value: 20, message: "Please write at least 20 characters" } })}
          rows={5}
          placeholder="How can we help you?"
          className={`w-full px-4 py-3 rounded-lg border font-body text-sm text-navy-dark placeholder:text-textMuted/50 outline-none transition-colors resize-none ${
            errors.message ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus:border-navy-light"
          }`}
        />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-orange-main hover:bg-orange-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-body font-semibold rounded-lg transition-colors"
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
  );
}
