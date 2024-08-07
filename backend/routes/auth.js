const express = require('express');
const jwt = require('jsonwebtoken');
const { getUserModel } = require('../models/db');

const router = express.Router();

// Définir le modèle User comme null initialement
let User = null;

// Middleware pour s'assurer que le modèle User est initialisé
router.use((req, res, next) => {
    if (!User) {
        User = getUserModel();
    }
    next();
});

// Route pour la connexion de l'utilisateur
router.post('/login', async (req, res) => {
    try {
        console.log("login");
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send({ error: 'Invalid username or password' });
        }
        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.send({ token });
    } catch (error) {
        res.status(400).send({ error: 'Error logging in' });
    }
});

module.exports = router;
