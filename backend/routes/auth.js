const express = require('express');
const jwt = require('jsonwebtoken');
const { getUserModel } = require('../models/db');
require('dotenv').config(); // Charger les variables d'environnement

const router = express.Router();

let User = null;

router.use((req, res, next) => {
    if (!User) {
        User = getUserModel();
    }
    next();
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send({ error: 'Nom d\'utilisateur ou mot de passe invalide' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '48h' });
        res.send({ token });
    } catch (error) {
        res.status(400).send({ error: 'Erreur lors de la connexion' });
    }
});

module.exports = router;
