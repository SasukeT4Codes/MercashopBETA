const tiendaSelect = document.getElementById('tiendaSelect');
const tbody = document.querySelector('#tablaCompras tbody');

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

    tiendaSelect.innerHTML = '<option value="">Seleccione una tienda...</option>';

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

  if (!tiendaId) {
    tbody.innerHTML = '<tr><td colspan="7">Seleccione una tienda.</td></tr>';
    return;
  }

  try {
    const res = await fetch(`/api/admin_compras.php?action=list&tienda=${tiendaId}`);
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
    } else if (data.OK) {
      tbody.innerHTML = '<tr><td colspan="7">No hay compras registradas para esta tienda.</td></tr>';
    } else {
      alert('Error al cargar compras: ' + (data.error || ''));
    }
  } catch (e) {
    console.error(e);
    alert('Error de red al cargar compras');
  }
}

tiendaSelect.addEventListener('change', cargarCompras);

cargarTiendas();