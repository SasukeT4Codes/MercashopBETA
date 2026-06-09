const API_URL = "/api/productos.php";
let productos = [];
let toast = null;

document.addEventListener("DOMContentLoaded", async () => {
  toast = bootstrap.Toast.getOrCreateInstance(document.getElementById("toast-carrito"));
  actualizarContador();
  await cargarProductos();
  conectarFiltros();
});

async function cargarProductos() {
  try {
    const resp = await fetch(API_URL);
    const data = await resp.json();
    productos = Array.isArray(data?.data) ? data.data : [];
    renderProductos(productos);
  } catch {
    renderVacío();
  }
}

function renderProductos(lista) {
  const grid = document.getElementById("productos-grid");
  const empty = document.getElementById("empty-state");
  const loading = document.getElementById("loading");
  const total = document.getElementById("total-productos");

  loading.style.display = "none";
  grid.style.display = "";
  grid.innerHTML = "";

  total.textContent = lista.length;

  if (!lista.length) {
    empty.classList.remove("d-none");
    return;
  }

  empty.classList.add("d-none");

  lista.forEach((p, index) => {
    const col = document.createElement("div");
    col.className = "col";

    col.innerHTML = `
      <div class="card ms-card h-100 border-0 shadow-sm">
        <div class="ms-card-img-wrap">
          <img src="${p.cUrlImagenPrincipal || `https://placehold.co/600x700?text=${encodeURIComponent(p.cDescripcionCorta)}`}" class="ms-card-img" alt="${p.cDescripcionCorta}">
          <button class="btn btn-dark ms-btn-agregar" aria-label="Agregar ${p.cDescripcionCorta} al carrito" data-id="${p.nProductoID}">
            <i class="bi bi-bag-plus me-2"></i>AGREGAR
          </button>
        </div>
        <div class="card-body">
          <h5 class="ms-product-name mb-2">${p.cDescripcionCorta}</h5>
          <p class="ms-muted small mb-2">${p.cDescripcionLarga || ""}</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="ms-price">${formatoCOP(p.nPrecioUnitario)}</span>
            <a href="detalle.html?id=${p.nProductoID}" class="btn btn-sm btn-outline-dark" aria-label="Ver detalle de ${p.cDescripcionCorta}">
              Ver
            </a>
          </div>
        </div>
      </div>
    `;

    grid.appendChild(col);

    col.querySelector(".ms-btn-agregar").addEventListener("click", () => agregarAlCarrito(p));
  });
}

function renderVacío() {
  document.getElementById("loading").style.display = "none";
  document.getElementById("empty-state").classList.remove("d-none");
}

function conectarFiltros() {
  const search = document.getElementById("search-input");
  const categoria = document.getElementById("filter-categoria");
  const precio = document.getElementById("filter-precio");
  const orden = document.getElementById("filter-orden");

  [search, categoria, precio, orden].forEach(el => el.addEventListener("input", filtrar));
  document.getElementById("btn-limpiar").addEventListener("click", () => {
    search.value = "";
    categoria.value = "";
    precio.value = "";
    orden.value = "";
    renderProductos(productos);
  });
}

function filtrar() {
  let lista = [...productos];
  const q = document.getElementById("search-input").value.toLowerCase().trim();
  const cat = document.getElementById("filter-categoria").value;
  const prec = document.getElementById("filter-precio").value;
  const ord = document.getElementById("filter-orden").value;

  if (q) {
    lista = lista.filter(p =>
      (p.cDescripcionCorta || "").toLowerCase().includes(q) ||
      (p.cDescripcionLarga || "").toLowerCase().includes(q)
    );
  }

  if (cat) {
    lista = lista.filter(p => (p.cCategoria || "").toLowerCase() === cat);
  }

  if (prec) {
    lista = lista.filter(p => filtrarPrecio(p.nPrecioUnitario, prec));
  }

  if (ord === "precio-asc") lista.sort((a, b) => a.nPrecioUnitario - b.nPrecioUnitario);
  if (ord === "precio-desc") lista.sort((a, b) => b.nPrecioUnitario - a.nPrecioUnitario);
  if (ord === "nombre") lista.sort((a, b) => (a.cDescripcionCorta || "").localeCompare(b.cDescripcionCorta || ""));

  renderProductos(lista);
}

function filtrarPrecio(valor, rango) {
  valor = Number(valor);
  if (rango === "0-10000") return valor >= 0 && valor <= 10000;
  if (rango === "10000-100000") return valor > 10000 && valor <= 100000;
  if (rango === "100000-1000000") return valor > 100000 && valor <= 1000000;
  if (rango === "1000000+") return valor > 1000000;
  return true;
}

function agregarAlCarrito(p) {
  let carrito = JSON.parse(localStorage.getItem("ms_carrito") || "[]");
  const existente = carrito.find(i => i.id === p.nProductoID);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      id: p.nProductoID,
      nombre: p.cDescripcionCorta,
      precio: p.nPrecioUnitario,
      imagen: p.cUrlImagenPrincipal,
      cantidad: 1
    });
  }

  localStorage.setItem("ms_carrito", JSON.stringify(carrito));
  actualizarContador();

  document.getElementById("toast-msg").textContent = `"${p.cDescripcionCorta}" agregado al carrito`;
  toast.show();
}

function formatoCOP(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(valor);
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