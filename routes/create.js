const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { pool } = require('../database');

// Hilfsfunktion: Zufällige unique_id generieren
function generateUniqueId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Hilfsfunktion: Text verschlüsseln
function encryptText(text) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-32-chars-long', 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
        encrypted: encrypted,
        iv: iv.toString('hex')
    };
}

// POST /create-note - Notiz erstellen
router.post('/create-note', async (req, res) => {
    try {
        const { noteContent, creatorEmail, isOneTime, expirationTime } = req.body;

        // Validierung
        if (!noteContent || noteContent.trim().length === 0) {
            return res.status(400).json({ error: 'Notizinhalt ist erforderlich' });
        }

        if (noteContent.length > 10000) {
            return res.status(400).json({ error: 'Notiz ist zu lang (max. 10.000 Zeichen)' });
        }

        // Unique ID generieren (mit Duplikat-Prüfung)
        let uniqueId;
        let isDuplicate = true;
        let attempts = 0;
        
        while (isDuplicate && attempts < 10) {
            uniqueId = generateUniqueId();
            
            const [existing] = await pool.execute(
                'SELECT id FROM notes WHERE unique_id = ?',
                [uniqueId]
            );
            
            isDuplicate = existing.length > 0;
            attempts++;
        }

        if (isDuplicate) {
            return res.status(500).json({ error: 'Fehler beim Generieren der unique ID' });
        }

        // Notiz verschlüsseln
        const encryptedData = encryptText(noteContent);
        const encryptedContent = JSON.stringify(encryptedData);

        // Ablaufdatum berechnen
        let expiresAt = null;
        if (!isOneTime) {
            const now = new Date();
            expiresAt = new Date(now.getTime() + (expirationTime * 60 * 1000)); // Minuten zu Millisekunden
        }

        // In Datenbank speichern
        const [result] = await pool.execute(
            `INSERT INTO notes (unique_id, note_content, creator_email, expires_at, is_one_time) 
             VALUES (?, ?, ?, ?, ?)`,
            [uniqueId, encryptedContent, creatorEmail || null, expiresAt, isOneTime]
        );

        // Link generieren
        const link = `${req.protocol}://${req.get('host')}/note/${uniqueId}`;

        console.log(`✅ Notiz erstellt: ${uniqueId} (OTN: ${isOneTime})`);

        res.json({
            success: true,
            link: link,
            uniqueId: uniqueId,
            expiresAt: expiresAt
        });

    } catch (error) {
        console.error('Fehler beim Erstellen der Notiz:', error);
        res.status(500).json({ error: 'Interner Serverfehler beim Erstellen der Notiz' });
    }
});

module.exports = router; 