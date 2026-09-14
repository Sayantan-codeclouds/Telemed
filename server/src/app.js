import express from "express";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import errorHandler from "./shared/errors/errorHandler.js";
import patientRoutes from "./patients/patient.routes.js";
import doctorRoutes from "./doctors/doctor.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import appointmentRoutes from "./appointments/appointment.routes.js";
import adminRoutes from "./admin/admin.routes.js";
import prescriptionRoutes from "./prescriptions/prescription.routes.js";
import aiRoutes from "./ai/ai.routes.js";
import notificationRoutes from "./notifications/notification.routes.js";
import pharmacyRoutes from "./pharmacy/pharmacy.routes.js";
import vrioRoutes from "./modules/vrio/vrio.routes.js";
import reviewRoutes from "./reviews/review.routes.js";
import specializationRoutes from "./specializations/specialization.routes.js";
import couponRoutes from "./coupons/coupon.routes.js";
import giftCardRoutes from "./giftcards/giftcard.routes.js";
import supportRoutes from "./support/support.routes.js";
import labReportRoutes from "./lab-reports/labReport.routes.js";
import payoutRoutes from "./payouts/payout.routes.js";

const app = express();

/**
 * Global Middlewares
 */
app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

/**
 * Static Files — Profile images & uploads
 */
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "src", "uploads"))
);

/**
 * API Routes
 */
app.use("/api/chat", chatRoutes);

app.use(
  "/api/patients",
  patientRoutes
);

app.use(
  "/api",
  payoutRoutes
);

app.use(
  "/api/doctors",
  doctorRoutes
);

app.use(
  "/api/appointments",
  appointmentRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/prescriptions",
  prescriptionRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/pharmacy",
  pharmacyRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use(
  "/api/v1/vrio",
  vrioRoutes
);

app.use(
  "/api/vrio",
  vrioRoutes
);

app.use(
  "/api/specializations",
  specializationRoutes
);

app.use(
  "/api/coupons",
  couponRoutes
);

app.use(
  "/api/gift-cards",
  giftCardRoutes
);

app.use(
  "/api/support",
  supportRoutes
);

app.use(
  "/api/lab-reports",
  labReportRoutes
);

/** 
 * Health Check & Public System Settings
 */
app.get("/api/settings", async (req, res) => {
  try {
    const { getCrmSettingsService } = await import("./pharmacy/vrio.service.js");
    const settings = await getCrmSettingsService();
    return res.status(200).json({
      success: true,
      data: {
        currencySign: settings.currencySign || "$",
        supportEmail: settings.supportEmail || "sayantan.das@codeclouds.com",
        doctorSupportEmail: settings.doctorSupportEmail || "sayantan.das@codeclouds.com",
        isEnabled: settings.isEnabled,
      },
    });
  } catch (err) {
    return res.status(200).json({
      success: true,
      data: {
        currencySign: "$",
        supportEmail: "sayantan.das@codeclouds.com",
        doctorSupportEmail: "sayantan.das@codeclouds.com",
      },
    });
  }
});

app.get("/api/health", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "TeleClinic API is running 🚀",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    });
});

/**
 * Global Error Handler (must be registered last)
 */
app.use(errorHandler);

export default app;