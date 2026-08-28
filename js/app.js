let datosPortal = null;
let fechaSeleccionada = null;

iniciarPortal();

async function iniciarPortal() {
    try {
        const respuesta = await fetch("./data/proyecto.json");
        if (!respuesta.ok) throw new Error("No se pudo cargar proyecto.json");

        datosPortal = await respuesta.json();
        const { proyecto, jornadas, equipo, enlaces } = datosPortal;

        mostrarResumen(proyecto);
        construirCalendario(jornadas);
        mostrarEquipo(equipo);
        mostrarRecursos(enlaces);
        mostrarUltimaActualizacion(proyecto.ultimaActualizacion);

        const jornadaInicial = obtenerJornadaInicial(jornadas);
        seleccionarJornada(jornadaInicial.fecha);
    } catch (error) {
        console.error(error);
        document.querySelector("main").innerHTML = `
            <div class="container py-5">
                <div class="alert alert-danger">
                    No se pudo cargar la información del portal. Revisá que el sitio esté ejecutándose desde GitHub Pages, XAMPP o Live Server.
                </div>
            </div>`;
    }
}

function mostrarResumen(proyecto) {
    const fechaEntrega = new Date(`${proyecto.fechaEntrega}T23:59:59`);
    const ahora = new Date();
    const diferencia = fechaEntrega.getTime() - ahora.getTime();
    const diasRestantes = Math.max(0, Math.ceil(diferencia / 86400000));

    document.getElementById("diasRestantes").textContent = diasRestantes;
    document.getElementById("fechaEntrega").textContent = formatearFechaCompleta(fechaEntrega);
    document.getElementById("avanceGeneral").textContent = `${proyecto.avanceGeneral}%`;
    document.getElementById("barraAvanceGeneral").style.width = `${proyecto.avanceGeneral}%`;
    document.getElementById("botonJiraHero").href = proyecto.urlJira;
}

function construirCalendario(jornadas) {
    const septiembre = document.getElementById("fechasSeptiembre");
    const octubre = document.getElementById("fechasOctubre");

    jornadas.forEach((jornada) => {
        const fecha = new Date(`${jornada.fecha}T12:00:00`);
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "fecha-btn";
        boton.dataset.fecha = jornada.fecha;
        boton.innerHTML = `
            <span class="fecha-dia-semana">${capitalizar(new Intl.DateTimeFormat("es-UY", { weekday: "short" }).format(fecha).replace(".", ""))}</span>
            <strong>${String(fecha.getDate()).padStart(2, "0")}</strong>
            <span class="fecha-cantidad">${jornada.tareas.length} tareas</span>`;
        boton.addEventListener("click", () => seleccionarJornada(jornada.fecha));

        (fecha.getMonth() === 8 ? septiembre : octubre).appendChild(boton);
    });
}

function obtenerJornadaInicial(jornadas) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return jornadas.find((jornada) => new Date(`${jornada.fecha}T00:00:00`) >= hoy) || jornadas[jornadas.length - 1];
}

function seleccionarJornada(fecha) {
    if (!datosPortal) return;
    const jornada = datosPortal.jornadas.find((item) => item.fecha === fecha);
    if (!jornada) return;

    fechaSeleccionada = fecha;
    document.querySelectorAll(".fecha-btn").forEach((boton) => {
        boton.classList.toggle("activo", boton.dataset.fecha === fecha);
    });

    document.getElementById("jornadaActual").textContent = formatearFechaCorta(fecha);
    document.getElementById("cantidadTareas").textContent = `${jornada.tareas.length} tareas asignadas`;
    document.getElementById("tituloJornada").textContent = jornada.titulo;
    document.getElementById("contadorTareasPanel").textContent = jornada.tareas.length;
    mostrarTareas(jornada.tareas);
}

function mostrarTareas(tareas) {
    const contenedor = document.getElementById("tareasJornada");
    contenedor.innerHTML = tareas.map((tarea) => `
        <div class="col-12 col-lg-6">
            <article class="tarea-card">
                <div class="tarea-card-top">
                    <span class="ticket-id">${escaparHTML(tarea.id)}</span>
                    <span class="fecha-limite">${formatearFechaNumerica(tarea.fecha)}</span>
                </div>
                <h3>${escaparHTML(tarea.ticket)}</h3>
                <div class="tarea-personas">
                    <div><span>Responsable</span><strong>${escaparHTML(tarea.responsable)}</strong></div>
                    <div><span>Ayudante</span><strong>${escaparHTML(tarea.ayudante)}</strong></div>
                </div>
                <div class="criterio-cierre">
                    <span>Criterio de cierre</span>
                    <p>${escaparHTML(tarea.criterioCierre)}</p>
                </div>
            </article>
        </div>`).join("");
}

function mostrarEquipo(equipo) {
    document.getElementById("equipoGrid").innerHTML = equipo.map((persona) => `
        <div class="col-12 col-sm-6 col-lg-4">
            <article class="miembro">
                <span class="rol-equipo">${escaparHTML(persona.rol)}</span>
                <h3>${escaparHTML(persona.nombre)}</h3>
                <p>${escaparHTML(persona.area)}</p>
            </article>
        </div>`).join("");
}

function mostrarRecursos(enlaces) {
    document.getElementById("enlacesRapidos").innerHTML = enlaces.map((enlace) => `
        <div class="col-12 col-sm-6 col-lg-3">
            <a class="recurso" href="${escaparHTML(enlace.url)}" target="_blank" rel="noopener noreferrer">
                <strong>${escaparHTML(enlace.nombre)}</strong>
                <span>${escaparHTML(enlace.descripcion)}</span>
            </a>
        </div>`).join("");
}

function mostrarUltimaActualizacion(fecha) {
    document.getElementById("ultimaActualizacion").textContent = `Última actualización: ${fecha}`;
}

function formatearFechaCompleta(fecha) {
    return new Intl.DateTimeFormat("es-UY", { day: "2-digit", month: "long", year: "numeric" }).format(fecha);
}

function formatearFechaCorta(fechaISO) {
    const fecha = new Date(`${fechaISO}T12:00:00`);
    return new Intl.DateTimeFormat("es-UY", { day: "2-digit", month: "short" }).format(fecha).replace(".", "");
}

function formatearFechaNumerica(fechaISO) {
    const [anio, mes, dia] = fechaISO.split("-");
    return `${dia}/${mes}/${anio}`;
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function escaparHTML(valor) {
    const elemento = document.createElement("div");
    elemento.textContent = valor ?? "";
    return elemento.innerHTML;
}
