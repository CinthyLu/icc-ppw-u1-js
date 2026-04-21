'use strict';

const nombre = 'Cinthya';
const apellido = 'Ramon';
let ciclo = 5;
const activo = true;

const direccion ={
    ciudad:'Cuenca',
    provincia:'Azuay',
    pais:'Ecuador'
}
//para imprimr toda la tabla de datos

console.table({nombre, apellido, ciclo, activo, direccion}  );

const calcularPromedio =(notas)=>  // promedio: notas.reduce=> sum();
    notas.reduce((sum, nota) => sum + nota, 0) / notas.length;

const esMayorEdad = (edad) => edad >= 18;

const getSaludo = (nombre,  hora) => hora < 12
    ? `Buenos días, ${nombre}`
    : hora < 18 
    ? `Buenas tardes, ${nombre}`
    : `Buenas noches, ${nombre}`;

    console.log(getSaludo('Cinthya', 10));

 //   Mostrar en HTML

 document.getElementById('nombre').textContent = `Nombre: ${nombre}`;
    document.getElementById('apellido').textContent = `Apellido: ${apellido}`;
    document.getElementById('ciclo').textContent = `Ciclo: ${ciclo}`;