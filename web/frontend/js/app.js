async function mostrarCatalogo() {
  const res = await fetch("/api/productos.php");
  const data = await res.json();

  const contenedor = document.getElementById("contenido");
  contenedor.innerHTML = "";

  if (data.OK && data.data.length > 0) {
    data.data.forEach(prod => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-4";

      col.innerHTML = `
        <div class="card h-100">
          <img src="${prod.cUrlImagenPrincipal || 'https://via.placeholder.com/150'}" 
               class="card-img-top" alt="${prod.cDescripcionCorta}">
          <div class="card-body">
            <h5 class="card-title">${prod.cDescripcionCorta}</h5>
            <p class="card-text">${prod.cDescripcionLarga}</p>
            <p class="card-text"><strong>Precio:</strong> $${prod.nPrecioUnitario}</p>
            <button class="btn btn-primary" onclick="agregarCarrito(${prod.nProductoID})">
              Agregar al carrito
            </button>
          </div>
        </div>
      `;
      contenedor.appendChild(col);
    });
  } else {
    contenedor.innerHTML = "<p>No hay productos disponibles.</p>";
  }
}

function agregarCarrito(id) {
  fetch("/api/carrito.php?action=add", {
    method: "POST",
    body: new URLSearchParams({ id })
  })
  .then(res => res.json())
  .then(data => {
    if (data.OK) {
      alert("Producto agregado al carrito");
    }
  });
}

function mostrarCarrito() {
  fetch("/api/carrito.php?action=view")
    .then(res => res.json())
    .then(data => {
      const contenedor = document.getElementById("contenido");
      contenedor.innerHTML = "<h2>Carrito</h2>";

      if (data.OK && data.data.length > 0) {
        const lista = document.createElement("ul");
        lista.className = "list-group";

        data.data.forEach(id => {
          const item = document.createElement("li");
          item.className = "list-group-item";
          item.textContent = "Producto ID: " + id;
          lista.appendChild(item);
        });

        contenedor.appendChild(lista);
      } else {
        contenedor.innerHTML += "<p>El carrito está vacío.</p>";
      }
    });
}

// Mostrar catálogo al cargar la página
document.addEventListener("DOMContentLoaded", mostrarCatalogo);
