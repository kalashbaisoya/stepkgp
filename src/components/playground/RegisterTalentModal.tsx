"use client";

import React, { useState } from "react";

type RegisterTalentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function RegisterTalentModal({ isOpen, onClose, onSuccess }: RegisterTalentModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleTarget, setRoleTarget] = useState("Technical Co-Founder / CTO");
  const [education, setEducation] = useState("B.Tech Computer Science, IIT Kharagpur ('25)");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [capabilities, setCapabilities] = useState("PyTorch, Next.js, Embedded C++, System Architecture");
  const [availability, setAvailability] = useState("Full-Time Co-Founder");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const capArray = capabilities.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch("/api/talent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          roleTarget,
          education,
          department,
          capabilities: capArray,
          availability,
          bio,
          linkedinUrl,
          githubUrl,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("🎉 Profile successfully created! You are now discoverable by founders.");
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage(`⚠️ Error: ${data.error || "Failed to register"}`);
      }
    } catch (err: any) {
      setMessage(`⚠️ Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
              🤝 Join STEP Talent & Co-Founder Directory
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              List your education, technical capabilities, and role target to connect with startup founders at STEP IIT Kharagpur
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className="p-3 mb-4 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun Mehta"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. arjun@iitkgp.ac.in"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Target Role Seeking</label>
              <select
                value={roleTarget}
                onChange={(e) => setRoleTarget(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Technical Co-Founder / CTO">Technical Co-Founder / CTO</option>
                <option value="Scientific Co-Founder / Chief Scientist">Scientific Co-Founder / Chief Scientist</option>
                <option value="Co-Founder & COO / Business Lead">Co-Founder & COO / Business Lead</option>
                <option value="Lead AI & Robotics Engineer">Lead AI & Robotics Engineer</option>
                <option value="Founding Software Engineer">Founding Software Engineer</option>
                <option value="Founding Designer / Product Manager">Founding Designer / Product Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Availability Commitment</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Full-Time Co-Founder">Full-Time Co-Founder</option>
                <option value="Part-Time Co-Founder">Part-Time Co-Founder</option>
                <option value="Founding Engineer (Full-Time)">Founding Engineer (Full-Time)</option>
                <option value="Advisor / Technical Consultant">Advisor / Technical Consultant</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Education & Degree</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. B.Tech Computer Science, IIT Kharagpur ('25)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Department / School</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Capabilities & Technical Skills (Comma-Separated)</label>
            <input
              type="text"
              value={capabilities}
              onChange={(e) => setCapabilities(e.target.value)}
              placeholder="e.g. PyTorch, Next.js, CUDA, Microfluidics, SolidWorks"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Bio & Achievements</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Briefly describe your background, projects built, research papers, or hackathon wins..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">LinkedIn Profile URL (Optional)</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">GitHub / Portfolio URL (Optional)</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? "Registering Talent Profile..." : "Publish Profile to STEP Co-Founder Directory"}
          </button>
        </form>
      </div>
    </div>
  );
}
