const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// POST /delete-note/:uniqueId - Notiz löschen
router.post('/delete-note/:uniqueId', async (req, res) => {
	try {
		const { uniqueId } = req.params;
		if (!uniqueId || typeof uniqueId !== 'string' || uniqueId.length > 12) {
			return res.status(400).json({ success: false, error: 'Ungültige ID' });
		}

		const [existing] = await pool.execute('SELECT id FROM notes WHERE unique_id = ?', [uniqueId]);
		if (existing.length === 0) {
			return res.status(404).json({ success: false, error: 'Notiz nicht gefunden' });
		}

		await pool.execute('DELETE FROM notes WHERE unique_id = ?', [uniqueId]);
		return res.json({ success: true });
	} catch (error) {
		console.error('Fehler beim Löschen der Notiz:', error);
		return res.status(500).json({ success: false, error: 'Interner Serverfehler' });
	}
});

module.exports = router;


