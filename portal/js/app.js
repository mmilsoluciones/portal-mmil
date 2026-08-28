'use strict';

let datosPortal = null;
let fechaSeleccionada = null;

iniciarPortal();

async function iniciarPortal() {
    try {
        const respuesta = await fetch('./data/proyecto.json', { credentials: 'same-origin' });
        if (!respuesta.ok) throw new Error('No se pudo cargar proyecto.json');

        datosPortal = await respuesta.json();
        const { proyecto, jornadas, equipo, enlaces } = datosPortal;

        mostrarResumen(proyecto);
        construirCalendario(jornadas);
        mostrarEquipo(equipo);
        mostrarRecursos(enlaces);
        mostrarUltimaActualizacion(proyecto.ultimaActualizacion);

        const jornadaInicial = obtenerJornadaInicial(jornadas);
        if (jornadaInicial) seleccionarJornada(jornadaInicial.fecha);
    } catch (error) {
        console.error(error);
        mostrarErrorCarga();
    }
}

function mostrarErrorCarga() {
    const main = document.querySelector('main');
    if (!main) return;
    main.replaceChildren();

    const container = crearElemento('div', 'container py-5');
    const alert = crearElemento('div', 'alert alert-danger', 'No se pudo cargar la información del portal. Revisá que el sitio esté ejecutándose desde GitHub Pages, XAMPP o Live Server.');
    container.appendChild(alert);
    main.appendChild(container);
}

function mostrarResumen(proyecto) {
    const fechaEntrega = new Date(`${proyecto.fechaEntrega}T23:59:59`);
    const ahora = new Date();
    const diferencia = fechaEntrega.getTime() - ahora.getTime();
    const diasRestantes = Math.max(0, Math.ceil(diferencia / 86400000));
    const avance = limitarNumero(proyecto.avanceGeneral, 0, 100);

    setTexto('diasRestantes', diasRestantes);
    setTexto('fechaEntrega', formatearFechaCompleta(fechaEntrega));
    setTexto('avanceGeneral', `${avance}%`);
    const barra = document.getElementById('barraAvanceGeneral');
    if (barra) barra.style.width = `${avance}%`;

    const jira = document.getElementById('botonJiraHero');
    const urlJira = urlHttpSegura(proyecto.urlJira);
    if (jira) {
        if (urlJira) jira.href = urlJira;
        else jira.removeAttribute('href');
    }
}

function construirCalendario(jornadas) {
    const septiembre = document.getElementById('fechasSeptiembre');
    const octubre = document.getElementById('fechasOctubre');
    if (!septiembre || !octubre || !Array.isArray(jornadas)) return;

    septiembre.replaceChildren();
    octubre.replaceChildren();

    jornadas.forEach((jornada) => {
        const fecha = new Date(`${jornada.fecha}T12:00:00`);
        if (Number.isNaN(fecha.getTime())) return;

        const boton = crearElemento('button', 'fecha-btn');
        boton.type = 'button';
        boton.dataset.fecha = String(jornada.fecha || '');

        const diaSemana = crearElemento('span', 'fecha-dia-semana', capitalizar(new Intl.DateTimeFormat('es-UY', { weekday: 'short' }).format(fecha).replace('.', '')));
        const dia = crearElemento('strong', '', String(fecha.getDate()).padStart(2, '0'));
        const cantidad = crearElemento('span', 'fecha-cantidad', `${Array.isArray(jornada.tareas) ? jornada.tareas.length : 0} tareas`);
        boton.append(diaSemana, dia, cantidad);
        boton.addEventListener('click', () => seleccionarJornada(jornada.fecha));

        (fecha.getMonth() === 8 ? septiembre : octubre).appendChild(boton);
    });
}

function obtenerJornadaInicial(jornadas) {
    if (!Array.isArray(jornadas) || jornadas.length === 0) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return jornadas.find((jornada) => new Date(`${jornada.fecha}T00:00:00`) >= hoy) || jornadas[jornadas.length - 1];
}

function seleccionarJornada(fecha) {
    if (!datosPortal || !Array.isArray(datosPortal.jornadas)) return;
    const jornada = datosPortal.jornadas.find((item) => item.fecha === fecha);
    if (!jornada) return;

    fechaSeleccionada = fecha;
    document.querySelectorAll('.fecha-btn').forEach((boton) => {
        boton.classList.toggle('activo', boton.dataset.fecha === fecha);
    });

    const tareas = Array.isArray(jornada.tareas) ? jornada.tareas : [];
    setTexto('jornadaActual', formatearFechaCorta(fecha));
    setTexto('cantidadTareas', `${tareas.length} tareas asignadas`);
    setTexto('tituloJornada', jornada.titulo || 'Jornada');
    setTexto('contadorTareasPanel', tareas.length);
    mostrarTareas(tareas);
}

