import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, changePassword } from '../services/auth';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState({ text: '', type: '' });

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const updated = await updateProfile({ name, email });
      updateUser(updated);
      setSaveMsg('Profile updated successfully');
    } catch (err) {
      setSaveMsg(err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ text: '', type: '' });

    if (newPw.length < 6) {
      setPwMsg({ text: 'New password must be at least 6 characters', type: 'error' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    setPwSaving(true);
    try {
      await changePassword(currentPw, newPw);
      setPwMsg({ text: 'Password changed successfully', type: 'success' });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      setPwMsg({ text: err.message, type: 'error' });
    } finally {
      setPwSaving(false);
      setTimeout(() => setPwMsg({ text: '', type: '' }), 3000);
    }
  };

  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="profile-hero glass">
        <div className="avatar avatar--xl">{initials}</div>
        <div className="profile-hero__info">
          <h2>{user?.name || 'User'}</h2>
          <span className="profile-hero__email">{user?.email}</span>
          <div className="profile-hero__meta">
            <span className="profile-hero__badge">{user?.plan || 'Free'} Plan</span>
            <span className="profile-hero__badge profile-hero__badge--dim">{user?.role || 'Developer'}</span>
            <span className="profile-hero__date">Joined {joined}</span>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <form className="profile-section glass" onSubmit={handleSave}>
        <h3 className="profile-section__title">Edit Profile</h3>
        <div className="profile-form-grid">
          <div className="profile-field">
            <label htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="profile-field">
            <label htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="profile-section__footer">
          {saveMsg && <span className="profile-msg profile-msg--success">{saveMsg}</span>}
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Change Password */}
      <form className="profile-section glass" onSubmit={handleChangePassword}>
        <h3 className="profile-section__title">Change Password</h3>
        <div className="profile-form-grid profile-form-grid--3">
          <div className="profile-field">
            <label htmlFor="current-pw">Current Password</label>
            <input
              id="current-pw"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="profile-field">
            <label htmlFor="new-pw">New Password</label>
            <input
              id="new-pw"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Min 6 characters"
            />
          </div>
          <div className="profile-field">
            <label htmlFor="confirm-pw">Confirm Password</label>
            <input
              id="confirm-pw"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>
        <div className="profile-section__footer">
          {pwMsg.text && (
            <span className={`profile-msg profile-msg--${pwMsg.type}`}>{pwMsg.text}</span>
          )}
          <button type="submit" className="btn btn--primary" disabled={pwSaving}>
            {pwSaving ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
