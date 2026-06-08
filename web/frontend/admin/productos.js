async function cargarProductos() {
  const res = await fetch("/api/admin_productos.php?action=list");
  const data = await res.json();

  const tbody = document.querySelector("#tablaProductos tbody");
  tbody.innerHTML = "";

  if (data.OK) {
    data.data.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.nProductoID}</td>
        <td>${p.cDescripcionCorta}</td>
        <td>$${p.nPrecioUnitario}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${p.nProductoID})">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

document.getElementById("formProducto").addEventListener("submit", async e => {
  e.preventDefault();
  const formData = new FormData(e.target);

  const res = await fetch("/api/admin_productos.php?action=add", {
    method: "POST",
    body: formData
  });
  const data = await res.json();

  if (data.OK) {
    e.target.reset();
    cargarProductos();
  } else {
    alert("Error al agregar producto");
  }
});

async function eliminarProducto(id) {
  const res = await fetch("/api/admin_productos.php?action=delete", {
    method: "POST",
    body: new URLSearchParams({ id })
  });
  const data = await res.json();

  if (data.OK) {
    cargarProductos();
  } else {
    alert("Error al eliminar producto");
  }
}

cargarProductos();
