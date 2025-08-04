# PROJECT NOTES FOR MY APP - ONE TIME NOTE

## INFROMATION ABOUT IMPORTANT CREDENTIALS
WEBHOST-DOMAIN: otn.see-sg.de
DATABASE-HOST: 188.68.47.52
DATABASE-USER: k34497_ota
DATABASE-PW: <MY_PASSWORD> = "tell me where to put the right password"
DATABASE-NAME: k34497_onetimenote
GIT-HUB REPO: git@github.com:see-coding/otn-app.git



## FULL DESCRIPTION OF THIS PROJECT
### **Projektzusammenfassung: WebApp "One-Time-Note" (OTN)**

Bei diesem Projekt handelt es sich um die Entwicklung einer Webanwendung namens **One-Time-Note (OTN)**. Ziel der App ist es, Benutzern eine einfache und sichere Möglichkeit zu bieten, Notizen zu erstellen, die sich nach einer bestimmten Zeit oder nach einmaligem Lesen selbst zerstören.

Die App ist über die Domain **otn.see-sg.de** erreichbar.

#### **Was kann die App? (Kernfunktionalität)**

Die Anwendung hat zwei Hauptfunktionen:

**1. Notiz erstellen:**
*   Ein Benutzer kann eine Textnotiz erstellen.
*   Optional kann er seine E-Mail-Adresse als Absenderinformation hinterlegen.
*   Für die Löschung der Notiz gibt es zwei grundlegende Optionen:
    *   **Einmalansicht (OTN - One-Time-Note):** Die Notiz wird sofort und endgültig gelöscht, nachdem sie ein einziges Mal aufgerufen wurde.
    *   **Zeitbasiertes Ablaufdatum:** Falls die Einmalansicht nicht gewählt wird, kann der Benutzer eine Lebensdauer für die Notiz festlegen (z.B. 5 Minuten, 1 Stunde, 1 Tag bis zu 30 Tagen). Nach Ablauf dieser Zeit wird die Notiz automatisch gelöscht.
*   Nach dem Erstellen erhält der Benutzer einen einzigartigen, kurzen Link (z.B. `otn.see-sg.de/mZ4bC`), den er teilen kann.

**2. Notiz ansehen:**
*   Ein Empfänger öffnet den geteilten Link im Browser, um die Notiz zu lesen.
*   Neben der Notiz wird ggf. die E-Mail-Adresse des Erstellers angezeigt.
*   Der Empfänger hat zwei Möglichkeiten:
    *   **"Gelesen + Tab schließen":** Der Tab schließt sich. Die Notiz bleibt (falls sie nicht als "One-Time-Note" markiert war) bis zu ihrem Ablaufdatum oder bis zur manuellen Löschung verfügbar.
    *   **"Notiz jetzt löschen":** Die Notiz wird sofort und unwiderruflich aus der Datenbank entfernt, unabhängig von ihrem ursprünglichen Ablaufdatum.

#### **Benötigte Tools & Technologien (Technischer Stack)**

Um dieses Projekt umzusetzen, werden folgende Komponenten benötigt:

*   **Backend (Serverseitige Logik):**
    *   Eine serverseitige Programmiersprache ist nötig, um die Logik (Notiz speichern, löschen, Links generieren) umzusetzen.
    *   **Empfehlungen:** **Node.js** (mit dem Framework **Express.js**) oder **PHP**.

*   **Frontend (Benutzeroberfläche im Browser):**
    *   Standard-Webtechnologien sind hier ausreichend.
    *   **Benötigt:** **HTML** (für die Struktur), **CSS** (für das Design) und **JavaScript** (für die Interaktivität, z.B. das Deaktivieren des Zeit-Auswahlfeldes).

*   **Datenbank:**
    *   Eine SQL-Datenbank zum Speichern der Notizen. Die Zugangsdaten sind bereits vorhanden.
    *   **Technologie:** **MySQL** oder **MariaDB**.
    *   **Sicherheit:** Die Notizen sollten in der Datenbank **verschlüsselt** gespeichert werden, um die Daten vor unbefugtem Zugriff zu schützen.

*   **Version Control:**
    *   Das bereitgestellte Git-Repository wird zur Code-Verwaltung genutzt.
    *   **Tool:** **Git** (Repository-Adresse: `git@github.com:see-coding/otn-app.git`).

*   **Webserver:**
    *   Ein Webserver wird benötigt, um die Anwendung im Internet bereitzustellen.
    *   **Empfehlungen:** **Nginx** oder **Apache**.

Mit dieser Zusammenfassung ist der Rahmen des Projekts klar definiert. Der nächste Schritt wäre die detaillierte Planung der Architektur und die Umsetzung der einzelnen Funktionen.



