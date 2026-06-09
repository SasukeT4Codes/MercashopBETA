// js/navbar.js
document.addEventListener("DOMContentLoaded", () => {
  // Cargar el navbar desde partials
  fetch("partials/navbar.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("navbar").innerHTML = html;
      actualizarContador();
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
