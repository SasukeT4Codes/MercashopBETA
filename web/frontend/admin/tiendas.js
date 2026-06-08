async function cargarTiendas() {
  const res = await fetch("/api/admin_tiendas.php?action=list");
  const data = await res.json();

  const tbody = document.querySelector("#tablaTiendas tbody");
  tbody.innerHTML = "";

  if (data.OK) {
    data.data.forEach(t => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.nTiendaID}</td>
        <td>${t.cNombreComercial}</td>
        <td>${t.cCorreoAtencion}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="eliminarTienda(${t.nTiendaID})">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

document.getElementById("formTienda").addEventListener("submit", async e => {
  e.preventDefault();
  const formData = new FormData(e.target);

  const res = await fetch("/api/admin_tiendas.php?action=add", {
    method: "POST",
    body: formData
  });
  const data = await res.json();

  if (data.OK) {
    e.target.reset();
    cargarTiendas();
  } else {
    alert("Error al agregar tienda");
  }
});

async function eliminarTienda(id) {
  const res = await fetch("/api/admin_tiendas.php?action=delete", {
    method: "POST",
    body: new URLSearchParams({ id })
  });
  const data = await res.json();

  if (data.OK) {
    cargarTiendas();
  } else {
    alert("Error al eliminar tienda");
  }
}

cargarTiendas();
