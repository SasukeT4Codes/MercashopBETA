let cuponActivo = null;

document.addEventListener("DOMContentLoaded", () => {
  actualizarContador();
  renderCarrito();

  document.getElementById("btn-cupon").addEventListener("click", aplicarCupon);
  document.getElementById("btn-checkout").addEventListener("click", abrirCheckout);
  document.getElementById("btn-confirmar").addEventListener("click", confirmarPedido);
});

function obtenerCarrito() {
  return JSON.parse(localStorage.getItem("ms_carrito") || "[]");
}

function guardarCarrito(carrito) {
  localStorage.setItem("ms_carrito", JSON.stringify(carrito));
  actualizarContador();
  renderCarrito();
}

function renderCarrito() {
  const carrito = obtenerCarrito();
  const tbody = document.querySelector("#tablaCarrito tbody");
  const wrap = document.getElementById("carrito-wrap");
  const vacio = document.getElementById("carrito-vacio");
  const itemCount = document.getElementById("item-count");

  itemCount.textContent = carrito.reduce((s, i) => s + i.cantidad, 0);

  if (!carrito.length) {
    wrap.classList.add("d-none");
    vacio.classList.remove("d-none");
    actualizarResumen(0, 0);
    tbody.innerHTML = "";
    return;
  }

  wrap.classList.remove("d-none");
  vacio.classList.add("d-none");

  tbody.innerHTML = "";
  let subtotal = 0;

  carrito.forEach(item => {
    const total = item.precio * item.cantidad;
    subtotal += total;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <img src="${item.imagen || 'https://placehold.co/80x80'}" alt="${item.nombre}" width="80" height="80" class="cart-thumb">
      <td>${item.nombre}</td>
      <td>${formatoCOP(item.precio)}</td>
      <td>
        <div class="input-group" style="max-width:130px">
          <button class="btn btn-outline-dark btn-sm" data-action="menos" data-id="${item.id}">−</button>
          <input type="text" class="form-control text-center" value="${item.cantidad}" readonly>
          <button class="btn btn-outline-dark btn-sm" data-action="mas" data-id="${item.id}">+</button>
        </div>
      </td>
      <td>${formatoCOP(total)}</td>
    `;

    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => modificarCantidad(btn.dataset.id, btn.dataset.action));
  });

  const descuento = calcularDescuento(subtotal);
  actualizarResumen(subtotal, descuento);
}

function modificarCantidad(id, accion) {
  let carrito = obtenerCarrito();
  const item = carrito.find(i => String(i.id) === String(id));
  if (!item) return;

  if (accion === "mas") item.cantidad += 1;
  if (accion === "menos") item.cantidad -= 1;

  carrito = carrito.filter(i => i.cantidad > 0);
  guardarCarrito(carrito);
}

function aplicarCupon() {
  const input = document.getElementById("cupon-input");
  const msg = document.getElementById("cupon-msg");
  const codigo = input.value.trim().toUpperCase();

  if (!codigo) {
    msg.textContent = "Ingresa un código de cupón.";
    msg.className = "small mt-1 text-danger";
    return;
  }

  if (codigo === "MSSHOP10") {
    cuponActivo = "MSSHOP10";
    msg.textContent = "Cupón aplicado correctamente: 10% de descuento.";
    msg.className = "small mt-1 text-success";
    renderCarrito();
  } else {
    cuponActivo = null;
    msg.textContent = "Cupón no válido.";
    msg.className = "small mt-1 text-danger";
    renderCarrito();
  }
}

function calcularDescuento(subtotal) {
  if (cuponActivo === "MSSHOP10") return subtotal * 0.1;
  return 0;
}

function actualizarResumen(subtotal, descuento) {
  const total = subtotal - descuento;

  document.getElementById("res-subtotal").textContent = formatoCOP(subtotal);
  document.getElementById("res-total").textContent = formatoCOP(total);
  document.getElementById("modal-total").textContent = formatoCOP(total);

  const row = document.getElementById("descuento-row");
  const el = document.getElementById("res-descuento");

  if (descuento > 0) {
    row.classList.remove("d-none");
    el.textContent = `-${formatoCOP(descuento)}`;
  } else {
    row.classList.add("d-none");
    el.textContent = "";
  }
}

function abrirCheckout() {
  const carrito = obtenerCarrito();
  if (!carrito.length) return;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-checkout")).show();
}

function confirmarPedido() {
  const spinner = document.getElementById("btn-conf-spinner");
  const text = document.getElementById("btn-conf-text");
  spinner.classList.remove("d-none");
  text.textContent = "Procesando...";

  setTimeout(() => {
    localStorage.removeItem("ms_carrito");
    cuponActivo = null;
    spinner.classList.add("d-none");
    text.textContent = "Confirmar";
    bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-checkout")).hide();
    renderCarrito();
  }, 1200);
}

function formatoCOP(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(valor);
}

function actualizarContador() {
  const carrito = obtenerCarrito();
  const total = carrito.reduce((s, i) => s + i.cantidad, 0);
  const el = document.getElementById("cart-count");
  if (el) {
    el.textContent = total;
    el.style.display = total === 0 ? "none" : "inline";
  }
}