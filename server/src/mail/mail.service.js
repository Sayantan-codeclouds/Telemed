import { Resend } from "resend";
import sgMail from "@sendgrid/mail";
import postmarkPkg from "postmark";
import nodemailer from "nodemailer";
import {
  verificationEmailTemplate,
  recheckupReminderEmailTemplate,
  orderInvoiceEmailTemplate,
} from "./mail.templates.js";
import { getCrmSettingsService } from "../pharmacy/vrio.service.js";

const PostmarkClient = postmarkPkg.ServerClient || postmarkPkg.default?.ServerClient || postmarkPkg;

/**
 * Dynamically resolves active mail provider configuration from Admin Settings (MongoDB)
 * with graceful fallback to process.env
 */
export async function getMailConfig() {
  let provider = "resend";
  let apiKey = "";
  let mailFrom = "TeleClinic Support <noreply@sayantandas.in>";
  let smtp = {
    host: "",
    port: 587,
    user: "",
    pass: "",
    secure: false,
  };

  try {
    const settings = await getCrmSettingsService();
    if (settings) {
      if (settings.mailProvider) {
        provider = settings.mailProvider.trim().toLowerCase();
      }

      // API Key resolution with fallback
      if (settings.mailApiKey && settings.mailApiKey.trim()) {
        apiKey = settings.mailApiKey.trim();
      } else if (settings.resendApiKey && settings.resendApiKey.trim()) {
        apiKey = settings.resendApiKey.trim();
      }

      // From email resolution
      if (settings.mailFromEmail && settings.mailFromEmail.trim()) {
        mailFrom = settings.mailFromEmail.trim();
      } else if (settings.resendFromEmail && settings.resendFromEmail.trim()) {
        mailFrom = settings.resendFromEmail.trim();
      }

      // SMTP settings
      smtp = {
        host: settings.smtpHost ? settings.smtpHost.trim() : "",
        port: Number(settings.smtpPort) || 587,
        user: settings.smtpUser ? settings.smtpUser.trim() : "",
        pass: settings.smtpPass ? settings.smtpPass.trim() : "",
        secure: Boolean(settings.smtpSecure),
      };
    }
  } catch (err) {
    console.warn("[Mail Service] Could not load mail settings from DB:", err.message);
  }

  // Fallbacks to process.env if still unset
  if (!apiKey) {
    if (provider === "resend" && process.env.RESEND_API_KEY) {
      apiKey = process.env.RESEND_API_KEY.trim();
    } else if (provider === "sendgrid" && process.env.SENDGRID_API_KEY) {
      apiKey = process.env.SENDGRID_API_KEY.trim();
    } else if (provider === "postmark" && process.env.POSTMARK_SERVER_TOKEN) {
      apiKey = process.env.POSTMARK_SERVER_TOKEN.trim();
    }
  }

  if (mailFrom === "TeleClinic Support <noreply@sayantandas.in>" && process.env.MAIL_FROM) {
    mailFrom = process.env.MAIL_FROM.trim();
  }

  return { provider, apiKey, mailFrom, smtp };
}

/**
 * Universal email dispatcher that routes to the configured provider:
 * - Resend
 * - SendGrid
 * - Postmark
 * - Custom SMTP (Nodemailer)
 */
