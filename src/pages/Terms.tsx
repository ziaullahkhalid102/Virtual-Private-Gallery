import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <Link to="/signup" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Signup
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <FileText className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Terms & Conditions</h1>
        </div>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>By creating an account on Virtual Private Gallery, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. User Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must not upload illegal content or content that violates the rights of others.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Service Limitations</h2>
            <p>We provide a free storage limit of 5GB per user. We reserve the right to modify or terminate the service at any time for any reason, including violation of these terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Account Termination</h2>
            <p>We reserve the right to block or delete accounts that are found to be in violation of our security policies or involved in illegal activities.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Disclaimer</h2>
            <p>The service is provided "as is" without warranties of any kind. We are not liable for any loss of data or damages resulting from the use of our service.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 text-sm text-slate-400">
          Last updated: April 16, 2026
        </div>
      </div>
    </div>
  );
}
