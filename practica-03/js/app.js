'use strict';

    
// SELECCIONADORES
    

const form = document.getElementById('formulario');
const nombre = document.getElementById('nombre');
const email = document.getElementById('email');
const asunto = document.getElementById('asunto');
const mensaje = document.getElementById('mensaje');
const contador = document.getElementById('contador');
const resultado = document.getElementById('resultado');
const btnEnviar = document.getElementById('btn-enviar');


// VALIDACIONES CON REGEX
    

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarEmail(valor) {
  return regexEmail.test(valor);
}

function validarNombre(valor) {
  return valor.trim().length >= 3;
}

function validarAsunto(valor) {
  return valor.trim() !== '';
}

function validarMensaje(valor) {
  return valor.trim().length > 0;
}

  
// FUNCIONES DE ERROR
   

function mostrarError(inputId, mensajeError) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(`error-${inputId}`);
  
  input.style.border = '2px solid #e74c3c';
  if (errorEl) {
    errorEl.textContent = mensajeError;
    errorEl.classList.add('visible');
  }
}

function limpiarError(inputId) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(`error-${inputId}`);
  
  input.style.border = '';
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }
}

   
// CONTADOR DE CARACTERES
    

mensaje.addEventListener('input', (e) => {
  contador.textContent = e.target.value.length;
  limpiarError('mensaje');
});

    
// VALIDACIONES EN TIEMPO REAL (BLUR)
    

nombre.addEventListener('blur', () => {
  if (!validarNombre(nombre.value)) {
    mostrarError('nombre', 'El nombre debe tener mínimo 3 caracteres');
  }
});

nombre.addEventListener('input', () => {
  limpiarError('nombre');
});

email.addEventListener('blur', () => {
  if (email.value.trim() && !validarEmail(email.value)) {
    mostrarError('email', 'Ingrese un email válido (ej: user@example.com)');
  }
});

email.addEventListener('input', () => {
  limpiarError('email');
});

asunto.addEventListener('blur', () => {
  if (!validarAsunto(asunto.value)) {
    mostrarError('asunto', 'Debe seleccionar un asunto');
  }
});

asunto.addEventListener('input', () => {
  limpiarError('asunto');
});

mensaje.addEventListener('blur', () => {
  if (!validarMensaje(mensaje.value)) {
    mostrarError('mensaje', 'El mensaje es obligatorio');
  }
});

  
// ENVÍO DEL FORMULARIO
  

form.addEventListener('submit', (e) => {
  e.preventDefault();

  let valido = true;

  // Validar nombre
  if (!validarNombre(nombre.value)) {
    mostrarError('nombre', 'El nombre debe tener mínimo 3 caracteres');
    valido = false;
  } else {
    limpiarError('nombre');
  }

  // Validar email
  if (!validarEmail(email.value)) {
    mostrarError('email', 'Ingrese un email válido (ej: user@example.com)');
    valido = false;
  } else {
    limpiarError('email');
  }

  // Validar asunto
  if (!validarAsunto(asunto.value)) {
    mostrarError('asunto', 'Debe seleccionar un asunto');
    valido = false;
  } else {
    limpiarError('asunto');
  }

  // Validar mensaje
  if (!validarMensaje(mensaje.value)) {
    mostrarError('mensaje', 'El mensaje es obligatorio');
    valido = false;
  } else {
    limpiarError('mensaje');
  }

  // Si todo es válido, mostrar resultado
  if (valido) {
    resultado.innerHTML = `
      <strong> Mensaje enviado correctamente</strong><br><br>
      <p><strong>Nombre:</strong> ${nombre.value}</p>
      <p><strong>Email:</strong> ${email.value}</p>
      <p><strong>Asunto:</strong> ${asunto.value}</p>
      <p><strong>Mensaje:</strong> ${mensaje.value}</p>
    `;
    resultado.classList.add('show');

    // Resetear formulario después de 2 segundos
    setTimeout(() => {
      form.reset();
      contador.textContent = '0';
      resultado.classList.remove('show');
    }, 2000);
  } else {
    resultado.classList.remove('show');
  }
});

    
// MODO OSCURO
  

const btnModo = document.getElementById('modo');

if (btnModo) {
  // Cargar preferencia del localStorage
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }

  btnModo.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
  });
}

    
// ATAJO DE TECLADO: CTRL + ENTER
    

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    form.dispatchEvent(new Event('submit'));
  }
});

    
// CONTADOR DE CLICS
    

let contadorClics = 0;
const zona = document.getElementById('zona');
const clicksDisplay = document.getElementById('clicks');

if (zona && clicksDisplay) {
  zona.addEventListener('click', () => {
    contadorClics++;
    clicksDisplay.textContent = contadorClics;
  });

  // También permitir Enter en la zona para accesibilidad
  zona.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      contadorClics++;
      clicksDisplay.textContent = contadorClics;
    }
  });
}

    
// LISTA DE TAREAS CON EVENT DELEGATION
    

const lista = document.getElementById('tareas');
const btnAgregar = document.getElementById('agregar');
const inputNueva = document.getElementById('nueva');
const pendientesCount = document.getElementById('pendientes-count');

let tareas = [];

// Función para renderizar
function renderTareas() {
  lista.innerHTML = tareas.map(t => `
    <li data-id="${t.id}" style="${t.done ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
      <span>${t.texto}</span>
      <button data-action="toggle" aria-label="Marcar como ${t.done ? 'pendiente' : 'completada'}">
        ${t.done ? '✔' : '✔'}
      </button>
      <button data-action="delete" aria-label="Eliminar tarea">✘</button>
    </li>
  `).join('');

  // Actualizar contador de pendientes
  const pendientes = tareas.filter(t => !t.done).length;
  if (pendientes > 0) {
    pendientesCount.textContent = `➤ ${pendientes} tarea(s) pendiente(s)`;
  } else {
    pendientesCount.textContent = tareas.length > 0 ? ' ¡Todas las tareas completadas!' : '';
  }
}

// Función para agregar tarea
function agregarTarea() {
  const texto = inputNueva.value.trim();

  if (texto.length === 0) {
    inputNueva.focus();
    return;
  }

  tareas.push({
    id: Date.now(),
    texto,
    done: false
  });

  inputNueva.value = '';
  inputNueva.focus();
  renderTareas();
}

// Click en botón agregar
if (btnAgregar) {
  btnAgregar.addEventListener('click', agregarTarea);
}

// Enter en input de nueva tarea
if (inputNueva) {
  inputNueva.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregarTarea();
    }
  });
}

// EVENT DELEGATION en la lista
if (lista) {
  lista.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;

    const id = Number(li.dataset.id);
    const action = e.target.dataset.action;

    if (action === 'delete') {
      tareas = tareas.filter(t => t.id !== id);
      renderTareas();
    }

    if (action === 'toggle') {
      const tarea = tareas.find(t => t.id === id);
      if (tarea) {
        tarea.done = !tarea.done;
        renderTareas();
      }
    }
  });
}

// Renderizar inicial
renderTareas();