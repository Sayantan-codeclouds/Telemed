export const verificationEmailTemplate = (
  firstName,
  verificationLink
) => `
<div style="font-family:Arial,sans-serif;padding:30px">
  <h2>Welcome to TeleClinic</h2>

  <p>Hello <b>${firstName}</b>,</p>

  <p>Please verify your email.</p>

  <a
    href="${verificationLink}"
    style="
      background:#2563eb;
      color:white;
      padding:12px 24px;
      text-decoration:none;
      border-radius:6px;
      display:inline-block;
    "
  >
    Verify Email
  </a>

  <p>If you didn't create this account, ignore this email.</p>
</div>
`;

export const recheckupReminderEmailTemplate = ({
  patientName,
  doctorName,
  doctorSpecialization,
  diagnosis,
  validityDays,
  recheckupDate,
  bookingUrl,
}) => `
<div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 15px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 12px 35px rgba(99, 102, 241, 0.08); border: 1px solid #e2e8f0;">
    <!-- Sweet Header Banner -->
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%); padding: 40px 30px; text-align: center; color: #ffffff;">
      <div style="font-size: 36px; margin-bottom: 12px;">🌸 🩺 🌿</div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">How Are You Feeling Today?</h1>
      <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.95; font-weight: 500;">A gentle, caring check-in from Dr. ${doctorName}</p>
    </div>

    <!-- Body -->
    <div style="padding: 36px 32px; color: #334155; line-height: 1.75;">
      <p style="font-size: 17px; font-weight: 700; color: #0f172a; margin-top: 0;">
        Dear ${patientName || "Friend"},
      </p>

      <p style="font-size: 14px; color: #475569;">
        We hope you are having a peaceful day and that your recovery journey has been going wonderfully! 🌼
      </p>

      <p style="font-size: 14px; color: #475569;">
        It has been <strong>${validityDays || 14} days</strong> since your consultation with <strong>Dr. ${doctorName}</strong> (${doctorSpecialization || "Specialist"}). Your prescription validity window has reached its scheduled follow-up period on <strong>${recheckupDate}</strong>${diagnosis ? ` for <em>${diagnosis}</em>` : ""}.
      </p>

      <!-- Sweet Care Card -->
      <div style="background: #f8fafc; border-left: 4px solid #6366f1; border-radius: 16px; padding: 20px 22px; margin: 26px 0; border: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 8px; font-size: 14px; color: #1e293b; font-weight: 800; display: flex; align-items: center; gap: 6px;">
          💖 Doctor's Recheckup Note
        </h4>
        <p style="margin: 0; font-size: 13.5px; color: #475569; font-style: italic; line-height: 1.6;">
          "Your health, recovery, and comfort mean the world to us. A quick recheckup allows us to review your progress, verify how your prescribed treatment has worked, and ensure you're on the absolute best path to complete wellness."
        </p>
      </div>

      <div style="text-align: center; margin: 36px 0 24px;">
        <a href="${bookingUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; padding: 15px 36px; border-radius: 16px; text-decoration: none; font-weight: 800; font-size: 14px; box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35); letter-spacing: 0.2px;">
          Schedule Your Recheckup Consultation ✨
        </a>
      </div>

      <p style="font-size: 12.5px; color: #94a3b8; text-align: center; margin-top: 25px; line-height: 1.6;">
        If you are already feeling 100% recovered, we celebrate your vibrant health! If any questions or symptoms linger, Dr. ${doctorName} is always here to support you.
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; padding: 22px 30px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
      With warmest care & well wishes,<br/>
      <strong style="color: #475569; font-size: 13px;">Dr. ${doctorName} & the TeleClinic Care Team</strong>
    </div>
  </div>
</div>
`;

