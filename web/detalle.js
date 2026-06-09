// js/detalle.js
const API_URL = "/api/productos.php";
let producto = null;

document.addEventListener("DOMContentLoaded", async () => {
  actualizarContador();
  const id = new URLSearchParams(location.search).get("id");
  if (!id) {
    mostrarError();
    return;
  }
  await cargarProducto(id);

  document.getElementById("btn-mas").addEventListener("click", () => cambiarCantidad(1));
  document.getElementById("btn-menos").addEventListener("click", () => cambiarCantidad(-1));
  document.getElementById("btn-agregar").addEventListener("click", agregarAlCarrito);
});

async function cargarProducto(id) {
  try {
    const resp = await fetch(`${API_URL}?id=${id}`);
    const data = await resp.json();
    if (!data.OK || !data.data || data.data.length === 0) throw new Error();
    producto = data.data[0];
    renderProducto(producto);
  } catch {
    mostrarError();
  }
}

function renderProducto(p) {
  document.title = `MercaShop – ${p.cDescripcionCorta}`;
  document.getElementById("bc-nombre").textContent = p.cDescripcionCorta;
  document.getElementById("det-nombre").textContent = p.cDescripcionCorta;
  document.getElementById("det-descripcion").textContent = p.cDescripcionLarga || "";
  document.getElementById("det-precio").textContent = formatoCOP(p.nPrecioUnitario);
  document.getElementById("det-stock").textContent = p.nCantidadStock ? `${p.nCantidadStock} unidades disponibles` : "";

  const img = document.getElementById("det-imagen");
  img.src = p.cUrlImagenPrincipal || `https://placehold.co/600x700?text=${encodeURIComponent(p.cDescripcionCorta)}`;
  img.alt = p.cDescripcionCorta;

  document.getElementById("loading").style.display = "none";
  document.getElementById("detalle-wrap").classList.remove("d-none");
}

function mostrarError() {
  document.getElementById("loading").style.display = "none";
  document.getElementById("error-state").classList.remove("d-none");
}

function formatoCOP(valor) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(valor);
}

function cambiarCantidad(delta) {
  const input = document.getElementById("cantidad-input");
  let val = parseInt(input.value) + delta;
  if (val < 1) val = 1;
  if (val > 99) val = 99;
  input.value = val;
}

function agregarAlCarrito() {
  if (!producto) return;
  const cantidad = parseInt(document.getElementById("cantidad-input").value);
  let carrito = JSON.parse(localStorage.getItem("ms_carrito") || "[]");
  const existente = carrito.find(i => i.id === producto.nProductoID);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({
      id: producto.nProductoID,
      nombre: producto.cDescripcionCorta,
      precio: producto.nPrecioUnitario,
      imagen: producto.cUrlImagenPrincipal,
      cantidad
    });
  }
  localStorage.setItem("ms_carrito", JSON.stringify(carrito));
  actualizarContador();

  document.getElementById("toast-msg").textContent = `"${producto.cDescripcionCorta}" agregado al carrito`;
  bootstrap.Toast.getOrCreateInstance(document.getElementById("toast-carrito")).show();
}

function actualizarContador() {
  const carrito = JSON.parse(localStorage.getItem("ms_carrito") || "[]");
  const total = carrito.reduce((s, i) => s + i.cantidad, 0);
  const el = document.getElementById("cart-count");
  if (el) {
    el.textContent = total;
    el.style.display = total === 0 ? "none" : "inline";
  }
}
