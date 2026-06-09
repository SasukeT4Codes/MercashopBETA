// js/navbar.js
document.addEventListener("DOMContentLoaded", () => {
  // Cargar el navbar desde partials
  fetch("partials/navbar.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("navbar").innerHTML = html;
      actualizarContador();
      mostrarUsuario();
    });
});

function actualizarContador() {
  const carrito = JSON.parse(localStorage.getItem("ms_carrito") || "[]");
  const total = carrito.reduce((s, i) => s + i.cantidad, 0);
  const el = document.getElementById("cart-count");
  if (el) {
    el.textContent = total;
    el.style.display = total === 0 ? "none" : "inline";
  }
}

function mostrarUsuario() {
  const user = localStorage.getItem("ms_user");
  const el = document.getElementById("nav-user");
  if (user && el) {
    const u = JSON.parse(user);
    el.textContent = u.nombre + " " + u.apellido;
    const link = el.closest("a");
    if (link) link.href = "mis_pedidos.html"; // redirigir al historial

    // Agregar botón logout como ícono separado
    const navContainer = link.parentElement; // el div con gap-3
    const logoutBtn = document.createElement("a");
    logoutBtn.href = "#";
    logoutBtn.className = "nav-link text-white ms-2"; // espacio extra
    logoutBtn.innerHTML = '<i class="bi bi-box-arrow-right"></i>'; // solo ícono
    logoutBtn.title = "Cerrar sesión"; // tooltip al pasar el mouse
    logoutBtn.addEventListener("click", e => {
      e.preventDefault();
      localStorage.removeItem("ms_user");
      window.location.href = "login.html";
    });
    navContainer.appendChild(logoutBtn);
  }
}
