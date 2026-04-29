const express = require('express');
const router = express.Router();
const { getWorkers, getWorkerById, getReputationExport, getSkillsList } = require('../controllers/workerController');
const { protect } = require('../middleware/auth');

router.get('/', getWorkers);
router.get('/skills', getSkillsList);
router.get('/:id', getWorkerById);
router.get('/:id/reputation', getReputationExport);

module.exports = router;
