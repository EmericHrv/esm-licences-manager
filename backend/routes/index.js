const express = require('express');
const authRoutes = require('./auth');
const personRoutes = require('./person');
const stockRoutes = require('./stock');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/persons', personRoutes);
router.use('/stocks', stockRoutes);

module.exports = router;
