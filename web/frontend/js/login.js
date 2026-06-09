// js/login.js
const AUTH_API = "/api/cliente_login.php";
const DEP_API  = "/api/departamentos.php";
const MUN_API  = "/api/municipios.php";

document.addEventListener("DOMContentLoaded", () => {
  // Tabs
  document.querySelectorAll("#auth-tabs .nav-link").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#auth-tabs .nav-link").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      document.getElementById("form-login").classList.toggle("d-none", tab !== "login");
      document.getElementById("form-registro").classList.toggle("d-none", tab !== "registro");
    });
  });

  // Cargar departamentos
  async function cargarDepartamentos() {
    try {
      const resp = await fetch(DEP_API);
      const data = await resp.json();
      const depSel = document.getElementById("reg-departamento");
      depSel.innerHTML = data.map(d => `<option value="${d.nDepartamentoID}">${d.cNombre}</option>`).join("");
      if (data.length) cargarMunicipios(data[0].nDepartamentoID);
    } catch (err) {
      console.error("Error cargando departamentos", err);
    }
  }

  // Cargar municipios según departamento
  async function cargarMunicipios(depID) {
    try {
      const resp = await fetch(MUN_API + "?dep=" + depID);
      const data = await resp.json();
      const munSel = document.getElementById("reg-municipio");
      munSel.innerHTML = data.map(m => `<option value="${m.nMunicipioID}">${m.cNombre}</option>`).join("");
    } catch (err) {
      console.error("Error cargando municipios", err);
    }
  }

  cargarDepartamentos();
  document.getElementById("reg-departamento").addEventListener("change", e => {
    cargarMunicipios(e.target.value);
  });

  // Login
  document.getElementById("btn-login").addEventListener("click", async () => {
    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-pass").value;
    const errEl = document.getElementById("login-error");
    errEl.classList.add("d-none");

    if (!email || !pass) return mostrarError(errEl, "Completa todos los campos");

    try {
      const resp = await fetch(AUTH_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "login", email, password: pass })
      });
      const data = await resp.json();
      if (data.ok) {
        localStorage.setItem("ms_user", JSON.stringify(data.usuario));
        window.location.href = "index.html";
      } else mostrarError(errEl, data.mensaje);
    } catch {
      mostrarError(errEl, "Error de conexión con el servidor");
    }
  });

  // Registro
  document.getElementById("btn-registro").addEventListener("click", async () => {
    const nombre = document.getElementById("reg-nombre").value.trim();
    const apellido = document.getElementById("reg-apellido").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const pass = document.getElementById("reg-pass").value;
    const pass2 = document.getElementById("reg-pass2").value;
    const nomenclatura = document.getElementById("reg-nomenclatura").value.trim();
    const barrio = document.getElementById("reg-barrio").value.trim();
    const codpostal = document.getElementById("reg-codpostal").value.trim();
    const municipio = document.getElementById("reg-municipio").value;

    const errEl = document.getElementById("reg-error");
    const okEl = document.getElementById("reg-success");
    errEl.classList.add("d-none");
    okEl.classList.add("d-none");

    if (!nombre || !apellido || !email || !pass || !pass2 || !nomenclatura || !municipio)
      return mostrarError(errEl, "Completa todos los campos");
    if (pass.length < 8) return mostrarError(errEl, "La contraseña debe tener al menos 8 caracteres");
    if (pass !== pass2) return mostrarError(errEl, "Las contraseñas no coinciden");

    try {
      const resp = await fetch(AUTH_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "registro",
          nombre, apellido, email, password: pass,
          nomenclatura, barrio, codpostal, municipio
        })
      });
      const data = await resp.json();
      if (data.ok) {
        okEl.textContent = "¡Cuenta creada! Ahora puedes iniciar sesión.";
        okEl.classList.remove("d-none");
        setTimeout(() => document.querySelector('[data-tab="login"]').click(), 2000);
      } else mostrarError(errEl, data.mensaje);
    } catch {
      mostrarError(errEl, "Error de conexión con el servidor");
    }
  });
});

function mostrarError(el, msg) {
  el.textContent = msg;
  el.classList.remove("d-none");
}
