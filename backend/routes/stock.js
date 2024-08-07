const express = require('express');
const { getStockModel } = require('../models/db');
const router = express.Router();

let Stock = null;

// Middleware pour s'assurer que le modèle Stock est initialisé
router.use((req, res, next) => {
    if (!Stock) {
        Stock = getStockModel();
    }
    next();
});

// Endpoint pour ajouter au stock total
router.post('/total/add', async (req, res) => {
    const { club, taille, quantite } = req.body;

    try {
        let stock = await Stock.findOne({ club, taille });

        if (!stock) {
            stock = new Stock({
                club,
                taille,
                stockTotal: 0,
                stockRestant: 0
            });
        }

        await stock.ajouterStockTotal(quantite);
        console.log(`Ajouté ${quantite} au stock total de ${club} taille ${taille}`);
        res.status(200).send('Le stock total a été ajouté avec succès.');
    } catch (error) {
        console.error('Erreur lors de l\'ajout au stock total:', error);
        res.status(500).send('Erreur lors de l\'ajout au stock total.');
    }
});

// Endpoint pour retirer du stock total
router.put('/total/remove', async (req, res) => {
    const { club, taille, quantite } = req.body;

    try {
        let stock = await Stock.findOne({ club, taille });

        if (!stock) {
            console.log(`Stock non trouvé pour ${club} taille ${taille}`);
            return res.status(404).send('Stock non trouvé.');
        }

        await stock.retirerStockTotal(quantite);
        console.log(`Retiré ${quantite} du stock total de ${club} taille ${taille}`);
        res.status(200).send('Le stock total a été retiré avec succès.');
    } catch (error) {
        console.error('Erreur lors du retrait du stock total:', error);
        res.status(500).send('Erreur lors du retrait du stock total.');
    }
});

// Endpoint pour ajouter au stock restant
router.post('/restant/add', async (req, res) => {
    const { club, taille, quantite } = req.body;

    try {
        let stock = await Stock.findOne({ club, taille });

        if (!stock) {
            stock = new Stock({
                club,
                taille,
                stockTotal: 0,
                stockRestant: 0
            });
        }

        await stock.ajouterStockRestant(quantite);
        console.log(`Ajouté ${quantite} au stock restant de ${club} taille ${taille}`);
        res.status(200).send('Le stock restant a été ajouté avec succès.');
    } catch (error) {
        console.error('Erreur lors de l\'ajout au stock restant:', error);
        res.status(500).send('Erreur lors de l\'ajout au stock restant.');
    }
});

// Endpoint pour retirer du stock restant
router.put('/restant/remove', async (req, res) => {
    const { club, taille, quantite } = req.body;

    try {
        let stock = await Stock.findOne({ club, taille });

        if (!stock) {
            console.log(`Stock non trouvé pour ${club} taille ${taille}`);
            return res.status(404).send('Stock non trouvé.');
        }

        await stock.retirerStockRestant(quantite);
        console.log(`Retiré ${quantite} du stock restant de ${club} taille ${taille}`);
        res.status(200).send('Le stock restant a été retiré avec succès.');
    } catch (error) {
        console.error('Erreur lors du retrait du stock restant:', error);
        res.status(500).send('Erreur lors du retrait du stock restant.');
    }
});

// Endpoint pour obtenir un tableau des clubs en ordre alphabétique et le stock par taille pour chaque club
router.get('/', async (req, res) => {
    try {
        const stocks = await Stock.aggregate([
            {
                $group: {
                    _id: {
                        club: "$club",
                        taille: "$taille"
                    },
                    stockTotal: { $sum: "$stockTotal" },
                    stockRestant: { $sum: "$stockRestant" }
                }
            },
            {
                $group: {
                    _id: "$_id.club",
                    tailles: {
                        $push: {
                            taille: "$_id.taille",
                            stockTotal: "$stockTotal",
                            stockRestant: "$stockRestant"
                        }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    club: "$_id",
                    tailles: 1,
                    _id: 0
                }
            }
        ]);
        console.log('Stocks récupérés avec succès');
        res.status(200).json(stocks);
    } catch (error) {
        console.error('Erreur lors de la récupération du stock:', error);
        res.status(500).send('Erreur lors de la récupération du stock.');
    }
});

module.exports = router;
