import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <Link to="/signup" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Signup
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, including your name, date of birth, country, and security questions. We also store the media files you upload to your private gallery.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
            <p>Your information is used solely to provide and maintain your private gallery service. We do not sell or share your personal data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Data Security & Encryption</h2>
            <p>All uploaded media is isolated to your unique user ID. We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Emergency Access</h2>
            <p>In extreme cases involving security issues or legal requirements (crime prevention), administrators may review account metadata or content within the bounds of the law and security protocols.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information and uploaded media at any time through your dashboard.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 text-sm text-slate-400">
          Last updated: April 16, 2026
        </div>
      </div>
    </div>
  );
}
