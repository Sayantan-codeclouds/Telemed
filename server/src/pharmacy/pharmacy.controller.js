import asyncHandler from "../shared/utils/asyncHandler.js";
import {
  getMedicinesService,
  getMedicineByIdService,
  createOrderService,
  getPatientOrdersService,
  getAllOrdersAdminService,
} from "./pharmacy.service.js";

import { getCrmSettingsService } from "./vrio.service.js";

export const getPublicPharmacySettings = asyncHandler(async (req, res) => {
  const settings = await getCrmSettingsService();
  res.status(200).json({
    success: true,
    data: {
      currencySign: settings.currencySign || "$",
      isEnabled: settings.isEnabled,
      isTestMode: settings.isTestMode,
      consultationItemId: settings.consultationItemId || 3366,
      consultationOfferId: settings.consultationOfferId || 29,
    },
  });
});

export const getMedicines = asyncHandler(async (req, res) => {
  const medicines = await getMedicinesService(req.query);
  const settings = await getCrmSettingsService();
  res.status(200).json({
    success: true,
    data: medicines,
    currencySign: settings.currencySign || "$",
  });
});

export const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await getMedicineByIdService(req.params.id);
  res.status(200).json({
    success: true,
    data: medicine,
  });
});

export const createOrder = asyncHandler(async (req, res) => {
  const clientIp =
    req.body.ip_address ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "127.0.0.1";
  const userAgent = req.body.user_agent || req.headers["user-agent"] || "Mozilla/5.0";
  const sessionId = req.body.session_id || req.sessionID || `sess_${Date.now().toString(36)}`;

  const orderData = {
    ...req.body,
    ip_address: clientIp,
    user_agent: userAgent,
    session_id: sessionId,
  };

  const order = await createOrderService(req.patient._id, orderData);
  res.status(201).json({
    success: true,
    message: "Order placed successfully!",
    data: order,
  });
});

export const getPatientOrders = asyncHandler(async (req, res) => {
  const orders = await getPatientOrdersService(req.patient._id);
  res.status(200).json({
    success: true,
    data: orders,
  });
});

export const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const orders = await getAllOrdersAdminService();
  res.status(200).json({
    success: true,
    data: orders,
  });
});
