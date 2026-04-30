const User = require('../models/User');
const Portfolio = require('../models/Portfolio');

// ─────────────────────────────────────────────────────────────────────────────
// Known skill taxonomy (extensible)
// ─────────────────────────────────────────────────────────────────────────────
const SKILL_MAP = {
  // Electrical
  electrician: ['Electrician', 'Electrical Wiring', 'Panel Installation'],
  electrical: ['Electrician', 'Electrical Wiring'],
  wiring: ['Electrical Wiring'],
  'circuit breaker': ['Circuit Breaker Installation'],
  switchboard: ['Switchboard Repair'],

  // Plumbing
  plumber: ['Plumber', 'Pipe Fitting', 'Leak Repair'],
  plumbing: ['Plumbing', 'Pipe Fitting'],
  pipe: ['Pipe Fitting', 'Pipe Installation'],
  drain: ['Drain Cleaning', 'Drainage'],
  'water heater': ['Water Heater Installation'],
  geyser: ['Geyser Installation', 'Geyser Repair'],

  // Carpentry
  carpenter: ['Carpenter', 'Wood Work', 'Furniture Making'],
  carpentry: ['Carpentry', 'Wood Work'],
  furniture: ['Furniture Making', 'Furniture Repair'],
  woodwork: ['Wood Work'],
  cabinet: ['Cabinet Making'],

  // Painting
  painter: ['Painter', 'Wall Painting', 'Texture Painting'],
  painting: ['Painting', 'Wall Painting'],
  'wall painting': ['Wall Painting'],
  'texture painting': ['Texture Painting'],

  // AC / Appliance
  ac: ['AC Repair', 'AC Installation', 'Air Conditioning'],
  'air conditioning': ['Air Conditioning', 'AC Repair'],
  refrigerator: ['Refrigerator Repair'],
  washing: ['Washing Machine Repair'],
  appliance: ['Appliance Repair'],

  // Masonry / Civil
  mason: ['Mason', 'Brickwork', 'Plastering'],
  masonry: ['Masonry', 'Brickwork'],
  tiling: ['Tiling', 'Tile Work'],
  tiles: ['Tile Work', 'Tiling'],
  plastering: ['Plastering'],
  brickwork: ['Brickwork'],

  // Welding
  welder: ['Welder', 'Metal Welding', 'Arc Welding'],
  welding: ['Welding', 'Metal Welding'],

  // Cleaning
  cleaning: ['House Cleaning', 'Cleaning Services'],
  housekeeping: ['Housekeeping', 'House Cleaning'],
  maid: ['Housekeeping', 'Domestic Help'],

  // Driving
  driver: ['Driver', 'Cab Driving'],
  driving: ['Driving', 'Cab Services'],

  // Cooking
  cook: ['Cooking', 'Home Cooking'],
  chef: ['Chef', 'Professional Cooking'],

  // Security
  security: ['Security Guard', 'Security Services'],
  guard: ['Security Guard'],

  // Other trades
  tailor: ['Tailoring', 'Stitching'],
  tailoring: ['Tailoring'],
  cobbler: ['Shoe Repair', 'Cobbling'],
  gardener: ['Gardening', 'Landscaping'],
  gardening: ['Gardening'],
};

// Language patterns for locations
const CITY_PATTERNS = [
  'mumbai', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata',
  'pune', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur', 'nagpur', 'indore',
  'thane', 'bhopal', 'visakhapatnam', 'pimpri', 'patna', 'vadodara', 'ghaziabad',
  'ludhiana', 'agra', 'nashik', 'meerut', 'rajkot', 'varanasi', 'srinagar', 'aurangabad',
  'dhanbad', 'amritsar', 'allahabad', 'ranchi', 'coimbatore', 'jabalpur', 'gwalior',
  'vijayawada', 'jodhpur', 'madurai', 'raipur', 'noida', 'gurgaon', 'gurugram',
  'navi mumbai', 'chandigarh', 'mangalore', 'kochi', 'cochin', 'thiruvananthapuram',
  'bhubaneswar', 'cuttack', 'mysore', 'mysuru', 'hubli', 'belgaum', 'erode', 'tiruppur',
];

