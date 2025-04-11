document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    const themeToggleButton = document.getElementById('theme-toggle');
    const themeIcon = themeToggleButton ? themeToggleButton.querySelector('i') : null;
    const productGridContainer = document.querySelector('.product-grid-container');
    const productDetailContainer = document.getElementById('product-detail-container');
    const cartBadge = document.querySelector('.cart-badge');
    const backToTopButton = document.getElementById('back-to-top-btn');
    const prevProductButton = document.getElementById('prev-product-btn');
    const nextProductButton = document.getElementById('next-product-btn');
    const addToCartFeedback = document.getElementById('add-to-cart-feedback');

    const currentTheme = localStorage.getItem('theme') || null;
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    let cart = JSON.parse(localStorage.getItem('darkbyte-cart')) || [];
    let currentProductList = JSON.parse(localStorage.getItem('darkbyte-product-list')) || [];
    let currentProduct = null; // Store the fetched product data for the detail page

    const saveCart = () => {
        localStorage.setItem('darkbyte-cart', JSON.stringify(cart));
    };

    const saveProductList = (products) => {
         localStorage.setItem('darkbyte-product-list', JSON.stringify(products.map(p => ({id: p.id, title: p.title, image: p.image, price: p.price}) ) ) ); // Store only necessary info
         currentProductList = products;
    };

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            themeToggleButton.setAttribute('aria-label', theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
        }
    };

    const updateCartBadge = () => {
        if (cartBadge) {
            const cartItemCount = cart.length;
            cartBadge.textContent = cartItemCount;
            cartBadge.style.display = cartItemCount > 0 ? 'flex' : 'none';
             if (cartItemCount > 0 && !cartBadge.classList.contains('active-pulse')) {
                 cartBadge.classList.add('active-pulse');
                 setTimeout(() => cartBadge.classList.remove('active-pulse'), 300);
             }
        }
    };

     const showFeedbackMessage = (message) => {
        if (!addToCartFeedback) return;
        addToCartFeedback.textContent = message;
        addToCartFeedback.classList.add('show');
        setTimeout(() => {
            addToCartFeedback.classList.remove('show');
        }, 2000); // Hide after 2 seconds
    };


    const addToCart = (productId, quantity, variation, buttonElement) => {
        console.log(`Adding product ${productId}, Qty: ${quantity}, Variation: ${variation} to cart.`);
        const newItem = {
            id: productId,
            quantity: quantity,
            variation: variation,
            // Optionally add price/name here if needed later in cart page
            // price: currentProduct ? currentProduct.price : null,
            // name: currentProduct ? currentProduct.title : null
        };
        // Check if item with same ID and variation already exists - simplistic approach
        const existingItemIndex = cart.findIndex(item => item.id === productId && item.variation === variation);

        if (existingItemIndex > -1) {
            // Update quantity (example - replace if you want separate lines)
            // cart[existingItemIndex].quantity += quantity;
            // For now, just add as a new line for simplicity
            cart.push(newItem);
        } else {
            cart.push(newItem);
        }

        saveCart();
        updateCartBadge();
        showFeedbackMessage("Item added to cart!");

        if (buttonElement) {
            buttonElement.textContent = 'Added!';
            buttonElement.disabled = true;
            setTimeout(() => {
                if(buttonElement){ // Check if still exists
                    buttonElement.textContent = 'Add to Cart';
                    buttonElement.disabled = false;
                }
            }, 1500); // Shorter timeout for button text reset
        }
    };

    const displayProducts = (products) => {
        if (!productGridContainer) return;
        productGridContainer.innerHTML = '';
        saveProductList(products);

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            const link = document.createElement('a');
            link.href = `product.html?id=${product.id}`;
            link.className = 'product-card-link';

            const imageContainer = document.createElement('div');
            imageContainer.className = 'product-image-container';

            const image = document.createElement('img');
            image.src = product.image;
            image.alt = product.title;
            image.className = 'product-image';
            image.loading = 'lazy';
            imageContainer.appendChild(image);

            const infoDiv = document.createElement('div');
            infoDiv.className = 'product-info';

            const name = document.createElement('h3');
            name.className = 'product-name';
            name.textContent = product.title;

            const price = document.createElement('p');
            price.className = 'product-price';
            price.textContent = `$${product.price.toFixed(2)}`;

            infoDiv.appendChild(name);
            infoDiv.appendChild(price);

            link.appendChild(imageContainer);
            link.appendChild(infoDiv);

            const button = document.createElement('button');
            button.className = 'add-to-cart-button';
            button.textContent = 'Add to Cart';
            button.dataset.productId = product.id;
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product.id, 1, 'Default', button); // Add default qty/variation from grid
            });

            card.appendChild(link);
            card.appendChild(button);

            productGridContainer.appendChild(card);
        });
    };

    const setupInteractiveElements = (product) => {
        const quantityInput = document.getElementById('quantity-input');
        const decreaseBtn = document.getElementById('quantity-decrease');
        const increaseBtn = document.getElementById('quantity-increase');
        const variationButtons = document.querySelectorAll('.variation-option-btn');
        const totalPriceValue = document.getElementById('total-price-value');
        const detailButton = document.querySelector('.product-detail-add-to-cart');
        let selectedVariation = 'M'; // Default placeholder selection
        let currentQuantity = 1;

        const updateTotalPrice = () => {
            if (!totalPriceValue || !product) return;
            const price = product.price || 0;
            const total = price * currentQuantity;
            totalPriceValue.textContent = `$${total.toFixed(2)}`;
        };

        if (quantityInput && decreaseBtn && increaseBtn) {
            quantityInput.value = currentQuantity;
            decreaseBtn.disabled = currentQuantity <= 1;

            decreaseBtn.addEventListener('click', () => {
                if (currentQuantity > 1) {
                    currentQuantity--;
                    quantityInput.value = currentQuantity;
                    decreaseBtn.disabled = currentQuantity <= 1;
                    updateTotalPrice();
                }
            });

            increaseBtn.addEventListener('click', () => {
                currentQuantity++;
                quantityInput.value = currentQuantity;
                decreaseBtn.disabled = false;
                updateTotalPrice();
            });

             quantityInput.addEventListener('change', (e) => {
                let newValue = parseInt(e.target.value, 10);
                if (isNaN(newValue) || newValue < 1) {
                    newValue = 1;
                }
                currentQuantity = newValue;
                e.target.value = currentQuantity;
                decreaseBtn.disabled = currentQuantity <= 1;
                updateTotalPrice();
            });
        }

        variationButtons.forEach(btn => {
             // Set default 'M' as active initially
             if(btn.dataset.value === selectedVariation){
                 btn.classList.add('active');
             }
            btn.addEventListener('click', () => {
                variationButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedVariation = btn.dataset.value;
                console.log("Selected variation:", selectedVariation); // For debugging
            });
        });

        if (detailButton) {
             // Remove previous listener if any
             detailButton.replaceWith(detailButton.cloneNode(true));
             const newDetailButton = productDetailContainer.querySelector('.product-detail-add-to-cart');

             if(newDetailButton) {
                 newDetailButton.addEventListener('click', () => {
                     addToCart(product.id, currentQuantity, selectedVariation, newDetailButton);
                 });
             }
        }

        updateTotalPrice(); // Initial price calculation
    };

    const displayProductDetails = (product) => {
        if (!productDetailContainer) return;
        currentProduct = product; // Store product data globally for this page

        document.title = `${product.title} - DarkByte`;

        productDetailContainer.innerHTML = `
            <div class="product-detail-image-container">
                <img src="${product.image}" alt="${product.title}" class="product-detail-image" loading="lazy">
            </div>
            <div class="product-detail-info">
                <h1 class="product-detail-title">${product.title}</h1>
                <p class="product-detail-price" id="product-unit-price">$${product.price.toFixed(2)}</p>
                <p class="product-detail-category"><strong>Category:</strong> ${product.category}</p>

                <div class="product-variations">
                   <div class="variation-group">
                        <span class="variation-label">Size:</span>
                        <div class="variation-options" id="size-options">
                            <button class="variation-option-btn" data-value="S">S</button>
                            <button class="variation-option-btn" data-value="M">M</button>
                            <button class="variation-option-btn" data-value="L">L</button>
                            <button class="variation-option-btn" data-value="XL">XL</button>
                        </div>
                   </div>
                    </div>

                 <div class="quantity-selector">
                    <span class="quantity-label">Quantity:</span>
                    <button id="quantity-decrease" class="quantity-btn" aria-label="Decrease quantity">-</button>
                    <input type="number" id="quantity-input" class="quantity-input" value="1" min="1" aria-label="Quantity">
                    <button id="quantity-increase" class="quantity-btn" aria-label="Increase quantity">+</button>
                 </div>

                 <div class="total-price-container">
                    <span class="total-price-label">Total:</span>
                    <span id="total-price-value">$${product.price.toFixed(2)}</span>
                 </div>

                <button class="product-detail-add-to-cart" data-product-id="${product.id}">Add to Cart</button>
                <p class="product-detail-description">${product.description}</p>
            </div>
        `;

        setupInteractiveElements(product); // Add listeners to new elements
        setupProductNav(product.id);
    };

    const setupProductNav = (currentProductId) => {
         if (!prevProductButton || !nextProductButton || currentProductList.length === 0) {
             if(prevProductButton) {
                 prevProductButton.classList.remove('visible');
                 prevProductButton.classList.add('disabled');
             }
             if(nextProductButton) {
                 nextProductButton.classList.remove('visible');
                 nextProductButton.classList.add('disabled');
             }
             return;
         };

         const productIndex = currentProductList.findIndex(p => p.id === currentProductId);

         if (productIndex === -1) {
             prevProductButton.classList.remove('visible');
             nextProductButton.classList.remove('visible');
             prevProductButton.classList.add('disabled');
             nextProductButton.classList.add('disabled');
             return;
         }

         if (productIndex > 0) {
             const prevProductId = currentProductList[productIndex - 1].id;
             prevProductButton.href = `product.html?id=${prevProductId}`;
             prevProductButton.classList.remove('disabled');
             prevProductButton.classList.add('visible');

         } else {
             prevProductButton.removeAttribute('href');
             prevProductButton.classList.add('disabled');
             prevProductButton.classList.remove('visible');
         }

         if (productIndex < currentProductList.length - 1) {
             const nextProductId = currentProductList[productIndex + 1].id;
             nextProductButton.href = `product.html?id=${nextProductId}`;
             nextProductButton.classList.remove('disabled');
             nextProductButton.classList.add('visible');
         } else {
             nextProductButton.removeAttribute('href');
             nextProductButton.classList.add('disabled');
             nextProductButton.classList.remove('visible');
         }
    };

    const fetchProducts = async () => {
        if (!productGridContainer) return;
        productGridContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--color-text-muted);">Loading products...</p>';
        try {
            const response = await fetch('https://fakestoreapi.com/products?limit=18');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error("Could not fetch products:", error);
             productGridContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: red;">Failed to load products. Please try again later.</p>';
             saveProductList([]);
        }
    };

     const fetchProductDetails = async (productId) => {
        if (!productDetailContainer || !productId) return;
        productDetailContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-muted);">Loading product details...</p>';
        if(prevProductButton) prevProductButton.classList.remove('visible');
        if(nextProductButton) nextProductButton.classList.remove('visible');

        try {
            const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const product = await response.json();
            if(product && product.id) { // Check if product has an ID
                displayProductDetails(product);
            } else {
                 throw new Error('Product data invalid or not found');
            }
        } catch (error) {
            console.error("Could not fetch product details:", error);
            productDetailContainer.innerHTML = '<p style="text-align: center; color: red;">Failed to load product details. Product may not exist.</p>';
            document.title = "Product Not Found - DarkByte";
             if(prevProductButton) {
                 prevProductButton.classList.add('disabled');
                 prevProductButton.classList.remove('visible');
             }
             if(nextProductButton) {
                nextProductButton.classList.add('disabled');
                nextProductButton.classList.remove('visible');
             }
        }
    };

    const handleScroll = () => {
        if (backToTopButton) {
            backToTopButton.classList.toggle('active', window.scrollY > 300);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (hamburgerMenu && mobileNav) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            mobileNav.classList.toggle('active');
            hamburgerMenu.setAttribute('aria-expanded', String(mobileNav.classList.contains('active')));
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });

        mobileNav.addEventListener('click', (e) => {
             if (e.target.tagName === 'A') {
                hamburgerMenu.classList.remove('active');
                mobileNav.classList.remove('active');
                hamburgerMenu.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
             }
        });

        document.addEventListener('click', (event) => {
            const isClickInsideNav = mobileNav.contains(event.target);
            const isClickOnHamburger = hamburgerMenu.contains(event.target);
            if (!isClickInsideNav && !isClickOnHamburger && mobileNav.classList.contains('active')) {
                hamburgerMenu.classList.remove('active');
                mobileNav.classList.remove('active');
                hamburgerMenu.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }

    if (backToTopButton) {
        window.addEventListener('scroll', handleScroll);
        backToTopButton.addEventListener('click', scrollToTop);
    }


    if (productGridContainer) {
        fetchProducts();
    }

    if (productDetailContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'), 10);
        if (productId) {
            fetchProductDetails(productId);
             // Attempt to setup nav with stored list immediately
             if (currentProductList && currentProductList.length > 0) {
                  setupProductNav(productId);
             } else {
                // If list isn't in storage (e.g., direct load), disable nav initially
                 if(prevProductButton) prevProductButton.classList.add('disabled');
                 if(nextProductButton) nextProductButton.classList.add('disabled');
             }
        } else {
            productDetailContainer.innerHTML = '<p style="text-align: center; color: red;">No product ID specified.</p>';
            document.title = "Error - DarkByte";
             if(prevProductButton) prevProductButton.classList.add('disabled');
             if(nextProductButton) nextProductButton.classList.add('disabled');
        }
    }

    if (currentTheme) {
        setTheme(currentTheme);
    } else {
         setTheme(prefersDarkScheme.matches ? 'dark' : 'light');
    }


    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
             setTheme(e.matches ? 'dark' : 'light');
        }
    });

    updateCartBadge();

});