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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="clay-lg relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-4 mb-6">
          <div>
            <h2 className="text-xl font-bold">
              🤝 Join STEP Talent & Co-Founder Directory
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              List your education, technical capabilities, and role target to connect with startup founders at STEP IIT Kharagpur
            </p>
          </div>
          <button
            onClick={onClose}
            className="clay-btn clay-plain h-9 w-9 shrink-0 rounded-full text-xs"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className="clay-sm clay-sun p-3.5 mb-4 text-xs font-semibold">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-foreground mb-1.5 font-semibold">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun Mehta"
                className="clay-field text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-foreground mb-1.5 font-semibold">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. arjun@iitkgp.ac.in"
                className="clay-field text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-foreground mb-1.5 font-semibold">Target Role Seeking</label>
              <select
                value={roleTarget}
                onChange={(e) => setRoleTarget(e.target.value)}
                className="clay-field text-xs"
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
              <label className="block text-foreground mb-1.5 font-semibold">Availability Commitment</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="clay-field text-xs"
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
              <label className="block text-foreground mb-1.5 font-semibold">Education & Degree</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. B.Tech Computer Science, IIT Kharagpur ('25)"
                className="clay-field text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-foreground mb-1.5 font-semibold">Department / School</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="clay-field text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-foreground mb-1.5 font-semibold">Capabilities & Technical Skills (Comma-Separated)</label>
            <input
              type="text"
              value={capabilities}
              onChange={(e) => setCapabilities(e.target.value)}
              placeholder="e.g. PyTorch, Next.js, CUDA, Microfluidics, SolidWorks"
              className="clay-field text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-foreground mb-1.5 font-semibold">Bio & Achievements</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Briefly describe your background, projects built, research papers, or hackathon wins..."
              className="clay-field text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-foreground mb-1.5 font-semibold">LinkedIn Profile URL (Optional)</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="clay-field text-xs"
              />
            </div>
            <div>
              <label className="block text-foreground mb-1.5 font-semibold">GitHub / Portfolio URL (Optional)</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="clay-field text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="clay-btn clay-primary w-full mt-2 py-3 text-sm"
          >
            {loading ? "Registering Talent Profile..." : "Publish Profile to STEP Co-Founder Directory"}
          </button>
        </form>
      </div>
    </div>
  );
}
