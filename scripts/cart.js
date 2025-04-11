document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.querySelector('.cart-items-container');
    const totalPriceElement = document.querySelector('.total-price');
    const checkoutButton = document.querySelector('.checkout-btn');
    const cartBadge = document.querySelector('.cart-badge');
    const cartIcon = document.querySelector('.cart-icon');

    let cart = JSON.parse(localStorage.getItem('darkbyte-cart')) || [];

    // Display cart items
    function displayCartItems() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fas fa-shopping-cart"></i>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added any items to your cart yet.</p>
                </div>
            `;
            checkoutButton.disabled = true;
            return;
        }

        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item" data-index="${index}">
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.title}</h3>
                    <p class="cart-item-variation">Size: ${item.size}</p>
                    <p class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease-quantity">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10">
                        <button class="quantity-btn increase-quantity">+</button>
                    </div>
                    <button class="remove-item-btn">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');

        updateTotalPrice();
        checkoutButton.disabled = false;
    }

    // Update total price
    function updateTotalPrice() {
        if (cart.length === 0) {
            totalPriceElement.textContent = '₹0.00';
            updateCartBadge();
            return;
        }
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalPriceElement.textContent = `₹${total.toFixed(2)}`;
        updateCartBadge();
    }

    // Update cart badge
    function updateCartBadge() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('darkbyte-cart', JSON.stringify(cart));
        updateCartBadge();
    }

    // Show feedback message
    function showFeedbackMessage(message) {
        const feedbackMessage = document.createElement('div');
        feedbackMessage.className = 'cart-feedback-message';
        feedbackMessage.textContent = message;
        document.body.appendChild(feedbackMessage);

        // Trigger reflow
        feedbackMessage.offsetHeight;

        // Add show class
        feedbackMessage.classList.add('show');

        // Remove after animation
        setTimeout(() => {
            feedbackMessage.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(feedbackMessage);
            }, 300);
        }, 2000);
    }

    // Event delegation for cart item actions
    cartItemsContainer.addEventListener('click', (e) => {
        const cartItem = e.target.closest('.cart-item');
        if (!cartItem) return;

        const index = parseInt(cartItem.dataset.index);
        const item = cart[index];

        // Handle quantity decrease
        if (e.target.classList.contains('decrease-quantity')) {
            if (item.quantity > 1) {
                item.quantity--;
                saveCart();
                displayCartItems();
                showFeedbackMessage('Quantity updated');
            }
        }
        // Handle quantity increase
        else if (e.target.classList.contains('increase-quantity')) {
            if (item.quantity < 10) {
                item.quantity++;
                saveCart();
                displayCartItems();
                showFeedbackMessage('Quantity updated');
            }
        }
        // Handle remove item
        else if (e.target.closest('.remove-item-btn')) {
            const itemTitle = item.title;
            cart.splice(index, 1);
            saveCart();
            displayCartItems();
            showFeedbackMessage(`${itemTitle} removed from cart`);
        }
    });

    // Handle quantity input changes
    cartItemsContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            const cartItem = e.target.closest('.cart-item');
            const index = parseInt(cartItem.dataset.index);
            const newQuantity = parseInt(e.target.value);

            if (newQuantity >= 1 && newQuantity <= 10) {
                cart[index].quantity = newQuantity;
                saveCart();
                displayCartItems();
                showFeedbackMessage('Quantity updated');
            } else {
                e.target.value = cart[index].quantity;
            }
        }
    });

    // Prevent invalid quantity input
    cartItemsContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('quantity-input')) {
            let value = e.target.value;
            value = value.replace(/[^0-9]/g, '');
            if (value > 10) value = 10;
            if (value < 1) value = 1;
            e.target.value = value;
        }
    });

    // Initialize cart display
    displayCartItems();
}); 