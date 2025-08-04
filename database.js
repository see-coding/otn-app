const mysql = require('mysql2/promise');
require('dotenv').config();

// Datenbankverbindung konfigurieren
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Verbindungspool erstellen
const pool = mysql.createPool(dbConfig);

// Verbindung testen
async function testConnection() {
    try {
        console.log('🔍 Versuche Datenbankverbindung...');
        console.log('Host:', process.env.DB_HOST);
        console.log('User:', process.env.DB_USER);
        console.log('Database:', process.env.DB_NAME);
        console.log('Password:', process.env.DB_PASSWORD ? '***' : 'NICHT GESETZT');
        
        const connection = await pool.getConnection();
        console.log('✅ Datenbankverbindung erfolgreich!');
        connection.release();
    } catch (error) {
        console.error('❌ Datenbankverbindung fehlgeschlagen:');
        console.error('Fehler-Code:', error.code);
        console.error('Fehler-Nummer:', error.errno);
        console.error('SQL-State:', error.sqlState);
        console.error('Nachricht:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 Tipp: Überprüfen Sie Benutzername und Passwort');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('💡 Tipp: Überprüfen Sie Host und Port');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('💡 Tipp: Datenbank existiert nicht');
        }
    }
}

// SQL für Tabellenerstellung
const createTableSQL = `
CREATE TABLE IF NOT EXISTS notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unique_id VARCHAR(10) UNIQUE NOT NULL,
    note_content TEXT NOT NULL,
    creator_email VARCHAR(255),
    expires_at DATETIME,
    is_one_time BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_unique_id (unique_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

// Tabelle erstellen
async function createTable() {
    try {
        await pool.execute(createTableSQL);
        console.log('✅ Notes-Tabelle erfolgreich erstellt!');
    } catch (error) {
        console.error('❌ Fehler beim Erstellen der Tabelle:', error.message);
    }
}

// Initialisierung
async function initializeDatabase() {
    await testConnection();
    await createTable();
}

module.exports = {
    pool,
    initializeDatabase
}; 