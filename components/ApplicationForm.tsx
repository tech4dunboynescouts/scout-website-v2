"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { CheckCircle, UserPlus, AlertCircle } from "lucide-react";
import { submitYouthApplication, submitVolunteerApplication } from "@/app/join/actions";

// Formats a phone input to "087 123 4567" style, max 10 digits
function formatPhone(val: string): string {
  const d = val.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

interface YouthFormData {
  childName: string;
  dob: string;
  gender: string;
  schoolYear: string;
  parentName: string;
  email: string;
  phone: string;
  section: string;
  medicalNotes: string;
  volunteeringInterest: string;
}

interface VolunteerFormData {
  name: string;
  email: string;
  phone: string;
  volunteerSection: string;
  availability: string;
  interests: string;
  experience: string;
}

function YouthForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<YouthFormData>();
  const phoneReg = register("phone", { required: "Required" });

  const onSubmit = async (data: YouthFormData) => {
    setLoading(true);
    setError(null);
    try {
      await submitYouthApplication(data);
      setSubmitted(true);
    } catch {
      setError("Sorry, something went wrong submitting your application. Please try again or contact us directly.");
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
        <h3 className="font-display font-bold text-navy-dark text-xl mb-2">Application Received!</h3>
        <p className="font-body text-textMuted text-sm mb-6 max-w-sm">
          Thank you for applying. Your child has been added to our waiting list. We will be in touch in due course to keep you informed on your application.
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
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-body">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
            Gender <span className="text-orange-main">*</span>
          </label>
          <select
            {...register("gender", { required: "Required" })}
            className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.gender ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
          >
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
            Current School Year / Class <span className="text-orange-main">*</span>
          </label>
          <select
            {...register("schoolYear", { required: "Required" })}
            className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.schoolYear ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
          >
            <option value="">Select…</option>
            <option value="junior-infants">Junior Infants</option>
            <option value="senior-infants">Senior Infants</option>
            <option value="1st-class">1st Class</option>
            <option value="2nd-class">2nd Class</option>
            <option value="3rd-class">3rd Class</option>
            <option value="4th-class">4th Class</option>
            <option value="5th-class">5th Class</option>
            <option value="6th-class">6th Class</option>
            <option value="1st-year">1st Year</option>
            <option value="2nd-year">2nd Year</option>
            <option value="3rd-year">3rd Year</option>
            <option value="4th-year">4th Year (TY)</option>
            <option value="5th-year">5th Year</option>
            <option value="6th-year">6th Year</option>
          </select>
          {errors.schoolYear && <p className="mt-1 text-xs text-red-500">{errors.schoolYear.message}</p>}
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
            {...phoneReg}
            type="tel"
            placeholder="08x xxx xxxx"
            inputMode="numeric"
            onChange={(e) => { e.target.value = formatPhone(e.target.value); phoneReg.onChange(e); }}
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

      <div>
        <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
          Are you interested in volunteering with Dunboyne Scout Group? <span className="text-orange-main">*</span>
        </label>
        <p className="text-xs font-body text-textMuted mb-2">e.g. becoming a Leader, helping with fundraising, or volunteering in another way. Note: volunteering as a Leader will ensure your child skips the waiting list.</p>
        <select
          {...register("volunteeringInterest", { required: "Required" })}
          className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.volunteeringInterest ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
        >
          <option value="">Select…</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
        {errors.volunteeringInterest && <p className="mt-1 text-xs text-red-500">{errors.volunteeringInterest.message}</p>}
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
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<VolunteerFormData>();
  const phoneReg = register("phone", { required: "Required" });

  const onSubmit = async (data: VolunteerFormData) => {
    setLoading(true);
    setError(null);
    try {
      await submitVolunteerApplication(data);
      setSubmitted(true);
    } catch {
      setError("Sorry, something went wrong submitting your enquiry. Please try again or contact us directly.");
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
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-body">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}
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
            placeholder="your@email.com"
            className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
            Phone Number <span className="text-orange-main">*</span>
          </label>
          <input
            {...phoneReg}
            type="tel"
            placeholder="08x xxx xxxx"
            inputMode="numeric"
            onChange={(e) => { e.target.value = formatPhone(e.target.value); phoneReg.onChange(e); }}
            className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-body font-medium text-navy-dark mb-1.5">
            Section to help with <span className="text-orange-main">*</span>
          </label>
          <select
            {...register("volunteerSection", { required: "Required" })}
            className={`w-full px-4 py-2.5 rounded-lg border font-body text-sm outline-none transition-colors ${errors.volunteerSection ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-navy-light"}`}
          >
            <option value="">Select…</option>
            <option value="beavers">Beavers</option>
            <option value="cubs">Cubs</option>
            <option value="scouts">Scouts</option>
            <option value="ventures">Ventures</option>
            <option value="non-scouter">Non-Scouter role e.g. Admin</option>
          </select>
          {errors.volunteerSection && <p className="mt-1 text-xs text-red-500">{errors.volunteerSection.message}</p>}
        </div>
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
