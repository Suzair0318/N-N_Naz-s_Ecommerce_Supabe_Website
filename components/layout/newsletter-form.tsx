"use client";

import { useState } from "react";

import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    toast.success("Welcome to the list", {
      description: "You'll be the first to know about new arrivals.",
    });
    setEmail("");
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center border-b border-white/30">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="w-full bg-transparent py-2 text-sm text-white placeholder:text-white/50 focus:outline-none"
      />
      <button type="submit" aria-label="Subscribe" className="text-gold hover:text-white">
        <ArrowRight className="h-5 w-5" />
      </button>
    </form>
  );
}
