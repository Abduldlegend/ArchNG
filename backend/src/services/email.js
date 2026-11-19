import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) return;
  if (env.EMAIL_DRIVER === "console") {
    logger.info("email.console", { to, subject, text });
    return;
  }
  try {
    await getTransporter().sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text,
      html: html || `<p>${String(text || "").replace(/\n/g, "<br />")}</p>`,
    });
  } catch (error) {
    logger.error("email.failed", { to, subject, error: error?.message });
  }
};

const appUrl = env.PUBLIC_API_URL;

export const emailVerificationReceived = async (provider) => {
  if (!provider.user?.email && !provider.contactEmail) return;
  await sendEmail({
    to: provider.user?.email || provider.contactEmail,
    subject: "ArchNG received your verification documents",
    text: `Hello ${provider.user?.name || provider.firm},\n\nYour verification documents are with the ArchNG review team. We aim to review submissions within 48 hours.\n\nYou can check your status at ${appUrl}.\n\nArchNG`,
  });
};

export const emailVerificationDecision = async (provider, status, note) => {
  if (!provider.user?.email && !provider.contactEmail) return;
  const approved = status === "VERIFIED";
  await sendEmail({
    to: provider.user?.email || provider.contactEmail,
    subject: approved ? "Your ArchNG practice is verified" : "ArchNG verification update",
    text: `Hello ${provider.user?.name || provider.firm},\n\n${
      approved
        ? "Your practice has been verified. Your public profile can now be published."
        : "The review team could not approve your verification in its current form."
    }${note ? `\n\nReviewer note: ${note}` : ""}\n\nArchNG`,
  });
};

export const emailWelcome = async (user) => {
  const isProvider = user.role === "PROVIDER";
  await sendEmail({
    to: user.email,
    subject: isProvider ? "Your ArchNG practice account is ready" : "Welcome to ArchNG",
    text: isProvider
      ? `Hello ${user.name},\n\nYour ArchNG practice account${
          user.provider?.firm ? ` for ${user.provider.firm}` : ""
        } has been created successfully.\n\nComplete your practice profile and submit your verification documents so the review team can assess your listing.\n\nArchNG`
      : `Hello ${user.name},\n\nYour ArchNG client account has been created successfully.\n\nYou can now browse verified practices and send a commission request when you are ready.\n\nArchNG`,
  });
};

export const emailNewRequest = async ({ provider, client, request }) => {
  await sendEmail({
    to: provider.user?.email || provider.contactEmail,
    subject: `New ArchNG request from ${client.name}`,
    text: `Hello ${provider.firm},\n\n${client.name} has sent a ${request.projectType} request for ${request.state}.\n\nBrief: ${request.brief}\n\nSign in to review the request and respond within the preference window.\n\nArchNG`,
  });
};

export const emailRequestStatus = async ({ client, provider, request }) => {
  const labels = {
    REQUESTED: "requested",
    ACCEPTED: "accepted",
    DECLINED: "declined",
    CANCELLED: "cancelled",
    COMPLETED: "completed",
  };
  await sendEmail({
    to: client.email,
    subject: `Your ArchNG request with ${provider.firm} was ${labels[request.status] || request.status}`,
    text: `Hello ${client.name},\n\nYour ${request.projectType} request with ${provider.firm} is now ${
      labels[request.status] || request.status
    }.${request.providerNote ? `\n\nNote from the practice: ${request.providerNote}` : ""}\n\nArchNG`,
  });
};
