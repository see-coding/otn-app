const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { pool } = require('../database');

// Hilfsfunktion: Text entschlüsseln
function decryptText(encryptedData) {
    try {
        const data = JSON.parse(encryptedData);
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-32-chars-long', 'salt', 32);
        
        const decipher = crypto.createDecipher(algorithm, key);
        let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Entschlüsselungsfehler:', error);
        throw new Error('Fehler beim Entschlüsseln der Notiz');
    }
}

// Hilfsfunktion: HTML-Template für Notiz-Anzeige
function generateNoteHTML(note, uniqueId) {
    return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>One-Time-Note - Anzeige</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .note-card {
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            flex: 1;
        }
        
        .note-header {
            text-align: center;
            margin-bottom: 30px;
            color: #667eea;
        }
        
        .note-content {
            background: #f8f9fa;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 16px;
            line-height: 1.8;
        }
        
        .creator-info {
            text-align: center;
            margin-bottom: 30px;
            color: #666;
            font-style: italic;
        }
        
        .button-group {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .btn-danger {
            background: #dc3545;
            color: white;
        }
        
        .btn-danger:hover {
            background: #c82333;
            transform: translateY(-2px);
        }
        
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .note-card { padding: 20px; }
            .button-group { flex-direction: column; }
            .btn { width: 100%; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="note-card">
            <div class="note-header">
                <h1>📝 One-Time-Note</h1>
                <p>Ihre sichere Nachricht</p>
            </div>
            
            ${note.is_one_time ? '<div class="warning">⚠️ Diese Notiz wird nach dem Lesen automatisch gelöscht!</div>' : ''}
            
            <div class="note-content">${note.content}</div>
            
            ${note.creator_email ? `<div class="creator-info">Von: ${note.creator_email}</div>` : ''}
            
            <div class="button-group">
                <button onclick="closeTab()" class="btn btn-primary">
                    ✅ Gelesen + Tab schließen
                </button>
                <button onclick="deleteNote()" class="btn btn-danger">
                    🗑️ Notiz jetzt löschen
                </button>
            </div>
        </div>
    </div>
    
    <script>
        function closeTab() {
            window.close();
        }
        
        function deleteNote() {
            if (confirm('Sind Sie sicher, dass Sie diese Notiz sofort löschen möchten?')) {
                fetch('/delete-note/${uniqueId}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Notiz wurde gelöscht.');
                        window.close();
                    } else {
                        alert('Fehler beim Löschen der Notiz.');
                    }
                })
                .catch(error => {
                    console.error('Fehler:', error);
                    alert('Fehler beim Löschen der Notiz.');
                });
            }
        }
    </script>
</body>
</html>`;
}

// GET /note/:uniqueId - Notiz ansehen
router.get('/note/:uniqueId', async (req, res) => {
    try {
        const { uniqueId } = req.params;

        // Notiz aus Datenbank abrufen
        const [notes] = await pool.execute(
            'SELECT * FROM notes WHERE unique_id = ?',
            [uniqueId]
        );

        if (notes.length === 0) {
            return res.status(404).send(`
                <html>
                    <head><title>Notiz nicht gefunden</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1>❌ Notiz nicht gefunden</h1>
                        <p>Diese Notiz existiert nicht oder wurde bereits gelöscht.</p>
                        <a href="/" style="color: #667eea;">← Zurück zur Startseite</a>
                    </body>
                </html>
            `);
        }

        const note = notes[0];

        // Prüfen ob Notiz abgelaufen ist
        if (note.expires_at && new Date() > new Date(note.expires_at)) {
            // Abgelaufene Notiz löschen
            await pool.execute('DELETE FROM notes WHERE id = ?', [note.id]);
            
            return res.status(410).send(`
                <html>
                    <head><title>Notiz abgelaufen</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1>⏰ Notiz abgelaufen</h1>
                        <p>Diese Notiz ist abgelaufen und wurde automatisch gelöscht.</p>
                        <a href="/" style="color: #667eea;">← Zurück zur Startseite</a>
                    </body>
                </html>
            `);
        }

        // Notiz entschlüsseln
        const decryptedContent = decryptText(note.note_content);

        // Notiz-Objekt für Template erstellen
        const noteData = {
            content: decryptedContent,
            creator_email: note.creator_email,
            is_one_time: note.is_one_time
        };

        // HTML generieren und senden
        const html = generateNoteHTML(noteData, uniqueId);
        res.send(html);

        // Wenn es eine OTN ist, sofort löschen
        if (note.is_one_time) {
            console.log(`🗑️ OTN gelöscht nach Anzeige: ${uniqueId}`);
            await pool.execute('DELETE FROM notes WHERE id = ?', [note.id]);
        }

    } catch (error) {
        console.error('Fehler beim Anzeigen der Notiz:', error);
        res.status(500).send(`
            <html>
                <head><title>Fehler</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1>❌ Fehler</h1>
                    <p>Ein Fehler ist aufgetreten beim Laden der Notiz.</p>
                    <a href="/" style="color: #667eea;">← Zurück zur Startseite</a>
                </body>
            </html>
        `);
    }
});

module.exports = router; 