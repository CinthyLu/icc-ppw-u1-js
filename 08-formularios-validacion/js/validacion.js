'use strict';

// ==========================================
// VALIDACION.JS — Constraint Validation API
// Práctica 8: Formularios y Validación
// ==========================================

/**
 * Expresiones regulares para validaciones personalizadas
 */
const REGEX = {
  nombre:   /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]{3,50}$/,
  email:    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  telefono: /^\d{10}$/,  // 10 dígitos sin formato
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
};

// ==========================================
// FUNCIONES DE FEEDBACK VISUAL
// ==========================================

/**
 * Muestra un mensaje de error debajo del campo y aplica clase CSS de error.
 * @param {HTMLElement} campo - El elemento input/select
 * @param {string} mensaje   - Texto del error
 */
function mostrarError(campo, mensaje) {
  campo.classList.add('campo--error');
  campo.classList.remove('campo--valido');

  const errorDiv = document.getElementById(`error-${campo.name}`);
  if (errorDiv) errorDiv.textContent = mensaje;
}

/**
 * Limpia el mensaje de error y aplica clase CSS de campo válido.
 * @param {HTMLElement} campo - El elemento input/select
 */
function limpiarError(campo) {
  campo.classList.remove('campo--error');
  campo.classList.add('campo--valido');

  const errorDiv = document.getElementById(`error-${campo.name}`);
  if (errorDiv) errorDiv.textContent = '';
}

/**
 * Limpia visualmente el campo (sin marcarlo como válido ni como error).
 * Útil al resetear el formulario.
 * @param {HTMLElement} campo
 */
function limpiarEstado(campo) {
  campo.classList.remove('campo--error', 'campo--valido');
  const errorDiv = document.getElementById(`error-${campo.name}`);
  if (errorDiv) errorDiv.textContent = '';
}

// ==========================================
// VALIDACIÓN POR CAMPO
// ==========================================

/**
 * Valida un campo individual según su atributo `name`.
 * Aplica feedback visual automáticamente.
 * @param {HTMLElement} campo
 * @returns {boolean} true si el campo es válido
 */
function validarCampo(campo) {
  const valor = campo.type === 'checkbox' ? campo.checked : campo.value.trim();
  const nombre = campo.name;
  let error = '';

  // ----- Campos requeridos vacíos -----
  if (campo.hasAttribute('required')) {
    if (campo.type === 'checkbox' && !valor) {
      error = 'Debes aceptar los términos y condiciones.';
    } else if (campo.type !== 'checkbox' && !valor) {
      error = 'Este campo es obligatorio.';
    }
  }

  // ----- Validaciones específicas -----
  if (!error && valor) {
    switch (nombre) {

      case 'nombre':
        if (valor.length < 3)
          error = 'El nombre debe tener al menos 3 caracteres.';
        else if (valor.length > 50)
          error = 'El nombre no puede superar los 50 caracteres.';
        else if (!REGEX.nombre.test(valor))
          error = 'Solo se permiten letras, espacios y guiones.';
        break;

      case 'email':
        if (!REGEX.email.test(valor))
          error = 'Ingresa un correo electrónico válido (ej: user@mail.com).';
        break;

      case 'telefono': {
        // Eliminar máscara antes de validar
        const soloDigitos = valor.replace(/\D/g, '');
        if (!REGEX.telefono.test(soloDigitos))
          error = 'El teléfono debe tener exactamente 10 dígitos.';
        break;
      }

      case 'fecha_nacimiento': {
        const hoy       = new Date();
        const nacimiento = new Date(valor);
        // Verificar que la fecha sea válida
        if (isNaN(nacimiento.getTime())) {
          error = 'Ingresa una fecha válida.';
        } else {
          let edad = hoy.getFullYear() - nacimiento.getFullYear();
          const m = hoy.getMonth() - nacimiento.getMonth();
          if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
          if (edad < 18)
            error = 'Debes ser mayor de 18 años para registrarte.';
          else if (edad > 120)
            error = 'Ingresa una fecha de nacimiento válida.';
        }
        break;
      }

      case 'genero':
        if (!valor || valor === '')
          error = 'Selecciona una opción de género.';
        break;

      case 'password':
        if (valor.length < 8)
          error = 'La contraseña debe tener al menos 8 caracteres.';
        else if (!/[A-Z]/.test(valor))
          error = 'Debe contener al menos una letra mayúscula.';
        else if (!/[a-z]/.test(valor))
          error = 'Debe contener al menos una letra minúscula.';
        else if (!/[0-9]/.test(valor))
          error = 'Debe contener al menos un número.';
        break;

      case 'confirmar_password': {
        const passOriginal = document.getElementById('password');
        if (passOriginal && valor !== passOriginal.value)
          error = 'Las contraseñas no coinciden.';
        break;
      }

      default:
        break;
    }
  }

  // ----- Aplicar resultado -----
  if (error) {
    mostrarError(campo, error);
    return false;
  } else {
    limpiarError(campo);
    return true;
  }
}

