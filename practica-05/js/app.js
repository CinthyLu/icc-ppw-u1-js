'use strict';

// VARIABLES GLOBALES

let intervaloId = null;
let tiempoRestante = 0;


// FUNCIONALIDAD: DARK MODE
// ==========================================
document.getElementById('toggleDark').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    // Guardar preferencia en localStorage
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
});

// Cargar preferencia de dark mode al iniciar
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
}


// UTILIDADES


/**
 * Registra un mensaje en el log de la UI
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo: 'info', 'success', 'error'
 */
function mostrarEstado(mensaje, tipo = 'info') {
    const log = document.getElementById('log');
    const entrada = document.createElement('div');
    entrada.className = `log-entry log-entry--${tipo}`;
    const hora = new Date().toLocaleTimeString('es-ES', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    entrada.innerHTML = `<span>${hora}</span><span>${mensaje}</span>`;
    log.appendChild(entrada);
    log.scrollTop = log.scrollHeight;
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
}

/**
 * Simula una petición a una API con delay aleatorio
 * @param {string} nombre - Nombre del recurso
 * @param {boolean} exito - Si la petición debe tener éxito
 * @returns {Promise} Promesa que se resuelve después del delay
 */
function simularPeticion(nombre, exito = true) {
    return new Promise((resolve, reject) => {
        // Delay aleatorio entre 0.5s y 2.5s (simulando latencia de red)
        const delay = Math.random() * 2000 + 500;
        
        setTimeout(() => {
            // 80% de probabilidad de éxito
            if (exito && Math.random() > 0.2) {
                resolve({
                    nombre,
                    datos: `Datos de ${nombre}`,
                    tiempo: Math.round(delay),
                    timestamp: new Date().toLocaleTimeString()
                });
            } else {
                reject(new Error(`❌ Error al cargar ${nombre} (simulado)`));
            }
        }, delay);
    });
}

/**
 * Implementa reintentos automáticos para promesas
 * @param {Function} promiseFn - Función que retorna una promesa
 * @param {number} maxIntentos - Número máximo de intentos
 * @returns {Promise} Resultado de la promesa o error
 */
async function fetchConReintentos(promiseFn, maxIntentos = 3) {
    for (let i = 0; i < maxIntentos; i++) {
        try {
            return await promiseFn();
        } catch (error) {
            console.warn(`Intento ${i + 1}/${maxIntentos} fallido:`, error.message);
            mostrarEstado(`Reintento ${i + 1}/${maxIntentos}...`, 'info');
            
            if (i === maxIntentos - 1) {
                throw error; // Último intento, lanzar error
            }
            
            // Esperar más tiempo con cada intento (backoff exponencial)
            const esperaMs = 1000 * (i + 1);
            await new Promise(r => setTimeout(r, esperaMs));
        }
    }
}

/**
 * Formatea segundos a MM:SS
 * @param {number} segundos - Segundos a formatear
 * @returns {string} Formato MM:SS
 */
function formatearTiempo(segundos) {
    const mins = Math.floor(segundos / 60).toString().padStart(2, '0');
    const segs = (segundos % 60).toString().padStart(2, '0');
    return `${mins}:${segs}`;
}


// SECCIÓN 1: CARGA DE DATOS


document.getElementById('btnCargar').addEventListener('click', async () => {
    const spinner = document.getElementById('spinner');
    const datos = document.getElementById('datos');
    const errorMsg = document.getElementById('errorMsg');

    // Limpiar estado anterior
    spinner.style.display = 'block';
    datos.style.display = 'none';
    datos.innerHTML = '';
    errorMsg.style.display = 'none';
    
    mostrarEstado('Iniciando carga de datos...', 'info');

    try {
        // Usar Promise.all para cargar datos en paralelo
        const [usuarios, productos, pedidos] = await Promise.all([
            fetchConReintentos(() => simularPeticion('Usuarios')),
            fetchConReintentos(() => simularPeticion('Productos')),
            fetchConReintentos(() => simularPeticion('Pedidos'))
        ]);

        // Renderizar datos
        datos.innerHTML = `
            <li>
                <span> ${usuarios.datos}</span>
                <span style="color: var(--secondary); font-size: 0.9rem;">${usuarios.tiempo}ms</span>
            </li>
            <li>
                <span> ${productos.datos}</span>
                <span style="color: var(--secondary); font-size: 0.9rem;">${productos.tiempo}ms</span>
            </li>
            <li>
                <span> ${pedidos.datos}</span>
                <span style="color: var(--secondary); font-size: 0.9rem;">${pedidos.tiempo}ms</span>
            </li>
        `;
        
        datos.style.display = 'block';
        spinner.style.display = 'none';
        mostrarEstado(' Datos cargados exitosamente', 'success');
        
    } catch (error) {
        errorMsg.textContent = error.message;
        errorMsg.style.display = 'block';
        spinner.style.display = 'none';
        mostrarEstado(`Error: ${error.message}`, 'error');
    }
});


// SECCIÓN 2: SECUENCIAL VS PARALELO

/**
 * Carga datos de forma SECUENCIAL (uno tras otro)
 * Tiempo total = suma de todos los delays
 */
document.getElementById('btnSecuencial').addEventListener('click', async () => {
    const inicio = performance.now();
    mostrarEstado('Carga SECUENCIAL iniciada...', 'info');
    
    try {
        // Usar await para esperar cada petición antes de la siguiente
        const usuarios = await simularPeticion('Usuarios');
        const productos = await simularPeticion('Productos');
        const pedidos = await simularPeticion('Pedidos');
        
        const total = Math.round(performance.now() - inicio);
        
        document.getElementById('resultados').innerHTML = `
            <strong> Secuencial completado en ${total}ms</strong>
            <div style="margin-top: 1rem; display: grid; gap: 0.5rem;">
                <div> ${usuarios.datos} (${usuarios.tiempo}ms)</div>
                <div> ${productos.datos} (${productos.tiempo}ms)</div>
                <div> ${pedidos.datos} (${pedidos.tiempo}ms)</div>
            </div>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--secondary);">
                Total estimado: ${usuarios.tiempo + productos.tiempo + pedidos.tiempo}ms
            </p>
        `;
        
        document.getElementById('resultados').classList.add('show');
        mostrarEstado(` Secuencial: ${total}ms`, 'success');
        
    } catch (error) {
        mostrarEstado(` Secuencial error: ${error.message}`, 'error');
    }
});

/**
 * Carga datos de forma PARALELA (todos a la vez)
 * Tiempo total = máximo de los delays individuales
 */
document.getElementById('btnParalelo').addEventListener('click', async () => {
    const inicio = performance.now();
    mostrarEstado('Carga PARALELA iniciada...', 'info');
    
    try {
        // Usar Promise.allSettled para ejecutar todas a la vez
        // y obtener resultados incluso si algunas fallan
        const resultados = await Promise.allSettled([
            simularPeticion('Usuarios'),
            simularPeticion('Productos'),
            simularPeticion('Pedidos')
        ]);
        
        const total = Math.round(performance.now() - inicio);
        let html = `<strong> Paralelo completado en ${total}ms</strong>`;
        html += '<div style="margin-top: 1rem; display: grid; gap: 0.5rem;">';
        
        let tiempoMax = 0;
        resultados.forEach((r, i) => {
            if (r.status === 'fulfilled') {
                const recursos = ['Usuarios', 'Productos', 'Pedidos'];

                html += `<div> ${icons[i]} ${r.value.datos} (${r.value.tiempo}ms)</div>`;
                tiempoMax = Math.max(tiempoMax, r.value.tiempo);
            } else {
                html += `<div> Error: ${r.reason.message}</div>`;
            }
        });
        
        html += '</div>';
        html += `<p style="margin-top: 1rem; font-size: 0.9rem; color: var(--secondary);">
            Tiempo máximo individual: ${tiempoMax}ms (lo que tarda en paralelo)
        </p>`;
        
        document.getElementById('resultados').innerHTML = html;
        document.getElementById('resultados').classList.add('show');
        mostrarEstado(`✅ Paralelo: ${total}ms`, 'success');
        
    } catch (error) {
        mostrarEstado(` Paralelo error: ${error.message}`, 'error');
    }
});


// SECCIÓN 3: TEMPORIZADOR



function actualizarDisplay() {
    document.getElementById('display').textContent = formatearTiempo(tiempoRestante);
    
    const barraInterna = document.querySelector('#barra-progreso > div');
    const total = Number(document.getElementById('tiempo-input').value);
    
    if (total > 0) {
        const porcentaje = ((total - tiempoRestante) / total) * 100;
        barraInterna.style.width = `${porcentaje}%`;
    }
}

/**
 * Inicia el temporizador
 */
function iniciar() {
    if (intervaloId) return; 
    
    tiempoRestante = Number(document.getElementById('tiempo-input').value);
    
    if (tiempoRestante <= 0) {
        mostrarEstado(' Ingresa un tiempo válido mayor a 0', 'info');
        return;
    }
    
    actualizarDisplay();
    mostrarEstado(` Temporizador iniciado: ${formatearTiempo(tiempoRestante)}`, 'info');
    
    intervaloId = setInterval(() => {
        tiempoRestante--;
        actualizarDisplay();
        
        if (tiempoRestante <= 0) {
            detener();
            const display = document.getElementById('display');
            display.textContent = '¡Tiempo!';
            display.classList.add('display--terminado');
            mostrarEstado(' ¡Temporizador terminado!', 'success');
        }
    }, 1000);
}

/**
 * Detiene/pausa el temporizador
 */
function detener() {
    clearInterval(intervaloId);
    intervaloId = null;
    mostrarEstado(`⏸ Temporizador pausado en ${formatearTiempo(tiempoRestante)}`, 'info');
}

/**
 * Reinicia el temporizador
 */
function reiniciar() {
    detener();
    tiempoRestante = 0;
    document.getElementById('display').textContent = '00:00';
    document.getElementById('display').classList.remove('display--terminado');
    document.querySelector('#barra-progreso > div').style.width = '0%';
    mostrarEstado(' Temporizador reiniciado', 'info');
}

// Asignar event listeners al temporizador
document.getElementById('btn-iniciar').addEventListener('click', iniciar);
document.getElementById('btn-detener').addEventListener('click', detener);
document.getElementById('btn-reiniciar').addEventListener('click', reiniciar);

// Actualizar display cuando cambia el input
document.getElementById('tiempo-input').addEventListener('change', () => {
    if (!intervaloId) {
        const value = Number(document.getElementById('tiempo-input').value);
        tiempoRestante = value;
        actualizarDisplay();
    }
});


// INICIALIZACIÓN


document.addEventListener('DOMContentLoaded', () => {
    // Inicializar display del temporizador
    actualizarDisplay();
    
    // Mensaje de bienvenida
    mostrarEstado('Aplicación inicializada correctamente', 'success');

});


// INFORMACIÓN EN CONSOLA

console.log(
    '%c⚡ Práctica 5: Programación Asíncrona %c',
    'background: linear-gradient(90deg, #38247c 0%, #00f3ff 100%); color: white; padding: 10px; border-radius: 5px; font-weight: bold; font-size: 14px;',
    ''
);

console.log(
    '%cConceptos principales:%c',
    'font-weight: bold; color: #38247c; font-size: 12px;',
    ''
);

console.log(`
✓ Promesas: Objetos que representan el resultado eventual de una operación
✓ async/await: Sintaxis que permite escribir código asíncrono de forma clara
✓ Promise.all(): Ejecuta múltiples promesas en paralelo
✓ Promise.allSettled(): Como .all() pero no falla si alguna falla
✓ setInterval/setTimeout: Para ejecutar código después de un delay
✓ Event Loop: Coordina call stack, web APIs, microtask queue y callback queue
`);