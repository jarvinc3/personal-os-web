import type { HelpGuide } from "@/src/modules/help/types/help.types"

export const INSTALLATION_GUIDES: readonly HelpGuide[] = [
  {
    slug: "instalar-android",
    title: "Instalar en Android",
    summary:
      "Añade Personal OS a la pantalla de inicio y úsala sin la barra del navegador.",
    group: "instalacion",
    steps: [
      {
        title: "Abre Personal OS en Chrome",
        body: "En Android, la instalación funciona desde Chrome. Si abriste el enlace en otro navegador, cámbialo a Chrome.",
      },
      {
        title: "Abre el menú del navegador",
        body: "Toca los tres puntos de la esquina superior derecha y elige «Instalar aplicación» o «Añadir a pantalla de inicio».",
      },
      {
        title: "Confirma el nombre",
        body: "Acepta. El icono de Personal OS queda en la pantalla de inicio y la app abre sin la barra del navegador.",
      },
      {
        title: "Activa los avisos",
        body: "Abre Ajustes → Notificaciones y enciende Push. Android pedirá permiso la primera vez.",
      },
      {
        title: "Si no ves la opción",
        body: "Comprueba que la página carga con candado (HTTPS) y que Chrome está actualizado.",
      },
    ],
  },
  {
    slug: "instalar-iphone",
    title: "Instalar en iPhone",
    summary:
      "Añádela desde Safari y activa los avisos push de la app instalada.",
    group: "instalacion",
    steps: [
      {
        title: "Abre Personal OS en Safari",
        body: "En el iPhone, la opción de instalar solo aparece en Safari. Si abriste el enlace en otro navegador, cópialo y pégalo en Safari.",
      },
      {
        title: "Toca Compartir",
        body: "Pulsa el icono de compartir: un cuadrado con una flecha hacia arriba.",
      },
      {
        title: "Añade a la pantalla de inicio",
        body: "Desliza y elige «Añadir a pantalla de inicio». Confirma el nombre y toca Añadir.",
      },
      {
        title: "Activa los avisos push",
        body: "Abre la app instalada, no la pestaña de Safari. Entra en Ajustes → Notificaciones y enciende Push. En iPhone, los avisos llegan solo desde la app añadida a la pantalla de inicio, con iOS 16.4 o posterior.",
      },
    ],
  },
  {
    slug: "instalar-escritorio",
    title: "Instalar en escritorio",
    summary: "Abre Personal OS en su propia ventana desde Chrome o Edge.",
    group: "instalacion",
    steps: [
      {
        title: "Abre la app en Chrome o Edge",
        body: "En el escritorio, la instalación está disponible en navegadores compatibles con apps web.",
      },
      {
        title: "Busca Instalar",
        body: "El icono aparece a la derecha de la barra de direcciones. También está en el menú del navegador como «Instalar Personal OS».",
      },
      {
        title: "Confirma",
        body: "Acepta el nombre. La app se abre en su propia ventana y queda en el menú de aplicaciones del sistema.",
      },
      {
        title: "Safari y Firefox",
        body: "Esos navegadores no instalan apps web en escritorio. Puedes usar Personal OS desde una pestaña normal.",
      },
    ],
  },
]