/**
 * Valida todos los campos del formulario y retorna si es completamente válido.
 * @param {HTMLFormElement} form
 * @returns {boolean}
 */
function validarFormulario(form) {
  const campos = form.querySelectorAll('input, select, textarea');
  let valido = true;
  campos.forEach(campo => {
    if (!validarCampo(campo)) valido = false;
  });
  return valido;
}

// ==========================================
// INDICADOR DE FUERZA DE CONTRASEÑA
// ==========================================

/**
 * Calcula y muestra el nivel de fuerza de la contraseña.
 * Niveles: débil (1), regular (2), buena (3), fuerte (4)
 * @param {string} valor - Valor actual del campo password
 */
function actualizarFuerzaPassword(valor) {
  const fill  = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');
  if (!fill || !label) return;

  // Resetear clases
  fill.className  = 'strength-fill';
  label.className = 'strength-label';

  if (!valor) {
    label.textContent = 'Escribe una contraseña';
    return;
  }

  let puntos = 0;
  if (valor.length >= 8)          puntos++;
  if (/[A-Z]/.test(valor))        puntos++;
  if (/[a-z]/.test(valor))        puntos++;
  if (/[0-9]/.test(valor))        puntos++;
  if (/[^A-Za-z0-9]/.test(valor)) puntos++; // símbolo especial extra

  let nivel, texto;
  if      (puntos <= 1) { nivel = 'debil';   texto = 'Débil'; }
  else if (puntos === 2) { nivel = 'regular'; texto = 'Regular'; }
  else if (puntos === 3) { nivel = 'buena';   texto = 'Buena'; }
  else                   { nivel = 'fuerte';  texto = 'Fuerte 🔒'; }

  fill.classList.add(nivel);
  label.classList.add(nivel);
  label.textContent = texto;
}

// ==========================================
// MÁSCARA DE TELÉFONO
// ==========================================

/**
 * Formatea un input de teléfono al patrón (0XX) XXX-XXXX mientras el usuario escribe.
 * @param {Event} e - Evento input
 */
function aplicarMascaraTelefono(e) {
  let valor = e.target.value.replace(/\D/g, '');  // solo dígitos
  if (valor.length > 10) valor = valor.slice(0, 10);

  if (valor.length > 6) {
    valor = `(${valor.slice(0, 3)}) ${valor.slice(3, 6)}-${valor.slice(6)}`;
  } else if (valor.length > 3) {
    valor = `(${valor.slice(0, 3)}) ${valor.slice(3)}`;
  } else if (valor.length > 0) {
    valor = `(${valor}`;
  }

  e.target.value = valor;
}

// ==========================================
// EXPORTAR (uso en app.js)
// ==========================================

// Se expone al scope global para que app.js pueda usarlas
window.Validacion = {
  validarCampo,
  validarFormulario,
  limpiarEstado,
  actualizarFuerzaPassword,
  aplicarMascaraTelefono
};