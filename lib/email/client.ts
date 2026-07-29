import "server-only";

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

/**
 * Gmail SMTP (no custom domain needed).
 * Requires a Google App Password on the sending Gmail account.
 */
export function getMailTransporter(): Transporter | null {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim()?.replace(/\s+/g, "");

  if (!user || !pass || pass.includes("placeholder")) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465) === 465,
      auth: { user, pass },
    });
  }

  return transporter;
}

export function getEmailFrom(): string {
  const from = process.env.EMAIL_FROM?.trim();
  if (from) return from;
  const user = process.env.SMTP_USER?.trim();
  if (user) return `Naz's Collection <${user}>`;
  return "Naz's Collection <noreply@localhost>";
}

/** Admin inbox for new-order alerts (comma-separated allowed). */
export function getAdminOrderEmails(): string[] {
  const raw = process.env.ADMIN_ORDER_EMAIL?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.includes("@"));
}