## ALL TASKS TO COMPLETE THE APP
### PHASE 1 - Projekt-Setup und Ordnerstruktur
"Ich möchte eine WebApp mit Node.js und dem Express.js Framework erstellen. Bitte erstelle mir die grundlegende Ordnerstruktur und eine package.json-Datei. Ich werde eine MySQL-Datenbank verwenden. Die App soll 'One-Time-Notes' erstellen. Benötigte Pakete sind express, mysql2 für die Datenbankverbindung und crypto für die Verschlüsselung."

### PHASE 2 - Datenbankverbindung und Tabellenerstellung
Erstelle eine neue Datei, z.B. database.js.
Bitte Cursor, den Verbindungscode zu schreiben.
Eingabe-Beispiel (im Chat oder direkt in der Datei):
"Erstelle in database.js den Code, um eine Verbindung zur MySQL-Datenbank herzustellen. Nutze das mysql2 Paket. Die Zugangsdaten sind: Host: 188.68.47.52, User: k34497_ota, PW: <DEIN_PASSWORT>, DB: k34497_onetimenote. Stelle sicher, dass das Passwort nicht im Code hardcodiert wird, sondern aus einer Umgebungsvariable gelesen wird (erstelle dafür auch eine .env Datei)." 
Lass Cursor die SQL-Tabelle erstellen.
Eingabe-Beispiel im Chat:
"Generiere mir den SQL CREATE TABLE Befehl für meine Notizen. Die Tabelle soll notes heißen und folgende Spalten haben: 
id (INT, auto-increment, primary key)
unique_id (VARCHAR, für den Link, z.B. 'mZ4bC')
note_content (TEXT, für die verschlüsselte Notiz)
creator_email (VARCHAR, optional)
expires_at (DATETIME, wann die Notiz abläuft)
is_one_time (BOOLEAN, um zu prüfen, ob es eine OTN ist)
created_at (TIMESTAMP, default current timestamp)"
Diesen SQL-Befehl kannst Du dann manuell in Deiner Datenbank ausführen.

### PHASE 3 - Das Frontend (HTML/CSS/JS)
Erstelle eine index.html im public Ordner.
Lass Cursor das HTML-Formular bauen.
Eingabe-Beispiel:
"Erstelle in index.html das HTML für meine App. Ich brauche ein Formular mit: 
Einer Checkbox mit dem Label 'OTN (Notiz nach einmaligem Ansehen löschen)'.
Einem Select-Feld für die Speicherdauer (5 Min, 15 Min, ... 30 Tage).
Einem textarea für die Notiz.
Einem optionalen Textfeld für die E-Mail des Erstellers.
Einem 'Notiz erstellen'-Button."
Füge die Interaktivität hinzu.
Eingabe-Beispiel:
"Füge jetzt JavaScript hinzu. Wenn die 'OTN'-Checkbox aktiviert ist, soll das Select-Feld für die Speicherdauer deaktiviert (disabled) werden." 

### PHASE 4 - Das Backend (Die Logik in server.js)
Das ist der Kern. Unterteile es in kleine logische Schritte.

### PHASE 4.1 - Notiz erstellen (Route):
Eingabe-Beispiel für den Chat:
"Erstelle mir in server.js eine Express POST-Route unter /create-note. Diese Route soll: 
Die Daten aus dem Frontend-Formular empfangen.
Eine zufällige, 6-stellige unique_id generieren.
Den Notiztext mit dem crypto-Modul von Node.js verschlüsseln (AES-256 wäre gut).
Das Ablaufdatum (expires_at) basierend auf der Benutzerauswahl berechnen.
Alle Daten in die notes-Tabelle in der MySQL-Datenbank einfügen.
Als Antwort den generierten Link zurückgeben, z.B. otn.see-sg.de/note/ + die unique_id."

### PHASE 4.2 - Notiz ansehen (Route):
Eingabe-Beispiel für den Chat:
"Erstelle jetzt eine Express GET-Route /note/:uniqueId. Diese Route soll: 
Die :uniqueId aus der URL nehmen.
Die passende Notiz aus der Datenbank suchen.
Prüfen, ob die Notiz eine is_one_time Notiz ist. Wenn ja, lösche sie sofort nach dem Auslesen aus der Datenbank.
Den Notiztext entschlüsseln.
Eine neue HTML-Seite rendern, die den Notizinhalt, die E-Mail des Erstellers und die zwei Buttons ('Gelesen + Tab schließen' und 'Notiz jetzt löschen') anzeigt."

### PHASE 4.3 - Notiz löschen (Route):
Eingabe-Beispiel für den Chat:
"Erstelle eine DELETE- oder POST-Route unter /delete-note/:uniqueId, die auf den 'Notiz jetzt löschen'-Button reagiert und den entsprechenden Eintrag aus der Datenbank entfernt." 




