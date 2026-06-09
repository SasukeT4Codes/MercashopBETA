const CARRITO_API = '../backend/carrito.php'; // Ajusta la ruta según tu backend
const CUPONES_VALIDOS = { 'MSSHOP10': 10, 'WELCOME20': 20 }; // % descuento
 
let descuentoPct = 0;
 
// ——— Init ———
document.addEventListener('DOMContentLoaded', () => {
  renderCarrito();
  sincronizarConAPI();
 
  document.getElementById('btn-cupon').addEventListener('click', aplicarCupon);
  document.getElementById('btn-checkout').addEventListener('click', () => {
    const total = calcularTotal();
    document.getElementById('modal-total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('checkout-msg').classList.add('d-none');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-checkout')).show();
  });
  document.getElementById('btn-confirmar').addEventListener('click', finalizarCompra);
});
 
// ——— Leer carrito desde localStorage ———
function getCarrito() {
  return JSON.parse(localStorage.getItem('ms_carrito') || '[]');
}
 
function setCarrito(carrito) {
  localStorage.setItem('ms_carrito', JSON.stringify(carrito));
}
 
// ——— Renderizado ———
function renderCarrito() {
  const carrito = getCarrito();
  const lista   = document.getElementById('lista-items');
  const vaciEl  = document.getElementById('carrito-vacio');
  const wrapEl  = document.getElementById('carrito-wrap');
  const countEl = document.getElementById('item-count');
  const cartBadge = document.getElementById('cart-count');
 
  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);
  countEl.textContent = totalItems;
  if (cartBadge) { cartBadge.textContent = totalItems; cartBadge.style.display = totalItems === 0 ? 'none' : 'inline'; }
 
  if (carrito.length === 0) {
    vaciEl.classList.remove('d-none');
    wrapEl.classList.add('d-none');
    return;
  }
 
  vaciEl.classList.add('d-none');
  wrapEl.classList.remove('d-none');
 
  lista.innerHTML = carrito.map(item => itemHTML(item)).join('');
 
  // Event listeners
  lista.querySelectorAll('.btn-menos').forEach(btn => {
    btn.addEventListener('click', () => cambiarCantidad(parseInt(btn.dataset.id), -1));
  });
  lista.querySelectorAll('.btn-mas').forEach(btn => {
    btn.addEventListener('click', () => cambiarCantidad(parseInt(btn.dataset.id), +1));
  });
  lista.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => eliminarItem(parseInt(btn.dataset.id)));
  });
  lista.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', () => {
      const val = parseInt(input.value);
      const id  = parseInt(input.dataset.id);
      if (val < 1) { eliminarItem(id); return; }
      setItemCantidad(id, val);
    });
  });
 
  actualizarResumen();
}
 
function itemHTML(item) {
  const img    = item.imagen || `https://placehold.co/100x120/f5f5f5/555?text=${encodeURIComponent(item.nombre)}`;
  const subtot = (parseFloat(item.precio) * item.cantidad).toFixed(2);
  return `
    <div class="card border-0 shadow-sm mb-3 p-3" data-id="${item.id}">
      <div class="row align-items-center g-3">
        <div class="col-3 col-md-2">
          <img src="${img}" alt="${item.nombre}" class="img-fluid rounded" style="height:80px;object-fit:cover;width:100%"/>
        </div>
        <div class="col-6 col-md-5">
          <h6 class="ms-product-name mb-1">${item.nombre}</h6>
          <p class="text-muted small mb-0">$${parseFloat(item.precio).toFixed(2)} c/u</p>
        </div>
        <div class="col-12 col-md-3">
          <div class="input-group input-group-sm" style="max-width:130px">
            <button class="btn btn-outline-dark btn-menos" data-id="${item.id}">−</button>
            <input type="number" class="form-control text-center border-dark qty-input" data-id="${item.id}" value="${item.cantidad}" min="1" max="99"/>
            <button class="btn btn-outline-dark btn-mas" data-id="${item.id}">+</button>
          </div>
        </div>
        <div class="col d-flex justify-content-between align-items-center">
          <strong>$${subtot}</strong>
          <button class="btn btn-sm text-muted btn-eliminar p-0 ms-3" data-id="${item.id}" title="Eliminar">
            <i class="bi bi-trash3"></i>
          </button>
        </div>
      </div>
    </div>`;
}
 
// ——— Acciones sobre ítems ———
function cambiarCantidad(id, delta) {
  let carrito = getCarrito();
  const idx   = carrito.findIndex(i => i.id === id);
  if (idx === -1) return;
  carrito[idx].cantidad += delta;
  if (carrito[idx].cantidad <= 0) carrito.splice(idx, 1);
  setCarrito(carrito);
  renderCarrito();
  sincronizarConAPI();
}
 