export const orderInvoiceEmailTemplate = ({
  order,
  patientName,
  currencySign = "$",
  supportEmail = "sayantan.das@codeclouds.com",
  orderRef,
  frontendUrl = "http://localhost:5173",
}) => {
  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const discountAmount = order.discountAmount || 0;
  const totalAmount = order.totalAmount ?? Math.max(0, subtotal - discountAmount);
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const shipping = order.shippingAddress || {};
  const billing = order.billingDetails || {};
  const cardLast4 = billing.cardLast4 || "4444";
  const cardType = (billing.cardType || "Visa").toUpperCase();

  const itemsRowsHtml = items
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #f1f5f9; ${idx % 2 === 0 ? "background-color: #ffffff;" : "background-color: #f8fafc;"}">
        <td style="padding: 14px 16px; font-size: 13px; color: #1e293b; font-weight: 600;">
          ${item.name}
          ${item.dosage ? `<div style="font-size: 11px; color: #64748b; font-weight: 400; margin-top: 2px;">Dosage: ${item.dosage}</div>` : ""}
        </td>
        <td style="padding: 14px 16px; font-size: 13px; color: #475569; text-align: center; font-weight: 600;">
          ${item.quantity || 1}
        </td>
        <td style="padding: 14px 16px; font-size: 13px; color: #475569; text-align: right; font-weight: 600;">
          ${currencySign}${Number(item.price || 0).toFixed(2)}
        </td>
        <td style="padding: 14px 16px; font-size: 13px; color: #0f172a; text-align: right; font-weight: 700;">
          ${currencySign}${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pharmacy Order Invoice #${orderRef}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 30px 15px; -webkit-font-smoothing: antialiased;">
    <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
      
      <!-- Top Branding Header -->
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%); padding: 36px 32px; color: #ffffff;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: middle;">
              <div style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">
                💊 TeleClinic Pharmacy
              </div>
              <div style="font-size: 13px; color: #c7d2fe; margin-top: 4px; font-weight: 500;">
                Certified Telemedicine Prescription Fulfillment
              </div>
            </td>
            <td style="vertical-align: middle; text-align: right;">
              <span style="background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); color: #ffffff; padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                PAID &amp; CONFIRMED
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Order Metadata Strip -->
      <div style="background: #f8fafc; padding: 18px 32px; border-bottom: 1px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="color: #64748b;">
              Order Reference: <strong style="color: #0f172a; font-family: monospace; font-size: 13px;">#${orderRef}</strong>
            </td>
            <td style="text-align: right; color: #64748b;">
              Date: <strong style="color: #0f172a;">${orderDate}</strong>
            </td>
          </tr>
        </table>
      </div>

      <!-- Main Body -->
      <div style="padding: 32px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 16px;">
          Thank you for your order, ${patientName}!
        </h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px;">
          Your prescription medicines have been received, verified, and sent for fulfillment. Below is your official invoice and payment receipt.
        </p>

        <!-- Customer & Shipping Summary Grid -->
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 28px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
          <tr>
            <td style="width: 50%; padding: 18px; vertical-align: top; border-right: 1px solid #e2e8f0;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6366f1; letter-spacing: 0.5px; margin-bottom: 6px;">
                📍 Shipping Destination
              </div>
              <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${patientName}</div>
              <div style="font-size: 12px; color: #475569; margin-top: 3px; line-height: 1.4;">
                ${shipping.line1 || "Standard Address"}<br/>
                ${shipping.city || ""}${shipping.city && shipping.state ? ", " : ""}${shipping.state || ""} ${shipping.pincode || ""}<br/>
                ${shipping.country || "US"}
              </div>
            </td>
            <td style="width: 50%; padding: 18px; vertical-align: top;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6366f1; letter-spacing: 0.5px; margin-bottom: 6px;">
                💳 Payment Summary
              </div>
              <div style="font-size: 13px; font-weight: 700; color: #0f172a;">
                ${cardType} (•••• ${cardLast4})
              </div>
              <div style="font-size: 12px; color: #475569; margin-top: 3px; line-height: 1.4;">
                Payment Status: <strong style="color: #16a34a;">PAID</strong><br/>
                Gateway: Vrio CRM Secure Checkout<br/>
                Fulfillment: Dispatch in 24-48 Hours
              </div>
            </td>
          </tr>
        </table>

        <!-- Itemized Table -->
        <div style="border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; font-weight: 800;">
                <th style="padding: 12px 16px; text-align: left;">Item Description</th>
                <th style="padding: 12px 16px; text-align: center;">Qty</th>
                <th style="padding: 12px 16px; text-align: right;">Unit Price</th>
                <th style="padding: 12px 16px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- Cost Breakdown Calculation -->
        <div style="background: #fafafa; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 28px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Subtotal</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #0f172a;">
                ${currencySign}${subtotal.toFixed(2)}
              </td>
            </tr>
            ${
              discountAmount > 0
                ? `
            <tr>
              <td style="padding: 6px 0; color: #16a34a; font-weight: 600;">
                Discount ${order.discountLabel ? `(${order.discountLabel})` : ""}
              </td>
              <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #16a34a;">
                -${currencySign}${discountAmount.toFixed(2)}
              </td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Standard Tracked Delivery</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 700; color: #16a34a;">
                FREE
              </td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 12px 0 4px; font-size: 15px; font-weight: 800; color: #0f172a;">Total Paid</td>
              <td style="padding: 12px 0 4px; text-align: right; font-size: 20px; font-weight: 900; color: #4338ca;">
                ${currencySign}${totalAmount.toFixed(2)}
              </td>
            </tr>
          </table>
        </div>

        <!-- Action CTA Button -->
        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${frontendUrl}/patient/orders" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); color: #ffffff; padding: 14px 32px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 14px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);">
            Track My Order in Patient Portal →
          </a>
        </div>

        <!-- Medical & Support Notice -->
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 12px; padding: 14px 18px; font-size: 12px; color: #166534; line-height: 1.5;">
          <strong>Clinical Verification:</strong> All pharmacy items are inspected by certified pharmacists before dispatch. If you have questions about your medications or need assistance, contact our pharmacy help desk at <a href="mailto:${supportEmail}" style="color: #15803d; font-weight: 700;">${supportEmail}</a>.
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; padding: 22px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
        <p style="margin: 0 0 6px;">© ${new Date().getFullYear()} TeleClinic Telemedicine &amp; Pharmacy Services. All rights reserved.</p>
        <p style="margin: 0;">This email serves as an official electronic receipt for pharmacy order #${orderRef}.</p>
      </div>

    </div>
  </body>
  </html>
  `;
};
