/**
 * Crea una tarjeta con los datos del usuario tras un registro exitoso
 */
export function SuccessCard(datosUsuario) {
    const card = document.createElement('div');
    card.className = 'success-card';

    const title = document.createElement('h3');
    title.textContent = '¡Registro Completado con Éxito!';
    
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Los datos registrados son:';
    subtitle.style.marginBottom = '1rem';

    const ul = document.createElement('ul');

    // Mapeo seguro de datos omitiendo contraseñas
    const camposMostrados = {
        'Nombre': datosUsuario.nombre,
        'Email': datosUsuario.email,
        'Teléfono': datosUsuario.telefono,
        'Fecha de Nac.': datosUsuario.fechaNac,
        'Género': datosUsuario.genero
    };

    for (const [key, value] of Object.entries(camposMostrados)) {
        const li = document.createElement('li');
        const bold = document.createElement('strong');
        bold.textContent = `${key}: `;
        
        const span = document.createElement('span');
        span.textContent = value;

        li.appendChild(bold);
        li.appendChild(span);
        ul.appendChild(li);
    }

    card.appendChild(title);
    card.appendChild(subtitle);
    card.appendChild(ul);

    return card;
}
