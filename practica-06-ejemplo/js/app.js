'use strict';

const btn = document.querySelector('#btn-cargar');
const contenedor = document.querySelector('#contenedor');
const loading = document.querySelector('#loading');
const URL = 'https://thesimpsonsapi.com/api/characters';

btn.addEventListener('click', cargarDatos);

async function cargarDatos() {
try {
loading.classList.remove('oculto');
contenedor.innerHTML = '';


const response = await fetch(URL);

if (!response.ok) {
  throw new Error(`HTTP Error: ${response.status}`);
}

const data = await response.json();
renderizar(data.results);


} catch (error) {
mostrarError(error.message);
} finally {
loading.classList.add('oculto');
}
}

function renderizar(lista) {
lista.forEach(item => {
const card = document.createElement('div');
card.className = 'card';

const bloqueImagen = document.createElement('div');
bloqueImagen.className = 'card-imagen';
const img = document.createElement('img');

// 
img.src = `https://thesimpsonsapi.com${item.portrait_path}`;
img.alt = item.name;
img.width = 100;

bloqueImagen.appendChild(img);

const bloqueTexto = document.createElement('div');
bloqueTexto.className = 'card-contenido';

const nombre = document.createElement('h3');
nombre.textContent = item.name;

const ocupacion = document.createElement('p');
ocupacion.textContent = item.occupation || 'Sin ocupación';

// 
const frase = document.createElement('p');
if (item.phrases && item.phrases.length > 0) {
  const random = Math.floor(Math.random() * item.phrases.length);
  frase.textContent = `"${item.phrases[random]}"`;
  frase.style.fontStyle = 'italic';
  frase.style.color = '#555';
 
}



// --- Frases (primeras 3) ---
const frases = Array.isArray(item.phrases) ? item.phrases.slice(0, 3) : [];

const bloqueFrases = document.createElement('div');

if (frases.length > 0) {
  frases.forEach(texto => {
    const frase = document.createElement('p');
    frase.textContent = `"${texto}"`;
    frase.style.fontStyle = 'italic';
    frase.style.color = '#555';
    bloqueFrases.appendChild(frase);
  });
} else {
  const sinFrases = document.createElement('p');
  sinFrases.textContent = 'Sin frases';
  sinFrases.style.color = '#aaa';
  bloqueFrases.appendChild(sinFrases);
}

bloqueTexto.appendChild(nombre);
bloqueTexto.appendChild(ocupacion);
bloqueTexto.appendChild(bloqueFrases);

card.appendChild(bloqueImagen);
card.appendChild(bloqueTexto);
contenedor.appendChild(card);

});
}

function mostrarError(mensaje) {
const p = document.createElement('p');
p.textContent = mensaje;
p.style.color = 'red';
contenedor.appendChild(p);
}