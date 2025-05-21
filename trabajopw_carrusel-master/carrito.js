// Datos de los juegos
const gamesData = {
    1: { 
        title: "Game 1", 
        price: 59.99, 
        description: "Descripción del Game 1", 
        image: "https://via.placeholder.com/300x180/00ff88/000000?text=Game+1" 
    },
    2: { 
        title: "Game 2", 
        price: 49.99, 
        description: "Descripción del Game 2", 
        image: "https://via.placeholder.com/300x180/00ff88/000000?text=Game+2" 
    },
    3: { 
        title: "Game 3", 
        price: 39.99, 
        description: "Descripción del Game 3", 
        image: "https://via.placeholder.com/300x180/00ff88/000000?text=Game+3" 
    }
};

// Variables del carrito
let cart = [];
let currentGameId = null;

// Elementos del DOM
const elements = {
    cartSidebar: document.getElementById('cartSidebar'),
    cartOverlay: document.getElementById('cartOverlay'),
    cartButton: document.getElementById('cartButton'),
    closeCartBtn: document.getElementById('closeCartBtn'),
    cartItems: document.getElementById('cartItems'),
    cartTotal: document.getElementById('cartTotal'),
    cartCount: document.getElementById('cartCount'),
    clearCartBtn: document.getElementById('clearCartBtn'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    addToCartBtn: document.getElementById('addToCartBtn'),
    gameModal: document.getElementById('gameModal'),
    gameTitle: document.getElementById('gameTitle'),
    gameDescription: document.getElementById('gameDescription'),
    gamePrice: document.getElementById('gamePrice'),
    gameModalTitle: document.getElementById('gameModalTitle'),
    customAlert: document.getElementById('customAlert'),
    alertMessage: document.getElementById('alertMessage')
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    elements.cartButton.addEventListener('click', toggleCart);
    elements.closeCartBtn.addEventListener('click', toggleCart);
    elements.cartOverlay.addEventListener('click', toggleCart);
    elements.clearCartBtn.addEventListener('click', clearCart);
    elements.checkoutBtn.addEventListener('click', checkout);
    elements.addToCartBtn.addEventListener('click', addToCart);
    
    elements.gameModal.addEventListener('show.bs.modal', function(event) {
        const button = event.relatedTarget;
        currentGameId = button.getAttribute('data-game-id');
        if (!currentGameId) return;
        
        const game = gamesData[currentGameId];
        elements.gameModalTitle.textContent = game.title;
        elements.gameTitle.textContent = game.title;
        elements.gameDescription.textContent = game.description;
        elements.gamePrice.textContent = `$${game.price.toFixed(2)}`;
    });
}

// Funciones del carrito
function toggleCart() {
    elements.cartSidebar.classList.toggle('show');
    elements.cartOverlay.classList.toggle('show');
    updateCartUI();
}

function addToCart() {
    if (!currentGameId) return;
    
    const game = gamesData[currentGameId];
    const existingItem = cart.find(item => item.id === currentGameId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: currentGameId,
            title: game.title,
            price: game.price,
            image: game.image,
            quantity: 1
        });
    }
    
    showAlert(`${game.title} ha sido añadido al carrito!`, 'success');
    updateCartUI();
    
    const modal = bootstrap.Modal.getInstance(elements.gameModal);
    modal.hide();
}

