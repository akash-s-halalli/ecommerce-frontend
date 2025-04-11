document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    const themeToggleButton = document.getElementById('theme-toggle');
    const themeIcon = themeToggleButton ? themeToggleButton.querySelector('i') : null;
    const productGridContainer = document.querySelector('.product-grid-container');
    const productDetailContainer = document.getElementById('product-detail-container');
    const cartBadge = document.querySelector('.cart-badge');
    const backToTopButton = document.getElementById('back-to-top-btn');

    const currentTheme = localStorage.getItem('theme') || null;
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    let cart = JSON.parse(localStorage.getItem('darkbyte-cart')) || [];
    let usdToInrRate = 83.0; // Default rate if API fails

    const saveCart = () => {
        localStorage.setItem('darkbyte-cart', JSON.stringify(cart));
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

    const addToCart = (productId, buttonElement) => {
        console.log(`Adding product ${productId} to cart.`);
        cart.push(productId);
        saveCart();
        updateCartBadge();
        if (buttonElement) {
            buttonElement.textContent = 'Added!';
            buttonElement.disabled = true;
            setTimeout(() => {
                buttonElement.textContent = 'Add to Cart';
                buttonElement.disabled = false;
            }, 1000);
        }
    };

    const fetchExchangeRate = async () => {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (!response.ok) throw new Error('Failed to fetch exchange rate');
            const data = await response.json();
            usdToInrRate = data.rates.INR;
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
            // Use default rate if API fails
        }
    };

    const convertToINR = (usdPrice) => {
        return (usdPrice * usdToInrRate).toFixed(2);
    };

    const displayProducts = (products) => {
        if (!productGridContainer) return;
        productGridContainer.innerHTML = '';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            const link = document.createElement('a');
            link.href = `product.html?id=${product.id}`;
            link.className = 'product-card-link';
            link.style.textDecoration = 'none';
            link.style.color = 'inherit';
            link.style.display = 'flex';
            link.style.flexDirection = 'column';
            link.style.flexGrow = '1';

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
            price.textContent = `₹${convertToINR(product.price)}`;

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
                addToCart(product.id, button);
            });

            card.appendChild(link);
            card.appendChild(button);

            productGridContainer.appendChild(card);
        });
    };

     const displayProductDetails = (product) => {
        if (!productDetailContainer) return;

        document.title = `${product.title} - DarkByte`;

        productDetailContainer.innerHTML = `
            <div class="product-detail-image-container">
                <img src="${product.image}" alt="${product.title}" class="product-detail-image" loading="lazy">
            </div>
            <div class="product-detail-info">
                <h1 class="product-detail-title">${product.title}</h1>
                <p class="product-detail-price">₹${convertToINR(product.price)}</p>
                <p class="product-detail-category"><strong>Category:</strong> ${product.category}</p>
                <p class="product-detail-description">${product.description}</p>
                <button class="product-detail-add-to-cart" data-product-id="${product.id}">Add to Cart</button>
            </div>
        `;

        const detailButton = productDetailContainer.querySelector('.product-detail-add-to-cart');
        if(detailButton) {
            detailButton.addEventListener('click', () => addToCart(product.id, detailButton));
        }
    };

    const fetchProducts = async () => {
        if (!productGridContainer) return;
        productGridContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--color-text-muted);">Loading products...</p>';
        
        try {
            await fetchExchangeRate(); // Fetch exchange rate before products
            const response = await fetch('https://fakestoreapi.com/products?limit=18');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error("Could not fetch products:", error);
            productGridContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: red;">Failed to load products. Please try again later.</p>';
        }
    };

     const fetchProductDetails = async (productId) => {
        if (!productDetailContainer || !productId) return;
        productDetailContainer.innerHTML = '<p style="text-align: center; color: var(--color-text-muted);">Loading product details...</p>';
        try {
            await fetchExchangeRate(); // Fetch exchange rate before product details
            const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const product = await response.json();
            if(product) {
                displayProductDetails(product);
                updateNavigationButtons(productId);
            } else {
                throw new Error('Product not found');
            }
        } catch (error) {
            console.error("Could not fetch product details:", error);
            productDetailContainer.innerHTML = '<p style="text-align: center; color: red;">Failed to load product details. Please try again later or check the product ID.</p>';
            document.title = "Product Not Found - DarkByte";
        }
    };

    const updateNavigationButtons = (currentProductId) => {
        const prevButton = document.getElementById('prev-product');
        const nextButton = document.getElementById('next-product');
        
        if (prevButton) {
            prevButton.disabled = currentProductId <= 1;
            prevButton.style.opacity = currentProductId <= 1 ? '0.5' : '1';
            prevButton.style.cursor = currentProductId <= 1 ? 'not-allowed' : 'pointer';
        }
        
        if (nextButton) {
            nextButton.disabled = currentProductId >= 20;
            nextButton.style.opacity = currentProductId >= 20 ? '0.5' : '1';
            nextButton.style.cursor = currentProductId >= 20 ? 'not-allowed' : 'pointer';
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
        const productId = urlParams.get('id');
        if (productId) {
            fetchProductDetails(productId);
        } else {
            productDetailContainer.innerHTML = '<p style="text-align: center; color: red;">No product ID specified.</p>';
            document.title = "Error - DarkByte";
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

    // Add event listeners for navigation buttons
    const prevButton = document.getElementById('prev-product');
    const nextButton = document.getElementById('next-product');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            const currentId = parseInt(window.location.search.split('=')[1]);
            if (currentId > 1) {
                window.location.href = `product.html?id=${currentId - 1}`;
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const currentId = parseInt(window.location.search.split('=')[1]);
            if (currentId < 20) {
                window.location.href = `product.html?id=${currentId + 1}`;
            }
        });
    }

});