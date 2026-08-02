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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="clay-lg max-w-lg w-full p-6 space-y-5 relative">
        <button
          onClick={onClose}
          className="clay-btn clay-plain absolute top-4 right-4 h-9 w-9 rounded-full text-xs"
        >
          ✕
        </button>

        <div>
          <span className="clay-chip clay-sun text-xs uppercase tracking-wider">
            STEP IIT KGP TALENT REGISTRY
          </span>
          <h2 className="text-xl font-extrabold mt-1.5">
            Claim Your Ecosystem Profile
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Connect your expertise with active startup graph executions & incubation pipelines.
          </p>
        </div>

        {message && (
          <div className="clay-inset p-3.5 text-xs font-semibold">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          {/* Role selector */}
          <div>
            <label className="block font-semibold mb-1.5">Select Your Primary Role</label>
            <div className="grid grid-cols-3 gap-2">
              {(['STUDENT', 'ALUMNI', 'PROFESSOR'] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2.5 text-xs ${
                    role === r
                      ? 'clay-btn clay-dark'
                      : 'clay-btn clay-plain'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1.5">Full Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Dr. A. K. Deb"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="clay-field"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1.5">Email Address *</label>
              <input
                required
                type="email"
                placeholder="e.g. deb@kgp.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="clay-field"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1.5">Department or Company *</label>
            <input
              required
              type="text"
              placeholder="e.g. Dept of Electrical Engg / Robotics Lab"
              value={departmentOrCompany}
              onChange={(e) => setDepartmentOrCompany(e.target.value)}
              className="clay-field"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1.5">Short Bio</label>
            <textarea
              rows={2}
              placeholder="Focus areas, lab facilities, mentoring interests..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="clay-field"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1.5">Key Skills (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Edge AI, Computer Vision, Embedded Hardware, PyTorch"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              className="clay-field"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1.5">Research / Venture Interests (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Agritech, Drone Mesh Networks, Seed Funding"
              value={interestsStr}
              onChange={(e) => setInterestsStr(e.target.value)}
              className="clay-field"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="clay-btn clay-plain px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="clay-btn clay-dark px-5 py-2.5"
            >
              {loading ? 'Publishing Profile...' : 'Publish Profile →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
