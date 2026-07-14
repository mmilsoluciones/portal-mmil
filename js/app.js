"use strict";

document.addEventListener("DOMContentLoaded", iniciarPortal);

async function iniciarPortal() {
    try {
        const respuesta = await fetch("./data/proyecto.json");

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        mostrarResumen(datos.proyecto, datos.semanas, datos.prioridades);
        mostrarPrioridades(datos.prioridades);
        mostrarCalendario(datos.semanas);
        mostrarEquipo(datos.equipo || []);
        mostrarMaterias(datos.materias);
        mostrarRecursos(datos.enlaces);
        mostrarUltimaActualizacion(datos.proyecto.ultimaActualizacion);
    } catch (error) {
        console.error("No fue posible cargar el portal:", error);

        document.querySelector("main").innerHTML = `
            <div class="container py-5">
                <div class="alert alert-danger">
                    No se pudo cargar la información del portal.
                    Revisa que el sitio esté ejecutándose desde GitHub Pages, XAMPP o Live Server.
                </div>
            </div>
        `;
    }
}

function mostrarResumen(proyecto, semanas, prioridades) {
    const fechaEntrega = new Date(`${proyecto.fechaEntrega}T23:59:59`);
    const hoy = new Date();
    const diferencia = fechaEntrega.getTime() - hoy.getTime();

    const diasRestantes = Math.max(
        0,
        Math.ceil(diferencia / (1000 * 60 * 60 * 24))
    );

    const semanaActual = semanas.find((semana) => semana.estado === "En curso");
    const prioridadActual = prioridades.find((tarea) => tarea.estado !== "Finalizado");

    document.getElementById("diasRestantes").textContent = diasRestantes;
    document.getElementById("fechaEntrega").textContent = formatearFecha(fechaEntrega);

    document.getElementById("avanceGeneral").textContent = `${proyecto.avanceGeneral}%`;
    document.getElementById("barraAvanceGeneral").style.width = `${proyecto.avanceGeneral}%`;

    document.getElementById("semanaActual").textContent =
        semanaActual ? `Semana ${semanaActual.numero}` : "Sin semana activa";

    if (semanaActual) {
        const resumen = calcularResumenSemana(semanaActual.tareas);

        document.getElementById("objetivoSemana").textContent =
            `${semanaActual.objetivo} · ${resumen.finalizadas}/${resumen.total} finalizadas`;
    } else {
        document.getElementById("objetivoSemana").textContent =
            "Actualiza el estado en proyecto.json";
    }

    document.getElementById("proximaPrioridad").textContent =
        prioridadActual ? prioridadActual.titulo : "Sin tareas pendientes";

    document.getElementById("responsablePrioridad").textContent =
        prioridadActual ? `Responsable: ${prioridadActual.responsable}` : "";

    document.getElementById("botonJiraHero").href = proyecto.urlJira;
}

function mostrarPrioridades(prioridades) {
    const contenedor = document.getElementById("listaPrioridades");

    contenedor.innerHTML = prioridades.map((tarea) => `
        <div class="col-12 col-md-6 col-xl-4">
            <article class="tarjeta">
                <div class="d-flex justify-content-between align-items-start gap-3">
                    <span class="badge-prioridad ${clasePrioridad(tarea.prioridad)}">
                        ${escaparHTML(tarea.prioridad)}
                    </span>

                    <span class="estado ${claseEstado(tarea.estado)}">
                        ${escaparHTML(tarea.estado)}
                    </span>
                </div>

                <h3>${escaparHTML(tarea.titulo)}</h3>
                <p><strong>Materia:</strong> ${escaparHTML(tarea.materia)}</p>
                <p><strong>Responsable:</strong> ${escaparHTML(tarea.responsable)}</p>
            </article>
        </div>
    `).join("");
}

