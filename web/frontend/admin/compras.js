const tiendaSelect = document.getElementById('tiendaSelect');
const ordenSelect = document.getElementById('ordenSelect');
const tbody = document.querySelector('#tablaCompras tbody');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const pageInfo = document.getElementById('page-info');

let paginaActual = 1;
const filasPorPagina = 20;
let orden = "fecha";

function formatearCOP(valor) {
  return 'COP ' + new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor || 0);
}

function formatearFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleString('es-CO');
}

async function cargarTiendas() {
  try {
    const res = await fetch('/api/admin_tiendas.php?action=list');
    const data = await res.json();

    tiendaSelect.innerHTML = '<option value="">Todas las tiendas</option>';

    if (data.OK) {
      data.data.forEach(tienda => {
        const option = document.createElement('option');
        option.value = tienda.nTiendaID;
        option.textContent = `${tienda.nTiendaID} - ${tienda.cNombreComercial}`;
        tiendaSelect.appendChild(option);
      });
    } else {
      alert('Error al cargar tiendas: ' + (data.error || ''));
    }
  } catch (e) {
    console.error(e);
    alert('Error de red al cargar tiendas');
  }
}

async function cargarCompras() {
  const tiendaId = tiendaSelect.value;
  let url = `/api/admin_compras.php?action=list&page=${paginaActual}&limit=${filasPorPagina}&orden=${orden}`;
  if (tiendaId) url += `&tienda=${tiendaId}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    tbody.innerHTML = '';

    if (data.OK && data.data.length > 0) {
      data.data.forEach(compra => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${compra.nPedidoID}</td>
          <td>${compra.nClienteFK}</td>
          <td>${compra.cCliente || 'Cliente sin nombre'}</td>
          <td>${formatearCOP(compra.nSubtotal)}</td>
          <td>${formatearCOP(compra.nTotal)}</td>
          <td>${compra.cNombreEstado || 'Sin estado'}</td>
          <td>${formatearFecha(compra.dFechaActualizacion)}</td>
        `;
        tbody.appendChild(tr);
      });

      // Mostrar página actual y total
      pageInfo.textContent = `Página ${data.page} de ${data.totalPages} (Total: ${data.totalRecords})`;
    } else {
      tbody.innerHTML = '<tr><td colspan="7">No hay compras registradas.</td></tr>';
      pageInfo.textContent = '';
    }
  } catch (e) {
    console.error(e);
    alert('Error de red al cargar compras');
  }
}

tiendaSelect.addEventListener('change', () => {
  paginaActual = 1;
  cargarCompras();
});

ordenSelect.addEventListener('change', e => {
  orden = e.target.value;
  paginaActual = 1;
  cargarCompras();
});

btnPrev.addEventListener('click', () => {
  if (paginaActual > 1) {
    paginaActual--;
    cargarCompras();
  }
});

btnNext.addEventListener('click', () => {
  paginaActual++;
  cargarCompras();
});

cargarTiendas();
cargarCompras();
