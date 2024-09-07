const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const connectToDatabase = async (uri) => {
    await mongoose.connect(uri);
    console.log('Connecté à MongoDB');
    await initializeSchemas(); // Appeler initializeSchemas ici
    await migratePersonSchema(); // Appeler migratePersonSchema ici
    await initializeStock(); // Appeler initializeStock ici
    await createAdminUser(); // Appeler createAdminUser ici
};

const initializeSchemas = async () => {
    console.log('Vérification et création des schémas et des modèles si nécessaire...');

    if (!mongoose.models.User) {
        const userSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            password: { type: String, required: true }
        });

        userSchema.pre('save', async function (next) {
            if (this.isModified('password') || this.isNew) {
                this.password = await bcrypt.hash(this.password, 10);
            }
            next();
        });

        userSchema.methods.comparePassword = function (password) {
            return bcrypt.compare(password, this.password);
        };

        mongoose.model('User', userSchema);
    }

    if (!mongoose.models.Person) {
        const personSchema = new mongoose.Schema({
            numero_personne: { type: String, required: true, unique: true },
            nom: { type: String, required: true },
            prenom: { type: String, required: true },
            date_naissance: { type: Date, required: true },
            lieu_naissance: { type: String, required: true },
            produit_licence: { type: Boolean, default: false },
            produit_licence_taille: { type: String, default: '' },
            produit_licence_taille_maillot: { type: String, default: '' },
            produit_licence_taille_short: { type: String, default: '' },
            produit_licence_taille_chaussettes: { type: String, default: '' },
            email: { type: String, required: true },
            numero_tel: { type: String, required: true },
            club: { type: String, required: true } // Ajout du champ Club
        });

        mongoose.model('Person', personSchema);
    }

    if (!mongoose.models.Licence) {
        const licenceSchema = new mongoose.Schema({
            person_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
            numero_licence: { type: String, required: true, unique: true },
            statut: { type: String, required: true },
            categorie: { type: String },
            sous_categorie: { type: String },
            prix: { type: mongoose.Schema.Types.Mixed },
            etat_reglement: { type: String, required: false, default: null },
            libelle_reglement: { type: String },
            mode_reglement: { type: String }
        });

        mongoose.model('Licence', licenceSchema);
    }

    if (!mongoose.models.Stock) {
        const stockSchema = new mongoose.Schema({
            club: { type: String, required: true },
            taille: { type: String, required: true },
            stockTotal: { type: Number, required: true },
            stockRestant: { type: Number, required: true },
            product: { type: String, required: false } // Nouveau champ, facultatif pour ESM
        });

        stockSchema.methods.ajouterStockTotal = async function (quantite) {
            this.stockTotal += quantite;
            await this.save();
            console.log(`Stock total ajouté: ${quantite} pour ${this.club} taille ${this.taille}`);
        };

        stockSchema.methods.retirerStockTotal = async function (quantite) {
            if (this.stockTotal >= quantite) {
                this.stockTotal -= quantite;
                await this.save();
                console.log(`Stock total retiré: ${quantite} pour ${this.club} taille ${this.taille}`);
            } else {
                console.log(`Erreur: Quantité totale insuffisante pour ${this.club} taille ${this.taille}`);
                throw new Error('Quantité totale insuffisante en stock');
            }
        };

        stockSchema.methods.ajouterStockRestant = async function (quantite) {
            this.stockRestant += quantite;
            await this.save();
            console.log(`Stock restant ajouté: ${quantite} pour ${this.club} taille ${this.taille}`);
        };

        stockSchema.methods.retirerStockRestant = async function (quantite) {
            if (this.stockRestant >= quantite) {
                this.stockRestant -= quantite;
                await this.save();
                console.log(`Stock restant retiré: ${quantite} pour ${this.club} taille ${this.taille}`);
            } else {
                console.log(`Erreur: Quantité restante insuffisante pour ${this.club} taille ${this.taille}`);
                throw new Error('Quantité restante insuffisante en stock');
            }
        };

        mongoose.model('Stock', stockSchema);
    }


    console.log('Les schémas et les modèles ont été vérifiés/créés.');
};

