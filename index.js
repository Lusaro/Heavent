document.addEventListener('DOMContentLoaded', () => {

    // --- Hero Scroll Animation ---
    const hero = document.querySelector('.hero');
    const heroBrand = document.querySelector('.hero-brand');
    const mainContent = document.querySelector('.main-content');

    function handleScroll() {
        if (!hero || !heroBrand || !mainContent) return;

        const scrollPosition = window.scrollY;
        const heroHeight = hero.offsetHeight;
        const scrollRatio = Math.min(scrollPosition / (heroHeight * 0.7), 1);

        hero.style.opacity = 1 - (scrollRatio * 1.2);
        hero.style.transform = `scale(${1 + scrollRatio * 0.1})`;
        heroBrand.style.opacity = 1 - (scrollRatio * 1.5);
        heroBrand.style.transform = `translateY(${scrollRatio * -40}px)`;

        if (scrollPosition > heroHeight * 0.3) {
            mainContent.classList.add('visible');
        } else {
            mainContent.classList.remove('visible');
        }

        if (scrollPosition > heroHeight) {
            hero.style.position = 'fixed';
            hero.style.top = '0';
            hero.style.height = '0';
        } else {
            hero.style.position = 'relative';
            hero.style.height = '100vh';
        }
    }

    if (hero && heroBrand && mainContent) {
        window.addEventListener('scroll', handleScroll);
        handleScroll();
    }


    // --- Detail View Funktionalität ---
    const itemCards = document.querySelectorAll('.item-card');
    let overlay;

    itemCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('buy-button')) return;

            overlay = document.createElement('div');
            overlay.classList.add('overlay');
            document.body.appendChild(overlay);

            const detailView = card.cloneNode(true);
            detailView.classList.add('detail-view');

            const buyButtonInDetail = detailView.querySelector('.buy-button');
            if (buyButtonInDetail) {
                buyButtonInDetail.remove();
            }

            const detailContainer = document.createElement('div');
            detailContainer.classList.add('detail-container');
            detailContainer.appendChild(detailView);

            const closeBtn = document.createElement('button');
            closeBtn.classList.add('close-btn');
            closeBtn.innerHTML = '×';
            closeBtn.addEventListener('click', closeDetailView);
            detailContainer.appendChild(closeBtn);

            overlay.appendChild(detailContainer);

            setTimeout(() => {
                overlay.classList.add('active');
                detailContainer.classList.add('active');
                document.body.style.overflow = 'hidden';
            }, 0);
        });
    });

    function closeDetailView() {
        const currentOverlay = document.querySelector('.overlay.active');
        const detailContainer = document.querySelector('.detail-container.active');

        if (currentOverlay && detailContainer) {
            currentOverlay.classList.remove('active');
            detailContainer.classList.remove('active');

            setTimeout(() => {
                currentOverlay.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('overlay') && !e.target.closest('.detail-container')) {
            closeDetailView();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.querySelector('.overlay.active')) {
            closeDetailView();
        }
    });

    // --- CSS-basierter Seitenübergang (Nur Abdunkeln beim 'Character'-Button) ---

    // **WICHTIG:** Diese Dauer muss mit der 'transition'-Dauer in deiner CSS-Datei (style.css)
    // für die '.page-transition-overlay' Klasse übereinstimmen!
    const FADE_TO_BLACK_DURATION_SECONDS = 0.8; 
    const FADE_TO_BLACK_DURATION_MS = FADE_TO_BLACK_DURATION_SECONDS * 1000;

    // Funktion zum Auslösen des Abdunkelns und zur Navigation nach Abschluss
    function fadeOutPageAndNavigate(url) {
        let transitionOverlay = document.querySelector('.page-transition-overlay');

        // Erstelle das Overlay-Element, falls es noch nicht im DOM ist
        if (!transitionOverlay) {
            transitionOverlay = document.createElement('div');
            transitionOverlay.classList.add('page-transition-overlay');
            document.body.appendChild(transitionOverlay);
        }
        
        // Füge die 'no-scroll'-Klasse zum Body hinzu, um den Overflow während der Animation zu verhindern
        document.body.classList.add('no-scroll');

        // Aktiviere die CSS-Animation für das Abdunkeln.
        // Ein minimaler Timeout ist hier immer noch entscheidend, damit der Browser
        // den Startzustand (opacity: 0) erkennt, bevor die 'active'-Klasse angewendet wird.
        setTimeout(() => {
            transitionOverlay.classList.add('active');
        }, 10); 

        // Navigiere erst zur nächsten Seite, NACHDEM die Abdunkel-Animation komplett abgeschlossen ist.
        // Dies sorgt für die gewünschte Verzögerung und den flüssigen Übergang.
        setTimeout(() => {
            window.location.href = url;
            // Entferne die 'no-scroll'-Klasse, wenn die Navigation ausgelöst wurde.
            // Dies ist wichtig, falls die Navigation aus irgendeinem Grund fehlschlägt
            // oder wenn man zurück auf die Ursprungsseite kommt.
            document.body.classList.remove('no-scroll'); 
        }, FADE_TO_BLACK_DURATION_MS + 50); // Kleiner Puffer nach der Animation für Sicherheit
    }

    // Event Listener für Navigationslinks, die zur 'character.html' führen sollen
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const targetUrl = button.getAttribute('href');

            // Prüfe, ob der Button zur 'character.html' führt
            if (targetUrl === 'character.html') {
                event.preventDefault(); // Standard-Link-Verhalten (sofortige Navigation) verhindern
                fadeOutPageAndNavigate(targetUrl); // Löse die Abdunkel-Animation aus und navigiere verzögert
            }
            // Für alle anderen Buttons passiert die Standard-Navigation OHNE Animation.
        });
    });

    // Dieser Abschnitt ist für Animationen auf der Character-Seite nach dem Laden gedacht.
    // **Wichtig:** Diese Animationen müssen auf der 'character.html' selbst ausgelöst werden,
    // da diese JS-Datei (main.js) beim Seitenwechsel neu geladen wird.
    // Daher bleibt dieser Block in der 'main.js' (die meistens auf der Startseite liegt) leer.
    // Wenn du spezifische Animationen für die character.html hast, sollten diese
    // in der JS-Datei, die auf character.html geladen wird, oder direkt auf der character.html
    // in einem <script>-Tag stehen.
    const isCharacterPage = document.querySelector('h1')?.textContent.trim() === 'Character';
    if (isCharacterPage) {
        // Hier wäre der Platz für Initial-Animationen NUR auf der Character-Seite,
        // z.B. Einblenden von Elementen nach dem Laden.
        // Aktuell ist dieser Block leer, da die Hauptfunktionalität die Abdunklung betrifft.
    }
});