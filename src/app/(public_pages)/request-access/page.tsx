"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function RequestAccessPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      reason: formData.get("reason"),
    };

    const res = await fetch("/api/request-access", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setStatus("sent");
    } else {
      alert("Failed to send request. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#171717] p-10 rounded-3xl w-full max-w-md border border-[#2e2e2e] shadow-2xl"
      >
        <h1 className="text-2xl font-bold mb-2">Request Access</h1>
        <p className="text-[#898989] mb-8 text-sm">BMAC Command Center is restricted. Request access to join the team.</p>
        
        {status === "sent" ? (
          <div className="text-center py-8">
            <p className="text-[#3ecf8e] font-bold mb-6">Request sent successfully!</p>
            <button 
              onClick={() => router.push("/login")}
              className="text-sm text-[#898989] underline hover:text-white"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              name="name"
              type="text" 
              placeholder="Your Full Name" 
              className="w-full p-4 bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl focus:border-[#3ecf8e] outline-none transition-all"
              required 
            />
            <input 
              name="email"
              type="email" 
              placeholder="Your Professional Email" 
              className="w-full p-4 bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl focus:border-[#3ecf8e] outline-none transition-all"
              required 
            />
            <textarea 
              name="reason"
              placeholder="Why do you need access?" 
              className="w-full p-4 bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl focus:border-[#3ecf8e] outline-none transition-all min-h-[100px]"
              required 
            />
            <button 
              disabled={status === "sending"}
              className="w-full bg-[#3ecf8e] text-black font-bold py-4 rounded-xl hover:bg-[#00c573] transition-all disabled:opacity-50"
            >
              {status === "sending" ? "Sending..." : "Submit Request"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
