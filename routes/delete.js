const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// POST /delete-note/:uniqueId - Notiz löschen
router.post('/delete-note/:uniqueId', async (req, res) => {
    try {
        const { uniqueId } = req.params;

        // Prüfen ob Notiz existiert
        const [notes] = await pool.execute(
            'SELECT id FROM notes WHERE unique_id = ?',
            [uniqueId]
        );

        if (notes.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Notiz nicht gefunden' 
            });
        }

        // Notiz löschen
        await pool.execute(
            'DELETE FROM notes WHERE unique_id = ?',
            [uniqueId]
        );

        console.log(`🗑️ Notiz manuell gelöscht: ${uniqueId}`);

        res.json({
            success: true,
            message: 'Notiz erfolgreich gelöscht'
        });

    } catch (error) {
        console.error('Fehler beim Löschen der Notiz:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Interner Serverfehler beim Löschen der Notiz' 
        });
    }
});

module.exports = router; 