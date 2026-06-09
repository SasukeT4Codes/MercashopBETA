document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("ms_user") || "null");
  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  try {
    const resp = await fetch("/api/mis_pedidos.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clienteID: usuario.id })
    });
    const data = await resp.json();
    if (data.ok && data.pedidos.length > 0) {
      renderPedidos(data.pedidos);
    } else {
      document.getElementById("pedidos-vacio").classList.remove("d-none");
    }
  } catch {
    alert("Error de conexión con el servidor");
  }
});

function renderPedidos(pedidos) {
  const cont = document.getElementById("pedidos-lista");
  cont.innerHTML = "";
  pedidos.forEach(p => {
    const card = document.createElement("div");
    card.className = "col-12";
    card.innerHTML = `
      <div class="card border-0 shadow-sm p-4">
        <h5 class="mb-2">Pedido #${p.nPedidoID}</h5>
        <p class="text-muted small">Fecha: ${p.dFechaActualizacion}</p>
        <table class="table table-sm">
          <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead>
          <tbody>
            ${p.detalles.map(d => `
              <tr>
                <td>${d.cNombreProducto}</td>
                <td>${d.nCantidad}</td>
                <td>${formatoCOP(d.nPrecioCompra)}</td>
                <td>${formatoCOP(d.nSubtotal)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="d-flex justify-content-between mt-2">
          <strong>Total:</strong>
          <strong>${formatoCOP(p.nTotal)}</strong>
        </div>
      </div>
    `;
    cont.appendChild(card);
  });
}

function formatoCOP(valor) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(valor);
}