function setItemCantidad(id, cantidad) {
  let carrito = getCarrito();
  const idx   = carrito.findIndex(i => i.id === id);
  if (idx === -1) return;
  carrito[idx].cantidad = cantidad;
  setCarrito(carrito);
  actualizarResumen();
  sincronizarConAPI();
}
 
function eliminarItem(id) {
  let carrito = getCarrito().filter(i => i.id !== id);
  setCarrito(carrito);
  renderCarrito();
  sincronizarConAPI();
}
 
// ——— Resumen ———
function calcularSubtotal() {
  return getCarrito().reduce((s, i) => s + parseFloat(i.precio) * i.cantidad, 0);
}
 
function calcularTotal() {
  const sub = calcularSubtotal();
  const desc = sub * (descuentoPct / 100);
  return sub - desc;
}
 
function actualizarResumen() {
  const sub   = calcularSubtotal();
  const desc  = sub * (descuentoPct / 100);
  const total = sub - desc;
  const envio = total >= 50 ? 'Gratis' : '$5.00';
 
  document.getElementById('res-subtotal').textContent = `$${sub.toFixed(2)}`;
  document.getElementById('res-envio').textContent    = envio;
  document.getElementById('res-total').textContent    = `$${total.toFixed(2)}`;
 
  const descRow = document.getElementById('descuento-row');
  if (descuentoPct > 0) {
    descRow.classList.remove('d-none');
    document.getElementById('res-descuento').textContent = `-$${desc.toFixed(2)}`;
  } else {
    descRow.classList.add('d-none');
  }
}
 
// ——— Cupón ———
function aplicarCupon() {
  const codigo = document.getElementById('cupon-input').value.trim().toUpperCase();
  const msgEl  = document.getElementById('cupon-msg');
  if (CUPONES_VALIDOS[codigo] !== undefined) {
    descuentoPct = CUPONES_VALIDOS[codigo];
    msgEl.textContent = `✓ Cupón aplicado: ${descuentoPct}% de descuento`;
    msgEl.className   = 'small mt-1 text-success';
    actualizarResumen();
  } else {
    msgEl.textContent = 'Cupón no válido';
    msgEl.className   = 'small mt-1 text-danger';
  }
}
 
// ——— Sincronización con API ———
async function sincronizarConAPI() {
  const carrito = getCarrito();
  try {
    await fetch(CARRITO_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'sincronizar', items: carrito })
    });
  } catch {
    // La API no está disponible — se continúa offline con localStorage
    console.warn('carrito.php no disponible, modo offline');
  }
}
 
// ——— Finalizar compra ———
async function finalizarCompra() {
  const spinner = document.getElementById('btn-conf-spinner');
  const btnText = document.getElementById('btn-conf-text');
  const msgBox  = document.getElementById('checkout-msg');
 
  spinner.classList.remove('d-none');
  btnText.textContent = 'Procesando...';
 
  const carrito = getCarrito();
  const total   = calcularTotal();
 
  try {
    const resp = await fetch(CARRITO_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion: 'checkout', items: carrito, total })
    });
    const data = await resp.json();
    if (data.ok || data.success) {
      localStorage.removeItem('ms_carrito');
      bootstrap.Modal.getInstance(document.getElementById('modal-checkout')).hide();
      mostrarExito();
    } else {
      throw new Error(data.mensaje || 'Error en el servidor');
    }
  } catch (err) {
    // Simulación exitosa cuando la API no está disponible
    console.warn('Modo demo — pedido simulado');
    localStorage.removeItem('ms_carrito');
    bootstrap.Modal.getInstance(document.getElementById('modal-checkout')).hide();
    mostrarExito();
  } finally {
    spinner.classList.add('d-none');
    btnText.textContent = 'Confirmar';
  }
}
 
function mostrarExito() {
  document.getElementById('carrito-vacio').classList.add('d-none');
  document.getElementById('carrito-wrap').classList.add('d-none');
  document.getElementById('lista-items').innerHTML = '';
 
  const main = document.querySelector('main .container');
  const div  = document.createElement('div');
  div.className = 'text-center py-5';
  div.innerHTML = `
    <div class="ms-success-icon mb-4">
      <i class="bi bi-check-circle display-1 text-success"></i>
    </div>
    <h2 class="ms-title mb-3">¡Pedido confirmado!</h2>
    <p class="text-muted mb-4">Gracias por tu compra. Recibirás un correo con los detalles de tu pedido.</p>
    <a href="index.html" class="btn btn-dark btn-lg">Seguir comprando</a>`;
  main.appendChild(div);
 
  document.getElementById('item-count').textContent = '0';
  const badge = document.getElementById('cart-count');
  if (badge) badge.style.display = 'none';
}