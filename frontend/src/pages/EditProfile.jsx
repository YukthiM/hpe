import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, portfolioAPI } from '../api';
import toast from 'react-hot-toast';
import { Camera, Save, Plus, X } from 'lucide-react';

export default function EditProfile() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    experience: user?.experience || '',
    hourlyRate: user?.hourlyRate || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'skills') {
          // Pass as JSON array
          const skillsArr = v.split(',').map((s) => s.trim()).filter(Boolean);
          skillsArr.forEach((s) => formData.append('skills[]', s));
        } else {
          formData.append(k, v);
        }
      });
      if (avatarFile) formData.append('avatar', avatarFile);

      await authAPI.updateProfile(formData);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="page-container animate-fade-in">
      <h1 className="font-display text-xl font-bold mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Avatar */}
        <div className="flex justify-center">
          <label className="relative cursor-pointer">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-3xl object-cover border-2 border-primary-500/30" />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-glow">
              <Camera size={14} />
            </div>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>

        {/* Fields */}
        {[
          { name: 'name', label: 'Full Name', placeholder: 'Your full name', type: 'text' },
          { name: 'phone', label: 'Phone', placeholder: '+91 98765 43210', type: 'tel' },
          { name: 'location', label: 'Location', placeholder: 'City, State', type: 'text' },
        ].map((field) => (
          <div key={field.name}>
            <label className="text-white/70 text-sm font-medium block mb-1.5">{field.label}</label>
            <input {...field} value={form[field.name]} onChange={handleChange} className="input-field" />
          </div>
        ))}

        <div>
          <label className="text-white/70 text-sm font-medium block mb-1.5">Bio</label>
          <textarea
            name="bio" value={form.bio} onChange={handleChange}
            placeholder="Describe your work experience and expertise..."
            rows={3} className="input-field resize-none"
          />
        </div>

        {user?.role === 'worker' && (
          <>
            <div>
              <label className="text-white/70 text-sm font-medium block mb-1.5">Skills (comma separated)</label>
              <input name="skills" value={form.skills} onChange={handleChange}
                placeholder="Electrician, Wiring, Solar Panels" className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Experience (years)</label>
                <input name="experience" type="number" value={form.experience} onChange={handleChange}
                  placeholder="5" className="input-field" />
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Rate (₹/hr)</label>
                <input name="hourlyRate" type="number" value={form.hourlyRate} onChange={handleChange}
                  placeholder="500" className="input-field" />
              </div>
            </div>
          </>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
