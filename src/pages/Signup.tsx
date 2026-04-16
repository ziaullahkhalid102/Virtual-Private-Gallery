import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "India", "Brazil", "Other"
];

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    country: '',
    username: '',
    password: '',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreed) {
      setError('You must agree to the Terms & Conditions and Privacy Policy');
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server error: ${res.status} ${res.statusText}. Please ensure the backend is running.`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 font-sans text-slate-900">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
            <span className="text-xl font-bold text-slate-900">VPG Private</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-500 text-sm">Join Virtual Private Gallery</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="block w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="block w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                required
                value={formData.dob}
                onChange={handleChange}
                className="block w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
              <select
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                className="block w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select a country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="block w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
                className="block w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder-slate-400 text-sm"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Security Question (For Password Reset)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Question</label>
                <input
                  type="text"
                  name="securityQuestion"
                  required
                  placeholder="e.g., What was the name of your first pet?"
                  value={formData.securityQuestion}
                  onChange={handleChange}
                  className="block w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Answer</label>
                <input
                  type="text"
                  name="securityAnswer"
                  required
                  value={formData.securityAnswer}
                  onChange={handleChange}
                  className="block w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 mt-6">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600"
            />
            <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
              I agree to the <Link to="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>. I understand that for security purposes, administrators may review account activity in emergency situations.
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors mt-6 shadow-sm disabled:opacity-50"
            disabled={!agreed}
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
