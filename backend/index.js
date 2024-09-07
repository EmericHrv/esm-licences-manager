const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./models/db');
const routes = require('./routes'); // Import central routes

// Charger les variables d'environnement
dotenv.config();
const { NODE_ENV } = process.env;

const app = express();
const port = 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Middleware CORS
if (NODE_ENV === 'dev') {
    console.log('Environnement de développement');
    app.use(cors());
} else {
    console.log('Environnement de production');
    app.use(cors({
        origin: 'https://licences-manager.esmorannes.com',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
}

const startServer = () => {
    // Utiliser les routes centralisées après l'initialisation des modèles
    app.use('/api', routes);

    // Commencer à écouter les requêtes après l'initialisation
    app.listen(port, () => {
        console.log(`Serveur démarré sur le port ${port}`);
    });
};

// Initialisation de la base de données et création des schémas
const initializeApp = async () => {
    try {
        const mongoUri = process.env.MONGO_URL;
        await connectToDatabase(mongoUri);
        console.log('La base de données et les collections sont prêtes.');
        startServer();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
    }
};

// Appel de la fonction initializeApp pour démarrer l'application
initializeApp();