function updateCartUI() {
    // Actualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    elements.cartCount.textContent = totalItems;
    
    // Actualizar lista de items
    if (cart.length === 0) {
        elements.cartItems.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-3x mb-3" style="color: var(--secondary-color);"></i>
                <p>Nada en el carrito</p>
            </div>
        `;
        elements.cartTotal.textContent = '$0.00';
        return;
    }
    
    elements.cartItems.innerHTML = cart.map(item => `
        <div class="cart-item d-flex align-items-center mb-3 p-3 bg-dark rounded">
            <img src="${item.image}" class="cart-item-img me-3" alt="${item.title}">
            <div class="flex-grow-1">
                <h6 class="mb-1">${item.title}</h6>
                <small class="text-muted">$${item.price.toFixed(2)} x ${item.quantity}</small>
            </div>
            <div class="d-flex flex-column align-items-center">
                <h6 class="mb-2">$${(item.price * item.quantity).toFixed(2)}</h6>
                <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Actualizar total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    elements.cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Event delegation para eliminar items
document.addEventListener('click', function(e) {
    if (e.target.closest('.remove-item')) {
        const gameId = e.target.closest('.remove-item').getAttribute('data-id');
        removeFromCart(gameId);
    }
});

function removeFromCart(gameId) {
    cart = cart.filter(item => item.id !== gameId);
    showAlert('Producto eliminado del carrito', 'success');
    updateCartUI();
}

// Variables para la confirmación
let confirmCallback = null;
const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
const confirmMessage = document.getElementById('confirmMessage');
const confirmActionBtn = document.getElementById('confirmAction');

// Configurar el evento una sola vez
confirmActionBtn.addEventListener('click', function() {
    if (confirmCallback) confirmCallback();
    confirmModal.hide();
});

// Función showConfirm modificada
function showConfirm(message, callback) {
    confirmMessage.textContent = message;
    confirmCallback = callback;
    confirmModal.show();
}
function clearCart() {
    if (cart.length === 0) {
        showAlert('El carrito ya está vacío', 'info');
        return;
    }
    
    showConfirm('¿Estás seguro de que quieres vaciar el carrito?', function() {
        cart = [];
        showAlert('Carrito vaciado', 'success');
        updateCartUI();
    });
}

function checkout() {
    if (cart.length === 0) {
        showAlert('Tu carrito está vacío', 'error');
        return;
    }
    
    showAlert('Orden confirmada! Gracias por tu compra.', 'success');
    cart = [];
    updateCartUI();
    toggleCart();
}

function showAlert(message, type = 'success') {
    elements.alertMessage.textContent = message;
    elements.customAlert.firstElementChild.className = `alert d-flex align-items-center ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
    elements.customAlert.firstElementChild.style.backgroundColor = type === 'success' ? 'var(--primary-color)' : '#ff4444';
    
    elements.customAlert.style.display = 'block';
    elements.customAlert.firstElementChild.classList.add('custom-notification');
    elements.customAlert.firstElementChild.classList.remove('fade-out');
    
    setTimeout(() => {
        elements.customAlert.firstElementChild.classList.add('fade-out');
        setTimeout(() => elements.customAlert.style.display = 'none', 500);
    }, 3000);
}

// Hacer funciones accesibles globalmente
window.removeFromCart = removeFromCart;


//juegos valorados

 const juegos = [
      { id: 1, titulo: "Elden Ring", estrellas: 4.9, precio: 59.99, imagen: "https://via.placeholder.com/150x120?text=Elden+Ring" },
      { id: 2, titulo: "God of War", estrellas: 4.8, precio: 49.99, imagen: "https://via.placeholder.com/150x120?text=God+of+War" },
      { id: 3, titulo: "Zelda TOTK", estrellas: 4.95, precio: 69.99, imagen: "https://via.placeholder.com/150x120?text=Zelda" },
      { id: 4, titulo: "Hollow Knight", estrellas: 4.85, precio: 19.99, imagen: "https://via.placeholder.com/150x120?text=Hollow+Knight" },
      { id: 5, titulo: "The Witcher 3", estrellas: 4.92, precio: 39.99, imagen: "https://via.placeholder.com/150x120?text=Witcher+3" },
      { id: 6, titulo: "Red Dead Redemption 2", estrellas: 4.88, precio: 59.99, imagen: "https://via.placeholder.com/150x120?text=RDR2" }
      // Puedes agregar más juegos
    ];

    function renderMejorValorados() {
      const contenedor = document.getElementById("mejorValorados");
      const topJuegos = juegos.sort((a, b) => b.estrellas - a.estrellas).slice(0, 10);

      topJuegos.forEach(juego => {
        const div = document.createElement("div");
        div.className = "juego";
        div.innerHTML = `
          <img src="${juego.imagen}" alt="${juego.titulo}">
          <h3>${juego.titulo}</h3>
          <p>⭐ ${juego.estrellas.toFixed(1)}</p>
          <p>$${juego.precio.toFixed(2)}</p>
        `;
        contenedor.appendChild(div);
      });
    }

    renderMejorValorados();