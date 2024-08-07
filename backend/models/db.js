const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const connectToDatabase = async (uri) => {
    await mongoose.connect(uri);
    console.log('Connecté à MongoDB');
    await initializeSchemas(); // Appeler initializeSchemas ici
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
            stockRestant: { type: Number, required: true }
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
        { name: 'ESM', sizes: ['S', 'M', 'L', 'XL', '2XL'] },
        { name: 'GJ', sizes: ['XS', 'S', 'M', 'L', 'XL'] }
    ];

    for (const club of clubs) {
        for (const taille of club.sizes) {
            const existingStock = await Stock.findOne({ club: club.name, taille });
            if (!existingStock) {
                const stock = new Stock({
                    club: club.name,
                    taille,
                    stockTotal: 0,
                    stockRestant: 0
                });
                await stock.save();
                console.log(`Stock initial créé pour ${club.name} taille ${taille}`);
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