// ─────────────────────────────────────────────────────────────────────────────
// Core NLP Parser
// ─────────────────────────────────────────────────────────────────────────────
function parseTranscript(transcript) {
  const text = transcript.toLowerCase().trim();
  const result = {
    name: null,
    skills: [],
    experience: null,
    location: null,
    bio: transcript,
    hourlyRate: null,
    availability: true,
    tools: [],
    specializations: [],
    confidence: 0,
  };

  // ── Name extraction ──────────────────────────────────────────────────────
  // "my name is X", "I am X", "I'm X", "name: X"
  const namePatterns = [
    /(?:my name is|i am|i'm|myself|name is|called)\s+([a-z][a-z\s]{1,30}?)(?:\s+(?:and|i|from|with|,|\.)|$)/i,
    /^([a-z][a-z\s]{2,25})\s+(?:here|speaking|from)/i,
  ];
  for (const pattern of namePatterns) {
    const m = transcript.match(pattern);
    if (m) {
      const candidate = m[1].trim().replace(/\b(am|is|are|from|and|the|a)\b/gi, '').trim();
      if (candidate.length > 1 && candidate.split(' ').length <= 4) {
        result.name = candidate.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }
  }

  // ── Experience extraction ────────────────────────────────────────────────
  // "5 years experience", "10 years of experience", "2 years exp"
  const expPatterns = [
    /(\d+(?:\.\d+)?)\s*(?:\+\s*)?years?\s*(?:of\s+)?(?:experience|exp|working|work experience)/i,
    /(\d+(?:\.\d+)?)\s*(?:\+\s*)?(?:saal|sal)\s*(?:ka|ki)?\s*(?:experience|kaam|anubhav)?/i, // Hindi
    /(?:experience|exp)\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*years?/i,
    /(\d+(?:\.\d+)?)\s+(?:years?|yrs?)\s+(?:in|of|as)/i,
  ];
  for (const pattern of expPatterns) {
    const m = text.match(pattern);
    if (m) {
      result.experience = parseFloat(m[1]);
      break;
    }
  }

  // ── Skills extraction ────────────────────────────────────────────────────
  const skillsSet = new Set();
  for (const [keyword, skills] of Object.entries(SKILL_MAP)) {
    if (text.includes(keyword)) {
      skills.forEach(s => skillsSet.add(s));
    }
  }
  result.skills = [...skillsSet];

  // ── Location extraction ──────────────────────────────────────────────────
  // "from Mumbai", "in Pune", "based in Delhi", "work in Bangalore"
  const locationPatterns = [
    /(?:from|in|at|based in|located in|working in|live in|living in|residing in)\s+([a-z\s]{3,25}?)(?:\s+(?:and|i|,|\.)|$)/i,
    /([a-z]{3,})\s+(?:mein|se|ka)\s+(?:hoon|rehta|rehti)/i, // Hindi
  ];
  for (const pattern of locationPatterns) {
    const m = transcript.match(pattern);
    if (m) {
      const loc = m[1].trim().toLowerCase();
      const matchedCity = CITY_PATTERNS.find(c => loc.includes(c));
      if (matchedCity) {
        result.location = matchedCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        break;
      }
    }
  }
  // Also try direct city name in text
  if (!result.location) {
    const matchedCity = CITY_PATTERNS.find(c => text.includes(c));
    if (matchedCity) {
      result.location = matchedCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  // ── Hourly rate extraction ───────────────────────────────────────────────
  // "charge 500 per hour", "₹300 per hour", "500 rupees", "rate is 600"
  const ratePatterns = [
    /(?:charge|rate|₹|rs\.?|inr)\s*(\d+)\s*(?:per\s+hour|\/hour|\/hr|ph|per\s+hr)?/i,
    /(\d+)\s*(?:rupees?|rs\.?|₹)\s*(?:per\s+hour|\/hour|\/hr|per\s+hr)?/i,
    /(\d+)\s*(?:per\s+hour|per\s+hr|\/hr|ph)/i,
  ];
  for (const pattern of ratePatterns) {
    const m = text.match(pattern);
    if (m) {
      const rate = parseInt(m[1], 10);
      if (rate >= 50 && rate <= 50000) {
        result.hourlyRate = rate;
        break;
      }
    }
  }

  // ── Tools extraction ─────────────────────────────────────────────────────
  const toolKeywords = ['drill', 'multimeter', 'soldering', 'welding machine', 'angle grinder',
    'pliers', 'screwdriver', 'wrench', 'hammer', 'saw', 'level', 'ladder'];
  const detectedTools = toolKeywords.filter(t => text.includes(t));
  result.tools = detectedTools.map(t => t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));

  // ── Confidence score ─────────────────────────────────────────────────────
  let confidence = 0;
  if (result.skills.length > 0) confidence += 40;
  if (result.experience !== null) confidence += 25;
  if (result.location) confidence += 15;
  if (result.name) confidence += 10;
  if (result.hourlyRate) confidence += 10;
  result.confidence = Math.min(confidence, 100);

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Controllers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/voice/parse
 * Parse a voice transcript into a structured profile object (preview only, no save)
 */
exports.parseVoice = async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ success: false, message: 'Transcript is required.' });
    }
    if (transcript.length > 2000) {
      return res.status(400).json({ success: false, message: 'Transcript too long (max 2000 chars).' });
    }

    const parsed = parseTranscript(transcript);
    return res.json({ success: true, parsed });
  } catch (err) {
    console.error('voiceController.parseVoice:', err);
    return res.status(500).json({ success: false, message: 'Server error parsing transcript.' });
  }
};

