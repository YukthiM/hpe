const express = require('express');
const router = express.Router();
const { parseVoice, applyVoiceProfile } = require('../controllers/voiceController');
const { protect, requireRole } = require('../middleware/auth');

// POST /api/voice/parse  — parse transcript, return structured data (no auth needed for demo)
router.post('/parse', parseVoice);

// POST /api/voice/apply  — parse + save to logged-in worker profile
router.post('/apply', protect, requireRole('worker'), applyVoiceProfile);

module.exports = router;
