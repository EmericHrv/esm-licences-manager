const express = require('express');
const moment = require('moment');
const multer = require('multer');
const xlsx = require('xlsx');
const { getPersonModel, getLicenceModel } = require('../models/db');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

let Person = null;
let Licence = null;

// Middleware pour s'assurer que les modèles Person et Licence sont initialisés
router.use((req, res, next) => {
    if (!Person || !Licence) {
        Person = getPersonModel();
        Licence = getLicenceModel();
    }
    next();
});

// Fonction pour vérifier et convertir les booléens et les chaînes vides
const parseBoolean = (value) => {
    return value ? true : false;
};

const parseString = (value) => {
    return value ? value : '';
};

const parseMontant = (value) => {
    return value === 0 ? 0 : (value ? value : '');
};

const parseDate = (value) => {
    const date = moment(value, 'DD/MM/YYYY').toDate();
    return isNaN(date.getTime()) ? null : date;
};

// Endpoint pour télécharger et traiter le fichier XLSX
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Aucun fichier téléchargé.');
    }

    const filePath = path.join(__dirname, '..', req.file.path); // Correction du chemin
    let workbook;
    try {
        workbook = xlsx.readFile(filePath);
    } catch (error) {
        console.error('Erreur lors de la lecture du fichier XLSX:', error);
        return res.status(400).send('Erreur lors de la lecture du fichier XLSX.');
    }

    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
        console.error('Erreur: Aucun sheet trouvé dans le fichier XLSX.');
        return res.status(400).send('Erreur: Aucun sheet trouvé dans le fichier XLSX.');
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    try {
        for (const row of data) {
            // Vérification de l'existence et de la validité de 'Code catégorie'
            const codeCategorie = row['Code catégorie'];
            if (!codeCategorie) {
                console.error('Erreur: Code catégorie manquant ou invalide.');
                continue;
            }

            // Déterminer la valeur du champ club
            const club = ['DI', 'EF', 'SEM', 'U19'].includes(codeCategorie) ? 'ESM' : 'GJ';

            // Chercher la personne par son Numéro personne
            let person = await Person.findOne({ numero_personne: row['Numéro personne'] });

            // Si la personne n'existe pas, la créer
            if (!person) {
                person = new Person({
                    numero_personne: parseString(row['Numéro personne']),
                    nom: parseString(row['Nom']),
                    prenom: parseString(row['Prénom']),
                    date_naissance: parseDate(row['Né(e) le']),
                    lieu_naissance: parseString(row['Lieu de naissance']),
                    email: parseString(row['Email principal']),
                    numero_tel: parseString(row['Mobile personnel']),
                    nom_club: parseString(row['Nom du club']),
                    num_club: parseString(row['Numéro']),
                    club: club
                });

                person = await person.save();
            } else {
                // Mettre à jour les informations de la personne existante, sauf produit_licence et produit_licence_taille
                person.nom = parseString(row['Nom']);
                person.prenom = parseString(row['Prénom']);
                person.date_naissance = parseDate(row['Né(e) le']);
                person.lieu_naissance = parseString(row['Lieu de naissance']);
                person.email = parseString(row['Email principal']);
                person.numero_tel = parseString(row['Mobile personnel']);
                person.nom_club = parseString(row['Nom du club']);
                person.num_club = parseString(row['Numéro']);
                person.club = club;
                await person.save();
            }

            // Chercher la licence par person_id et numero_licence
            let licence = await Licence.findOne({
                person_id: person._id,
                numero_licence: row['Numéro licence']
            });

            // Si la licence n'existe pas, la créer
            if (!licence) {
                licence = new Licence({
                    person_id: person._id,
                    numero_licence: parseString(row['Numéro licence']),
                    statut: parseString(row['Statut']),
                    categorie: parseString(row['Sous catégorie']),
                    sous_categorie: parseString(row['Type licence']),
                    prix: parseMontant(row['Prix club']),
                    etat_reglement: parseString(row['Etat règlement']) || null,
                    libelle_reglement: parseString(row['Libellé règlement']),
                    mode_reglement: parseString(row['Mode de règlement'])
                });

                await licence.save();
            } else {
                // Mettre à jour les informations de la licence existante
                licence.statut = parseString(row['Statut']);
                licence.categorie = parseString(row['Sous catégorie']);
                licence.sous_categorie = parseString(row['Type licence']);
                licence.prix = parseMontant(row['Prix club']);
                licence.etat_reglement = parseString(row['Etat règlement']) || null;
                licence.libelle_reglement = parseString(row['Libellé règlement']);
                licence.mode_reglement = parseString(row['Mode de règlement']);
                await licence.save();
            }
        }

        res.status(200).send('Les données ont été importées avec succès.');
    } catch (error) {
        console.error('Erreur lors de l\'importation des données:', error);
        res.status(500).send('Erreur lors de l\'importation des données.');
    } finally {
        // Supprimer le fichier téléchargé après traitement
        fs.unlinkSync(filePath);
    }
});