export async function sendMailWithProvider({ to, subject, html, text }) {
  const config = await getMailConfig();
  const { provider, apiKey, mailFrom, smtp } = config;

  if (provider === "resend") {
    if (!apiKey) {
      console.warn("[Mail Service] Resend API key is not configured. Skipping email.");
      return null;
    }
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: mailFrom,
      to,
      subject,
      html,
      text: text || undefined,
    });
    if (error) {
      throw new Error(error.message || "Resend email delivery failed");
    }
    return { success: true, provider: "resend", messageId: data?.id, data };
  }

  if (provider === "sendgrid") {
    if (!apiKey) {
      console.warn("[Mail Service] SendGrid API key is not configured. Skipping email.");
      return null;
    }
    const sg = sgMail.default || sgMail;
    sg.setApiKey(apiKey);
    const [response] = await sg.send({
      to,
      from: mailFrom,
      subject,
      html,
      text: text || undefined,
    });
    return {
      success: true,
      provider: "sendgrid",
      messageId: response?.headers?.["x-message-id"] || "delivered",
      statusCode: response?.statusCode,
    };
  }

  if (provider === "postmark") {
    if (!apiKey) {
      console.warn("[Mail Service] Postmark Server Token is not configured. Skipping email.");
      return null;
    }
    const client = new PostmarkClient(apiKey);
    const response = await client.sendEmail({
      From: mailFrom,
      To: to,
      Subject: subject,
      HtmlBody: html,
      TextBody: text || undefined,
    });
    return {
      success: true,
      provider: "postmark",
      messageId: response?.MessageID,
      data: response,
    };
  }

  if (provider === "smtp") {
    if (!smtp.host) {
      console.warn("[Mail Service] SMTP Host is not configured. Skipping email.");
      return null;
    }
    const transportOptions = {
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure, // true for 465, false for 587/25
    };
    if (smtp.user) {
      transportOptions.auth = {
        user: smtp.user,
        pass: smtp.pass,
      };
    }
    const transporter = nodemailer.createTransport(transportOptions);
    const info = await transporter.sendMail({
      from: mailFrom,
      to,
      subject,
      html,
      text: text || undefined,
    });
    return {
      success: true,
      provider: "smtp",
      messageId: info?.messageId,
      info,
    };
  }

  throw new Error(`Unsupported email provider: "${provider}"`);
}

/**
 * Resolves the active frontend domain dynamically from CRM settings or environment
 */
