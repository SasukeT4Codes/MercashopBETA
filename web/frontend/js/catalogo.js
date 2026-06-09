const API_URL = '../backend/productos.php'; // Ajusta la ruta según tu backend
 
// ——— Estado global ———
let todosLosProductos = [];
let filtrados = [];
 
// ——— Elementos del DOM ———
const grid        = document.getElementById('productos-grid');
const loading     = document.getElementById('loading');
const emptyState  = document.getElementById('empty-state');
const totalEl     = document.getElementById('total-productos');
const searchInput = document.getElementById('search-input');
const filtCat     = document.getElementById('filter-categoria');
const filtPrecio  = document.getElementById('filter-precio');
const filtOrden   = document.getElementById('filter-orden');
const btnLimpiar  = document.getElementById('btn-limpiar');
const cartCount   = document.getElementById('cart-count');
 
// ——— Inicialización ———
document.addEventListener('DOMContentLoaded', () => {
  actualizarContadorCarrito();
  cargarProductos();
 
  searchInput.addEventListener('input',  aplicarFiltros);
  filtCat.addEventListener('change',     aplicarFiltros);
  filtPrecio.addEventListener('change',  aplicarFiltros);
  filtOrden.addEventListener('change',   aplicarFiltros);
  btnLimpiar.addEventListener('click',   limpiarFiltros);
});
 
// ——— Carga desde la API ———
async function cargarProductos() {
  try {
    mostrarLoading(true);
    const resp = await fetch(API_URL);
    if (!resp.ok) throw new Error('Error al cargar productos');
    const data = await resp.json();
    todosLosProductos = data;
    aplicarFiltros();
  } catch (err) {
    console.warn('API no disponible, usando datos de ejemplo:', err.message);
    todosLosProductos = productosDemo();
    aplicarFiltros();
  } finally {
    mostrarLoading(false);
  }
}
 
// ——— Filtros y ordenación ———
function aplicarFiltros() {
  const texto    = searchInput.value.trim().toLowerCase();
  const cat      = filtCat.value.toLowerCase();
  const precio   = filtPrecio.value;
  const orden    = filtOrden.value;
 
  filtrados = todosLosProductos.filter(p => {
    const nombreOk = p.nombre.toLowerCase().includes(texto) ||
                     (p.descripcion || '').toLowerCase().includes(texto);
    const catOk    = !cat || (p.categoria || '').toLowerCase() === cat;
    const precioOk = !precio || filtrarPorPrecio(parseFloat(p.precio), precio);
    return nombreOk && catOk && precioOk;
  });
 
  if (orden === 'precio-asc')  filtrados.sort((a,b) => a.precio - b.precio);
  if (orden === 'precio-desc') filtrados.sort((a,b) => b.precio - a.precio);
  if (orden === 'nombre')      filtrados.sort((a,b) => a.nombre.localeCompare(b.nombre));
 
  renderizarProductos(filtrados);
}
 
function filtrarPorPrecio(precio, rango) {
  if (rango === '0-30')   return precio <= 30;
  if (rango === '30-60')  return precio > 30  && precio <= 60;
  if (rango === '60-100') return precio > 60  && precio <= 100;
  if (rango === '100+')   return precio > 100;
  return true;
}
 
function limpiarFiltros() {
  searchInput.value = '';
  filtCat.value     = '';
  filtPrecio.value  = '';
  filtOrden.value   = '';
  aplicarFiltros();
}
 
// ——— Render ———
function renderizarProductos(lista) {
  grid.innerHTML = '';
  totalEl.textContent = lista.length;
 
  if (lista.length === 0) {
    grid.style.display = 'none';
    emptyState.classList.remove('d-none');
    return;
  }
 
  emptyState.classList.add('d-none');
  grid.style.display = '';
 
  lista.forEach((p, i) => {
    const col = document.createElement('div');
    col.className = 'col';
    col.style.animationDelay = `${i * 0.05}s`;
    col.innerHTML = tarjetaProducto(p);
    grid.appendChild(col);
  });
}
 
