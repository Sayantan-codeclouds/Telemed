import asyncHandler from "../shared/utils/asyncHandler.js";
import {
  getAllCouponsService,
  getCouponByIdService,
  createCouponService,
  updateCouponService,
  deleteCouponService,
  validateAndApplyCouponService,
  validateVrioDiscountApiService,
} from "./coupon.service.js";

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await getAllCouponsService();
  res.status(200).json({
    success: true,
    data: coupons,
  });
});

export const getCoupon = asyncHandler(async (req, res) => {
  const coupon = await getCouponByIdService(req.params.id);
  res.status(200).json({
    success: true,
    data: coupon,
  });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await createCouponService(req.body);
  res.status(201).json({
    success: true,
    message: `Coupon "${coupon.code}" created successfully!`,
    data: coupon,
  });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await updateCouponService(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: `Coupon "${coupon.code}" updated successfully!`,
    data: coupon,
  });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const result = await deleteCouponService(req.params.id);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body;
  const result = await validateAndApplyCouponService({ code, orderTotal });
  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});

export const validateVrioDiscount = asyncHandler(async (req, res) => {
  const {
    campaign_id,
    offer_id,
    item_id,
    discount_code,
    gift_cards,
    session_id,
    ip_address,
    user_agent,
    order_notes,
    apiKey,
  } = req.body;

  const clientIp = ip_address || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";
  const clientUserAgent = user_agent || req.headers["user-agent"] || "Mozilla/5.0";

  const result = await validateVrioDiscountApiService({
    campaign_id,
    offer_id,
    item_id,
    discount_code,
    gift_cards,
    session_id: session_id || req.sessionID,
    ip_address: clientIp,
    user_agent: clientUserAgent,
    order_notes,
    apiKey,
  });
  res.status(200).json(result);
});
