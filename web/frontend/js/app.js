const API_URL = "http://localhost:4000"; // tu backend local
let carrito = [];

async function mostrarCatalogo() {
  const res = await fetch(`${API_URL}/productos`);
  const data = await res.json();
  const cont = document.getElementById("contenido");
  cont.innerHTML = "";
  data.data.forEach(p => {
    const div = document.createElement("div");
    div.className = "col-md-4 producto-card";
    div.innerHTML = `
      <div class="card h-100">
        <img src="${p.cUrlImagenPrincipal || 'assets/logo.png'}" class="card-img-top" alt="${p.cDescripcionCorta}">
        <div class="card-body">
          <h5 class="card-title">${p.cDescripcionCorta}</h5>
          <p class="card-text">${p.cDescripcionLarga || ""}</p>
          <p><strong>Precio:</strong> $${p.nPrecioUnitario}</p>
          <button class="btn btn-primary" onclick="agregarCarrito(${p.nProductoID}, '${p.cDescripcionCorta}', ${p.nPrecioUnitario})">Agregar al carrito</button>
        </div>
      </div>
    `;
    cont.appendChild(div);
  });
}

function agregarCarrito(id, nombre, precio) {
  carrito.push({ id, nombre, precio });
  alert(`${nombre} agregado al carrito`);
}

function mostrarCarrito() {
  const cont = document.getElementById("contenido");
  cont.innerHTML = "<h2>Carrito</h2>";
  let total = 0;
  carrito.forEach(item => {
    cont.innerHTML += `<p>${item.nombre} - $${item.precio}</p>`;
    total += item.precio;
  });
  cont.innerHTML += `<h3>Total: $${total}</h3>`;
}
