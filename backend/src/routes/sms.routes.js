import express from 'express';
import { handleInboundSms } from '../controllers/sms.controller.js';

const router = express.Router();

// ⚠️ This route is NOT behind JWT auth middleware.
// SMS senders have no JWT — security is enforced via Twilio signature validation
// in the controller. Do NOT add `protect` middleware here.
router.post('/inbound', express.urlencoded({ extended: false }), handleInboundSms);

export default router;
