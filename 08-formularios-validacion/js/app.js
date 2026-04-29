import { REGEX, validaciones } from './validacion.js';
import { SuccessCard } from './components.js';

const form = document.getElementById('registro-form');
const btnSubmit = document.getElementById('btn-submit');
const btnLimpiar = document.getElementById('btn-limpiar');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');
const resultadoContainer = document.getElementById('resultado-container');

// Utilidad para manejar mensajes de error en el DOM
function mostrarError(input, mensaje) {
    const grupo = input.closest('.input-group');
    let errorEl = grupo.querySelector('.error-msg');
    
    if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'error-msg';
        grupo.appendChild(errorEl);
    }
    
    errorEl.textContent = mensaje;
    input.classList.add('invalid');
    input.classList.remove('valid');
    verificarFormulario();
}

function limpiarError(input) {
    const grupo = input.closest('.input-group');
    const errorEl = grupo.querySelector('.error-msg');
    if (errorEl) errorEl.remove();
    
    input.classList.remove('invalid');
    if (input.value.trim() !== '') {
        input.classList.add('valid');
    }
    verificarFormulario();
}

// Validación individual
function validarCampo(input) {
    // 1. Validación nativa (Constraint Validation API)
    if (input.validity.valueMissing) {
        mostrarError(input, 'Este campo es obligatorio');
        return false;
    }

    // 2. Validaciones Custom
    if (input.id === 'nombre' && !validaciones.validarRegex(input.value, REGEX.soloLetras)) {
        mostrarError(input, 'Solo se permiten letras y espacios (min 3 caracteres)');
        return false;
    }

    if (input.id === 'email' && !validaciones.validarRegex(input.value, REGEX.email)) {
        mostrarError(input, 'Ingresa un correo electrónico válido');
        return false;
    }

    if (input.id === 'telefono') {
        const telLimpio = input.value.replace(/\D/g, ''); // limpia mascara para validar
        if (telLimpio.length !== 10) {
            mostrarError(input, 'El teléfono debe tener exactamente 10 dígitos');
            return false;
        }
    }

    if (input.id === 'fechaNac' && !validaciones.esMayorDeEdad(input.value)) {
        mostrarError(input, 'Debes ser mayor de 18 años para registrarte');
        return false;
    }

    if (input.id === 'password' && !validaciones.validarRegex(input.value, REGEX.password)) {
        mostrarError(input, 'Mín. 8 caracteres, 1 mayúscula, 1 minúscula y 1 número');
        return false;
    }

    if (input.id === 'confirmPassword' && !validaciones.passwordsCoinciden(passwordInput.value, input.value)) {
        mostrarError(input, 'Las contraseñas no coinciden');
        return false;
    }

    if (input.id === 'terminos' && !input.checked) {
        mostrarError(input, 'Debes aceptar los términos');
        return false;
    }

    // Si pasa todas las validaciones
    limpiarError(input);
    return true;
}

// Comprueba si TODO el formulario es válido para habilitar el botón
function verificarFormulario() {
    const inputs = Array.from(form.querySelectorAll('input, select'));
    const todosValidos = inputs.every(input => {
        if (input.type === 'checkbox') return input.checked;
        return input.classList.contains('valid');
    });
    
    btnSubmit.disabled = !todosValidos;
}

// Evento Focusout: Valida al salir del campo
form.addEventListener('focusout', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        validarCampo(e.target);
    }
});

// Evento Input: Limpia errores mientras escribe, aplica máscaras, y mide fuerza de pass
form.addEventListener('input', (e) => {
    const input = e.target;
    
    // Limpieza rápida de estado inválido
    if (input.classList.contains('invalid')) {
        limpiarError(input);
    }

    // Fuerza de contraseña en tiempo real
    if (input.id === 'password') {
        const fuerza = validaciones.calcularFuerzaPassword(input.value);
        const colores = ['#e5e7eb', 'var(--strength-1)', 'var(--strength-2)', 'var(--strength-3)', 'var(--strength-4)', 'var(--strength-5)'];
        const textos = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte', 'Muy Fuerte'];
        
        strengthBar.style.width = `${fuerza * 20}%`;
        strengthBar.style.backgroundColor = colores[fuerza];
        strengthText.textContent = input.value === '' ? 'Fuerza de la contraseña' : textos[fuerza];
        
        // Re-validar confirmación si el password cambia
        if (confirmPasswordInput.value !== '') {
            validarCampo(confirmPasswordInput);
        }
    }

    // Máscara en tiempo real para teléfono: (099) 999-9999
    if (input.id === 'telefono') {
        let x = input.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        input.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    }
});

// Evento change especial para el checkbox y select (mejor UX)
form.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox' || e.target.tagName === 'SELECT') {
        validarCampo(e.target);
    }
});

// Botón limpiar
btnLimpiar.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que deseas limpiar todo el formulario? Perderás los datos ingresados.')) {
        form.reset();
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.classList.remove('valid', 'invalid');
            const error = input.closest('.input-group')?.querySelector('.error-msg');
            if (error) error.remove();
        });
        strengthBar.style.width = '0';
        strengthText.textContent = 'Fuerza de la contraseña';
        resultadoContainer.innerHTML = '';
        resultadoContainer.classList.add('hidden');
        btnSubmit.disabled = true;
        form.querySelector('input').focus(); // Auto focus al primero
    }
});

// Envío del formulario
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Forzar validación final
    const inputs = Array.from(form.querySelectorAll('input, select'));
    let esValido = true;
    let primerError = null;

    inputs.forEach(input => {
        if (!validarCampo(input)) {
            esValido = false;
            if (!primerError) primerError = input;
        }
    });

    if (!esValido && primerError) {
        // Scroll automático al primer error
        primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        primerError.focus();
        return;
    }

    // Recopilar datos
    const formData = new FormData(form);
    const datosUsuario = Object.fromEntries(formData.entries());
    
    // Renderizar Componente de Éxito
    resultadoContainer.innerHTML = ''; // Limpiar previo
    resultadoContainer.appendChild(SuccessCard(datosUsuario));
    resultadoContainer.classList.remove('hidden');
    
    // Opcional: Ocultar el formulario
    form.classList.add('hidden');
    
    // Scroll al resultado
    resultadoContainer.scrollIntoView({ behavior: 'smooth' });
});
