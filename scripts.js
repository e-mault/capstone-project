let currentModal = null; // Track the currently open modal
const cart = []; // Array to hold cart items
let products = []; // Global variable to hold products

// Function to fetch and parse CSV file
function fetchCSV() {
    return fetch('products.csv')
        .then(response => response.text())
        .then(data => {
            const lines = data.trim().split('\n');
            const headers = lines[0].split(',').map(header => header.trim());

            products = lines.slice(1).map(line => {
                const values = line.split(',').map(value => value.trim());
                return {
                    name: values[0],
                    price: parseFloat(values[1]),
                    category: values[2],
                    image: values[3],
                    description: values[4]
                };
            });

            products.sort((a, b) => a.name.localeCompare(b.name));
            return products;
        });
}

function displayProducts(productsToDisplay) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    productsToDisplay.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        const productImage = document.createElement('img');
        productImage.src = product.image;
        productImage.alt = product.name;
        productImage.style.width = '100%';
        productCard.appendChild(productImage);

        const productPrice = document.createElement('p');
        productPrice.innerText = `$${product.price.toFixed(2)}`;
        productCard.appendChild(productPrice);

        const productName = document.createElement('h2');
        productName.innerText = product.name;
        productCard.appendChild(productName);

        // Quantity input for the product
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.min = 1; // Minimum quantity is 1
        quantityInput.value = 1; // Default quantity is 1
        productCard.appendChild(quantityInput);

        const productButton = document.createElement('button');
        productButton.innerText = 'Add to Cart';
        productButton.onclick = (event) => {
            event.stopPropagation(); // Prevent modal from opening
            addToCart(product, parseInt(quantityInput.value)); // Pass the quantity
        };
        productCard.appendChild(productButton);

        // Add click event to show product details
        productCard.onclick = () => {
            if (event.target !== quantityInput) { // Only open modal if not clicking quantity input
                showProductDetails(product);
            }
        };

        productList.appendChild(productCard);
    });
}

// Cart management
const cartIcon = document.getElementById('cart-icon');
const cartItemsContainer = document.getElementById('cart-items-container');
let cartVisible = false;

cartIcon.addEventListener('click', () => {
    cartVisible = !cartVisible;
    cartItemsContainer.style.display = cartVisible ? 'block' : 'none';
});

function addToCart(product, quantity) {
    const existingItem = cart.find(item => item.product.name === product.name);
    if (existingItem) {
        existingItem.quantity += quantity; // Increase quantity if already in cart
    } else {
        cart.push({ product, quantity }); // Add new item to cart
    }
    updateCart();
    alert(`${product.name} added to cart!`);
}

