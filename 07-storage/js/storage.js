'use strict';

/**
 * storage.js — Servicio centralizado de localStorage
 * Práctica 7 - Web Storage
 * Cinthya Catalina Ramon Morocho
 */

// ─── Helper genérico (maneja errores y parseo automático) ──────────────────
const StorageHelper = {
  get(clave, valorDefecto = null) {
    try {
      const item = localStorage.getItem(clave);
      return item !== null ? JSON.parse(item) : valorDefecto;
    } catch {
      return valorDefecto;
    }
  },

  set(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (error) {
      console.error('Storage lleno o no disponible:', error);
      return false;
    }
  },

  remove(clave) {
    localStorage.removeItem(clave);
  },

  has(clave) {
    return localStorage.getItem(clave) !== null;
  },

  /** Calcula espacio aproximado usado en bytes */
  usadoBytes() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i);
      const valor = localStorage.getItem(clave);
      total += (clave.length + valor.length) * 2; // UTF-16 ≈ 2 bytes/char
    }
    return total;
  },

  /** Verifica disponibilidad */
  disponible() {
    try {
      const t = '__test__';
      localStorage.setItem(t, t);
      localStorage.removeItem(t);
      return true;
    } catch {
      return false;
    }
  },

  /** Devuelve todas las claves con prefijo dado */
  clavesCon(prefijo) {
    const resultado = [];
    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i);
      if (clave.startsWith(prefijo)) resultado.push(clave);
    }
    return resultado;
  }
};

// ─── CRUD de Tareas ────────────────────────────────────────────────────────
const TareaStorage = {
  CLAVE: 'p7_tareas',

  /** Leer todas las tareas */
  getAll() {
    return StorageHelper.get(this.CLAVE, []);
  },

  /** Crear una nueva tarea */
  create(texto) {
    const tareas = this.getAll();
    const nueva = {
      id: Date.now(),
      texto: texto.trim(),
      completada: false,
      creadoEn: new Date().toISOString()
    };
    tareas.push(nueva);
    StorageHelper.set(this.CLAVE, tareas);
    return nueva;
  },

  /** Cambiar estado completada */
  toggleCompletada(id) {
    const tareas = this.getAll();
    const tarea = tareas.find(t => t.id === id);
    if (tarea) {
      tarea.completada = !tarea.completada;
      StorageHelper.set(this.CLAVE, tareas);
    }
    return tarea;
  },

  /** Editar texto */
  update(id, nuevoTexto) {
    const tareas = this.getAll();
    const idx = tareas.findIndex(t => t.id === id);
    if (idx === -1) return null;
    tareas[idx].texto = nuevoTexto.trim();
    tareas[idx].editadoEn = new Date().toISOString();
    StorageHelper.set(this.CLAVE, tareas);
    return tareas[idx];
  },

  /** Eliminar por id */
  delete(id) {
    const tareas = this.getAll();
    const filtradas = tareas.filter(t => t.id !== id);
    if (filtradas.length === tareas.length) return false;
    StorageHelper.set(this.CLAVE, filtradas);
    return true;
  },

  /** Eliminar todas */
  clear() {
    StorageHelper.remove(this.CLAVE);
  },

  /** Importar array de tareas desde JSON externo */
  importar(tareas) {
    StorageHelper.set(this.CLAVE, tareas);
  }
};

// ─── Preferencia de tema ───────────────────────────────────────────────────
const TemaStorage = {
  CLAVE: 'p7_tema',

  get() {
    return StorageHelper.get(this.CLAVE, 'default');
  },

  set(nombre) {
    return StorageHelper.set(this.CLAVE, nombre);
  }
};

// ─── sessionStorage para el borrador del formulario ───────────────────────
const DraftStorage = {
  CLAVE: 'p7_form_draft',

  get() {
    try {
      const item = sessionStorage.getItem(this.CLAVE);
      return item ? JSON.parse(item) : null;
    } catch { return null; }
  },

  set(datos) {
    try {
      sessionStorage.setItem(this.CLAVE, JSON.stringify(datos));
    } catch { /* silencioso */ }
  },

  remove() {
    sessionStorage.removeItem(this.CLAVE);
  }
};