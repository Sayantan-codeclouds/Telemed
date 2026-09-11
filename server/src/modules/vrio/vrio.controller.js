import * as vrioService from "./vrio.service.js";

/**
 * POST /api/v1/vrio/orders
 * Create a new Vrio order (either step-1 pending or direct single-step process)
 */
export const createOrderHandler = async (req, res, next) => {
  try {
    const user = req.user || req.patient || req.admin;
    const order = await vrioService.createVrioOrder(req.body, user);

    return res.status(201).json({
      success: true,
      message:
        order.status === "COMPLETED"
          ? "Vrio order processed successfully."
          : "Vrio order created. Payment pending.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/vrio/orders/:orderId/process
 * Step 2: Process payment for an existing pending Vrio order
 */
export const processPaymentHandler = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const user = req.user || req.patient || req.admin;
    const order = await vrioService.processVrioPayment(orderId, req.body, user);

    return res.status(200).json({
      success: true,
      message: "Vrio order payment processed successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/vrio/orders/:orderId
 * Get details for a specific Vrio order
 */
export const getOrderHandler = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const user = req.user || req.patient || req.admin;
    const order = await vrioService.getVrioOrderById(orderId, user);

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/vrio/orders
 * List orders for the authenticated patient or all orders for admin
 */
export const listOrdersHandler = async (req, res, next) => {
  try {
    const user = req.user || req.patient || req.admin;
    const orders = await vrioService.listVrioOrders(req.query, user);

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/vrio/orders/from-prescription
 * Create Vrio Order directly from an existing prescription
 */
export const createFromPrescriptionHandler = async (req, res, next) => {
  try {
    const { prescriptionId } = req.body;
    const user = req.user || req.patient || req.admin;
    const order = await vrioService.createVrioOrderFromPrescription(
      prescriptionId,
      req.body,
      user
    );

    return res.status(201).json({
      success: true,
      message: "Vrio order created from prescription successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