export const getEffectiveFrontendUrl = async () => {
  try {
    const settings = await getCrmSettingsService();
    if (settings?.frontendUrl && settings.frontendUrl.trim()) {
      return settings.frontendUrl.trim().replace(/\/+$/, "");
    }
  } catch (_) {}
  return (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
};

/**
 * Send a verification email to a newly registered doctor
 */
export const sendDoctorVerificationEmail = async (email, token) => {
  const frontendUrl = await getEffectiveFrontendUrl();
  const verificationLink = `${frontendUrl}/doctor/verify-email?token=${token}`;

  return await sendMailWithProvider({
    to: email,
    subject: "Verify your TeleMed Doctor Account",
    html: `
      <div style="font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
        <div style="background:#16a34a;padding:20px;border-radius:8px;text-align:center;color:#ffffff;">
          <h2 style="margin:0;font-size:22px;">Welcome to TeleMed</h2>
          <p style="margin:5px 0 0;font-size:13px;color:#dcfce7;">Doctor Account Registration</p>
        </div>
        <div style="padding:24px 8px;color:#1e293b;">
          <p>Thank you for registering as a healthcare provider on TeleMed.</p>
          <p>Please verify your email address to activate your clinical portal.</p>
          <div style="margin:24px 0;text-align:center;">
            <a
              href="${verificationLink}"
              style="
                display:inline-block;
                background:#16a34a;
                color:#ffffff;
                padding:14px 28px;
                border-radius:8px;
                text-decoration:none;
                font-weight:bold;
                font-size:14px;
              "
            >
              Verify Doctor Email →
            </a>
          </div>
          <p style="margin-top:20px;font-size:12px;color:#64748b;">
            This verification link will expire in <b>24 hours</b>. If you did not create this account, please disregard this email.
          </p>
        </div>
      </div>
    `,
  });
};

/**
 * Send a verification email to a patient
 */
export const sendPatientVerificationEmail = async (patient, verificationToken) => {
  const frontendUrl = await getEffectiveFrontendUrl();
  const verificationLink = `${frontendUrl}/patient/verify-email?token=${verificationToken}`;

  return await sendMailWithProvider({
    to: patient.email,
    subject: "Verify Your TeleClinic Account",
    html: verificationEmailTemplate(patient.firstName, verificationLink),
  });
};

/**
 * Send password reset email to patient
 */
export const sendResetPasswordEmail = async (email, token) => {
  const frontendUrl = await getEffectiveFrontendUrl();
  const resetLink = `${frontendUrl}/patient/reset-password?token=${token}`;

  return await sendMailWithProvider({
    to: email,
    subject: "Reset your TeleMed password",
    html: `
      <div style="font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
        <div style="background:#2563eb;padding:20px;border-radius:8px;text-align:center;color:#ffffff;">
          <h2 style="margin:0;font-size:22px;">Password Reset Request</h2>
          <p style="margin:5px 0 0;font-size:13px;color:#dbeafe;">TeleMed Patient Portal</p>
        </div>
        <div style="padding:24px 8px;color:#1e293b;">
          <p>We received a request to reset your password.</p>
          <p>Click the button below to establish a new secure password.</p>
          <div style="margin:24px 0;text-align:center;">
            <a
              href="${resetLink}"
              style="
                display:inline-block;
                background:#2563eb;
                color:#ffffff;
                padding:14px 28px;
                border-radius:8px;
                text-decoration:none;
                font-weight:bold;
                font-size:14px;
              "
            >
              Reset Password →
            </a>
          </div>
          <p style="margin-top:20px;font-size:12px;color:#64748b;">
            This link will expire in <b>1 hour</b>. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};

/**
 * Send password reset email to doctor
 */
export const sendDoctorResetPasswordEmail = async (email, token) => {
  const frontendUrl = await getEffectiveFrontendUrl();
  const resetLink = `${frontendUrl}/doctor/reset-password?token=${token}`;

  return await sendMailWithProvider({
    to: email,
    subject: "Reset your TeleMed Doctor Password",
    html: `
      <div style="font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
        <div style="background:#16a34a;padding:20px;border-radius:8px;text-align:center;color:#ffffff;">
          <h2 style="margin:0;font-size:22px;">Password Reset Request</h2>
          <p style="margin:5px 0 0;font-size:13px;color:#dcfce7;">TeleMed Doctor Portal</p>
        </div>
        <div style="padding:24px 8px;color:#1e293b;">
          <p>We received a request to reset your doctor account credentials.</p>
          <p>Click the button below to create a new password.</p>
          <div style="margin:24px 0;text-align:center;">
            <a
              href="${resetLink}"
              style="
                display:inline-block;
                background:#16a34a;
                color:#ffffff;
                padding:14px 28px;
                border-radius:8px;
                text-decoration:none;
                font-weight:bold;
                font-size:14px;
              "
            >
              Reset Doctor Password →
            </a>
          </div>
          <p style="margin-top:20px;font-size:12px;color:#64748b;">
            This link expires in <b>1 hour</b>. If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};

/**
 * Send recheckup reminder email to patient
 */
export const sendRecheckupReminderEmail = async ({
  patientEmail,
  patientName,
  doctorName,
  doctorSpecialization,
  diagnosis,
  validityDays,
  recheckupDate,
  bookingUrl,
}) => {
  const frontendUrl = await getEffectiveFrontendUrl();
  const html = recheckupReminderEmailTemplate({
    patientName,
    doctorName,
    doctorSpecialization,
    diagnosis,
    validityDays,
    recheckupDate,
    bookingUrl: bookingUrl || `${frontendUrl}/patient/doctors`,
  });

  return await sendMailWithProvider({
    to: patientEmail,
    subject: `🌸 Gentle Health Check-in: Time for your Recheckup with Dr. ${doctorName}`,
    html,
  });
};

/**
 * Support ticket created confirmation email to user
 */
export const sendSupportTicketCreatedEmail = async ({
  email,
  name,
  ticketId,
  subject,
  category,
  priority,
  message,
}) => {
  try {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:25px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
        <div style="background:#1e1b4b;padding:20px;border-radius:8px;text-align:center;color:#ffffff;">
          <h2 style="margin:0;font-size:22px;">TeleClinic Support</h2>
          <p style="margin:5px 0 0;font-size:13px;color:#a5b4fc;">Help Request Received</p>
        </div>

        <div style="padding:20px 5px;color:#1e293b;">
          <p style="font-size:15px;">Hello <b>${name || "Valued User"}</b>,</p>
          <p style="font-size:14px;line-height:1.6;color:#475569;">
            We have received your support request. Our clinical and technical support team is reviewing it and will get back to you promptly.
          </p>

          <div style="background:#f8fafc;padding:16px;border-radius:8px;border-left:4px solid #4f46e5;margin:20px 0;">
            <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Ticket Reference: <b style="color:#1e1b4b;font-size:15px;">#${ticketId}</b></p>
            <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Subject: <b style="color:#0f172a;">${subject}</b></p>
            <p style="margin:0 0 8px;font-size:13px;color:#64748b;">Category: <span style="background:#e0e7ff;color:#3730a3;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;">${category}</span></p>
            <p style="margin:0;font-size:13px;color:#64748b;">Priority: <span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;">${priority}</span></p>
          </div>

          <div style="background:#ffffff;border:1px dashed #cbd5e1;padding:14px;border-radius:8px;">
            <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;text-transform:uppercase;font-weight:bold;">Your Message:</p>
            <p style="margin:0;font-size:13px;color:#334155;white-space:pre-line;">${message}</p>
          </div>

          <p style="font-size:13px;color:#64748b;margin-top:25px;">
            You can check the real-time status of your support request directly within your portal dashboard under the <b>Help & Support</b> section.
          </p>
        </div>

        <div style="border-top:1px solid #e2e8f0;padding-top:15px;text-align:center;font-size:11px;color:#94a3b8;">
          <p>© ${new Date().getFullYear()} TeleClinic Support Desk. All healthcare services encrypted.</p>
        </div>
      </div>
    `;

    const res = await sendMailWithProvider({
      to: email,
      subject: `[Ticket #${ticketId}] Support Request Received: ${subject}`,
      html,
    });
    console.log("[Mail Service] User confirmation email sent to:", email, "provider:", res?.provider);
    return res;
  } catch (err) {
    console.error("[Mail Service] Failed to send support ticket email:", err?.message || err);
  }
};

/**
 * Alert admin about a new support ticket
 */
export const sendAdminSupportTicketAlertEmail = async ({
  adminEmail = "sayantan.das@codeclouds.com",
  ticketId,
  name,
  senderEmail,
  senderPhone,
  senderType = "Patient",
  category,
  priority,
  subject,
  message,
}) => {
  try {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:25px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
        <div style="background:#0f172a;padding:20px;border-radius:8px;text-align:center;color:#ffffff;">
          <h2 style="margin:0;font-size:20px;">🚨 New Support Ticket Alert</h2>
          <p style="margin:5px 0 0;font-size:13px;color:#94a3b8;">Ticket #${ticketId} • Priority: <b style="color:#f87171;">${priority}</b></p>
        </div>

        <div style="padding:20px 5px;color:#1e293b;">
          <p style="font-size:14px;line-height:1.6;color:#334155;">
            A new support inquiry has been submitted by <b>${name}</b> (${senderType}).
          </p>

          <div style="background:#f8fafc;padding:16px;border-radius:8px;border-left:4px solid #3b82f6;margin:16px 0;font-size:13px;line-height:1.8;">
            <p style="margin:0;"><b>Submitter:</b> ${name} (${senderType})</p>
            <p style="margin:0;"><b>Email:</b> <a href="mailto:${senderEmail}" style="color:#2563eb;">${senderEmail}</a></p>
            ${senderPhone ? `<p style="margin:0;"><b>Phone:</b> ${senderPhone}</p>` : ""}
            <p style="margin:0;"><b>Category:</b> ${category}</p>
            <p style="margin:0;"><b>Priority:</b> <span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:4px;font-weight:bold;font-size:11px;">${priority}</span></p>
            <p style="margin:0;"><b>Subject:</b> ${subject}</p>
          </div>

          <div style="background:#ffffff;border:1px solid #e2e8f0;padding:14px;border-radius:8px;">
            <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:bold;text-transform:uppercase;">Inquiry Description:</p>
            <p style="margin:0;font-size:13px;color:#0f172a;line-height:1.5;white-space:pre-line;">${message}</p>
          </div>

          <div style="margin-top:24px;text-align:center;">
            <a href="${await getEffectiveFrontendUrl()}/admin/support" style="display:inline-block;background:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;">
              Open in Admin Support Desk →
            </a>
          </div>
        </div>

        <div style="border-top:1px solid #e2e8f0;padding-top:15px;text-align:center;font-size:11px;color:#94a3b8;">
          <p>© ${new Date().getFullYear()} TeleClinic Support Desk System Notification</p>
        </div>
      </div>
    `;

    const res = await sendMailWithProvider({
      to: adminEmail,
      subject: `[New Ticket #${ticketId}] [${priority}] ${subject} - ${name} (${senderType})`,
      html,
    });
    console.log("[Mail Service] Admin support alert email sent to:", adminEmail, "provider:", res?.provider);
    return res;
  } catch (err) {
    console.error("[Mail Service] Failed to send admin support ticket email:", err?.message || err);
  }
};

/**
 * Support ticket resolved notification email
 */
export const sendSupportTicketResolvedEmail = async ({
  email,
  name,
  ticketId,
  subject,
  adminResponse,
  resolvedAt,
}) => {
  try {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:25px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
        <div style="background:#065f46;padding:20px;border-radius:8px;text-align:center;color:#ffffff;">
          <h2 style="margin:0;font-size:22px;">✓ Support Ticket Solved</h2>
          <p style="margin:5px 0 0;font-size:13px;color:#a7f3d0;">Ticket #${ticketId}</p>
        </div>

        <div style="padding:20px 5px;color:#1e293b;">
          <p style="font-size:15px;">Hello <b>${name || "Valued User"}</b>,</p>
          <p style="font-size:14px;line-height:1.6;color:#475569;">
            Your support request regarding "<b>${subject}</b>" has been marked as <b>SOLVED</b> by our team.
          </p>

          ${
            adminResponse
              ? `
            <div style="background:#ecfdf5;padding:16px;border-radius:8px;border-left:4px solid #059669;margin:20px 0;">
              <p style="margin:0 0 6px;font-size:12px;color:#047857;text-transform:uppercase;font-weight:bold;">Admin Resolution Response:</p>
              <p style="margin:0;font-size:14px;color:#064e3b;line-height:1.5;white-space:pre-line;">${adminResponse}</p>
            </div>
          `
              : ""
          }

          <p style="font-size:13px;color:#64748b;margin-top:20px;">
            If you need further assistance or your issue persists, please submit a new ticket or reply directly in your portal.
          </p>
        </div>

        <div style="border-top:1px solid #e2e8f0;padding-top:15px;text-align:center;font-size:11px;color:#94a3b8;">
          <p>© ${new Date().getFullYear()} TeleClinic Support Desk.</p>
        </div>
      </div>
    `;

    const res = await sendMailWithProvider({
      to: email,
      subject: `[Resolved - Ticket #${ticketId}] ${subject}`,
      html,
    });
    console.log("[Mail Service] User ticket resolved email sent to:", email, "provider:", res?.provider);
    return res;
  } catch (err) {
    console.error("[Mail Service] Failed to send support resolved email:", err?.message || err);
  }
};

