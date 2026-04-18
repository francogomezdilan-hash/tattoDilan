/* ==========================================
   ARTE DE LA TINTA — Lógica principal
   ========================================== */

// ---- Estado global del carrito ----
const carrito = [];

// ---- Referencias al DOM ----
const navbar = document.getElementById('navbar');
const estilosGrid = document.getElementById('estilosGrid');
const filtroBtns = document.querySelectorAll('.filtro-btn');
const carritoBadge = document.getElementById('carritoBadge');
const carritoPanel = document.getElementById('carritoPanel');
const carritoOverlay = document.getElementById('carritoOverlay');
const carritoLista = document.getElementById('carritoLista');
const carritoFooter = document.getElementById('carritoFooter');
const carritoTotal = document.getElementById('carritoTotal');
const cerrarCarrito = document.getElementById('cerrarCarrito');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
const particulasContainer = document.getElementById('particulas');

// ==========================================
// 1. NAVBAR — Efecto scroll
// ==========================================
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ==========================================
// 2. PARTÍCULAS — Pétalos de sakura
// ==========================================
function crearParticulas() {
    const cantidad = 20;
    for (let i = 0; i < cantidad; i++) {
        const p = document.createElement('div');
        p.classList.add('particula');

        // Posición horizontal aleatoria
        p.style.left = Math.random() * 100 + '%';

        // Tamaño variado
        const tamaño = 4 + Math.random() * 8;
        p.style.width = tamaño + 'px';
        p.style.height = tamaño + 'px';

        // Duración y retraso aleatorios
        const duracion = 6 + Math.random() * 10;
        p.style.animationDuration = duracion + 's';
        p.style.animationDelay = Math.random() * duracion + 's';

        // Color entre rojo y dorado
        const colores = [
            'rgba(196, 30, 58, 0.6)',
            'rgba(196, 30, 58, 0.4)',
            'rgba(201, 168, 76, 0.4)',
            'rgba(139, 0, 0, 0.5)',
        ];
        p.style.background = colores[Math.floor(Math.random() * colores.length)];

        particulasContainer.appendChild(p);
    }
}
crearParticulas();

// ==========================================
// 3. FILTROS DE CATEGORÍAS
// ==========================================
filtroBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Quitar clase active de todos
        filtroBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filtro = btn.dataset.filtro;
        const tarjetas = estilosGrid.querySelectorAll('.tarjeta');

        tarjetas.forEach((tarjeta, index) => {
            const categoria = tarjeta.dataset.categoria;

            if (filtro === 'todos' || categoria === filtro) {
                tarjeta.classList.remove('oculto');
                // Animación escalonada de entrada
                tarjeta.style.opacity = '0';
                tarjeta.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    tarjeta.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    tarjeta.style.opacity = '1';
                    tarjeta.style.transform = 'translateY(0)';
                }, index * 80);
            } else {
                tarjeta.classList.add('oculto');
            }
        });
    });
});

// ==========================================
// 4. CARRITO — Agregar productos
// ==========================================
estilosGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.tarjeta__btn');
    if (!btn) return;

    const nombre = btn.dataset.nombre;
    const precio = parseInt(btn.dataset.precio, 10);

    // Verificar si ya existe en el carrito
    const existente = carrito.find(item => item.nombre === nombre);
    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ nombre, precio, cantidad: 1 });
    }

    actualizarCarrito();
    mostrarToast(`${nombre} agregado al carrito`);

    // Pequeña animación en el botón
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 150);
});

// ==========================================
// 5. CARRITO — Abrir / Cerrar panel
// ==========================================
document.querySelector('.carrito-btn').addEventListener('click', (e) => {
    e.preventDefault();
    abrirCarrito();
});

cerrarCarrito.addEventListener('click', cerrarPanelCarrito);
carritoOverlay.addEventListener('click', cerrarPanelCarrito);

function abrirCarrito() {
    carritoPanel.classList.add('visible');
    carritoOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function cerrarPanelCarrito() {
    carritoPanel.classList.remove('visible');
    carritoOverlay.classList.remove('visible');
    document.body.style.overflow = '';
}

// ==========================================
// 6. CARRITO — Renderizar contenido
// ==========================================
function actualizarCarrito() {
    // Actualizar badge
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    carritoBadge.textContent = totalItems;

    if (totalItems > 0) {
        carritoBadge.classList.add('visible');
    } else {
        carritoBadge.classList.remove('visible');
    }

    // Renderizar lista
    if (carrito.length === 0) {
        carritoLista.innerHTML = '<p class="carrito-panel__vacio">Tu carrito está vacío</p>';
        carritoFooter.style.display = 'none';
        return;
    }

    carritoFooter.style.display = 'block';

    let html = '';
    let total = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        html += `
            <div class="carrito-item">
                <div class="carrito-item__info">
                    <div class="carrito-item__nombre">${item.nombre}</div>
                    <div class="carrito-item__precio">$${item.precio} USD × ${item.cantidad}</div>
                </div>
                <button class="carrito-item__eliminar" data-index="${index}" aria-label="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;
    });

    carritoLista.innerHTML = html;
    carritoTotal.textContent = `$${total} USD`;
}

// Delegación de eventos para eliminar items
carritoLista.addEventListener('click', (e) => {
    const btnEliminar = e.target.closest('.carrito-item__eliminar');
    if (!btnEliminar) return;

    const index = parseInt(btnEliminar.dataset.index, 10);
    const eliminado = carrito[index].nombre;

    carrito.splice(index, 1);
    actualizarCarrito();
    mostrarToast(`${eliminado} eliminado del carrito`);
});

// ==========================================
// 7. TOAST — Notificaciones
// ==========================================
let toastTimeout = null;

function mostrarToast(mensaje) {
    // Limpiar timeout previo
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toast.classList.remove('visible');
    }

    toastMsg.textContent = mensaje;

    // Forzar reflow para reiniciar animación
    void toast.offsetWidth;

    toast.classList.add('visible');

    toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
        toastTimeout = null;
    }, 2500);
}

// ==========================================
// 8. SCROLL REVEAL — Animación al hacer scroll
// ==========================================
function initReveal() {
    // Seleccionar elementos a animar
    const elementos = document.querySelectorAll(
        '.tarjeta, .galeria__item, .estilos__header, .footer__col'
    );

    elementos.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    elementos.forEach(el => observer.observe(el));
}

initReveal();

// ==========================================
// 9. BOTÓN RESERVAR CITA
// ==========================================
document.querySelector('.carrito-panel__pagar').addEventListener('click', () => {
    if (carrito.length === 0) return;
    mostrarToast('Cita reservada con éxito');
    carrito.length = 0;
    actualizarCarrito();
    setTimeout(() => {
        cerrarPanelCarrito();
    }, 1200);
});

// ==========================================
// 10. CERRAR CON TECLA ESCAPE
// ==========================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        cerrarPanelCarrito();
    }
});