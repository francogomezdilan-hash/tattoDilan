/* ==========================================
   ARTE DE LA TINTA — Lógica principal
   ========================================== */

// ---- Estado global del carrito ----
// Array vacío que almacena los productos agregados al carrito (cada item tiene nombre, precio y cantidad)
const carrito = [];

// ---- Referencias al DOM ----
// Seleccionan todos los elementos del HTML que JavaScript necesita manipular y se guardan en constantes
// Esto evita buscarlos múltiples veces y mejora el rendimiento
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
// Event listener que escucha el scroll de la ventana para cambiar el estilo de la navbar
window.addEventListener('scroll', () => {
    // Si el usuario ha scrolleado más de 50px, agrega la clase "scrolled" (navbar más opaca con sombra)
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        // Si está arriba del todo, quita la clase y vuelve al estado normal
        navbar.classList.remove('scrolled');
    }
});

// ==========================================
// 2. PARTÍCULAS — Pétalos de sakura
// ==========================================
// Función que genera 20 partículas decorativas flotantes en el hero
function crearParticulas() {
    const cantidad = 20; // Cantidad total de partículas a crear
    for (let i = 0; i < cantidad; i++) {
        // Crea un nuevo div por cada partícula
        const p = document.createElement('div');
        // Le asigna la clase CSS que tiene la animación de caída
        p.classList.add('particula');

        // Posición horizontal aleatoria entre 0% y 100% del contenedor
        p.style.left = Math.random() * 100 + '%';

        // Tamaño variado aleatorio entre 4px y 12px
        const tamaño = 4 + Math.random() * 8;
        p.style.width = tamaño + 'px';
        p.style.height = tamaño + 'px';

        // Duración de la animación aleatoria entre 6 y 16 segundos
        const duracion = 6 + Math.random() * 10;
        p.style.animationDuration = duracion + 's';
        // Retraso aleatorio para que no caigan todas al mismo tiempo
        p.style.animationDelay = Math.random() * duracion + 's';

        // Array con 4 tonos posibles: rojos y dorados semitransparentes
        const colores = [
            'rgba(196, 30, 58, 0.6)',
            'rgba(196, 30, 58, 0.4)',
            'rgba(201, 168, 76, 0.4)',
            'rgba(139, 0, 0, 0.5)',
        ];
        // Elige un color al azar del array usando un índice aleatorio
        p.style.background = colores[Math.floor(Math.random() * colores.length)];

        // Inserta la partícula como hijo del contenedor en el HTML
        particulasContainer.appendChild(p);
    }
}
// Ejecuta la función inmediatamente para que las partículas aparezcan al cargar
crearParticulas();

// ==========================================
// 3. FILTROS DE CATEGORÍAS
// ==========================================
// Recorre cada botón de filtro y le asigna un evento de clic
filtroBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Primero, quita la clase "active" de TODOS los botones de filtro
        filtroBtns.forEach(b => b.classList.remove('active'));
        // Luego, agrega "active" solo al botón que fue clickeado
        btn.classList.add('active');

        // Lee el valor del atributo data-filtro del botón clickeado (ej: "japones", "ornamental")
        const filtro = btn.dataset.filtro;
        // Selecciona todas las tarjetas dentro del grid
        const tarjetas = estilosGrid.querySelectorAll('.tarjeta');

        // Recorre cada tarjeta para decidir si se muestra o se oculta
        tarjetas.forEach((tarjeta, index) => {
            // Lee la categoría de la tarjeta desde su atributo data-categoria
            const categoria = tarjeta.dataset.categoria;

            // Si el filtro es "todos" O la categoría coincide con el filtro seleccionado
            if (filtro === 'todos' || categoria === filtro) {
                tarjeta.classList.remove('oculto'); // Muestra la tarjeta
                // Prepara la tarjeta para la animación: invisible y desplazada hacia abajo
                tarjeta.style.opacity = '0';
                tarjeta.style.transform = 'translateY(20px)';
                // Aplica la animación con un retraso escalonado según el índice de la tarjeta
                // index * 80 hace que cada tarjeta aparezca 80ms después de la anterior
                setTimeout(() => {
                    tarjeta.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    tarjeta.style.opacity = '1';
                    tarjeta.style.transform = 'translateY(0)';
                }, index * 80);
            } else {
                // Si no coincide con el filtro, oculta la tarjeta
                tarjeta.classList.add('oculto');
            }
        });
    });
});

