const API_TIENDAS = "/api/admin_tiendas.php";
const API_PRODUCTOS = "/api/admin_productos.php";

let tiendaActual = "";
let tiendaNombreActual = "";
let editandoId = null;
let tiendasCache = [];
let productoSeleccionado = null;

document.addEventListener("DOMContentLoaded", async () => {
  await cargarTiendas();
  conectarEventos();
});

function conectarEventos() {
  document.getElementById("tiendaSelector").addEventListener("change", async e => {
    tiendaActual = e.target.value;
    tiendaNombreActual = obtenerNombreTienda(tiendaActual);
    document.getElementById("tienda_id").value = tiendaActual;
    actualizarTiendaActiva();
    activarVistaProductos();
    if (tiendaActual) await cargarProductos();
  });

  document.getElementById("btnRecargarProductos").addEventListener("click", async () => {
    if (tiendaActual) await cargarProductos();
  });

  document.getElementById("formProducto").addEventListener("submit", guardarProducto);
  document.getElementById("btnCancelarEdicion").addEventListener("click", cancelarEdicion);

  document.getElementById("imagen").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) {
      document.getElementById("previewImagen").classList.add("d-none");
      document.getElementById("previewPlaceholder").classList.remove("d-none");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = document.getElementById("previewImagen");
    img.src = url;
    img.classList.remove("d-none");
    document.getElementById("previewPlaceholder").classList.add("d-none");
  });
}

async function cargarTiendas() {
  try {
    const resp = await fetch(`${API_TIENDAS}?action=list`);
    const data = await resp.json();
    tiendasCache = data.data || [];

    const sel = document.getElementById("tiendaSelector");
    sel.innerHTML = `<option value="" selected disabled>-- Selecciona una tienda --</option>`;

    tiendasCache.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.nTiendaID;
      opt.textContent = t.cNombreComercial;
      sel.appendChild(opt);
    });
  } catch {
    document.getElementById("tiendaSelector").innerHTML = `<option value="" selected disabled>No se pudieron cargar las tiendas</option>`;
  }
}

function obtenerNombreTienda(id) {
  const t = tiendasCache.find(x => String(x.nTiendaID) === String(id));
  return t ? t.cNombreComercial : "";
}

function actualizarTiendaActiva() {
  const box = document.getElementById("tiendaActivaBox");
  const nombre = document.getElementById("tiendaActivaNombre");
  const id = document.getElementById("tiendaActivaId");

  if (tiendaActual) {
    box.classList.remove("d-none");
    nombre.textContent = tiendaNombreActual || "Tienda seleccionada";
    id.textContent = `ID: ${tiendaActual}`;
  } else {
    box.classList.add("d-none");
    nombre.textContent = "-";
    id.textContent = "";
  }
}

function activarVistaProductos() {
  const bloque = document.getElementById("bloqueProductos");
  const msg = document.getElementById("mensajeSeleccionTienda");
  const btn = document.getElementById("btnRecargarProductos");

  if (tiendaActual) {
    bloque.classList.remove("d-none");
    msg.classList.add("d-none");
    btn.disabled = false;
  } else {
    bloque.classList.add("d-none");
    msg.classList.remove("d-none");
    btn.disabled = true;
  }
}

async function cargarProductos() {
  const tbody = document.querySelector("#tablaProductos tbody");
  tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4">Cargando productos...</td></tr>`;

  try {
    const resp = await fetch(`${API_PRODUCTOS}?action=list&tienda=${encodeURIComponent(tiendaActual)}`);
    const data = await resp.json();
    const lista = data.data || [];

    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center admin-muted py-4">Esta tienda no tiene productos todavía.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";
    lista.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.nProductoID}</td>
        <td>${p.cDescripcionCorta || ""}</td>
        <td>${formatoCOP(p.nPrecioUnitario || 0)}</td>
        <td>${p.nCantidadStock || 0}</td>
        <td>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-dark admin-btn-soft" data-action="editar" data-id="${p.nProductoID}">Editar</button>
            <button class="btn btn-sm btn-danger" data-action="eliminar" data-id="${p.nProductoID}">Eliminar</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("button[data-action='editar']").forEach(btn => {
      btn.addEventListener("click", () => iniciarEdicion(btn.dataset.id));
    });

    tbody.querySelectorAll("button[data-action='eliminar']").forEach(btn => {
      btn.addEventListener("click", () => eliminarProducto(btn.dataset.id));
    });
  } catch {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">No se pudieron cargar los productos.</td></tr>`;
  }
}

async function guardarProducto(e) {
  e.preventDefault();
  if (!tiendaActual) return;

  const form = e.target;
  const fd = new FormData(form);
  fd.set("tienda_id", tiendaActual);

  let action = "add";
  if (editandoId) {
    action = "update";
    fd.set("id", editandoId);
  }

  try {
    const resp = await fetch(`${API_PRODUCTOS}?action=${action}`, { method: "POST", body: fd });
    const data = await resp.json();
    if (data.OK === false) {
      alert(data.error || "No se pudo guardar el producto");
      return;
    }
    form.reset();
    cancelarEdicion();
    document.getElementById("tienda_id").value = tiendaActual;
    document.getElementById("previewImagen").classList.add("d-none");
    document.getElementById("previewPlaceholder").classList.remove("d-none");
    await cargarProductos();
  } catch {
    alert("No se pudo guardar el producto");
  }
}

function iniciarEdicion(id) {
  editandoId = id;
  document.getElementById("producto-id").value = id;
  document.getElementById("btnCancelarEdicion").style.display = "inline-block";
}

function cancelarEdicion() {
  editandoId = null;
  document.getElementById("producto-id").value = "";
  document.getElementById("formProducto").reset();
  document.getElementById("btnCancelarEdicion").style.display = "none";
  document.getElementById("tienda_id").value = tiendaActual;
}

async function eliminarProducto(id) {
  if (!confirm("¿Eliminar este producto?")) return;

  const fd = new FormData();
  fd.set("id", id);

  try {
    const resp = await fetch(`${API_PRODUCTOS}?action=delete`, { method: "POST", body: fd });
    const data = await resp.json();
    if (data.OK === false) {
      alert(data.error || "No se pudo eliminar el producto");
      return;
    }
    await cargarProductos();
  } catch {
    alert("No se pudo eliminar el producto");
  }
}

function formatoCOP(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(valor);
}