const initializeStock = async () => {
    const Stock = mongoose.model('Stock');
    const clubs = [
        { name: 'ESM', sizes: ['S', 'M', 'L', 'XL', '2XL'], products: [null] },
        { name: 'GJ', products: ['maillot', 'short', 'chaussettes'] }
    ];

    for (const club of clubs) {
        for (const product of club.products) {
            let tailles;
            if (club.name === 'ESM') {
                // Utiliser les tailles spécifiées dans le tableau sizes pour ESM
                tailles = club.sizes;
            } else if (product === 'chaussettes') {
                // Tailles spécifiques pour les chaussettes
                tailles = ['27-30', '31-34', '35-38', '39-42', '43-46'];
            } else {
                // Tailles spécifiques pour les maillots et shorts
                tailles = ['S', 'M', 'L', '164', '152', '140', '128', '116'];
            }

            for (const taille of tailles) {
                // Cherche le stock existant basé sur le club et la taille, et maintenant le produit aussi pour GJ
                const query = { club: club.name, taille };
                if (product) query.product = product;

                const existingStock = await Stock.findOne(query);
                if (!existingStock) {
                    const stock = new Stock({
                        club: club.name,
                        taille,
                        stockTotal: 0,
                        stockRestant: 0,
                        product: product || undefined // Le champ product sera défini uniquement pour GJ
                    });
                    await stock.save();
                    console.log(`Stock initial créé pour ${club.name} ${product ? `(${product})` : ''} taille ${taille}`);
                }
            }
        }
    }
    console.log('Les stocks initiaux ont été créés.');
};



const createAdminUser = async () => {
    const User = mongoose.model('User');
    const adminUsername = 'admin';
    const adminPassword = '49Esm640!';

    const existingAdmin = await User.findOne({ username: adminUsername });
    if (!existingAdmin) {
        const adminUser = new User({
            username: adminUsername,
            password: adminPassword
        });
        await adminUser.save();
        console.log('Utilisateur admin créé avec succès.');
    } else {
        console.log('Utilisateur admin existe déjà.');
    }
};

const migratePersonSchema = async () => {
    const Person = mongoose.model('Person');

    console.log("Démarrage de la migration du schéma 'Person'...");

    // Vérifiez et ajoutez les champs manquants pour chaque document de la collection 'Person'
    const personsToUpdate = await Person.find({
        $or: [
            { produit_licence_taille_maillot: { $exists: false } },
            { produit_licence_taille_short: { $exists: false } },
            { produit_licence_taille_chaussettes: { $exists: false } }
        ]
    });

    if (personsToUpdate.length === 0) {
        console.log("Aucun document à migrer.");
        return;
    }

    for (const person of personsToUpdate) {
        let updateData = {};

        if (!person.produit_licence_taille_maillot) {
            updateData.produit_licence_taille_maillot = '';
        }
        if (!person.produit_licence_taille_short) {
            updateData.produit_licence_taille_short = '';
        }
        if (!person.produit_licence_taille_chaussettes) {
            updateData.produit_licence_taille_chaussettes = '';
        }

        // Mettez à jour le document si nécessaire
        await Person.updateOne({ _id: person._id }, { $set: updateData });
        console.log(`Document Person mis à jour: ${person._id}`);
    }

    console.log('Migration du schéma "Person" terminée.');
};


const getUserModel = () => mongoose.model('User');
const getPersonModel = () => mongoose.model('Person');
const getLicenceModel = () => mongoose.model('Licence');
const getStockModel = () => mongoose.model('Stock');

module.exports = {
    connectToDatabase,
    getUserModel,
    getPersonModel,
    getLicenceModel,
    getStockModel
};
