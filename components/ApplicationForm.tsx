"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { CheckCircle, UserPlus } from "lucide-react";

interface YouthFormData {
  childName: string;
  dob: string;
  parentName: string;
  email: string;
  phone: string;
  section: string;
  medicalNotes: string;
}

interface VolunteerFormData {
  name: string;
  email: string;
  phone: string;
  availability: string;
  interests: string;
  experience: string;
}

function YouthForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<YouthFormData>();

  const onSubmit = async () => {
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
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <CheckCircle size={52} className="text-orange-main mb-4" />
        <h3 className="font-display font-bold text-navy-dark text-xl mb-2">Application Received!</h3>
        <p className="font-body text-textMuted text-sm mb-6 max-w-sm">
          Thank you for applying. A leader from the relevant section will be in touch within 5 working days to confirm your child&apos;s place and next steps.
        </p>
        <button
          onClick={() => { setSubmitted(false); reset(); }}
          className="px-5 py-2.5 bg-navy-dark text-white font-body font-medium rounded-lg hover:bg-navy-mid transition-colors text-sm"
        >
          Submit another application
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
            Child&apos;s Full Name <span className="text-orange-main">*</span>
          </label>
          <input
            {...register("childName", { required: "Required" })}
            type="text"
            placeholder="First and last name"
            className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.childName ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
          />
          {errors.childName && <p className="mt-1 text-xs text-red-500">{errors.childName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
            Date of Birth <span className="text-orange-main">*</span>
          </label>
          <input
            {...register("dob", { required: "Required" })}
            type="date"
            className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.dob ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
          />
          {errors.dob && <p className="mt-1 text-xs text-red-500">{errors.dob.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
          Parent / Guardian Name <span className="text-orange-main">*</span>
        </label>
        <input
          {...register("parentName", { required: "Required" })}
          type="text"
          placeholder="Full name"
          className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.parentName ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
        />
        {errors.parentName && <p className="mt-1 text-xs text-red-500">{errors.parentName.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
            Email Address <span className="text-orange-main">*</span>
          </label>
          <input
            {...register("email", { required: "Required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Valid email required" } })}
            type="email"
            placeholder="your@email.com"
            className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
            Phone Number <span className="text-orange-main">*</span>
          </label>
          <input
            {...register("phone", { required: "Required" })}
            type="tel"
            placeholder="08x xxx xxxx"
            className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
          Section of Interest <span className="text-orange-main">*</span>
        </label>
        <select
          {...register("section", { required: "Please select a section" })}
          className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.section ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
        >
          <option value="">Select section…</option>
          <option value="beavers">Beavers</option>
          <option value="cubs">Cubs</option>
          <option value="scouts">Scouts</option>
          <option value="ventures">Ventures</option>
        </select>
        {errors.section && <p className="mt-1 text-xs text-red-500">{errors.section.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
          Medical Notes / Additional Information
        </label>
        <textarea
          {...register("medicalNotes")}
          rows={3}
          placeholder="Any allergies, medical conditions, or other information we should know about (optional)"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-navy-light font-body text-sm outline-none transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-orange-main hover:bg-orange-hover disabled:opacity-60 text-white font-body font-semibold rounded-lg transition-colors"
      >
        {loading ? (
          <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Submitting…</>
        ) : (
          <><UserPlus size={16} /> Submit Application</>
        )}
      </button>
    </form>
  );
}

function VolunteerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<VolunteerFormData>();

  const onSubmit = async () => {
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
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <CheckCircle size={52} className="text-orange-main mb-4" />
        <h3 className="font-display font-bold text-navy-dark text-xl mb-2">Application Received!</h3>
        <p className="font-body text-textMuted text-sm mb-6 max-w-sm">
          Thank you for your interest in volunteering. Our Group Leader will be in touch within 5 working days.
        </p>
        <button
          onClick={() => { setSubmitted(false); reset(); }}
          className="px-5 py-2.5 bg-navy-dark text-white font-body font-medium rounded-lg hover:bg-navy-mid transition-colors text-sm"
        >
          Submit another application
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
            Full Name <span className="text-orange-main">*</span>
          </label>
          <input
            {...register("name", { required: "Required" })}
            type="text"
            placeholder="Your full name"
            className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
            Email Address <span className="text-orange-main">*</span>
          </label>
          <input
            {...register("email", { required: "Required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Valid email required" } })}
            type="email"
            className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">Phone</label>
          <input
            {...register("phone")}
            type="tel"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-navy-light font-body text-sm outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
            Availability <span className="text-orange-main">*</span>
          </label>
          <select
            {...register("availability", { required: "Required" })}
            className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.availability ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
          >
            <option value="">Select…</option>
            <option value="weekday-evenings">Weekday Evenings</option>
            <option value="weekends">Weekends</option>
            <option value="both">Both</option>
            <option value="flexible">Flexible</option>
          </select>
          {errors.availability && <p className="mt-1 text-xs text-red-500">{errors.availability.message}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">Areas of Interest</label>
        <textarea
          {...register("interests")}
          rows={2}
          placeholder="e.g. outdoor activities, water sports, admin, fundraising…"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-navy-light font-body text-sm outline-none transition-colors resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">Relevant Experience</label>
        <textarea
          {...register("experience")}
          rows={2}
          placeholder="Any scouting, youth work, or relevant professional experience (optional)"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-navy-light font-body text-sm outline-none transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-navy-dark hover:bg-navy-mid disabled:opacity-60 text-white font-body font-semibold rounded-lg transition-colors"
      >
        {loading ? (
          <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Submitting…</>
        ) : (
          <><UserPlus size={16} /> Express Interest</>
        )}
      </button>
    </form>
  );
}

export { YouthForm, VolunteerForm };
export default YouthForm;