/**
 * Send official pharmacy order invoice & receipt email to patient
 */
export const sendOrderInvoiceEmail = async (order) => {
  try {
    const settings = await getCrmSettingsService();
    const currencySign = settings?.currencySign || "$";
    const supportEmail = settings?.supportEmail || "sayantan.das@codeclouds.com";

    // Resolve recipient email: check patient.email first, then billingDetails.email
    const recipientEmail =
      order.patient?.email ||
      order.billingDetails?.email;

    if (!recipientEmail) {
      console.warn("[Mail Service] No recipient email found for order", order._id);
      return null;
    }

    const patientName =
      order.patient?.firstName
        ? `${order.patient.firstName} ${order.patient.lastName || ""}`.trim()
        : `${order.billingDetails?.fname || ""} ${order.billingDetails?.lname || ""}`.trim() || "Valued Customer";

    const orderRef = order.vrioOrderId || order.stickyCrmOrderId || order._id?.toString().slice(-8).toUpperCase();

    const frontendUrl = await getEffectiveFrontendUrl();
    const html = orderInvoiceEmailTemplate({
      order,
      patientName,
      currencySign,
      supportEmail,
      orderRef,
      frontendUrl,
    });

    const res = await sendMailWithProvider({
      to: recipientEmail,
      subject: `🧾 Pharmacy Order Invoice & Receipt [#${orderRef}] - TeleClinic`,
      html,
    });

    console.log(`[Mail Service] Order invoice email sent to ${recipientEmail} for order #${orderRef}. Provider: ${res?.provider}`);
    return { success: true, recipientEmail, messageId: res?.messageId, provider: res?.provider };
  } catch (err) {
    console.error("[Mail Service] Failed to send order invoice email:", err?.message || err);
    throw err;
  }
};

