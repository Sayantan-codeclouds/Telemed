import asyncHandler from "../shared/utils/asyncHandler.js";
import {
  getActiveSpecializationsService,
  getAllSpecializationsAdminService,
  createSpecializationService,
  updateSpecializationService,
  deleteSpecializationService,
  toggleSpecializationStatusService,
} from "./specialization.service.js";

/**
 * Public: Get active specializations
 */
export const getActiveSpecializations = asyncHandler(async (req, res) => {
  const list = await getActiveSpecializationsService();
  res.status(200).json({
    success: true,
    data: list,
  });
});

/**
 * Admin: Get all specializations with doctor counts
 */
export const getAllSpecializationsAdmin = asyncHandler(async (req, res) => {
  const list = await getAllSpecializationsAdminService();
  res.status(200).json({
    success: true,
    data: list,
  });
});

/**
 * Admin: Create specialization
 */
export const createSpecialization = asyncHandler(async (req, res) => {
  const item = await createSpecializationService(req.body);
  res.status(201).json({
    success: true,
    message: `Specialization "${item.name}" created successfully!`,
    data: item,
  });
});

/**
 * Admin: Update specialization
 */
export const updateSpecialization = asyncHandler(async (req, res) => {
  const item = await updateSpecializationService(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: `Specialization "${item.name}" updated successfully!`,
    data: item,
  });
});

/**
 * Admin: Delete specialization
 */
export const deleteSpecialization = asyncHandler(async (req, res) => {
  const result = await deleteSpecializationService(req.params.id);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * Admin: Toggle active status
 */
export const toggleSpecializationStatus = asyncHandler(async (req, res) => {
  const item = await toggleSpecializationStatusService(req.params.id);
  res.status(200).json({
    success: true,
    message: `Specialization "${item.name}" is now ${item.isActive ? "Active" : "Inactive"}.`,
    data: item,
  });
});
