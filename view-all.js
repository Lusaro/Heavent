document.addEventListener('DOMContentLoaded', () => {
    // Filter-Elemente
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const searchInput = document.getElementById('searchInput');
    const sizeButtons = document.querySelectorAll('.size-btn');
    const productCards = document.querySelectorAll('.product-card');

    // Warenkorb-Elemente
    const cartCountElement = document.getElementById('cartCount');
    const openCartModalBtn = document.getElementById('openCartModal');
    const cartModal = document.getElementById('cartModal');
    const closeCartModalBtn = document.getElementById('closeCartModal');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalItemsElement = document.getElementById('cartTotalItems');
    const cartTotalDiscountElement = document.getElementById('cartTotalDiscount');
    const cartTotalPriceElement = document.getElementById('cartTotalPrice');
    const clearCartBtn = document.getElementById('clearCartBtn');

    // Größenanzeige zu jeder Produktkarte hinzufügen
    productCards.forEach(card => {
        const size = card.dataset.size;
        const sizeElement = document.createElement('p');
        sizeElement.className = 'product-size';
        sizeElement.style.marginLeft = '2%';
        sizeElement.textContent = `Größe: ${size}`;
        card.appendChild(sizeElement);
    });

    // Initialisiere Filter (Alle Größen ausgewählt)
    document.querySelector('.size-btn[data-size="all"]').classList.add('active');

    // --- Favoriten-Verwaltung ---
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    function saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    // Rendert und fügt Event Listener für die Favoriten-Buttons hinzu
    function renderFavoriteButtons() {
        const favoriteButtons = document.querySelectorAll('.favorite-btn-container .favorite-btn');
        favoriteButtons.forEach(button => {
            const productId = button.dataset.id;
            if (favorites.includes(productId)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                toggleFavorite(productId, button);
            });
        });
    }

    // Schaltet den Favoritenstatus eines Produkts um
    function toggleFavorite(productId, button) {
        const index = favorites.indexOf(productId);
        if (index > -1) {
            favorites.splice(index, 1);
            button.classList.remove('active');
        } else {
            favorites.push(productId);
            button.classList.add('active');
        }
        saveFavorites();
    }
    // --- ENDE Favoriten-Verwaltung ---


    // --- Warenkorb-Verwaltung ---
    // cart: Ein Array von Objekten { id: 'produkt-id', quantity: 1, originalPrice: 100, modalDiscount: 0 }
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const PRODUCT_QUANTITY_DISCOUNT = 0.15; // 15% Rabatt für gleiche Produkte bei >= 3 Stück

    // Speichert den Warenkorb im LocalStorage und aktualisiert die UI
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        renderCartItems(); // Warenkorb-Anzeige im Modal aktualisieren
    }

    // Aktualisiert die Anzeige der Gesamtartikel im Warenkorb-Icon
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }

    // Holt Produktdaten (Bild, Titel, Preis, Größe) anhand der Produkt-ID
    function getProductDataById(productId) {
        const card = document.querySelector(`.product-card[data-id="${productId}"]`);
        if (card) {
            const imageUrl = card.querySelector('.product-image').style.backgroundImage.replace('url("', '').replace('")', '');
            const title = card.querySelector('h3').innerText;
            const priceText = card.querySelector('p').innerText;
            const price = parseFloat(priceText.replace('Preis: €', '').replace(',', '.'));
            const size = card.dataset.size;
            return { imageUrl, title, price, size };
        }
        return null;
    }

    // Rendert die Artikel im Warenkorb-Modal
    function renderCartItems() {
        cartItemsContainer.innerHTML = ''; // Vorherige Elemente leeren
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Dein Warenkorb ist leer.</p>';
            cartTotalItemsElement.textContent = 0;
            cartTotalDiscountElement.textContent = '0,00€';
            cartTotalPriceElement.textContent = '0,00€';
            return;
        }

        let totalItems = 0;
        let overallDiscountAmount = 0;
        let overallTotalPrice = 0;

        cart.forEach(item => {
            const productData = getProductDataById(item.id);
            if (!productData) return;

            const basePricePerUnit = item.originalPrice; // Der "zweifache" Preis aus dem Produkt-Modal
            // const currentItemOriginalTotal = basePricePerUnit * item.quantity; // Wird nicht mehr direkt angezeigt, aber für Berechnung des overallDiscountAmount benötigt

            // Preis nach dem Rabatt aus dem Produkt-Modal (5-50% Klick-Rabatt)
            let priceAfterModalDiscountPerUnit = basePricePerUnit * (1 - item.modalDiscount / 100);

            let currentItemPriceTotal = priceAfterModalDiscountPerUnit * item.quantity;

            // ZUSÄTZLICHER Mengenrabatt für das gleiche Produkt (bei >= 3 Stück)
            let quantityDiscountAmount = 0;
            let itemHasQuantityDiscount = false; // Flag für Mengenrabatt auf DIESEM Item
            if (item.quantity >= 3) {
                quantityDiscountAmount = currentItemPriceTotal * PRODUCT_QUANTITY_DISCOUNT;
                currentItemPriceTotal -= quantityDiscountAmount;
                itemHasQuantityDiscount = true;
            }

            // Prüfen, ob für DIESES Produkt ein Rabatt vorhanden ist (Modal- oder Mengenrabatt)
            const itemHasAnyDiscount = (item.modalDiscount > 0 || itemHasQuantityDiscount);

            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="cart-item-image" style="background-image: url('${productData.imageUrl}');"></div>
                <div class="cart-item-details">
                    <h4>${productData.title} (${productData.size})</h4>
                    <p>Menge: ${item.quantity} x ${basePricePerUnit.toFixed(2).replace('.', ',')}€</p>
                    ${item.modalDiscount > 0 ? `<p>Klick-Rabatt: ${item.modalDiscount}%</p>` : ''}
                    ${itemHasQuantityDiscount ? `<p>Mengenrabatt (${(PRODUCT_QUANTITY_DISCOUNT * 100).toFixed(0)}%): -${quantityDiscountAmount.toFixed(2).replace('.', ',')}€</p>` : ''}
                </div>
                <div class="cart-item-price">
                    <span class="${itemHasAnyDiscount ? 'original-price-total' : ''}">
                        ${currentItemPriceTotal.toFixed(2).replace('.', ',')}€
                    </span>
                </div>
                <button class="cart-item-remove" data-id="${item.id}">&times;</button>
            `;
            cartItemsContainer.appendChild(itemElement);

            totalItems += item.quantity;
            overallTotalPrice += currentItemPriceTotal;
            // Berechnung des overallDiscountAmount basierend auf originalem Preis und finalem rabattierten Preis des Items
            overallDiscountAmount += ((basePricePerUnit * item.quantity) - currentItemPriceTotal);
        });

        cartTotalItemsElement.textContent = totalItems;
        cartTotalDiscountElement.textContent = overallDiscountAmount.toFixed(2).replace('.', ',');
        // Gesamtpreis zeigt immer den rabattierten Endpreis an
        cartTotalPriceElement.textContent = overallTotalPrice.toFixed(2).replace('.', ',') + '€';

        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', (event) => {
                const productIdToRemove = event.target.dataset.id;
                removeFromCart(productIdToRemove);
            });
        });

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Dein Warenkorb ist leer.</p>';
        }
    }

    // Fügt ein Produkt zum Warenkorb hinzu oder aktualisiert es
    function addToCart(product) {
        const existingItemIndex = cart.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
            const existingItem = cart[existingItemIndex];
            existingItem.quantity += product.quantity;
            existingItem.modalDiscount = Math.max(existingItem.modalDiscount, product.modalDiscount);
            existingItem.originalPrice = product.originalPrice; // Aktualisiere den originalPrice
        } else {
            cart.push(product);
        }
        saveCart();
    }

    // Entfernt ein Produkt vollständig aus dem Warenkorb
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
    }
    // --- ENDE Warenkorb-Verwaltung ---


    // Haupt-Filterfunktion
    function filterProducts() {
        const category = categoryFilter.value;
        const price = priceFilter.value;
        const search = searchInput.value.toLowerCase();
        const activeSizeBtn = document.querySelector('.size-btn.active');
        const size = activeSizeBtn.dataset.size;

        productCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const cardPrice = card.dataset.price;
            const cardSize = card.dataset.size || 'all';
            const title = card.querySelector('h3').innerText.toLowerCase();
            const productId = card.dataset.id ? card.dataset.id.toLowerCase() : '';


            const matches = (
                (category === 'all' || category === cardCategory) &&
                (price === 'all' || price === cardPrice) &&
                (size === 'all' || size === cardSize) &&
                (title.includes(search) || productId.includes(search))
            );

            card.style.transform = 'none';
            card.style.scale = '1';

            if (matches) {
                card.classList.remove('hidden');
                card.style.height = 'auto';
                card.style.width = 'auto';
                card.style.opacity = '1';
                card.style.visibility = 'visible';
                card.style.position = 'relative';
            } else {
                card.classList.add('hidden');
                card.style.height = '0';
                card.style.width = '0';
                card.style.opacity = '0';
                card.style.visibility = 'hidden';
                card.style.position = 'absolute';
            }
        });
    }

    // Event Listener für Größen-Buttons
    sizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterProducts();
        });
    });

    // Event Listener für andere Filter
    categoryFilter.addEventListener('change', filterProducts);
    priceFilter.addEventListener('change', filterProducts);
    searchInput.addEventListener('input', filterProducts);

    // Modal-Funktionalität (Produktdetails)
    const modal = document.getElementById('productModal');
    const modalImgElement = document.querySelector('.modal-image');
    const modalTitle = document.querySelector('.modal-title');
    const modalPrice = document.querySelector('.modal-price');
    const modalSize = document.querySelector('.modal-content .product-size');
    const modalDescription = document.querySelector('.modal-description');
    const modalDiscount = document.querySelector('.modal-discount span');
    const closeModal = document.querySelector('.close-modal');
    const addToCartModalBtn = document.querySelector('.add-to-cart');
    const buyNowBtn = document.querySelector('.buy-now');

    const originalPriceElement = document.querySelector('.original-price');
    const modalImageContainer = document.querySelector('.modal-image-container');

    let currentDiscount = 0;
    let currentOriginalPrice = 0;
    let clickCount = 0;
    const MAX_DISCOUNT = 50;
    let currentProductId = null; // Speichert die ID des aktuell geöffneten Produkts

    // Produktklick-Handler mit Animation Reset
    productCards.forEach(card => {
        card.addEventListener('click', () => {
            currentDiscount = 0;
            clickCount = 0;
            addToCartModalBtn.disabled = false;
            addToCartModalBtn.style.opacity = '1';
            addToCartModalBtn.style.cursor = 'pointer';
            addToCartModalBtn.textContent = 'Warenkorb';

            originalPriceElement.style.display = 'none';

            const imageUrl = card.querySelector('.product-image').style.backgroundImage;
            const cleanImageUrl = imageUrl.replace('url("', '').replace('")', '');
            const title = card.querySelector('h3').innerText;
            const priceText = card.querySelector('p').innerText;
            const price = parseFloat(priceText.replace('Preis: €', '').replace(',', '.'));
            const size = card.dataset.size;
            currentOriginalPrice = price * 2; // Der ursprüngliche Preis, auf den sich die Rabatte beziehen
            currentProductId = card.dataset.id;

            // Reset Animationen
            const modalElements = [
                modalImageContainer,
                document.querySelector('.modal-content'),
                modalTitle,
                modalPrice,
                modalDescription,
                document.querySelector('.modal-discount'),
                document.querySelector('.modal-actions')
            ];

            modalElements.forEach(el => {
                if (el) {
                    el.style.opacity = '0';
                    el.style.transition = 'none';
                    el.style.transform = el === modalImageContainer
                        ? 'translateX(-50px)'
                        : el.classList.contains('modal-content')
                            ? 'translateX(50px)'
                            : 'translateX(20px)';
                }
            });

            // Bild setzen mit <img> Tag
            modalImgElement.src = cleanImageUrl;
            modalImgElement.alt = title;

            modalTitle.innerText = title;
            modalSize.textContent = `Größe: ${size}`;
            modalDescription.innerText = 'Premium Qualität mit langer Haltbarkeit.';

            updateDiscountDisplay(); // Aktualisiert den Preis im Modal basierend auf currentDiscount
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Animationen nach kurzer Verzögerung auslösen
            setTimeout(() => {
                modalElements.forEach(el => {
                    if (el) {
                        el.style.transition = '';
                        el.style.opacity = '1';
                        el.style.transform = 'translateX(0)';
                    }
                });
            }, 50);
        });
    });

    // Aktualisiert die Anzeige des Rabatts und Preises im Produkt-Modal
    function updateDiscountDisplay() {
        modalDiscount.textContent = `${currentDiscount}%`;
        const discountedPrice = currentOriginalPrice * (1 - currentDiscount / 100);

        if (currentDiscount > 0) {
            modalPrice.innerHTML = `
                ${discountedPrice.toFixed(2).replace('.', ',')}€
                <span class="original-price">${currentOriginalPrice.toFixed(2).replace('.', ',')}€</span>
            `;
            originalPriceElement.style.display = 'inline';
        } else {
            modalPrice.innerHTML = `${currentOriginalPrice.toFixed(2).replace('.', ',')}€`;
            originalPriceElement.style.display = 'none';
        }
    }

    // Warenkorb-Button Klick-Handler im PRODUKT-MODAL (nur für Menge/Rabatt im Modal)
    addToCartModalBtn.addEventListener('click', () => {
        clickCount++;

        if (currentDiscount < MAX_DISCOUNT) {
            currentDiscount += 5;
            if (currentDiscount >= MAX_DISCOUNT) {
                currentDiscount = MAX_DISCOUNT;
                addToCartModalBtn.disabled = true;
                addToCartModalBtn.style.opacity = '0.6';
                addToCartModalBtn.style.cursor = 'not-allowed';
            }
        }

        updateDiscountDisplay();
        addToCartModalBtn.textContent = clickCount > 0 ? `Warenkorb x${clickCount}` : 'Warenkorb';
    });

    // Kaufen-Button Klick-Handler im PRODUKT-MODAL (fügt zum Warenkorb hinzu)
    buyNowBtn.addEventListener('click', () => {
        if (currentProductId && clickCount > 0) {
            addToCart({
                id: currentProductId,
                quantity: clickCount,
                originalPrice: currentOriginalPrice,
                modalDiscount: currentDiscount
            });
            alert(`${clickCount}x ${modalTitle.textContent} wurde zum Warenkorb hinzugefügt!`);
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        } else if (clickCount === 0) {
            alert('Bitte wähle zuerst eine Menge, indem du auf "Warenkorb" klickst.');
        } else {
            alert('Es gab ein Problem beim Hinzufügen zum Warenkorb. Bitte versuche es erneut.');
        }
    });


    // Produkt-Modal schließen
    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Fallback für fehlende Bilder
    modalImgElement.onerror = function() {
        this.src = 'fallback-image.jpg';
        console.error('Bild konnte nicht geladen werden');
    };

    // --- Event Listener für Warenkorb-Modal ---
    openCartModalBtn.addEventListener('click', () => {
        renderCartItems();
        cartModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    closeCartModalBtn.addEventListener('click', () => {
        cartModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    clearCartBtn.addEventListener('click', () => {
        if (confirm('Möchtest du wirklich den gesamten Warenkorb leeren?')) {
            cart = [];
            saveCart();
            alert('Warenkorb wurde geleert!');
        }
    });

    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (cart.length > 0) {
            alert('Weiter zur Kasse! Dein Gesamtpreis beträgt ' + cartTotalPriceElement.textContent);
        } else {
            alert('Dein Warenkorb ist leer. Füge zuerst Produkte hinzu.');
        }
    });
    // --- ENDE Event Listener für Warenkorb-Modal ---


    // Initialisierungen beim Laden der Seite
    renderFavoriteButtons();
    updateCartCount();
});