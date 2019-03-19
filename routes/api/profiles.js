const express = require('express');

const router = express.Router();

// @route   GET api/profile/test
// @desc    tests profile route
// @accesss Public
router.get('/test', (req, res) => res.json({ msg: 'profile works' }));

module.exports = router;