function tarjetaProducto(p) {
  const img = p.imagen || `https://placehold.co/400x500/f5f5f5/555?text=${encodeURIComponent(p.nombre)}`;
  const precio = parseFloat(p.precio).toFixed(2);
  const precioAnterior = p.precio_anterior ? `<span class="text-muted text-decoration-line-through small me-1">$${parseFloat(p.precio_anterior).toFixed(2)}</span>` : '';
 
  return `
    <div class="card ms-card h-100 border-0 shadow-sm">
      <div class="ms-card-img-wrap position-relative overflow-hidden">
        <a href="detalle.html?id=${p.id}">
          <img src="${img}" class="card-img-top ms-card-img" alt="${p.nombre}" loading="lazy"/>
        </a>
        ${p.descuento ? `<span class="badge bg-dark position-absolute top-0 start-0 m-2">-${p.descuento}%</span>` : ''}
        <button class="btn btn-dark btn-sm ms-btn-agregar w-100" onclick="agregarAlCarrito(${p.id}, '${p.nombre}', ${precio}, '${img}')">
          <i class="bi bi-bag-plus me-1"></i>AGREGAR
        </button>
      </div>
      <div class="card-body px-2 py-3">
        <p class="text-muted small mb-1 text-uppercase" style="font-size:.7rem;letter-spacing:.08em">${p.categoria || ''}</p>
        <a href="detalle.html?id=${p.id}" class="text-decoration-none text-dark">
          <h6 class="ms-product-name mb-1">${p.nombre}</h6>
        </a>
        <div class="d-flex align-items-center">
          ${precioAnterior}
          <strong>$${precio}</strong>
        </div>
      </div>
    </div>`;
}
 
// ——— Carrito ———
function agregarAlCarrito(id, nombre, precio, imagen) {
  let carrito = JSON.parse(localStorage.getItem('ms_carrito') || '[]');
  const idx = carrito.findIndex(i => i.id === id);
  if (idx > -1) {
    carrito[idx].cantidad++;
  } else {
    carrito.push({ id, nombre, precio, imagen, cantidad: 1 });
  }
  localStorage.setItem('ms_carrito', JSON.stringify(carrito));
  actualizarContadorCarrito();
  mostrarToast(`"${nombre}" agregado al carrito`);
}
 
function actualizarContadorCarrito() {
  if (!cartCount) return;
  const carrito = JSON.parse(localStorage.getItem('ms_carrito') || '[]');
  const total = carrito.reduce((s, i) => s + i.cantidad, 0);
  cartCount.textContent = total;
  cartCount.style.display = total === 0 ? 'none' : 'inline';
}
 
function mostrarToast(msg) {
  const el  = document.getElementById('toast-carrito');
  const txt = document.getElementById('toast-msg');
  if (!el) return;
  txt.textContent = msg;
  bootstrap.Toast.getOrCreateInstance(el, { delay: 2500 }).show();
}
 
function mostrarLoading(show) {
  loading.style.display = show ? 'block' : 'none';
}
 
// ——— Datos demo (cuando la API no está disponible) ———
function productosDemo() {
  return [
    { id:1,  nombre:'Banana Sweatshirt',      precio:29.90, precio_anterior:45.00, categoria:'Sudaderas',  descuento:33, imagen:'' },
    { id:2,  nombre:'Short-sleeved Blouse',   precio:17.90, precio_anterior:null,  categoria:'Blusas',     descuento:null, imagen:'' },
    { id:3,  nombre:'Wide-leg Twill Pants',   precio:79.90, precio_anterior:null,  categoria:'Pantalones', descuento:null, imagen:'' },
    { id:4,  nombre:'Linen Oversized Tee',    precio:24.90, precio_anterior:34.00, categoria:'Camisetas',  descuento:27, imagen:'' },
    { id:5,  nombre:'Ribbed Midi Skirt',      precio:39.90, precio_anterior:null,  categoria:'Pantalones', descuento:null, imagen:'' },
    { id:6,  nombre:'Relaxed Denim Jacket',   precio:89.90, precio_anterior:110.00,categoria:'Sudaderas',  descuento:18, imagen:'' },
    { id:7,  nombre:'Cropped Knit Cardigan',  precio:49.90, precio_anterior:null,  categoria:'Blusas',     descuento:null, imagen:'' },
    { id:8,  nombre:'Floral Wrap Dress',      precio:59.90, precio_anterior:75.00, categoria:'Camisetas',  descuento:20, imagen:'' },
  ];
}