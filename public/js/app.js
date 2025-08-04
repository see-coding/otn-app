document.addEventListener('DOMContentLoaded', function() {
    const noteForm = document.getElementById('noteForm');
    const isOneTimeCheckbox = document.getElementById('isOneTime');
    const expirationTimeSelect = document.getElementById('expirationTime');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const shareLinkInput = document.getElementById('shareLink');
    const copyLinkBtn = document.getElementById('copyLink');
    const newNoteBtn = document.getElementById('newNote');

    // OTN Checkbox Logik
    isOneTimeCheckbox.addEventListener('change', function() {
        if (this.checked) {
            expirationTimeSelect.disabled = true;
            expirationTimeSelect.style.opacity = '0.5';
        } else {
            expirationTimeSelect.disabled = false;
            expirationTimeSelect.style.opacity = '1';
        }
    });

    // Formular Submit Handler
    noteForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Loading anzeigen
        noteForm.classList.add('hidden');
        loadingDiv.classList.remove('hidden');
        
        // Formulardaten sammeln
        const formData = new FormData(noteForm);
        const data = {
            noteContent: formData.get('noteContent'),
            creatorEmail: formData.get('creatorEmail') || null,
            isOneTime: formData.get('isOneTime') === 'on',
            expirationTime: parseInt(formData.get('expirationTime'))
        };

        try {
            const response = await fetch('/create-note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Erfolg - Link anzeigen
                shareLinkInput.value = result.link;
                loadingDiv.classList.add('hidden');
                resultDiv.classList.remove('hidden');
            } else {
                // Fehler
                throw new Error(result.error || 'Fehler beim Erstellen der Notiz');
            }
        } catch (error) {
            console.error('Fehler:', error);
            alert('Fehler beim Erstellen der Notiz: ' + error.message);
            
            // Zurück zum Formular
            loadingDiv.classList.add('hidden');
            noteForm.classList.remove('hidden');
        }
    });

    // Link kopieren
    copyLinkBtn.addEventListener('click', function() {
        shareLinkInput.select();
        shareLinkInput.setSelectionRange(0, 99999); // Für mobile Geräte
        
        try {
            document.execCommand('copy');
            this.textContent = '✅ Kopiert!';
            this.style.background = '#28a745';
            
            setTimeout(() => {
                this.textContent = '📋 Kopieren';
                this.style.background = '#6c757d';
            }, 2000);
        } catch (err) {
            // Fallback für moderne Browser
            navigator.clipboard.writeText(shareLinkInput.value).then(() => {
                this.textContent = '✅ Kopiert!';
                this.style.background = '#28a745';
                
                setTimeout(() => {
                    this.textContent = '📋 Kopieren';
                    this.style.background = '#6c757d';
                }, 2000);
            });
        }
    });

    // Neue Notiz erstellen
    newNoteBtn.addEventListener('click', function() {
        resultDiv.classList.add('hidden');
        noteForm.classList.remove('hidden');
        noteForm.reset();
        
        // Select-Feld wieder aktivieren
        expirationTimeSelect.disabled = false;
        expirationTimeSelect.style.opacity = '1';
    });

    // Auto-Resize für Textarea
    const textarea = document.getElementById('noteContent');
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // Formular-Validierung
    noteForm.addEventListener('input', function() {
        const submitBtn = noteForm.querySelector('button[type="submit"]');
        const noteContent = document.getElementById('noteContent').value.trim();
        
        if (noteContent.length > 0) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        } else {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
        }
    });

    // Initial validation
    noteForm.dispatchEvent(new Event('input'));
}); 