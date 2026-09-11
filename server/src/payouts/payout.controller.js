import {
  getDoctorEarningsService,
  getDoctorPayoutsService,
  requestDoctorPayoutService,
  getDoctorPayoutSettingsService,
  updateDoctorPayoutSettingsService,
  getAllPayoutsAdminService,
  updatePayoutStatusAdminService,
} from "./payout.service.js";

export const getEarnings = async (req, res) => {
  try {
    const data = await getDoctorEarningsService(req.doctor._id);
    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPayouts = async (req, res) => {
  try {
    const payouts = await getDoctorPayoutsService(req.doctor._id);
    return res.json({
      success: true,
      data: payouts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const requestPayout = async (req, res) => {
  try {
    const payout = await requestDoctorPayoutService(req.doctor._id, req.body);
    return res.status(201).json({
      success: true,
      message: "Payout withdrawal request submitted successfully.",
      data: payout,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPayoutSettings = async (req, res) => {
  try {
    const settings = await getDoctorPayoutSettingsService(req.doctor._id);
    return res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePayoutSettings = async (req, res) => {
  try {
    const settings = await updateDoctorPayoutSettingsService(
      req.doctor._id,
      req.body
    );
    return res.json({
      success: true,
      message: "Payout account settings saved successfully.",
      data: settings,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAdminPayouts = async (req, res) => {
  try {
    const payouts = await getAllPayoutsAdminService();
    return res.json({
      success: true,
      data: payouts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAdminPayoutStatus = async (req, res) => {
  try {
    const payout = await updatePayoutStatusAdminService(
      req.params.id,
      req.body
    );
    return res.json({
      success: true,
      message: `Payout marked as ${payout.status}.`,
      data: payout,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
