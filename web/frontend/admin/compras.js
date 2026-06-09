const API_TIENDAS = "/api/admin_tiendas.php";
const API_COMPRAS = "/api/admin_compras.php";

let tiendaVentaActual = "";
let tiendaVentaNombreActual = "";
let tiendasCache = [];

document.addEventListener("DOMContentLoaded", async () => {
  await cargarTiendas();
  conectarEventos();
});

function conectarEventos() {
  document.getElementById("tiendaVentaSelector").addEventListener("change", async e => {
    tiendaVentaActual = e.target.value;
    tiendaVentaNombreActual = obtenerNombreTienda(tiendaVentaActual);
    actualizarTiendaVentaActiva();
    activarVistaVentas();
    if (tiendaVentaActual) await cargarVentas();
  });

  document.getElementById("btnRecargarVentas").addEventListener("click", async () => {
    if (tiendaVentaActual) await cargarVentas();
  });
}

async function cargarTiendas() {
  try {
    const resp = await fetch(`${API_TIENDAS}?action=list`);
    const data = await resp.json();
    tiendasCache = data.data || [];

    const sel = document.getElementById("tiendaVentaSelector");
    sel.innerHTML = `<option value="" selected disabled>-- Selecciona una tienda --</option>`;

    tiendasCache.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.nTiendaID;
      opt.textContent = t.cNombreComercial;
      sel.appendChild(opt);
    });
  } catch {
    document.getElementById("tiendaVentaSelector").innerHTML = `<option value="" selected disabled>No se pudieron cargar las tiendas</option>`;
  }
}

function obtenerNombreTienda(id) {
  const t = tiendasCache.find(x => String(x.nTiendaID) === String(id));
  return t ? t.cNombreComercial : "";
}

function actualizarTiendaVentaActiva() {
  const box = document.getElementById("tiendaVentaActivaBox");
  const nombre = document.getElementById("tiendaVentaActivaNombre");
  const id = document.getElementById("tiendaVentaActivaId");

  if (tiendaVentaActual) {
    box.classList.remove("d-none");
    nombre.textContent = tiendaVentaNombreActual || "Tienda seleccionada";
    id.textContent = `ID: ${tiendaVentaActual}`;
  } else {
    box.classList.add("d-none");
    nombre.textContent = "-";
    id.textContent = "";
  }
}

function activarVistaVentas() {
  const bloque = document.getElementById("bloqueVentas");
  const msg = document.getElementById("mensajeSeleccionTiendaVentas");
  const btn = document.getElementById("btnRecargarVentas");

  if (tiendaVentaActual) {
    bloque.classList.remove("d-none");
    msg.classList.add("d-none");
    btn.disabled = false;
  } else {
    bloque.classList.add("d-none");
    msg.classList.remove("d-none");
    btn.disabled = true;
    document.querySelector("#tablaCompras tbody").innerHTML = `<tr><td colspan="6" class="text-center admin-muted py-4">Selecciona una tienda para ver sus ventas.</td></tr>`;
  }
}

async function cargarVentas() {
  const tbody = document.querySelector("#tablaCompras tbody");
  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">Cargando ventas...</td></tr>`;

  try {
    const resp = await fetch(`${API_COMPRAS}?action=list&tienda=${encodeURIComponent(tiendaVentaActual)}`);
    const data = await resp.json();
    const lista = data.data || [];

    document.getElementById("totalVentas").textContent = lista.length;
    document.getElementById("ventasPendientes").textContent = lista.filter(x => (x.cNombreEstado || x.estado || "") === "Pendiente").length;
    document.getElementById("ventasCompletadas").textContent = lista.filter(x => (x.cNombreEstado || x.estado || "") === "Completada").length;

    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center admin-muted py-4">No hay ventas registradas para esta tienda.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";
    lista.forEach(v => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${v.nPedidoID}</td>
        <td>${v.nClienteFK}</td>
        <td>${v.cCliente}</td>
        <td>${v.dFechaActualizacion || ""}</td>
        <td>${formatoCOP(v.nTotal || 0)}</td>
        <td><span class="admin-tag px-2 py-1 rounded-pill">${v.cNombreEstado || ""}</span></td>
      `;
      tbody.appendChild(tr);
    });
  } catch {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">No se pudieron cargar las ventas.</td></tr>`;
  }
}

function formatoCOP(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(valor);
}