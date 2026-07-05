"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/actions/admin-auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await requestPasswordReset(email);
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="w-full max-w-md p-8 bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Check your email</h2>
            <p className="text-gray-400 text-sm">If an account exists with that email, we've sent a password reset link. It expires in 1 hour.</p>
            <Link href="/admin/login" className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300">Back to login</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Reset password</h1>
            <p className="text-gray-400 text-sm mb-6">Enter your admin email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-400">
              <Link href="/admin/login" className="text-blue-400 hover:text-blue-300">Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
