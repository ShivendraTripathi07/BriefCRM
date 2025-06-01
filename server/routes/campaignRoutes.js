const express = require("express");
const router = express.Router();
const {
  getAudiencePreview,
  createCampaign,
  getCampaignHistory,
  handleDeliveryReceipt,
  vendorSendMessage,
  campaignValidationRules,
} = require("../controllers/campaignCommunicationController");

// Middleware for authentication
const authenticateUser  = require("../middleware/auth");

// Public routes (no authentication required)
// POST /api/delivery-receipt - Webhook for delivery status updates
router.post("/delivery-receipt", handleDeliveryReceipt);

// POST /api/vendor/send - Dummy vendor API for testing
router.post("/vendor/send", vendorSendMessage);

// Protected routes (authentication required)
router.use(authenticateUser);

// POST /api/campaigns/audience/preview - Preview audience size
router.post("/audience/preview", campaignValidationRules(), getAudiencePreview);

// GET /api/campaigns/history - Get campaign history
router.get("/history", getCampaignHistory);

// POST /api/campaigns - Create and execute campaign
router.post("/", campaignValidationRules(), createCampaign);

module.exports = router;
