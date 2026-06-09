let tiendaActual = '';

const selectTienda = document.getElementById('tiendaSelect');
const form = document.getElementById('formProducto');
const inputId = document.getElementById('productoId');
const inputNombre = document.getElementById('nombre');
const inputDescripcion = document.getElementById('descripcion');
const inputPrecio = document.getElementById('precio');
const inputStock = document.getElementById('stock');
const tbody = document.querySelector('#tablaProductos tbody');

function formatearCOP(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
}

async function cargarTiendas() {
  try {
    const res = await fetch('/api/admin_tiendas.php?action=list');
    const data = await res.json();
    selectTienda.innerHTML = '<option value="">Seleccione una tienda...</option>';

    if (data.OK) {
      data.data.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.nTiendaID;
        opt.textContent = `${t.nTiendaID} - ${t.cNombreComercial}`;
        selectTienda.appendChild(opt);
      });
    } else {
      alert('Error al cargar tiendas: ' + (data.error || ''));
    }
  } catch (e) {
    console.error(e);
    alert('Error de red al cargar tiendas');
  }
}

async function cargarProductos() {
  if (!tiendaActual) {
    tbody.innerHTML = '<tr><td colspan="5">Seleccione una tienda.</td></tr>';
    return;
  }

  try {
    const res = await fetch(`/api/admin_productos.php?action=list&tienda=${tiendaActual}`);
    const data = await res.json();
    tbody.innerHTML = '';

    if (data.OK && data.data.length > 0) {
      data.data.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${p.nProductoID}</td>
          <td>${p.cDescripcionCorta}</td>
          <td>${formatearCOP(p.nPrecioUnitario)}</td>
          <td>${p.nCantidadStock}</td>
          <td>
            <button class="btn btn-sm btn-warning me-1"
              onclick="editarProducto(${p.nProductoID},
                                      '${p.cDescripcionCorta.replace(/'/g, "\\'")}',
                                      \`${(p.cDescripcionLarga || '').replace(/`/g, '\\`')}\`,
                                      ${p.nPrecioUnitario},
                                      ${p.nCantidadStock})">
              Editar
            </button>
            <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${p.nProductoID})">
              Eliminar
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } else if (data.OK) {
      tbody.innerHTML = '<tr><td colspan="5">Sin productos para esta tienda.</td></tr>';
    } else {
      alert('Error al cargar productos: ' + (data.error || ''));
    }
  } catch (e) {
    console.error(e);
    alert('Error de red al cargar productos');
  }
}

selectTienda.addEventListener('change', () => {
  tiendaActual = selectTienda.value;
  inputId.value = '';
  form.reset();
  cargarProductos();
});

form.addEventListener('submit', async e => {
  e.preventDefault();

  if (!tiendaActual) {
    alert('Selecciona una tienda antes de agregar productos');
    return;
  }

  const id = inputId.value;
  const fd = new FormData();
  fd.append('tienda_id', tiendaActual);
  fd.append('nombre', inputNombre.value);
  fd.append('descripcion', inputDescripcion.value);
  fd.append('precio', inputPrecio.value);
  fd.append('stock', inputStock.value);

  let action = 'add';
  if (id) {
    action = 'update';
    fd.append('id', id);
  }

  try {
    const res = await fetch(`/api/admin_productos.php?action=${action}`, {
      method: 'POST',
      body: fd
    });
    const data = await res.json();

    if (data.OK) {
      alert(id ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
      form.reset();
      inputId.value = '';
      cargarProductos();
    } else {
      alert('No se pudo guardar el producto: ' + (data.error || ''));
    }
  } catch (e) {
    console.error(e);
    alert('Error de red al guardar producto');
  }
});

window.editarProducto = function(id, nombre, descripcion, precio, stock) {
  inputId.value = id;
  inputNombre.value = nombre;
  inputDescripcion.value = descripcion;
  inputPrecio.value = precio;
  inputStock.value = stock;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.eliminarProducto = async function(id) {
  if (!confirm('¿Eliminar este producto?')) return;

  try {
    const res = await fetch('/api/admin_productos.php?action=delete', {
      method: 'POST',
      body: new URLSearchParams({ id })
    });
    const data = await res.json();

    if (data.OK) {
      alert('Producto eliminado correctamente');
      cargarProductos();
    } else {
      alert('No se pudo eliminar el producto: ' + (data.error || ''));
    }
  } catch (e) {
    console.error(e);
    alert('Error de red al eliminar producto');
  }
};

cargarTiendas();
tbody.innerHTML = '<tr><td colspan="5">Seleccione una tienda.</td></tr>';