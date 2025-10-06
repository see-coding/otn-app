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

// Hilfsfunktion: Text verschlüsseln (AES-256-GCM)
function encryptText(text) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'change-me-32-bytes-minimum-security-key', 'otn-salt', 32);
    const iv = crypto.randomBytes(12); // 96-bit IV für GCM

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
        encrypted: encrypted.toString('hex'),
        iv: iv.toString('hex'),
        tag: authTag.toString('hex')
    };
}

// POST /create-note - Notiz erstellen
router.post('/create-note', async (req, res) => {
    try {
        const { noteContent, creatorEmail, isOneTime, expirationTime } = req.body;

        // Strikte Typenvalidierung
        const isOneTimeBool = Boolean(isOneTime);
        const allowedExpMinutes = [5,15,30,60,180,360,720,1440,4320,10080,43200];

        // Validierung
        if (!noteContent || typeof noteContent !== 'string' || noteContent.trim().length === 0) {
            return res.status(400).json({ error: 'Notizinhalt ist erforderlich' });
        }

        if (noteContent.length > 10000) {
            return res.status(400).json({ error: 'Notiz ist zu lang (max. 10.000 Zeichen)' });
        }

        if (creatorEmail && typeof creatorEmail === 'string') {
            const email = creatorEmail.trim();
            if (email.length > 255) {
                return res.status(400).json({ error: 'E-Mail ist zu lang (max. 255 Zeichen)' });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email.length > 0 && !emailRegex.test(email)) {
                return res.status(400).json({ error: 'Ungültige E-Mail-Adresse' });
            }
        }

        if (!isOneTimeBool) {
            const expInt = parseInt(expirationTime, 10);
            if (!allowedExpMinutes.includes(expInt)) {
                return res.status(400).json({ error: 'Ungültige Speicherdauer' });
            }
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
        if (!isOneTimeBool) {
            const now = new Date();
            const expInt = parseInt(expirationTime, 10);
            expiresAt = new Date(now.getTime() + (expInt * 60 * 1000)); // Minuten zu Millisekunden
        }

        // In Datenbank speichern
        const [result] = await pool.execute(
            `INSERT INTO notes (unique_id, note_content, creator_email, expires_at, is_one_time) 
             VALUES (?, ?, ?, ?, ?)`,
            [uniqueId, encryptedContent, creatorEmail || null, expiresAt, isOneTimeBool]
        );

        // Link generieren - bevorzugt BASE_URL aus .env
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const link = `${baseUrl}/note/${uniqueId}`;

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