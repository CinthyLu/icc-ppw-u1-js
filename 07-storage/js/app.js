'use strict';

/**
 * app.js — Lógica principal
 * Práctica 7 - Web Storage
 * Cinthya Catalina Ramon Morocho
 */

// ─── Utilidad: Log de operaciones ─────────────────────────────────────────
function registrarLog(mensaje, tipo = 'info') {
  const logEl = document.getElementById('log');
  if (!logEl) return;
  const hora = new Date().toLocaleTimeString('es-EC');
  const entry = document.createElement('div');
  entry.className = `log-entry log-entry--${tipo}`;
  entry.innerHTML = `<span>${hora}</span><span>${mensaje}</span>`;
  logEl.prepend(entry);
  console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
}

// ─── SECCIÓN 1: CRUD de Tareas ─────────────────────────────────────────────
let filtroActual = 'todas';

function renderizarTareas() {
  const todas = TareaStorage.getAll();
  const lista = document.getElementById('lista-tareas');
  const emptyMsg = document.getElementById('empty-msg');

  // Filtrar
  const filtradas = todas.filter(t => {
    if (filtroActual === 'pendientes') return !t.completada;
    if (filtroActual === 'completadas') return t.completada;
    return true;
  });

  lista.innerHTML = '';

  if (filtradas.length === 0) {
    emptyMsg.style.display = 'block';
  } else {
    emptyMsg.style.display = 'none';
    filtradas.forEach(tarea => {
      lista.appendChild(crearElementoTarea(tarea));
    });
  }

  actualizarStats(todas);
}

function crearElementoTarea(tarea) {
  const li = document.createElement('li');
  li.className = `tarea-item${tarea.completada ? ' completada' : ''}`;
  li.dataset.id = tarea.id;

  const fecha = new Date(tarea.creadoEn).toLocaleDateString('es-EC', {
    day: '2-digit', month: 'short'
  });

  li.innerHTML = `
    <input type="checkbox" ${tarea.completada ? 'checked' : ''} title="Marcar como ${tarea.completada ? 'pendiente' : 'completada'}">
    <span class="tarea-texto">${escapeHtml(tarea.texto)}</span>
    <span class="tarea-fecha">${fecha}</span>
    <div class="tarea-acciones">
      <button class="btn-accion editar" title="Editar">✏️</button>
      <button class="btn-accion eliminar" title="Eliminar">🗑️</button>
    </div>
  `;

  // Toggle completada
  li.querySelector('input[type="checkbox"]').addEventListener('change', () => {
    TareaStorage.toggleCompletada(tarea.id);
    registrarLog(`Tarea "${tarea.texto.slice(0, 30)}" marcada como ${!tarea.completada ? 'completada' : 'pendiente'}`, 'success');
    renderizarTareas();
  });

  // Editar
  li.querySelector('.editar').addEventListener('click', () => activarEdicion(li, tarea));

  // Eliminar
  li.querySelector('.eliminar').addEventListener('click', () => {
    if (confirm(`¿Eliminar "${tarea.texto}"?`)) {
      TareaStorage.delete(tarea.id);
      registrarLog(`Tarea eliminada: "${tarea.texto.slice(0, 30)}"`, 'error');
      renderizarTareas();
      refrescarInspector();
    }
  });

  return li;
}

function activarEdicion(li, tarea) {
  const textoEl = li.querySelector('.tarea-texto');
  const accionesEl = li.querySelector('.tarea-acciones');
  const valorActual = tarea.texto;

  // Reemplazar texto por input
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'tarea-input-edit';
  input.value = valorActual;
  textoEl.replaceWith(input);
  input.focus();
  input.select();

  // Cambiar botones
  accionesEl.innerHTML = `
    <button class="btn-accion guardar" title="Guardar (Enter)">✔️</button>
    <button class="btn-accion cancelar" title="Cancelar (Esc)">✖️</button>
  `;

  const guardar = () => {
    const nuevoTexto = input.value.trim();
    if (!nuevoTexto) { alert('El texto no puede estar vacío.'); return; }
    TareaStorage.update(tarea.id, nuevoTexto);
    registrarLog(`Tarea editada: "${nuevoTexto.slice(0, 30)}"`, 'info');
    renderizarTareas();
    refrescarInspector();
  };

  const cancelar = () => renderizarTareas();

  accionesEl.querySelector('.guardar').addEventListener('click', guardar);
  accionesEl.querySelector('.cancelar').addEventListener('click', cancelar);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') guardar();
    if (e.key === 'Escape') cancelar();
  });
  input.addEventListener('blur', () => {
    // Pequeño delay para que no cancele antes de que el click de "guardar" se dispare
    setTimeout(() => {
      if (document.activeElement !== input) cancelar();
    }, 200);
  });
}