// Nouvelle route pour récupérer toutes les personnes et leurs licences
router.get('/', async (req, res) => {
    try {
        const persons = await Person.aggregate([
            {
                $lookup: {
                    from: 'licences',
                    localField: '_id',
                    foreignField: 'person_id',
                    as: 'licences'
                }
            }
        ]);
        res.status(200).json(persons);
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        res.status(500).send('Erreur lors de la récupération des données.');
    }
});

// Nouvelle route pour mettre à jour produit_licence et produit_licence_taille
router.put('/:numero_personne', async (req, res) => {
    const { numero_personne } = req.params;
    const { produit_licence, produit_licence_taille, produit_licence_taille_maillot, produit_licence_taille_short, produit_licence_taille_chaussettes } = req.body;

    try {
        let person = await Person.findOne({ numero_personne });

        if (!person) {
            return res.status(404).send('Personne non trouvée.');
        }

        if (produit_licence !== undefined) {
            person.produit_licence = produit_licence;
        }

        if (produit_licence_taille !== undefined) {
            person.produit_licence_taille = produit_licence_taille;
        }

        if (produit_licence_taille_maillot !== undefined) {
            person.produit_licence_taille_maillot = produit_licence_taille_maillot;
        }

        if (produit_licence_taille_short !== undefined) {
            person.produit_licence_taille_short = produit_licence_taille_short;
        }

        if (produit_licence_taille_chaussettes !== undefined) {
            person.produit_licence_taille_chaussettes = produit_licence_taille_chaussettes;
        }

        await person.save();
        res.status(200).send('Les données de la personne ont été mises à jour avec succès.');
    } catch (error) {
        console.error('Erreur lors de la mise à jour des données:', error);
        res.status(500).send('Erreur lors de la mise à jour des données.');
    }
});

// Nouvelle route pour connaitre le nombre de personnes et de licences ainsi que le nombre de licences non payées et de produits non remis
router.get('/stats/ESM', async (req, res) => {
    try {
        const personsCount = await Person.countDocuments({ num_club: 522758 });
        const licencesCount = await Licence.countDocuments({ person_id: { $in: await Person.find({ num_club: 522758 }).distinct('_id') } });
        const licencesNonPayeesCount = await Licence.countDocuments({ etat_reglement: null, person_id: { $in: await Person.find({ num_club: 522758 }).distinct('_id') } });
        const produitsRemisCount = await Person.countDocuments({ produit_licence: true, num_club: 522758 });

        res.status(200).json({
            personsCount,
            licencesCount,
            licencesNonPayeesCount,
            produitsRemisCount
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).send('Erreur lors de la récupération des statistiques.');
    }
});

router.get('/stats/GJ', async (req, res) => {
    try {
        const personsCount = await Person.countDocuments({ club: 'GJ' });
        const licencesCount = await Licence.countDocuments({ person_id: { $in: await Person.find({ club: 'GJ' }).distinct('_id') } });
        const licencesNonPayeesCount = await Licence.countDocuments({ etat_reglement: null, person_id: { $in: await Person.find({ club: 'GJ' }).distinct('_id') } });
        const produitsRemisCount = await Person.countDocuments({ produit_licence: true, club: 'GJ' });

        res.status(200).json({
            personsCount,
            licencesCount,
            licencesNonPayeesCount,
            produitsRemisCount
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).send('Erreur lors de la récupération des statistiques.');
    }
});

module.exports = router;