// ==========================================
// 4. CARRITO — Agregar productos
// ==========================================
// Delegación de eventos: escucha clics en todo el grid y detecta si se clickeó un botón "AGREGAR"
estilosGrid.addEventListener('click', (e) => {
    // .closest() busca hacia arriba en el DOM si se clickeó el SVG o el texto dentro del botón
    const btn = e.target.closest('.tarjeta__btn');
    // Si el clic no fue en un botón de agregar, no hace nada
    if (!btn) return;

    // Extrae el nombre y precio desde los atributos data del botón
    const nombre = btn.dataset.nombre;
    const precio = parseInt(btn.dataset.precio, 10); // Convierte el string a número entero

    // Busca en el array del carrito si ya existe un item con ese nombre
    const existente = carrito.find(item => item.nombre === nombre);
    if (existente) {
        // Si ya existe, solo incrementa la cantidad en 1
        existente.cantidad++;
    } else {
        // Si no existe, lo agrega como nuevo objeto al array con cantidad 1
        carrito.push({ nombre, precio, cantidad: 1 });
    }

    // Llama a la función que actualiza visualmente el carrito (badge, lista, total)
    actualizarCarrito();
    // Muestra la notificación toast con el nombre del producto
    mostrarToast(`${nombre} agregado al carrito`);

    // Animación de feedback: encoge el botón brevemente al clickear
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)'; // Lo devuelve a su tamaño normal
    }, 150);
});

