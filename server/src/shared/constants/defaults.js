/**
 * Fallback support inbox address used only when no admin has configured
 * a support email yet (via CRM Settings) and DEFAULT_SUPPORT_EMAIL is
 * not set in the environment. Never a personal address — this is what
 * every fresh deployment starts with.
 */
export const DEFAULT_SUPPORT_EMAIL =
  process.env.DEFAULT_SUPPORT_EMAIL || "support@teleclinic.com";

/**
 * Fallback "From" address for outgoing transactional email, used only when
 * no admin has configured one (via CRM Settings) and MAIL_FROM is not set
 * in the environment.
 */
export const DEFAULT_MAIL_FROM =
  process.env.MAIL_FROM || "TeleClinic Support <noreply@teleclinic.com>";