/**
 * POST /api/voice/apply
 * Apply the parsed profile data to the logged-in worker's profile & portfolio
 */
exports.applyVoiceProfile = async (req, res) => {
  try {
    const { transcript, overwrite = false } = req.body;
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ success: false, message: 'Transcript is required.' });
    }

    const parsed = parseTranscript(transcript);
    const userId = req.user._id;

    // Load the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Apply parsed fields (only if field is not empty OR overwrite=true)
    const updates = {};
    if (parsed.skills.length > 0) {
      updates.skills = overwrite
        ? parsed.skills
        : [...new Set([...(user.skills || []), ...parsed.skills])];
    }
    if (parsed.experience !== null && (overwrite || !user.experience)) {
      updates.experience = parsed.experience;
    }
    if (parsed.location && (overwrite || !user.location)) {
      updates.location = parsed.location;
    }
    if (parsed.hourlyRate && (overwrite || !user.hourlyRate)) {
      updates.hourlyRate = parsed.hourlyRate;
    }

    // Build a generated bio from the transcript if not already set
    if (overwrite || !user.bio) {
      const bioParts = [];
      if (parsed.skills.length > 0) bioParts.push(`Expert in ${parsed.skills.slice(0, 3).join(', ')}`);
      if (parsed.experience) bioParts.push(`with ${parsed.experience} years of experience`);
      if (parsed.location) bioParts.push(`based in ${parsed.location}`);
      if (bioParts.length > 0) updates.bio = bioParts.join(' ') + '.';
    }

    await User.findByIdAndUpdate(userId, updates);

    // Portfolio updates
    const portfolioUpdates = {};
    if (parsed.tools.length > 0) {
      const portfolio = await Portfolio.findOne({ workerId: userId });
      const existingTools = portfolio?.tools || [];
      portfolioUpdates.tools = overwrite
        ? parsed.tools
        : [...new Set([...existingTools, ...parsed.tools])];
      if (parsed.skills.length > 0) {
        const existingSpec = portfolio?.specializations || [];
        portfolioUpdates.specializations = overwrite
          ? parsed.skills
          : [...new Set([...existingSpec, ...parsed.skills])];
      }
    }

    if (Object.keys(portfolioUpdates).length > 0) {
      await Portfolio.findOneAndUpdate(
        { workerId: userId },
        { $set: portfolioUpdates },
        { upsert: true, new: true }
      );
    }

    // Return updated user
    const updatedUser = await User.findById(userId);

    return res.json({
      success: true,
      message: 'Profile updated successfully from voice input!',
      parsed,
      user: updatedUser,
    });
  } catch (err) {
    console.error('voiceController.applyVoiceProfile:', err);
    return res.status(500).json({ success: false, message: 'Server error applying profile.' });
  }
};
