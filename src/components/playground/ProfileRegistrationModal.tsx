'use client';

import React, { useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated?: () => void;
};

export default function ProfileRegistrationModal({ isOpen, onClose, onProfileCreated }: Props) {
  const [role, setRole] = useState<'STUDENT' | 'ALUMNI' | 'PROFESSOR'>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentOrCompany, setDepartmentOrCompany] = useState('');
  const [bio, setBio] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [interestsStr, setInterestsStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const skills = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
      const interests = interestsStr.split(',').map((i) => i.trim()).filter(Boolean);

      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          role,
          departmentOrCompany,
          bio,
          skills,
          interests,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create profile');
      }

      setMessage('🎉 Profile published successfully! You are now discoverable in the STEP ecosystem matcher.');
      setTimeout(() => {
        onProfileCreated?.();
        onClose();
      }, 1800);
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-stone-200 shadow-xl max-w-lg w-full p-6 space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 font-bold text-sm"
        >
          ✕
        </button>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
            STEP IIT KGP TALENT REGISTRY
          </span>
          <h2 className="text-xl font-black text-stone-900 mt-1">
            Claim Your Ecosystem Profile
          </h2>
          <p className="text-xs text-stone-600 font-medium">
            Connect your expertise with active startup graph executions & incubation pipelines.
          </p>
        </div>

        {message && (
          <div className="p-3 text-xs font-semibold rounded-lg bg-stone-100 border border-stone-300 text-stone-900">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {/* Role selector */}
          <div>
            <label className="block text-stone-700 font-bold mb-1">Select Your Primary Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['STUDENT', 'ALUMNI', 'PROFESSOR'] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-lg font-bold border transition ${
                    role === r
                      ? 'bg-stone-900 text-stone-50 border-stone-900 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-bold mb-1">Full Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Dr. A. K. Deb"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50"
              />
            </div>
            <div>
              <label className="block text-stone-700 font-bold mb-1">Email Address *</label>
              <input
                required
                type="email"
                placeholder="e.g. deb@kgp.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Department or Company *</label>
            <input
              required
              type="text"
              placeholder="e.g. Dept of Electrical Engg / Robotics Lab"
              value={departmentOrCompany}
              onChange={(e) => setDepartmentOrCompany(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Short Bio</label>
            <textarea
              rows={2}
              placeholder="Focus areas, lab facilities, mentoring interests..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Key Skills (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Edge AI, Computer Vision, Embedded Hardware, PyTorch"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Research / Venture Interests (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Agritech, Drone Mesh Networks, Seed Funding"
              value={interestsStr}
              onChange={(e) => setInterestsStr(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50/50"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 font-bold shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Publishing Profile...' : 'Publish Profile →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
