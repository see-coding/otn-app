const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Datenbankverbindung importieren
const db = require('./database');

// Routen importieren
const createRoutes = require('./routes/create');
const viewRoutes = require('./routes/view');
const deleteRoutes = require('./routes/delete');

// Routen verwenden
app.use('/', createRoutes);
app.use('/', viewRoutes);
app.use('/', deleteRoutes);

// Basis-Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server starten
app.listen(PORT, () => {
    console.log(`OTN-App läuft auf Port ${PORT}`);
    console.log(`Besuchen Sie: http://localhost:${PORT}`);
});

module.exports = app; 