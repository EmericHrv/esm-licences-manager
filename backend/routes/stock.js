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
    const { club, taille, product, quantite } = req.body; // Inclure product

    try {
        let stock = await Stock.findOne({ club, taille, product }); // Ajouter product dans le filtre

        if (!stock) {
            stock = new Stock({
                club,
                taille,
                product, // Ajouter le product lors de la création du document
                stockTotal: 0,
                stockRestant: 0
            });
        }

        await stock.ajouterStockTotal(quantite);
        console.log(`Ajouté ${quantite} au stock total de ${club} taille ${taille}, produit ${product}`);
        res.status(200).send('Le stock total a été ajouté avec succès.');
    } catch (error) {
        console.error('Erreur lors de l\'ajout au stock total:', error);
        res.status(500).send('Erreur lors de l\'ajout au stock total.');
    }
});

// Endpoint pour retirer du stock total
router.put('/total/remove', async (req, res) => {
    const { club, taille, product, quantite } = req.body; // Inclure product

    try {
        let stock = await Stock.findOne({ club, taille, product }); // Ajouter product dans le filtre

        if (!stock) {
            console.log(`Stock non trouvé pour ${club} taille ${taille}, produit ${product}`);
            return res.status(404).send('Stock non trouvé.');
        }

        await stock.retirerStockTotal(quantite);
        console.log(`Retiré ${quantite} du stock total de ${club} taille ${taille}, produit ${product}`);
        res.status(200).send('Le stock total a été retiré avec succès.');
    } catch (error) {
        console.error('Erreur lors du retrait du stock total:', error);
        res.status(500).send('Erreur lors du retrait du stock total.');
    }
});

// Endpoint pour ajouter au stock restant
router.post('/restant/add', async (req, res) => {
    const { club, taille, product, quantite } = req.body; // Inclure product

    try {
        let stock = await Stock.findOne({ club, taille, product }); // Ajouter product dans le filtre

        if (!stock) {
            stock = new Stock({
                club,
                taille,
                product, // Ajouter le product lors de la création du document
                stockTotal: 0,
                stockRestant: 0
            });
        }

        await stock.ajouterStockRestant(quantite);
        console.log(`Ajouté ${quantite} au stock restant de ${club} taille ${taille}, produit ${product}`);
        res.status(200).send('Le stock restant a été ajouté avec succès.');
    } catch (error) {
        console.error('Erreur lors de l\'ajout au stock restant:', error);
        res.status(500).send('Erreur lors de l\'ajout au stock restant.');
    }
});

// Endpoint pour retirer du stock restant
router.put('/restant/remove', async (req, res) => {
    const { club, taille, product, quantite } = req.body; // Inclure product

    try {
        let stock = await Stock.findOne({ club, taille, product }); // Ajouter product dans le filtre

        if (!stock) {
            console.log(`Stock non trouvé pour ${club} taille ${taille}, produit ${product}`);
            return res.status(404).send('Stock non trouvé.');
        }

        await stock.retirerStockRestant(quantite);
        console.log(`Retiré ${quantite} du stock restant de ${club} taille ${taille}, produit ${product}`);
        res.status(200).send('Le stock restant a été retiré avec succès.');
    } catch (error) {
        console.error('Erreur lors du retrait du stock restant:', error);
        res.status(500).send('Erreur lors du retrait du stock restant.');
    }
});

// Endpoint pour obtenir un tableau des stocks, triés par club et regroupés par produit
router.get('/', async (req, res) => {
    try {
        const stocks = await Stock.aggregate([
            {
                $group: {
                    _id: {
                        club: "$club",
                        taille: "$taille",
                        product: "$product" // Utiliser le champ product pour le type de produit
                    },
                    stockTotal: { $sum: "$stockTotal" }, // Somme des stocks totaux pour chaque taille et produit
                    stockRestant: { $sum: "$stockRestant" } // Somme des stocks restants pour chaque taille et produit
                }
            },
            {
                $group: {
                    _id: {
                        club: "$_id.club",
                        product: "$_id.product" // Groupement par club et produit
                    },
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
                $group: {
                    _id: "$_id.club", // Groupement final par club
                    produits: {
                        $push: {
                            product: "$_id.product",
                            tailles: "$tailles" // Ajouter les tailles associées à chaque produit
                        }
                    }
                }
            },
            {
                $sort: { _id: 1 } // Tri par ordre alphabétique des clubs
            },
            {
                $project: {
                    club: "$_id", // Renommage de _id en club
                    produits: 1, // Conserver les informations des produits (types et tailles)
                    _id: 0 // Exclure _id du résultat final
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