function updateCart() {
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    cartItemsElement.innerHTML = ''; // Clear existing items
    let total = 0;

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${item.product.name} - $${item.product.price.toFixed(2)} x ${item.quantity}`;

        // Quantity change input
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.min = 1; // Minimum quantity is 1
        quantityInput.value = item.quantity; // Set current quantity

        quantityInput.onchange = () => {
            const newQuantity = parseInt(quantityInput.value);
            if (newQuantity > 0) {
                item.quantity = newQuantity; // Update quantity
                updateCart(); // Refresh cart display
            } else {
                removeFromCart(index); // Remove item if quantity is 0
            }
        };

        li.appendChild(quantityInput);

        // Remove button for each item
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => {
            removeFromCart(index);
        };
        li.appendChild(removeBtn);
        cartItemsElement.appendChild(li);

        total += item.product.price * item.quantity; // Update total cost
    });

    cartTotalElement.textContent = total.toFixed(2);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Checkout button click event
document.getElementById('checkout-btn').onclick = () => {
    alert('You have checked out.');
    cart.length = 0; // Clear the cart
    updateCart();
};

// Product details modal handling
function showProductDetails(product) {
    if (currentModal) {
        closeProductDetails();
    }

    currentModal = document.createElement('div');
    currentModal.className = 'product-details';
    currentModal.innerHTML = `
        <h2>${product.name}</h2>
        <div class="image-container">
            <img src="${product.image}" alt="${product.name}" class="zoom-image" style="max-width: 300px; height: auto;">
        </div>
        <p>${product.description}</p>
        <button onclick="closeProductDetails()">Close</button>
    `;
    document.body.appendChild(currentModal);

    const zoomImage = currentModal.querySelector('.zoom-image');
    zoomImage.addEventListener('mousemove', (event) => {
        const { offsetX, offsetY } = event;
        const { width, height } = zoomImage.getBoundingClientRect();
        const xPercent = (offsetX / width) * 100;
        const yPercent = (offsetY / height) * 100;
        zoomImage.style.transform = `scale(2) translate(-${xPercent}%, -${yPercent}%)`;
    });

    zoomImage.addEventListener('mouseleave', () => {
        zoomImage.style.transform = 'scale(1)'; // Reset zoom on mouse leave
    });
}

// Function to close product details
function closeProductDetails() {
    if (currentModal) {
        document.body.removeChild(currentModal);
        currentModal = null;
    }
}

function filterProducts() {
    const selectedCategories = Array.from(document.querySelectorAll('#category-filter input:checked')).map(input => input.value);
    const searchInput = document.getElementById('search-input').value.toLowerCase();

    // Filter by category and search input
    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategories.includes('all') || selectedCategories.includes(product.category);
        const matchesSearch = product.name.toLowerCase().includes(searchInput);
        return matchesCategory && matchesSearch; // Return true if both conditions are met
    });

    displayProducts(filteredProducts); // Display the filtered products
}

// Initialize the application
fetchCSV().then(() => {
    displayProducts(products);
    autocompleteSearch(); // Initialize autocomplete feature

    // Add filtering event listener
    document.getElementById('category-filter').addEventListener('change', filterProducts);
    document.getElementById('search-input').addEventListener('input', filterProducts); // Add listener for search input
});

function filterProducts() {
    const selectedCategories = Array.from(document.querySelectorAll('#category-filter input:checked')).map(input => input.value);
    const searchInput = document.getElementById('search-input').value.toLowerCase();

    // Filter by category and search input
    const filteredProducts = products.filter(product => {
        // If no categories are selected, matchesCategory is true for all products
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
        const matchesSearch = product.name.toLowerCase().includes(searchInput);
        return matchesCategory && matchesSearch; // Return true if both conditions are met
    });

    displayProducts(filteredProducts); // Display the filtered products
}

// Initialize the application
fetchCSV().then(() => {
    displayProducts(products); // Display all products on initial load
    autocompleteSearch(); // Initialize autocomplete feature

    // Add filtering event listener
    document.getElementById('category-filter').addEventListener('change', filterProducts);
    document.getElementById('search-input').addEventListener('input', filterProducts); // Add listener for search input
});

function autocompleteSearch() {
    const searchInput = document.getElementById('search-input');
    const autocompleteList = document.getElementById('autocomplete-list');

    searchInput.addEventListener('input', () => {
        const value = searchInput.value.toLowerCase();
        autocompleteList.innerHTML = ''; // Clear previous suggestions

        // Display all products when input is empty
        if (!value) {
            autocompleteList.style.display = 'none'; // Hide suggestions
            displayProducts(products); // Display all products
            return;
        }

        const suggestions = Array.from(new Set(products
            .map(product => product.name)
            .filter(name => name.toLowerCase().includes(value))
        ));

        // Limit the number of suggestions displayed (e.g., 5 suggestions)
        const maxSuggestions = 5;
        suggestions.slice(0, maxSuggestions).forEach(name => {
            const suggestionItem = document.createElement('div');
            suggestionItem.textContent = name;

            // Use event delegation to handle clicks
            suggestionItem.onclick = () => {
                searchInput.value = name; // Set input to selected suggestion
                autocompleteList.innerHTML = ''; // Clear suggestions
                autocompleteList.style.display = 'none'; // Hide suggestions

                // Display filtered products based on the selected suggestion
                const filteredProducts = products.filter(product => product.name.toLowerCase() === name.toLowerCase());
                displayProducts(filteredProducts);
            };

            autocompleteList.appendChild(suggestionItem);
        });

        // Show the suggestions if there are any
        autocompleteList.style.display = suggestions.length > 0 ? 'block' : 'none';

        // Update displayed products with current search input
        filterProducts(); // Call filter function
    });

    // Hide suggestions when the input loses focus
    searchInput.addEventListener('blur', () => {
        setTimeout(() => {
            autocompleteList.style.display = 'none'; // Hide suggestions
        }, 200); // Delay to allow click on suggestion
    });
}

// Add filtering event listener
document.getElementById('category-filter').addEventListener('change', filterProducts);
