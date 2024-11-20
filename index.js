const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connexion à MongoDB
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie'))
    .catch(err => console.error('Erreur lors de la connexion à MongoDB :', err));

// Schéma et modèle MongoDB
const factureSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: String, required: true },
    image: { type: String, required: true }
});

const Facture = mongoose.model('Facture', factureSchema);

// Configuration de Multer pour gérer les téléchargements
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public/uploads');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Routes

// Page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Page pour ajouter une facture
app.get('/ajouter_facture', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ajouter_facture.html'));
});

// Route pour ajouter une nouvelle facture


// Route pour ajouter une nouvelle facture
app.post('/add-facture', upload.single('image'), async (req, res, next) => {
    console.log('Requête reçue pour ajouter une facture.');

    // Vérification si les champs requis sont présents
    const { name, date } = req.body;
    if (!name || !date) {
        console.error('Champs requis manquants :', { name, date });
        return res.status(400).json({ error: 'Le nom et la date sont obligatoires.' });
    }

    // Vérification si un fichier a été téléchargé
    if (!req.file) {
        console.error('Fichier image manquant.');
        return res.status(400).json({ error: 'L\'image de la facture est obligatoire.' });
    }

    console.log('Fichier reçu :', req.file);

    // Préparation des données pour MongoDB
    const image = req.file.filename;

    const newFacture = new Facture({
        name,
        date,
        image
    });

    // Sauvegarde dans la base de données
    const savedFacture = await newFacture.save();
    console.log('Facture ajoutée avec succès :', savedFacture);

    // Réponse réussie
    res.status(201).json({
        message: 'Facture ajoutée avec succès.',
        facture: savedFacture
    });
});





// Route pour récupérer toutes les factures
app.get('/factures', async (req, res) => {
    try {
        const factures = await Facture.find();
        res.status(200).json(factures);
    } catch (error) {
        console.error('Erreur lors de la récupération des factures :', error);
        res.status(500).json({ error: 'Une erreur interne s\'est produite.' });
    }
});

// Route pour récupérer une facture spécifique par ID
app.get('/factures/:id', async (req, res) => {
    try {
        const facture = await Facture.findById(req.params.id);
        if (!facture) {
            return res.status(404).json({ error: 'Facture introuvable.' });
        }
        res.status(200).json(facture);
    } catch (error) {
        console.error('Erreur lors de la récupération de la facture :', error);
        res.status(500).json({ error: 'Une erreur interne s\'est produite.' });
    }
});

// Route pour supprimer une facture
app.delete('/factures/:id', async (req, res) => {
    try {
        const facture = await Facture.findByIdAndDelete(req.params.id);
        if (!facture) {
            return res.status(404).json({ error: 'Facture introuvable.' });
        }
        res.status(200).json({ message: 'Facture supprimée avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la facture :', error);
        res.status(500).json({ error: 'Une erreur interne s\'est produite.' });
    }
});

// Route pour mettre à jour une facture
app.put('/factures/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, date } = req.body;
        const updateData = { name, date };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        const updatedFacture = await Facture.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedFacture) {
            return res.status(404).json({ error: 'Facture introuvable.' });
        }
        res.status(200).json({ message: 'Facture mise à jour avec succès.', facture: updatedFacture });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la facture :', error);
        res.status(500).json({ error: 'Une erreur interne s\'est produite.' });
    }
});

// Route pour télécharger une image de facture
app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'public/uploads', req.params.filename);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Erreur lors de l\'envoi du fichier :', err);
            res.status(404).json({ error: 'Fichier introuvable.' });
        }
    });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
