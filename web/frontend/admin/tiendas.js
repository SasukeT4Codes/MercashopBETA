async function cargarTiendas() {
  try {
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
    } else {
      alert("Error al cargar tiendas: " + (data.error || ""));
    }
  } catch (e) {
    console.error(e);
    alert("Error de red al cargar tiendas");
  }
}

document.getElementById("formTienda").addEventListener("submit", async e => {
  e.preventDefault();
  const formData = new FormData(e.target);

  try {
    const res = await fetch("/api/admin_tiendas.php?action=add", {
      method: "POST",
      body: formData
    });
    const data = await res.json();

    if (data.OK) {
      alert("Tienda creada correctamente");
      e.target.reset();
      cargarTiendas();
    } else {
      alert("No se pudo crear la tienda: " + (data.error || ""));
    }
  } catch (e) {
    console.error(e);
    alert("Error de red al crear la tienda");
  }
});

async function eliminarTienda(id) {
  if (!confirm("¿Eliminar esta tienda?")) return;

  try {
    const res = await fetch("/api/admin_tiendas.php?action=delete", {
      method: "POST",
      body: new URLSearchParams({ id })
    });
    const data = await res.json();

    if (data.OK) {
      alert("Tienda eliminada correctamente");
      cargarTiendas();
    } else {
      alert("No se pudo eliminar la tienda: " + (data.error || ""));
    }
  } catch (e) {
    console.error(e);
    alert("Error de red al eliminar tienda");
  }
}

cargarTiendas();