function actualizarStats(tareas) {
  const statsEl = document.getElementById('stats-tareas');
  const total = tareas.length;
  const completadas = tareas.filter(t => t.completada).length;
  const pendientes = total - completadas;

  statsEl.innerHTML = `
    <span class="stat-item">📋 Total: <strong>${total}</strong></span>
    <span class="stat-item">✅ Completadas: <strong>${completadas}</strong></span>
    <span class="stat-item">⏳ Pendientes: <strong>${pendientes}</strong></span>
  `;
}

// Agregar tarea
document.getElementById('btn-agregar').addEventListener('click', () => {
  const input = document.getElementById('input-tarea');
  const texto = input.value.trim();
  if (!texto) { input.focus(); return; }
  TareaStorage.create(texto);
  registrarLog(`Nueva tarea creada: "${texto.slice(0, 30)}"`, 'success');
  input.value = '';
  input.focus();
  renderizarTareas();
  refrescarInspector();
});

document.getElementById('input-tarea').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-agregar').click();
});

// Filtros
document.getElementById('filtros').addEventListener('click', e => {
  if (!e.target.matches('.filter-btn')) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  filtroActual = e.target.dataset.filtro;
  renderizarTareas();
});

// Limpiar todo
document.getElementById('btn-limpiar').addEventListener('click', () => {
  if (confirm('¿Eliminar TODAS las tareas? Esta acción no se puede deshacer.')) {
    TareaStorage.clear();
    registrarLog('Todas las tareas eliminadas', 'error');
    renderizarTareas();
    refrescarInspector();
  }
});

// Exportar JSON
document.getElementById('btn-exportar').addEventListener('click', () => {
  const tareas = TareaStorage.getAll();
  const blob = new Blob([JSON.stringify(tareas, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tareas_p7_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  registrarLog(`${tareas.length} tareas exportadas como JSON`, 'success');
});

// Importar JSON
document.getElementById('input-importar').addEventListener('change', e => {
  const archivo = e.target.files[0];
  if (!archivo) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const datos = JSON.parse(ev.target.result);
      if (!Array.isArray(datos)) throw new Error('El archivo no contiene un array de tareas.');
      TareaStorage.importar(datos);
      registrarLog(`${datos.length} tareas importadas desde ${archivo.name}`, 'success');
      renderizarTareas();
      refrescarInspector();
    } catch (err) {
      registrarLog(`Error al importar: ${err.message}`, 'error');
      alert(`Error al importar: ${err.message}`);
    }
  };
  reader.readAsText(archivo);
  e.target.value = ''; // Reset para permitir reimportar el mismo archivo
});

// ─── SECCIÓN 2: Temas ─────────────────────────────────────────────────────
const TEMAS_NOMBRES = {
  default: 'Clásico',
  dark: 'Cyberpunk',
  ocean: 'Océano',
  forest: 'Bosque',
  sunset: 'Atardecer'
};

function aplicarTema(nombre) {
  // Limpiar clases de tema
  document.body.classList.remove('dark', 'ocean', 'forest', 'sunset');
  if (nombre !== 'default') document.body.classList.add(nombre);

  // Marcar botón activo
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.tema === nombre);
  });

  document.getElementById('tema-nombre').textContent = TEMAS_NOMBRES[nombre] || nombre;
  TemaStorage.set(nombre);
  registrarLog(`Tema cambiado a "${TEMAS_NOMBRES[nombre]}" y guardado en localStorage`, 'info');
}

document.getElementById('theme-grid').addEventListener('click', e => {
  const btn = e.target.closest('.theme-btn');
  if (!btn) return;
  aplicarTema(btn.dataset.tema);
});

// ─── SECCIÓN 3: Formulario con sessionStorage ─────────────────────────────
const form = document.getElementById('form-contacto');

// Autoguardado en sessionStorage al escribir
form.addEventListener('input', () => {
  const datos = Object.fromEntries(new FormData(form));
  DraftStorage.set(datos);
});

