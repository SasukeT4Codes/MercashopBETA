// js/carrito.js
const CUPONES_VALIDOS = { "MSSHOP10": 10, "WELCOME20": 20 };
let descuentoPct = 0;

document.addEventListener("DOMContentLoaded", () => {
  renderCarrito();

  document.getElementById("btn-cupon").addEventListener("click", aplicarCupon);
  document.getElementById("btn-checkout").addEventListener("click", mostrarCheckout);
  document.getElementById("btn-confirmar").addEventListener("click", finalizarCompra);
});

function getCarrito() {
  return JSON.parse(localStorage.getItem("ms_carrito") || "[]");
}

function setCarrito(carrito) {
  localStorage.setItem("ms_carrito", JSON.stringify(carrito));
}

function renderCarrito() {
  const carrito = getCarrito();
  const tbody = document.querySelector("#tablaCarrito tbody");
  tbody.innerHTML = "";

  // Actualizar contador de ítems en la página y en el navbar
  document.getElementById("item-count").textContent = carrito.reduce((s, i) => s + i.cantidad, 0);
  actualizarContador();

  if (carrito.length === 0) {
    document.getElementById("carrito-vacio").classList.remove("d-none");
    document.getElementById("carrito-wrap").classList.add("d-none");
    actualizarResumen();
    return;
  } else {
    document.getElementById("carrito-vacio").classList.add("d-none");
    document.getElementById("carrito-wrap").classList.remove("d-none");
  }

  carrito.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><img src="${p.imagen || "https://placehold.co/60"}" alt="${p.nombre}" style="width:60px"/></td>
      <td>${p.nombre}</td>
      <td>${formatoCOP(p.precio)}</td>
      <td>
        <button class="btn btn-sm btn-outline-dark" onclick="cambiarCantidad(${p.id}, -1)">−</button>
        <span class="mx-2">${p.cantidad}</span>
        <button class="btn btn-sm btn-outline-dark" onclick="cambiarCantidad(${p.id}, 1)">+</button>
      </td>
      <td>${formatoCOP(p.precio * p.cantidad)}</td>
    `;
    tbody.appendChild(tr);
  });

  actualizarResumen();
}

function cambiarCantidad(id, delta) {
  let carrito = getCarrito();
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) carrito = carrito.filter(i => i.id !== id);
  setCarrito(carrito);
  renderCarrito();
}

function calcularSubtotal() {
  return getCarrito().reduce((s, i) => s + i.precio * i.cantidad, 0);
}

function actualizarResumen() {
  const subtotal = calcularSubtotal();
  const descuento = subtotal * (descuentoPct / 100);
  const total = subtotal - descuento;

  document.getElementById("res-subtotal").textContent = formatoCOP(subtotal);
  document.getElementById("res-descuento").textContent = formatoCOP(descuento);
  document.getElementById("res-total").textContent = formatoCOP(total);

  if (descuentoPct > 0) {
    document.getElementById("descuento-row").classList.remove("d-none");
  } else {
    document.getElementById("descuento-row").classList.add("d-none");
  }
}

function aplicarCupon() {
  const code = document.getElementById("cupon-input").value.trim().toUpperCase();
  if (CUPONES_VALIDOS[code]) {
    descuentoPct = CUPONES_VALIDOS[code];
    document.getElementById("cupon-msg").textContent = `Cupón aplicado: ${descuentoPct}% de descuento`;
  } else {
    descuentoPct = 0;
    document.getElementById("cupon-msg").textContent = "Cupón inválido";
  }
  actualizarResumen();
}

function mostrarCheckout() {
  const total = calcularSubtotal() * (1 - descuentoPct / 100);
  document.getElementById("modal-total").textContent = formatoCOP(total);
  bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-checkout")).show();
}

function finalizarCompra() {
  localStorage.removeItem("ms_carrito");
  renderCarrito();
  const msg = document.getElementById("checkout-msg");
  if (msg) msg.classList.remove("d-none");
}

function formatoCOP(valor) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(valor);
}

function actualizarContador() {
  const carrito = getCarrito();
  const total = carrito.reduce((s, i) => s + i.cantidad, 0);
  const el = document.getElementById("cart-count");
  if (el) {
    el.textContent = total;
    el.style.display = total === 0 ? "none" : "inline";
  }
}