function mostrarTareas(tareas) {
    const contenedor = document.getElementById('tareasJornada');
    if (!contenedor) return;
    contenedor.replaceChildren();

    tareas.forEach((tarea) => {
        const col = crearElemento('div', 'col-12 col-lg-6');
        const article = crearElemento('article', 'tarea-card');
        const top = crearElemento('div', 'tarea-card-top');
        top.append(
            crearElemento('span', 'ticket-id', tarea.id || ''),
            crearElemento('span', 'fecha-limite', formatearFechaNumerica(tarea.fecha || ''))
        );

        const h3 = crearElemento('h3', '', tarea.ticket || '');
        const personas = crearElemento('div', 'tarea-personas');
        personas.append(
            crearPersona('Responsable', tarea.responsable),
            crearPersona('Ayudante', tarea.ayudante)
        );

        const criterio = crearElemento('div', 'criterio-cierre');
        criterio.append(
            crearElemento('span', '', 'Criterio de cierre'),
            crearElemento('p', '', tarea.criterioCierre || '')
        );

        article.append(top, h3, personas, criterio);
        col.appendChild(article);
        contenedor.appendChild(col);
    });
}

function crearPersona(etiqueta, valor) {
    const div = document.createElement('div');
    div.append(crearElemento('span', '', etiqueta), crearElemento('strong', '', valor || ''));
    return div;
}

function mostrarEquipo(equipo) {
    const grid = document.getElementById('equipoGrid');
    if (!grid || !Array.isArray(equipo)) return;
    grid.replaceChildren();

    equipo.forEach((persona) => {
        const col = crearElemento('div', 'col-12 col-sm-6 col-lg-4');
        const article = crearElemento('article', 'miembro');
        article.append(
            crearElemento('span', 'rol-equipo', persona.rol || ''),
            crearElemento('h3', '', persona.nombre || ''),
            crearElemento('p', '', persona.area || '')
        );
        col.appendChild(article);
        grid.appendChild(col);
    });
}

function mostrarRecursos(enlaces) {
    const grid = document.getElementById('enlacesRapidos');
    if (!grid || !Array.isArray(enlaces)) return;
    grid.replaceChildren();

    enlaces.forEach((enlace) => {
        const url = urlHttpSegura(enlace.url);
        if (!url) return;

        const col = crearElemento('div', 'col-12 col-sm-6 col-lg-3');
        const link = crearElemento('a', 'recurso');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.append(
            crearElemento('strong', '', enlace.nombre || ''),
            crearElemento('span', '', enlace.descripcion || '')
        );
        col.appendChild(link);
        grid.appendChild(col);
    });
}

function mostrarUltimaActualizacion(fecha) {
    setTexto('ultimaActualizacion', `Última actualización: ${fecha || '--'}`);
}

function crearElemento(tag, clase = '', texto = null) {
    const elemento = document.createElement(tag);
    if (clase) elemento.className = clase;
    if (texto !== null && texto !== undefined) elemento.textContent = String(texto);
    return elemento;
}

function setTexto(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = String(valor ?? '');
}

function urlHttpSegura(valor) {
    try {
        const url = new URL(String(valor || ''), window.location.href);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
        return url.href;
    } catch (_) {
        return null;
    }
}

function limitarNumero(valor, minimo, maximo) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return minimo;
    return Math.min(maximo, Math.max(minimo, numero));
}

function formatearFechaCompleta(fecha) {
    return new Intl.DateTimeFormat('es-UY', { day: '2-digit', month: 'long', year: 'numeric' }).format(fecha);
}

function formatearFechaCorta(fechaISO) {
    const fecha = new Date(`${fechaISO}T12:00:00`);
    return new Intl.DateTimeFormat('es-UY', { day: '2-digit', month: 'short' }).format(fecha).replace('.', '');
}

function formatearFechaNumerica(fechaISO) {
    const partes = String(fechaISO).split('-');
    if (partes.length !== 3) return '';
    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
}

function capitalizar(texto) {
    const valor = String(texto || '');
    return valor.charAt(0).toUpperCase() + valor.slice(1);
}
