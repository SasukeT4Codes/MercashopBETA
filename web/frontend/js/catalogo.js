// js/catalogo.js
const API_URL = "/api/productos.php"; // ruta pública correcta

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();

  document.getElementById("btn-limpiar").addEventListener("click", () => {
    document.getElementById("search-input").value = "";
    document.getElementById("filter-categoria").value = "";
    document.getElementById("filter-precio").value = "";
    document.getElementById("filter-orden").value = "";
    cargarProductos();
  });
});

async function cargarProductos() {
  const grid = document.getElementById("productos-grid");
  const loading = document.getElementById("loading");
  const empty = document.getElementById("empty-state");
  const totalEl = document.getElementById("total-productos");

  grid.style.display = "none";
  loading.style.display = "block";
  empty.classList.add("d-none");

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    loading.style.display = "none";

    if (data.OK && data.data.length > 0) {
      totalEl.textContent = data.data.length;
      const productos = data.data.map(p => ({
        id: p.nProductoID,
        nombre: p.cDescripcionCorta,
        descripcion: p.cDescripcionLarga,
        imagen: p.cUrlImagenPrincipal,
        precio: p.nPrecioUnitario
      }));
      grid.innerHTML = productos.map(p => productoHTML(p)).join("");
      grid.style.display = "flex";
    } else {
      totalEl.textContent = 0;
      empty.classList.remove("d-none");
    }
  } catch (err) {
    console.error("Error cargando productos", err);
    loading.style.display = "none";
    empty.classList.remove("d-none");
  }
}

function productoHTML(p) {
  const img = p.imagen || "https://placehold.co/300x300?text=Producto";
  const precioCOP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(p.precio);

  return `
    <div class="col">
      <div class="card h-100 border-0 shadow-sm">
        <a href="detalle.html?id=${p.id}">
          <img src="${img}" class="card-img-top" alt="${p.nombre}" style="height:200px;object-fit:cover"/>
        </a>
        <div class="card-body d-flex flex-column">
          <a href="detalle.html?id=${p.id}" class="text-decoration-none text-dark">
            <h6 class="ms-product-name mb-2">${p.nombre}</h6>
          </a>
          <p class="text-muted mb-2">${precioCOP}</p>
          <button class="btn btn-dark mt-auto" onclick="agregarAlCarrito(${p.id}, '${p.nombre}', ${p.precio}, '${img}')">
            <i class="bi bi-bag me-1"></i>Agregar
          </button>
        </div>
      </div>
    </div>`;
}


function agregarAlCarrito(id, nombre, precio, imagen) {
  let carrito = JSON.parse(localStorage.getItem("ms_carrito") || "[]");
  const existente = carrito.find(i => i.id === id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ id, nombre, precio, imagen, cantidad: 1 });
  }
  localStorage.setItem("ms_carrito", JSON.stringify(carrito));

  const toast = bootstrap.Toast.getOrCreateInstance(document.getElementById("toast-carrito"));
  document.getElementById("toast-msg").textContent = `${nombre} agregado al carrito`;
  toast.show();
}