// Restaurar borrador al cargar
function restaurarBorrador() {
  const draft = DraftStorage.get();
  if (!draft) return;
  Object.entries(draft).forEach(([name, value]) => {
    const campo = form.querySelector(`[name="${name}"]`);
    if (campo) campo.value = value;
  });
  document.getElementById('session-indicator').style.display = 'flex';
  registrarLog('Borrador restaurado desde sessionStorage', 'info');
}

document.getElementById('btn-descartar-draft').addEventListener('click', () => {
  DraftStorage.remove();
  form.reset();
  document.getElementById('session-indicator').style.display = 'none';
  registrarLog('Borrador de sessionStorage descartado', 'info');
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(form));

  // Validación básica
  if (!datos.nombre.trim() || !datos.email.trim()) {
    mostrarResultadoForm('Por favor completa todos los campos.', false);
    return;
  }

  // Simular envío
  DraftStorage.remove();
  document.getElementById('session-indicator').style.display = 'none';
  form.reset();
  mostrarResultadoForm(`¡Mensaje enviado por ${datos.nombre}! (Borrador eliminado de sessionStorage)`, true);
  registrarLog(`Formulario enviado por ${datos.nombre}`, 'success');
});

document.getElementById('btn-reset-form').addEventListener('click', () => {
  form.reset();
  DraftStorage.remove();
  document.getElementById('session-indicator').style.display = 'none';
  document.getElementById('form-resultado').classList.remove('show');
  registrarLog('Formulario y borrador limpiados', 'info');
});

function mostrarResultadoForm(mensaje, exito) {
  const el = document.getElementById('form-resultado');
  el.innerHTML = `<strong>${exito ? '✅ Éxito' : '⚠️ Error'}</strong>${mensaje}`;
  el.style.borderLeftColor = exito ? 'var(--success)' : 'var(--error)';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 5000);
}

// ─── SECCIÓN 4: Inspector de Storage ──────────────────────────────────────
function refrescarInspector() {
  const infoEl = document.getElementById('storage-info');
  const logEl = document.getElementById('log');

  const bytes = StorageHelper.usadoBytes();
  const kb = (bytes / 1024).toFixed(2);
  const items = localStorage.length;

  infoEl.innerHTML = `
    <span class="stat-item">🗂️ Entradas: <strong>${items}</strong></span>
    <span class="stat-item">💾 Espacio usado: <strong>${kb} KB</strong></span>
    <span class="stat-item">📦 Límite aprox.: <strong>5 MB</strong></span>
    <span class="stat-item">📊 Uso: <strong>${((bytes / (5 * 1024 * 1024)) * 100).toFixed(3)}%</strong></span>
  `;

  // Mostrar entradas relevantes de esta app
  const clavesApp = ['p7_tareas', 'p7_tema'];
  clavesApp.forEach(clave => {
    const valor = localStorage.getItem(clave);
    if (valor !== null) {
      const entry = document.createElement('div');
      entry.className = 'log-entry log-entry--info';
      const preview = valor.length > 80 ? valor.slice(0, 80) + '…' : valor;
      entry.innerHTML = `<span>${clave}</span><span>${preview}</span>`;
      // No duplicar en cada refresh — solo mostrar en el primer refresh o en registro
    }
  });
}

document.getElementById('btn-refrescar-inspector').addEventListener('click', () => {
  refrescarInspector();
  registrarLog('Inspector actualizado', 'info');
});

// ─── Modo oscuro (botón del header) ───────────────────────────────────────
document.getElementById('toggleDark').addEventListener('click', () => {
  const esDark = document.body.classList.contains('dark');
  aplicarTema(esDark ? 'default' : 'dark');
});

// ─── Utilidad ─────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Inicialización ───────────────────────────────────────────────────────
(function init() {
  if (!StorageHelper.disponible()) {
    registrarLog('⚠️ localStorage no disponible (modo privado?)', 'error');
  }

  // Aplicar tema guardado
  const temaGuardado = TemaStorage.get();
  aplicarTema(temaGuardado);

  // Renderizar tareas
  renderizarTareas();

  // Restaurar borrador de formulario
  restaurarBorrador();

  // Inspector inicial
  refrescarInspector();

  registrarLog('App iniciada — datos cargados desde localStorage', 'info');
})();