/**
 * Test email verification tool for Admin Portal
 */
export const sendTestEmailService = async (targetEmail) => {
  if (!targetEmail || !targetEmail.includes("@")) {
    throw new Error("A valid target email address is required.");
  }

  const config = await getMailConfig();
  const providerNames = {
    resend: "Resend Email API",
    sendgrid: "Twilio SendGrid API",
    postmark: "Postmark Transactional API",
    smtp: "Custom SMTP Server",
  };
  const providerDisplay = providerNames[config.provider] || config.provider;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;">
      <div style="background:linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);padding:24px;border-radius:12px;text-align:center;color:#ffffff;">
        <h1 style="margin:0;font-size:22px;font-weight:800;">🎉 TeleMed Email Gateway Test</h1>
        <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">Provider Connection Verified Successfully</p>
      </div>

      <div style="padding:24px 8px;color:#1e293b;">
        <p style="font-size:15px;line-height:1.6;">
          Congratulations! Your TeleMed platform email gateway is operational and communicating properly.
        </p>

        <div style="background:#f8fafc;padding:18px;border-radius:10px;border:1px solid #e2e8f0;margin:20px 0;font-size:13px;line-height:1.9;">
          <p style="margin:0;"><b>Active Provider:</b> <span style="background:#e0e7ff;color:#4338ca;padding:2px 8px;border-radius:5px;font-weight:bold;">${providerDisplay}</span></p>
          <p style="margin:0;"><b>Sender (From):</b> <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;color:#0f172a;">${config.mailFrom}</code></p>
          <p style="margin:0;"><b>Recipient (To):</b> <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;color:#0f172a;">${targetEmail}</code></p>
          <p style="margin:0;"><b>Dispatched At:</b> ${new Date().toLocaleString()}</p>
        </div>

        <p style="font-size:13px;color:#64748b;line-height:1.5;">
          All clinical notifications, patient verification links, doctor credentials, and order receipts will now be dispatched seamlessly through this provider.
        </p>
      </div>

      <div style="border-top:1px solid #e2e8f0;padding-top:16px;text-align:center;font-size:11px;color:#94a3b8;">
        <p>© ${new Date().getFullYear()} TeleMed Healthcare System • Secure Email Dispatcher</p>
      </div>
    </div>
  `;

  const result = await sendMailWithProvider({
    to: targetEmail,
    subject: `✅ Test Email: ${providerDisplay} is Active on TeleMed`,
    html,
  });

  return {
    success: true,
    provider: config.provider,
    providerDisplay,
    recipient: targetEmail,
    sender: config.mailFrom,
    messageId: result?.messageId,
  };
};