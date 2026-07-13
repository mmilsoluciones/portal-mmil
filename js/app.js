"use strict";

document.addEventListener("DOMContentLoaded", iniciarPortal);

async function iniciarPortal() {
    try {
        const respuesta = await fetch("./data/proyecto.json");

        if (!respuesta.ok) {
            throw new Error(
                `No se pudo cargar proyecto.json. Estado HTTP: ${respuesta.status}`
            );
        }

        const datos = await respuesta.json();

        mostrarResumen(datos.proyecto);
        mostrarPrioridades(datos.prioridades);
        mostrarSemanas(datos.semanas);
        mostrarMaterias(datos.materias);
        mostrarEnlaces(datos.enlaces);
    } catch (error) {
        console.error(error);

        document.querySelector("main").innerHTML = `
            <div class="alert alert-danger">
                No fue posible cargar la información del portal.
            </div>
        `;
    }
}

function mostrarResumen(proyecto) {
    const fechaEntrega = new Date(`${proyecto.fechaEntrega}T23:59:59`);
    const hoy = new Date();

    const diferencia = fechaEntrega.getTime() - hoy.getTime();

    const diasRestantes = Math.max(
        0,
        Math.ceil(diferencia / (1000 * 60 * 60 * 24))
    );

    document.getElementById("nombreEntrega").textContent =
        proyecto.entrega;

    document.getElementById("fechaEntrega").textContent =
        formatearFecha(fechaEntrega);

    document.getElementById("diasRestantes").textContent =
        diasRestantes;

    document.getElementById("avanceGeneral").textContent =
        `${proyecto.avanceGeneral}%`;

    document.getElementById("barraAvanceGeneral").style.width =
        `${proyecto.avanceGeneral}%`;
}

function mostrarPrioridades(prioridades) {
    const contenedor = document.getElementById("listaPrioridades");

    contenedor.innerHTML = prioridades.map((tarea) => {
        return `
            <div class="col-12 col-md-6 col-xl-4">
                <article class="tarjeta-contenido">
                    <span class="etiqueta ${clasePrioridad(tarea.prioridad)}">
                        ${escaparHTML(tarea.prioridad)}
                    </span>

                    <h3 class="mt-3">${escaparHTML(tarea.titulo)}</h3>

                    <p>
                        <strong>Materia:</strong>
                        ${escaparHTML(tarea.materia)}
                    </p>

                    <p>
                        <strong>Responsable:</strong>
                        ${escaparHTML(tarea.responsable)}
                    </p>

                    <p class="${claseEstado(tarea.estado)}">
                        <strong>Estado:</strong>
                        ${escaparHTML(tarea.estado)}
                    </p>
                </article>
            </div>
        `;
    }).join("");
}

function mostrarSemanas(semanas) {
    const contenedor = document.getElementById("calendarioSemanal");

    contenedor.innerHTML = semanas.map((semana) => {
        const tareas = semana.tareas.map((tarea) => {
            return `<li>${escaparHTML(tarea)}</li>`;
        }).join("");

        return `
            <div class="col-12 col-lg-6">
                <article class="tarjeta-contenido">
                    <p class="mb-1">
                        <strong>Semana ${semana.numero}</strong>
                        · ${escaparHTML(semana.periodo)}
                    </p>

                    <h3>${escaparHTML(semana.objetivo)}</h3>

                    <p class="${claseEstado(semana.estado)}">
                        ${escaparHTML(semana.estado)}
                    </p>

                    <ul class="lista-tareas">
                        ${tareas}
                    </ul>
                </article>
            </div>
        `;
    }).join("");
}

function mostrarMaterias(materias) {
    const contenedor = document.getElementById("materias");

    contenedor.innerHTML = materias.map((materia) => {
        const tareas = materia.tareas.map((tarea) => {
            const icono = tarea.completada ? "✓" : "○";

            return `
                <li>
                    ${icono} ${escaparHTML(tarea.nombre)}
                </li>
            `;
        }).join("");

        return `
            <div class="col-12 col-md-6">
                <article class="tarjeta-contenido">
                    <div class="d-flex justify-content-between gap-3">
                        <h3>${escaparHTML(materia.nombre)}</h3>
                        <strong>${materia.avance}%</strong>
                    </div>

                    <div class="progress mt-2">
                        <div
                            class="progress-bar"
                            style="width: ${materia.avance}%"
                        ></div>
                    </div>

                    <ul class="lista-tareas">
                        ${tareas}
                    </ul>
                </article>
            </div>
        `;
    }).join("");
}

function mostrarEnlaces(enlaces) {
    document.getElementById("enlaceJira").href = enlaces.jira;

    const contenedor = document.getElementById("enlacesRapidos");

    const nombres = {
        jira: "Jira",
        github: "GitHub",
        drive: "Google Drive",
        figma: "Figma"
    };

    contenedor.innerHTML = Object.entries(enlaces).map(([clave, url]) => {
        return `
            <a
                class="btn btn-primary"
                href="${escaparHTML(url)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                ${nombres[clave] ?? escaparHTML(clave)}
            </a>
        `;
    }).join("");
}

function clasePrioridad(prioridad) {
    const valor = prioridad.toLowerCase();

    if (valor === "alta") {
        return "prioridad-alta";
    }

    if (valor === "media") {
        return "prioridad-media";
    }

    return "prioridad-baja";
}

function claseEstado(estado) {
    const valor = estado.toLowerCase();

    if (valor === "finalizado") {
        return "estado-finalizado";
    }

    if (valor === "en curso") {
        return "estado-en-curso";
    }

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