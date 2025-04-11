document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    const themeToggleButton = document.getElementById('theme-toggle');
    const themeIcon = themeToggleButton ? themeToggleButton.querySelector('i') : null;
    const productGridContainer = document.querySelector('.product-grid-container');
    const cartBadge = document.querySelector('.cart-badge');
    const backToTopButton = document.getElementById('back-to-top-btn');

    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    let cart = [];

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeIcon) {
            if (theme === 'dark') {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                themeToggleButton.setAttribute('aria-label', 'Switch to Light Theme');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                themeToggleButton.setAttribute('aria-label', 'Switch to Dark Theme');
            }
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


    const displayProducts = (products) => {
        if (!productGridContainer) return;
        productGridContainer.innerHTML = '';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

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

            const button = document.createElement('button');
            button.className = 'add-to-cart-button';
            button.textContent = 'Add to Cart';
            button.dataset.productId = product.id;


            infoDiv.appendChild(name);
            infoDiv.appendChild(price);
            infoDiv.appendChild(button);

            card.appendChild(imageContainer);
            card.appendChild(infoDiv);

            productGridContainer.appendChild(card);
        });
    };

    const fetchProducts = async () => {
        if (!productGridContainer) return;
        productGridContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--color-text-muted);">Loading products...</p>';
        try {
            const response = await fetch('https://fakestoreapi.com/products?limit=12'); // Fetch all product types again
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error("Could not fetch products:", error);
             productGridContainer.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: red;">Failed to load products. Please try again later.</p>';
        }
    };

    const handleScroll = () => {
        if (backToTopButton) {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('active');
            } else {
                backToTopButton.classList.remove('active');
            }
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };


    if (hamburgerMenu && mobileNav) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            mobileNav.classList.toggle('active');
            const isExpanded = hamburgerMenu.getAttribute('aria-expanded') === 'true';
            hamburgerMenu.setAttribute('aria-expanded', !isExpanded);
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });

        const mobileNavLinks = mobileNav.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNav.classList.contains('active')) {
                    hamburgerMenu.classList.remove('active');
                    mobileNav.classList.remove('active');
                    hamburgerMenu.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
                // Smooth scroll handled by CSS 'scroll-behavior'
            });
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

    if (productGridContainer) {
        productGridContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('add-to-cart-button')) {
                const button = event.target;
                const productId = button.dataset.productId;
                console.log(`Added product ${productId} to cart.`);
                cart.push(productId);
                updateCartBadge();
                button.textContent = 'Added!';
                button.disabled = true;
                setTimeout(() => {
                    button.textContent = 'Add to Cart';
                    button.disabled = false;
                }, 1000);
            }
        });
    }

    if (backToTopButton) {
        window.addEventListener('scroll', handleScroll);
        backToTopButton.addEventListener('click', scrollToTop);
    }


    if (currentTheme) {
        setTheme(currentTheme);
    } else if (prefersDarkScheme.matches) {
        setTheme('dark');
    } else {
        setTheme('light');
    }

    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
             setTheme(e.matches ? 'dark' : 'light');
        }
    });

    fetchProducts();
    updateCartBadge();

});