function mostrarCalendario(semanas) {
    const contenedor = document.getElementById("calendarioSemanal");

    contenedor.innerHTML = semanas.map((semana) => {
        const resumen = calcularResumenSemana(semana.tareas);

        return `
            <article class="semana">
                <div class="semana-fecha">
                    <strong>Semana ${semana.numero}</strong>
                    <span>${escaparHTML(semana.periodo)}</span>
                    <span class="contador-semana">
                        ${resumen.finalizadas}/${resumen.total} finalizadas
                    </span>
                </div>

                <div class="semana-contenido">
                    <div class="cabecera-semana">
                        <div>
                            <h3>${escaparHTML(semana.objetivo)}</h3>

                            <span class="estado ${claseEstado(semana.estado)}">
                                ${escaparHTML(semana.estado)}
                            </span>
                        </div>

                        <div class="progreso-semana">
                            <strong>${resumen.porcentaje}%</strong>

                            <div class="progress">
                                <div
                                    class="progress-bar"
                                    style="width: ${resumen.porcentaje}%"
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div class="tareas-semana">
                        ${semana.tareas.map((tarea) => crearTarjetaTarea(tarea)).join("")}
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function crearTarjetaTarea(tarea) {
    const colaboradores = Array.isArray(tarea.colaboradores)
        ? tarea.colaboradores
        : [];

    const textoColaboradores = colaboradores.length > 0
        ? colaboradores.map((nombre) => escaparHTML(nombre)).join(", ")
        : "Sin colaboradores";

    return `
        <article class="tarea-semanal">
            <div class="tarea-superior">
                <span class="badge-prioridad ${clasePrioridad(tarea.prioridad)}">
                    ${escaparHTML(tarea.prioridad)}
                </span>

                <span class="estado ${claseEstado(tarea.estado)}">
                    ${escaparHTML(tarea.estado)}
                </span>
            </div>

            <h4>${escaparHTML(tarea.nombre)}</h4>

            <div class="datos-tarea">
                <p>
                    <span class="dato-etiqueta">Responsable</span>
                    <strong>${escaparHTML(tarea.responsable)}</strong>
                </p>

                <p>
                    <span class="dato-etiqueta">Colaboración</span>
                    <span>${textoColaboradores}</span>
                </p>
            </div>
        </article>
    `;
}

function mostrarEquipo(equipo) {
    const contenedor = document.getElementById("equipoGrid");

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = equipo.map((persona) => `
        <div class="col-12 col-sm-6 col-lg-4">
            <article class="miembro">
                <span class="rol-equipo">${escaparHTML(persona.rol)}</span>
                <h3>${escaparHTML(persona.nombre)}</h3>
                <p>${escaparHTML(persona.area)}</p>
            </article>
        </div>
    `).join("");
}

function mostrarMaterias(materias) {
    const contenedor = document.getElementById("materiasGrid");

    contenedor.innerHTML = materias.map((materia) => {
        const avance = calcularAvanceMateria(materia.tareas);

        return `
            <div class="col-12 col-md-6">
                <article class="materia">
                    <div class="d-flex justify-content-between gap-3">
                        <h3>${escaparHTML(materia.nombre)}</h3>
                        <strong>${avance}%</strong>
                    </div>

                    <div class="progress mt-2">
                        <div
                            class="progress-bar"
                            style="width: ${avance}%"
                        ></div>
                    </div>

                    <ul class="lista-check">
                        ${materia.tareas.map((tarea) => `
                            <li class="${tarea.completada ? "completada" : ""}">
                                <span class="check-icono">
                                    ${tarea.completada ? "✓" : ""}
                                </span>

                                <span class="texto-tarea">
                                    ${escaparHTML(tarea.nombre)}
                                </span>
                            </li>
                        `).join("")}
                    </ul>
                </article>
            </div>
        `;
    }).join("");
}

function mostrarRecursos(enlaces) {
    const contenedor = document.getElementById("enlacesRapidos");

    contenedor.innerHTML = enlaces.map((enlace) => `
        <div class="col-12 col-sm-6 col-lg-3">
            <a
                class="recurso"
                href="${escaparHTML(enlace.url)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                <strong>${escaparHTML(enlace.nombre)}</strong>
                <span>${escaparHTML(enlace.descripcion)}</span>
            </a>
        </div>
    `).join("");
}

function mostrarUltimaActualizacion(fecha) {
    document.getElementById("ultimaActualizacion").textContent =
        `Última actualización: ${fecha}`;
}

function calcularResumenSemana(tareas) {
    const total = tareas.length;
    const finalizadas = tareas.filter(
        (tarea) => tarea.estado === "Finalizado"
    ).length;

    const porcentaje = total > 0
        ? Math.round((finalizadas / total) * 100)
        : 0;

    return {
        total,
        finalizadas,
        porcentaje
    };
}

function calcularAvanceMateria(tareas) {
    if (!tareas.length) {
        return 0;
    }

    const completadas = tareas.filter((tarea) => tarea.completada).length;
    return Math.round((completadas / tareas.length) * 100);
}

function clasePrioridad(prioridad) {
    const valor = prioridad.toLowerCase();

    if (valor === "alta") return "prioridad-alta";
    if (valor === "media") return "prioridad-media";

    return "prioridad-baja";
}

function claseEstado(estado) {
    const valor = estado.toLowerCase();

    if (valor === "finalizado") return "estado-finalizado";
    if (valor === "en curso") return "estado-en-curso";

    return "estado-pendiente";
}

function formatearFecha(fecha) {
    return new Intl.DateTimeFormat("es-UY", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }).format(fecha);
}

function escaparHTML(valor) {
    const elemento = document.createElement("div");
    elemento.textContent = String(valor);

    return elemento.innerHTML;
}