// ==========================================
// 5. CARRITO — Abrir / Cerrar panel
// ==========================================
// Evento en el icono del carrito de la navbar para abrir el panel
document.querySelector('.carrito-btn').addEventListener('click', (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del enlace (#)
    abrirCarrito();     // Llama a la función que abre el panel
});

// Eventos para cerrar el panel: clic en la X o clic en el overlay oscuro
cerrarCarrito.addEventListener('click', cerrarPanelCarrito);
carritoOverlay.addEventListener('click', cerrarPanelCarrito);

// Función que abre el panel lateral del carrito
function abrirCarrito() {
    carritoPanel.classList.add('visible');     // Desliza el panel hacia adentro
    carritoOverlay.classList.add('visible');   // Muestra la capa oscura de fondo
    document.body.style.overflow = 'hidden';  // Bloquea el scroll del body para no scrollear detrás
}

// Función que cierra el panel lateral del carrito
function cerrarPanelCarrito() {
    carritoPanel.classList.remove('visible');  // Desliza el panel hacia afuera
    carritoOverlay.classList.remove('visible'); // Oculta la capa oscura
    document.body.style.overflow = '';         // Restaura el scroll del body
}

// ==========================================
// 6. CARRITO — Renderizar contenido
// ==========================================
// Función principal que actualiza toda la interfaz del carrito (badge, lista de items, total)
function actualizarCarrito() {
    // Calcula el total de items sumando la cantidad de cada uno con .reduce()
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    // Muestra ese número en el badge de la navbar
    carritoBadge.textContent = totalItems;

    // Muestra u oculta el badge según si hay items o no (clase que activa la animación CSS)
    if (totalItems > 0) {
        carritoBadge.classList.add('visible');
    } else {
        carritoBadge.classList.remove('visible');
    }

    // Si el carrito está vacío, muestra el mensaje de vacío y oculta el footer con el total
    if (carrito.length === 0) {
        carritoLista.innerHTML = '<p class="carrito-panel__vacio">Tu carrito está vacío</p>';
        carritoFooter.style.display = 'none';
        return; // Sale de la función, no sigue ejecutando lo de abajo
    }

    // Si hay items, muestra el footer con el total
    carritoFooter.style.display = 'block';

    let html = ''; // Variable para acumular el HTML de todos los items
    let total = 0; // Acumulador para el precio total

    // Recorre cada item del carrito para generar su HTML
    carrito.forEach((item, index) => {
        // Calcula el subtotal del item (precio × cantidad)
        const subtotal = item.precio * item.cantidad;
        total += subtotal; // Suma al total general

        // Concatena el HTML de este item usando un template literal
        // data-index guarda la posición del item para poder eliminarlo después
        html += `
            <div class="carrito-item">
                <div class="carrito-item__info">
                    <div class="carrito-item__nombre">${item.nombre}</div>
                    <div class="carrito-item__precio">$${item.precio} COP × ${item.cantidad}</div>
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

    // Inserta todo el HTML acumulado en la lista del panel
    carritoLista.innerHTML = html;
    // Muestra el total formateado con el símbolo de peso y "COP"
    carritoTotal.textContent = `$${total} COP`;
}

// Delegación de eventos para eliminar items del carrito
// En vez de poner un listener en cada botón, se pone uno en la lista y se detecta qué botón fue clickeado
carritoLista.addEventListener('click', (e) => {
    // Verifica si el clic fue en (o dentro de) un botón de eliminar
    const btnEliminar = e.target.closest('.carrito-item__eliminar');
    // Si no fue en un botón de eliminar, no hace nada
    if (!btnEliminar) return;

    // Lee el índice del item desde data-index y lo convierte a número entero
    const index = parseInt(btnEliminar.dataset.index, 10);
    // Guarda el nombre antes de eliminar para mostrarlo en el toast
    const eliminado = carrito[index].nombre;

    // .splice(index, 1) elimina 1 elemento del array en la posición indicada
    carrito.splice(index, 1);
    // Re-renderiza todo el carrito para reflejar la eliminación
    actualizarCarrito();
    // Muestra notificación confirmando la eliminación
    mostrarToast(`${eliminado} eliminado del carrito`);
});

// ==========================================
// 7. TOAST — Notificaciones
// ==========================================
// Variable para almacenar el ID del timeout actual del toast
let toastTimeout = null;

// Función que muestra la notificación toast con un mensaje personalizado
function mostrarToast(mensaje) {
    // Si ya hay un toast activo, limpia el timeout anterior y lo oculta
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toast.classList.remove('visible');
    }

    // Actualiza el texto del toast con el mensaje recibido
    toastMsg.textContent = mensaje;

    // Force reflow: accede a una propiedad de layout para forzar al navegador a reiniciar la animación CSS
    void toast.offsetWidth;

    // Muestra el toast agregando la clase "visible" que activa la transición CSS
    toast.classList.add('visible');

    // Configura un timeout para ocultar el toast después de 2.5 segundos
    toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
        toastTimeout = null; // Limpia la variable
    }, 2500);
}

// ==========================================
// 8. SCROLL REVEAL — Animación al hacer scroll
// ==========================================
// Función que inicializa las animaciones de aparición al hacer scroll
function initReveal() {
    // Selecciona todos los elementos que tendrán la animación de entrada
    const elementos = document.querySelectorAll(
        '.tarjeta, .galeria__item, .estilos__header, .footer__col'
    );

    // Les agrega la clase "reveal" a todos (los pone invisibles y desplazados, según el CSS)
    elementos.forEach(el => el.classList.add('reveal'));

    // Crea un IntersectionObserver: observa cuándo los elementos entran en el viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // entry.isIntersecting es true cuando el elemento es visible en pantalla
            if (entry.isIntersecting) {
                // Agrega la clase "visible" que activa la transición CSS (opacidad 1, translateY 0)
                entry.target.classList.add('visible');
                // Deja de observar el elemento para que la animación solo ocurra una vez
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,                      // Se activa cuando el 10% del elemento es visible
        rootMargin: '0px 0px -40px 0px'      // Margen inferior negativo: se activa 40px antes de entrar realmente
    });

    // Empieza a observar cada elemento seleccionado
    elementos.forEach(el => observer.observe(el));
}

// Ejecuta la función al cargar el script
initReveal();

// ==========================================
// 9. BOTÓN RESERVAR CITA
// ==========================================
// Evento en el botón "RESERVAR CITA" del panel del carrito
document.querySelector('.carrito-panel__pagar').addEventListener('click', () => {
    // Si el carrito está vacío, no hace nada (no debería ser posible porque el footer está oculto)
    if (carrito.length === 0) return;
    // Muestra toast de confirmación
    mostrarToast('Cita reservada con éxito');
    // Vacía el array del carrito usando .length = 0 (forma rápida de limpiar un array)
    carrito.length = 0;
    // Re-renderiza el carrito (ahora vacío, con el mensaje y sin footer)
    actualizarCarrito();
    // Espera 1.2 segundos y luego cierra el panel para que el usuario vea el toast de confirmación
    setTimeout(() => {
        cerrarPanelCarrito();
    }, 1200);
});

// ==========================================
// 10. CERRAR CON TECLA ESCAPE
// ==========================================
// Event listener global del teclado que permite cerrar el carrito con la tecla Escape
document.addEventListener('keydown', (e) => {
    // Verifica si la tecla presionada es "Escape"
    if (e.key === 'Escape') {
        cerrarPanelCarrito(); // Cierra el panel del carrito
    }
});