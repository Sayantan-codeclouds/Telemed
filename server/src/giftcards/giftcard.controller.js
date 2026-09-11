import asyncHandler from "../shared/utils/asyncHandler.js";
import {
  getGiftCardsService,
  getGiftCardByIdService,
  createGiftCardService,
  updateGiftCardService,
  deleteGiftCardService,
  validateAndApplyGiftCardService,
} from "./giftcard.service.js";

export const getGiftCards = asyncHandler(async (req, res) => {
  const cards = await getGiftCardsService(req.query);
  res.status(200).json({
    success: true,
    data: cards,
  });
});

export const getGiftCard = asyncHandler(async (req, res) => {
  const card = await getGiftCardByIdService(req.params.id);
  res.status(200).json({
    success: true,
    data: card,
  });
});

export const createGiftCard = asyncHandler(async (req, res) => {
  const card = await createGiftCardService(req.body);
  res.status(201).json({
    success: true,
    message: `Gift card created successfully! Code: ${card.giftCardCode}`,
    data: card,
  });
});

export const updateGiftCard = asyncHandler(async (req, res) => {
  const card = await updateGiftCardService(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: `Gift card "${card.giftCardCode}" updated successfully!`,
    data: card,
  });
});

export const deleteGiftCard = asyncHandler(async (req, res) => {
  const result = await deleteGiftCardService(req.params.id);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

export const applyGiftCard = asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body;
  const result = await validateAndApplyGiftCardService({ code, orderTotal });
  res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});
