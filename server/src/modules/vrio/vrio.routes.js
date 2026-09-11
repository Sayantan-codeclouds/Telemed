import express from "express";
import * as vrioController from "./vrio.controller.js";
import { authenticateAny } from "../../shared/middleware/authenticateAny.js";
import validate from "../../shared/middleware/validate.js";
import {
  createVrioOrderSchema,
  processVrioPaymentSchema,
  createFromPrescriptionSchema,
} from "./vrio.validation.js";

const router = express.Router();

// Order creation (direct single-step or step-1 pending)
router.post(
  "/orders",
  authenticateAny,
  validate(createVrioOrderSchema),
  vrioController.createOrderHandler
);

// Order creation from existing prescription
router.post(
  "/orders/from-prescription",
  authenticateAny,
  validate(createFromPrescriptionSchema),
  vrioController.createFromPrescriptionHandler
);

// Step-2 payment processing for a pending order
router.post(
  "/orders/:orderId/process",
  authenticateAny,
  validate(processVrioPaymentSchema),
  vrioController.processPaymentHandler
);

// Get single order by ID
router.get(
  "/orders/:orderId",
  authenticateAny,
  vrioController.getOrderHandler
);

// List orders
router.get(
  "/orders",
  authenticateAny,
  vrioController.listOrdersHandler
);

export default router;
