# TurnApp — Guía técnica de funcionalidad

## Sistema de agendamiento de citas para negocios

| Metadato    | Valor      |
| ----------- | ---------- |
| Versión     | 1.0        |
| Actualizado | Abril 2026 |

---

## Tabla de contenidos

1. [Visión general](#1-visión-general)
2. [Roles y permisos](#2-roles-y-permisos)
3. [Vistas de la aplicación](#3-vistas-de-la-aplicación)
4. [Flujo de agendamiento del cliente](#4-flujo-de-agendamiento-del-cliente-onboarding) · [4.2 Pasos adaptativos](#42-pasos-del-onboarding-orden-adaptativo) · [4.3 Zona horaria (UI)](#43-zona-horaria-en-la-experiencia-del-cliente)
5. [Sistema de horarios y disponibilidad](#5-sistema-de-horarios-y-disponibilidad) · [5.4](#54-bloqueo-de-emergencia-y-citas-solapadas) · [5.5](#55-ventana-de-agendamiento)
6. [Gestión de citas](#6-gestión-de-citas) · [6.5](#65-reglas-de-reserva-y-cancelación-cliente) · [6.6](#66-citas-manuales-y-walk-in)
7. [Notificaciones](#7-notificaciones)
8. [Entidades principales](#8-entidades-principales-del-sistema)
9. [Consideraciones técnicas generales](#9-consideraciones-técnicas-generales)
10. [Políticas de tokens y alcance](#10-políticas-de-tokens-y-alcance)

---

## 1. Visión general

TurnApp es una plataforma SaaS de agendamiento de citas diseñada para funcionar en cualquier tipo de negocio que requiera gestión de turnos, cupos o citas. El flujo principal se activa mediante escaneo de QR, permitiendo que el cliente agende sin necesidad de descargar ninguna aplicación.

| Aspecto                     | Descripción                                                           |
| --------------------------- | --------------------------------------------------------------------- |
| **Propósito**               | Gestión de citas para negocios con múltiples trabajadores mediante QR |
| **Usuarios objetivo**       | Dueños de negocio, administradores, trabajadores y clientes finales   |
| **Canal de acceso cliente** | Web progresiva (PWA) activada por QR, sin app nativa requerida        |
| **Notificaciones**          | WhatsApp para clientes, panel web para trabajadores                   |
| **Pagos**                   | No incluidos en v1.0                                                  |

---

## 2. Roles y permisos

El sistema maneja cuatro actores principales con distintos niveles de acceso:

| Rol            | Acceso                | Capacidades principales                                                                                                                                                                                                                                                                                                                     |
| -------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dueño**      | Panel completo        | Configuración total del negocio, gestión de trabajadores, catálogo de servicios del establecimiento, QR global y calendario de trabajadores (**reportes básicos: no previstos en v1.0**)                                                                                                                                                    |
| **Trabajador** | Panel propio limitado | Configuración de **oferta** sobre el catálogo de servicios del negocio, agenda, horarios y bloqueos, perfil, **historial de citas del cliente** en el establecimiento; **cancelación manual** o **solicitud de reagendamiento** (WhatsApp al cliente); resolución de conflictos en **bloqueos de emergencia**; **citas manuales / walk-in** |
| **Cliente**    | Onboarding vía QR     | Flujo **servicio → profesional** (adaptativo al tipo de QR, [§4](#4-flujo-de-agendamiento-del-cliente-onboarding)), verificación WhatsApp, cancelación y reagendamiento por links                                                                                                                                                           |

---

## 3. Vistas de la aplicación

La plataforma se divide en dos superficies: el panel de administración que a su vez se divide para dueños y trabajadores, y el flujo de cliente accesible por QR.

### 3.1 Vista de login

- Acceso para dueños y trabajadores: **inicio de sesión con Google** es el camino previsto; la **recuperación de contraseña** queda de **baja prioridad** mientras el login dependa del proveedor OAuth (puede documentarse o habilitarse más adelante si se añade login por email/contraseña).
- Los clientes finales no tienen cuenta; su acceso es exclusivo por QR y verificación WhatsApp (u omitida en citas manuales según [§6.6](#66-citas-manuales-y-walk-in)).

### 3.2 Onboarding de negocio (dueño)

- Se presenta al dueño una selección de templates por tipo de negocio (barbería, salón de belleza, clínica, consultorio, etc.).
- **Configuración de equipo:** el dueño indica si el negocio operará con múltiples trabajadores o solo él.
- Se configura el nombre, logo, dirección y datos básicos del establecimiento.
- Al finalizar, se generan automáticamente el QR del establecimiento y el QR personal del dueño/único trabajador si aplica.

### 3.3 Panel administrador

#### Gestión de trabajadores

- Invitar trabajadores por email o link.
- Ver listado de trabajadores con su estado, foto de perfil y ranking si está habilitado.
- Desactivar o eliminar trabajadores.

#### Configuración de horario global

- Definir los días laborables de la semana del establecimiento.
- Definir el rango de horas de operación general (ej. martes a domingo, 6 am — 10 pm).
- Agregar bloqueos globales: feriados, cierres especiales, eventos.
- Todos los horarios de los trabajadores deben estar contenidos dentro de este horario global.

#### Gestión de QR

- Visualizar, descargar e imprimir el QR del establecimiento.
- Ver los QR individuales de cada trabajador.

#### Catálogo de servicios del negocio

- Los **servicios son del establecimiento** (catálogo global al negocio): nombre y datos base definidos a nivel negocio.
- Cada **trabajador** activa un servicio del catálogo y define su **duración**, **precio** y **galería de imágenes** propia para ese servicio; también puede **crear nuevos servicios**, que se incorporan al catálogo del negocio.
- El dueño/admin puede gestionar o auditar el catálogo según permisos definidos en implementación.

#### Vista de agenda global

- Calendario con todas las citas del establecimiento, filtrable por trabajador, servicio o fecha.
- Creación o cancelación de citas desde el panel, incluida la **cita manual / walk-in** con opción de **enviar o no OTP** al cliente ([§6.6](#66-citas-manuales-y-walk-in)).
- El estado **En proceso** puede marcarse **manualmente** desde esta vista o desde el **dashboard** ([§6.1](#61-estados-de-una-cita)).

### 3.4 Panel del trabajador

#### Perfil

- Foto de perfil (obligatoria para aparecer en Onboarding del cliente).
- Nombre, descripción corta o especialidad.
- Ranking/puntuación acumulada (opcional, configurable por el negocio).

#### Mis servicios (oferta sobre el catálogo)

- El trabajador opera sobre el **catálogo de servicios del negocio** (definido en el panel administrador).
- Para cada servicio del catálogo que ofrezca: **duración** (minutos), **precio** (referencial) y **galería de imágenes única**; el cliente ve nombre/duración/precio/galería resultantes de la **oferta** de ese trabajador.
- Puede **crear nuevos servicios**, que se incorporan al catálogo del establecimiento.
- Activar o desactivar su oferta sobre un servicio sin eliminar el servicio del catálogo.

#### Mi horario

- El trabajador define su horario de trabajo dentro del marco global del establecimiento.
- Puede tener rangos múltiples en un mismo día (ej. 8 am—12 pm y 2 pm—8 pm).
- Puede trabajar días distintos a los de otro trabajador, siempre dentro de los días habilitados por el negocio.
- Bloqueos propios: vacaciones, cita médica, descanso, emergencia, con fecha/hora de inicio y fin.
- **Bloqueo de emergencia:** si el rango solapa con citas ya agendadas, el sistema obliga a resolver cada conflicto antes de guardar el bloqueo (ver [§5.4](#54-bloqueo-de-emergencia-y-citas-solapadas)).

#### Mi agenda

- Vista de citas del día y semana.
- Detalle de cada cita: cliente, servicio, hora, estado.
- **Historial del cliente:** al consultar una cita, el trabajador puede ver el **historial de citas** de ese número/teléfono en **este establecimiento** (fechas, estados, servicios), para contexto operativo.
- Notificación interna al recibir una nueva reserva.
- **En proceso:** el trabajador (o quien tenga permiso) marca **En proceso** **manualmente** desde el panel de citas o el **dashboard**; no hay activación automática en v1.0.
- **Cancelación manual:** el trabajador puede cancelar una cita desde el panel; el cliente recibe **notificación por WhatsApp** con un mensaje (la cita queda **Cancelada** en el sistema).
- **Solicitud de reagendamiento:** ver [§6.4](#64-solicitud-de-reagendamiento-por-el-trabajador) (cancelación automática + link para que el cliente decida reagendar o no).
- **Citas manuales / walk-in:** desde la agenda ([§6.6](#66-citas-manuales-y-walk-in)).

---

## 4. Flujo de agendamiento del cliente (Onboarding)

El cliente nunca necesita descargar una app. El flujo completo ocurre en el navegador al escanear el QR.

El orden de los pasos es **adaptativo según el tipo de QR** ([§4.2](#42-pasos-del-onboarding-orden-adaptativo)):

- **QR del establecimiento:** primero **servicio** (descubrimiento del catálogo), luego **profesional** que lo ofrece (comparación de ofertas y galerías), opcionalmente **perfil del trabajador**, y después fecha/hora.
- **QR del trabajador:** el mismo orden lógico comienza por **servicio**, pero la lista de servicios y ofertas está **acotada al `worker` del enlace**; la elección de **profesional** se **omite** o se reduce a **confirmación**, con posibilidad de **«Elegir otro profesional»** si el producto lo habilita (misma vista comparativa que en el flujo del establecimiento).

### 4.1 Estructura de la URL del QR

| Tipo                   | URL                                      |
| ---------------------- | ---------------------------------------- |
| QR del establecimiento | `/book/{business_id}`                    |
| QR del trabajador      | `/book/{business_id}?worker={worker_id}` |

### 4.2 Pasos del onboarding (orden adaptativo)

| Paso | Nombre                    | Descripción                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Selección de servicio     | Muestra servicios del **catálogo del negocio** que tengan al menos una **oferta activa** por algún trabajador. **QR establecimiento:** catálogo completo (según reglas del negocio). **QR trabajador:** solo ofertas **de ese trabajador** (`worker_id` en la URL).                                                                                                                                                                                                                                                                                       |
| 2    | Profesional y oferta      | **QR establecimiento:** lista de trabajadores que ofrecen el servicio elegido: foto, ranking, **duración y precio de su oferta**, **galería de imágenes de esa oferta**. El cliente puede abrir el **perfil del trabajador** (presentación, **resto de servicios** que ofrece) y volver sin perder el contexto. **QR trabajador:** paso **omitido** o sustituido por **confirmación** del profesional implícito en el QR; opción **«Elegir otro profesional»** para pasar a la misma comparativa que en el flujo del establecimiento, si está habilitado. |
| 3    | Selección de fecha y hora | Calendario con disponibilidad real para el **trabajador y servicio** ya fijados (horario, duración de la oferta, bloqueos, citas, [§5.5](#55-ventana-de-agendamiento)). Realtime requerido.                                                                                                                                                                                                                                                                                                                                                               |
| 4    | Datos del cliente         | Nombre completo y número de teléfono (WhatsApp). No se requiere email ni contraseña. Si el cliente ya tiene cita activa en el establecimiento, el flujo se bloquea ([§6.5](#65-reglas-de-reserva-y-cancelación-cliente)).                                                                                                                                                                                                                                                                                                                                 |
| 5    | Verificación por WhatsApp | Se envía un código de 4-6 dígitos al número ingresado; el cliente debe introducirlo para confirmar (omitido en **citas manuales** si el staff elige no enviar OTP, [§6.6](#66-citas-manuales-y-walk-in)).                                                                                                                                                                                                                                                                                                                                                 |
| 6    | Confirmación              | Resumen de la cita. WhatsApp con datos y **dos links** (cancelar y reagendar) con política de **expiración** definida ([§10](#10-políticas-de-tokens-y-alcance)).                                                                                                                                                                                                                                                                                                                                                                                         |

### 4.3 Zona horaria en la experiencia del cliente

- Todos los horarios mostrados al cliente (slots, resumen, links) se expresan en la **zona horaria del establecimiento**.
- La interfaz debe incluir un **indicador explícito** (etiqueta o tooltip) de la zona horaria o del desfase respecto al dispositivo, para evitar confusiones en viajeros o fronteras.

---

## 5. Sistema de horarios y disponibilidad

### 5.1 Horario global del establecimiento

- Define los días de la semana en que el negocio opera.
- Define el rango horario máximo de operación (ej. 6 am — 10 pm).
- Los trabajadores no pueden tener horarios fuera de este rango.
- Permite agregar bloqueos globales por fecha (feriados, cierres especiales).

### 5.2 Horario por trabajador

- Cada trabajador configura los días que trabaja (subconjunto de los días globales).
- Puede tener múltiples rangos horarios en un mismo día para simular descansos (ej. 8—12 y 2—8).
- Puede agregar bloqueos individuales con fecha y hora de inicio/fin y motivo opcional.

### 5.3 Cálculo de disponibilidad

- Al seleccionar un trabajador y servicio, el sistema calcula los slots disponibles.
- Un slot se considera disponible si: cae dentro del horario del trabajador, no está bloqueado (ni por el trabajador ni por el establecimiento) y no se solapa con otra cita ya agendada considerando la duración del servicio.
- Los slots se muestran en bloques del tamaño de la duración del servicio seleccionado.
- Se debe ir mostrando en realtime la disponibilidad de horarios (via supabase realtime o websocket).

### 5.4 Bloqueo de emergencia y citas solapadas

- Si el trabajador define un bloqueo (p. ej. motivo **emergencia** u otro bloqueo puntual) cuyo intervalo **intersecta** con el horario de una o más citas **Pendientes** o **Confirmadas** (u otros estados que sigan ocupando agenda, según reglas del producto), el sistema **no** guarda el bloqueo hasta que el conflicto quede resuelto.
- Para **cada** cita afectada, el trabajador debe elegir una de dos acciones:
  - **Cancelar la cita:** pasa a **Cancelada**; se envía al cliente **WhatsApp** con mensaje informando la cancelación (y el motivo operativo si el producto lo incluye).
  - **Solicitar reagendamiento:** mismo comportamiento que [§6.4](#64-solicitud-de-reagendamiento-por-el-trabajador): la cita pasa a **Cancelada** automáticamente, el cliente recibe **WhatsApp** (mensaje + **link de reagendamiento**) y decide si deja la cita cancelada o reserva nuevo horario.
- Tras aplicar la decisión para todas las citas en conflicto, se persiste el bloqueo y se actualiza la disponibilidad.

### 5.5 Ventana de agendamiento

- Solo se pueden reservar turnos cuyo inicio cumpla **ambos** límites respecto a “ahora” en la **zona horaria del negocio**:
  - **Anticipación mínima:** **30 minutos** (media hora; no se ofrecen slots que comiencen antes de ese margen desde el momento actual).
  - **Anticipación máxima:** **30 días** (no se ofrecen slots más allá de 30 días).
- El cálculo de slots ([§5.3](#53-cálculo-de-disponibilidad)) debe excluir automáticamente los que queden fuera de esta ventana.

---

## 6. Gestión de citas

### 6.1 Estados de una cita

| Estado         | Significado                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pendiente**  | La cita fue agendada pero aún no se ha atendido                                                                                                            |
| **Confirmada** | El negocio o trabajador confirmó manualmente (opcional)                                                                                                    |
| **En proceso** | El servicio está en curso; el estado se activa **solo manualmente** desde el **panel de citas** o el **dashboard** (no hay disparador automático en v1.0). |
| **Completada** | El servicio fue prestado                                                                                                                                   |
| **Cancelada**  | Cancelada por el cliente (vía link), por el **trabajador** desde el panel o como resultado de la resolución de conflicto al crear un bloqueo de emergencia |
| **No asistió** | El cliente no se presentó (marcado manualmente)                                                                                                            |

### 6.2 Cancelación y reagendamiento por el cliente

- Al confirmar una cita, el cliente recibe por WhatsApp **en el mismo mensaje** (o bloque de confirmación) **dos links** (cancelar y reagendar) sujetos a **expiración** e invalidación ([§10](#10-políticas-de-tokens-y-alcance)).
- **Cancelación:** el link abre una página donde puede confirmar la cancelación sin necesidad de volver a verificarse por WhatsApp, **solo si se cumple la política de cancelación tardía** ([§6.5](#65-reglas-de-reserva-y-cancelación-cliente)).
- **Reagendamiento (cliente):** el link abre un flujo para elegir nueva fecha y hora (mismo trabajador y servicio de la cita), respetando la ventana de agendamiento ([§5.5](#55-ventana-de-agendamiento)). Tras confirmar, se actualiza la cita, se libera el slot anterior, se emiten **nuevos** tokens/links y se notifica al trabajador.
- Tanto la cancelación como el reagendamiento notifican al trabajador en su panel cuando afectan la agenda.

### 6.3 Cancelación manual por el trabajador

- Desde **Mi agenda**, el trabajador puede cancelar una cita sin usar el link del cliente.
- El sistema registra la cita como **Cancelada** y envía al cliente un **mensaje por WhatsApp** (texto acordado por el producto; puede incluir datos básicos de la cita anulada).
- El slot queda liberado en la agenda del trabajador.

### 6.4 Solicitud de reagendamiento por el trabajador

- Desde **Mi agenda**, el trabajador puede iniciar una **solicitud de reagendamiento** hacia el cliente (imprevistos, acuerdo verbal, etc.).
- **No** existe estado persistente “pendiente de nuevo horario”: al confirmar la acción, el sistema realiza **cancelación automática** de la cita (queda **Cancelada**), libera el slot y envía al cliente **WhatsApp** con un mensaje explicativo y el **link de reagendamiento**.
- El **cliente decide** el resultado: puede **no usar el link** (la cita permanece cancelada) o **abrir el link**, completar el flujo y crear una **nueva reserva** con las reglas normales (anticipación, una cita activa por establecimiento, OTP si aplica, etc.). Si el producto reutiliza la misma fila de cita o crea una nueva, debe quedar trazabilidad clara en datos y notificaciones.
- Los mismos límites de expiración de tokens aplican al link emitido en este flujo ([§10](#10-políticas-de-tokens-y-alcance)).

### 6.5 Reglas de reserva y cancelación (cliente)

- **Ventana de agendamiento:** entre **30 minutos** (media hora) y **30 días** de anticipación ([§5.5](#55-ventana-de-agendamiento)).
- **Una cita activa por establecimiento:** cada cliente (identificado por teléfono) solo puede tener **una** cita **activa** a la vez en un mismo negocio; estados que cuentan como activos: **Pendiente**, **Confirmada** y **En proceso** (ajustable si *No asistió* debe bloquear o no). El onboarding debe rechazar una segunda reserva hasta que la anterior termine, se cancele o complete.
- **Cancelación tardía (cliente):** el cliente puede **cancelar por link** solo hasta **10 minutos antes** de la hora de inicio; dentro de ese margen el link deja de permitir cancelación (mensaje orientando a contactar al negocio o política equivalente).

### 6.6 Citas manuales y walk-in

- Desde el **panel del trabajador** y el **panel administrador (agenda global)** se puede **crear una cita manualmente** (walk-in, reserva telefónica, etc.) eligiendo trabajador, servicio, horario y datos del cliente.
- Opción explícita al guardar: **enviar OTP por WhatsApp** al número del cliente **o omitir** la verificación (útil en mostrador con identificación presencial).
- Si no se envía OTP, el sistema debe registrar el nivel de verificación del teléfono (p. ej. no verificado / verificado por staff) según el modelo de datos ([§8](#8-entidades-principales-del-sistema)).

---

## 7. Notificaciones

| Evento                                     | Canal              | Destinatario y contenido                                                                                                                |
| ------------------------------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Cita agendada                              | **WhatsApp**       | Cliente: confirmación con datos completos, **link de cancelación y link de reagendamiento** (ambos en el mismo envío)                   |
| Cita agendada                              | **Panel (in-app)** | Trabajador: alerta de nueva reserva con detalle                                                                                         |
| Cita reagendada por cliente                | **WhatsApp**       | Cliente: confirmación con el nuevo horario; se pueden reenviar links de cancelación y reagendamiento para la cita actualizada           |
| Cita reagendada por cliente                | **Panel (in-app)** | Trabajador: notificación de cambio de horario                                                                                           |
| Cita cancelada por cliente                 | **WhatsApp**       | Cliente: confirmación de cancelación                                                                                                    |
| Cita cancelada por cliente                 | **Panel (in-app)** | Trabajador: notificación de cancelación                                                                                                 |
| Cita cancelada por trabajador              | **WhatsApp**       | Cliente: mensaje informando la cancelación (acción manual desde el panel)                                                               |
| Solicitud de reagendamiento por trabajador | **WhatsApp**       | Cliente: la cita queda **cancelada automáticamente**; mensaje con contexto y **link de reagendamiento** (el cliente puede no reagendar) |
| Bloqueo de emergencia (citas canceladas)   | **WhatsApp**       | Cliente: un mensaje por cada cita que el trabajador decidió **cancelar** al resolver el conflicto                                       |
| Bloqueo de emergencia (reagendamiento)     | **WhatsApp**       | Igual que solicitud por trabajador: **cancelación automática** + mensaje y **link de reagendamiento** por cada cita afectada            |
| Recordatorio de cita                       | **WhatsApp**       | Cliente: recordatorio X horas antes (configurable)                                                                                      |

---

## 8. Entidades principales del sistema

A continuación se listan las entidades de datos que el sistema debe manejar, sin entrar en detalle de implementación.

### Business (Negocio)

- Nombre, logo, dirección, tipo de negocio (template), zona horaria.
- Horario global: días habilitados, rango horario general.
- Lista de bloqueos globales (fecha inicio, fecha fin, motivo).
- QR del establecimiento.

### Worker (Trabajador)

- Nombre, foto de perfil, descripción/especialidad.
- Rol dentro del negocio (owner / admin / worker).
- Horario propio: días y rangos horarios múltiples por día.
- Lista de bloqueos individuales.
- QR individual.
- Ranking/puntuación acumulada (opcional).

### Service (Catálogo del negocio)

- Pertenece al **establecimiento** (no a un trabajador aislado).
- Identidad del servicio en catálogo: nombre, descripción base u otros metadatos del negocio.
- Puede crearse desde el flujo del trabajador o gestionarse desde el panel admin; visibilidad y permisos según implementación.

### WorkerServiceOffer (Oferta del trabajador sobre un servicio)

- Vincula **trabajador** + **servicio del catálogo**.
- **Duración** (minutos), **precio** referencial, **galería de imágenes** propia del trabajador para ese servicio.
- Estado activo/inactivo de esta oferta (el servicio en catálogo puede seguir existiendo).

### Appointment (Cita)

- Negocio, trabajador, referencia al **servicio de catálogo** y a la **oferta** aplicada (duración/precio efectivos para esa reserva).
- Cliente: nombre, teléfono; indicador de **teléfono verificado por OTP** o creado sin verificación (cita manual).
- Fecha y hora de inicio, fin calculado según la duración de la oferta al momento de reservar.
- Estado actual de la cita.
- Tokens o links firmados de **cancelación** y **reagendamiento** con **expiración** acorde a [§10](#10-políticas-de-tokens-y-alcance); nueva emisión tras reagendamiento exitoso iniciado por el cliente.

### Client (Cliente)

- No tiene cuenta permanente en el sistema.
- Se identifica por número de teléfono; verificación depende del flujo (QR + OTP u omitida en manual).
- Historial de citas asociado al número en cada negocio; el **trabajador** puede consultar ese historial **dentro del establecimiento** desde el detalle de cita ([§3.4](#34-panel-del-trabajador)).

---

## 9. Consideraciones técnicas generales

| Tema                        | Detalle                                                                                                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Acceso del cliente**      | Web app sin instalación, responsive, optimizada para móvil                                                                                                                                      |
| **Autenticación clientes**  | OTP (código de verificación) enviado por WhatsApp al número ingresado                                                                                                                           |
| **QR**                      | Cada QR codifica una URL con el ID del negocio y opcionalmente el ID del trabajador                                                                                                             |
| **Cancelación (tokens)**    | Política de expiración e invalidación en [§10.2](#102-tokens--links-de-cancelación-cliente); alineada con cancelación tardía del cliente ([§6.5](#65-reglas-de-reserva-y-cancelación-cliente))  |
| **Reagendamiento**          | Política de **expiración e invalidación** en [§10](#10-políticas-de-tokens-y-alcance); no requiere nuevo OTP en el flujo por link salvo reglas adicionales del producto                         |
| **Zona horaria**            | Almacenamiento/cálculo preferente en **UTC**; **UI cliente** muestra horario en **zona del establecimiento** con **indicador visible** ([§4.3](#43-zona-horaria-en-la-experiencia-del-cliente)) |
| **Multi-idioma**            | No requerido en v1.0; base en español                                                                                                                                                           |
| **Integración WhatsApp**    | Requerida para OTP y notificaciones (vía Baileys)                                                                                                                                               |
| **Acciones del trabajador** | Cancelación manual o solicitud de reagendamiento, y resolución de conflictos por bloqueo de emergencia, disparan siempre mensaje al cliente por **WhatsApp** cuando afecta una cita             |
| **Login staff**             | Objetivo: **Google OAuth**; recuperación de contraseña no prioritaria hasta haber login clásico                                                                                                 |
| **Reportes (dueño)**        | **No** incluidos en v1.0                                                                                                                                                                        |

---

## 10. Políticas de tokens y alcance

### 10.1 Tokens / links de reagendamiento

- Todo link de reagendamiento debe tener una **ventana de validez limitada en el tiempo** (**TTL**): por ejemplo tiempo máximo desde su emisión y/o invalidez **después de la hora de inicio de la cita a la que estaba asociada** el envío anterior. El valor concreto se fija en configuración del producto pero la regla es **obligatoria**: no hay links de reagendamiento sin expiración definida.
- **Tras un reagendamiento exitoso** iniciado por el cliente con un link, los tokens anteriores de cancelación/reagendamiento dejan de ser válidos y se emiten **nuevos** para la nueva instancia horaria.
- Un link usado **exitosamente** para completar un reagendamiento debe **invalidarse** (no reutilizable), salvo diseño explícito de idempotencia con el mismo resultado.
- Los links emitidos tras **cancelación automática** por solicitud del trabajador ([§6.4](#64-solicitud-de-reagendamiento-por-el-trabajador)) siguen la misma política de TTL e invalidación.

### 10.2 Tokens / links de cancelación (cliente)

- Misma familia de reglas: **expiración** clara (p. ej. hasta el inicio del turno o hasta la ventana de **cancelación tardía** de [§6.5](#65-reglas-de-reserva-y-cancelación-cliente), la más restrictiva prevalece).
- Tras cancelación confirmada, el token deja de aceptar nuevas solicitudes.

### 10.3 Alcance funcional explícito (v1.0)

- **Reportes básicos para el dueño:** fuera de alcance en esta versión.
- **Recuperación de contraseña:** secundaria mientras el acceso staff sea principalmente **Google**; documentar en roadmap si se añade email/contraseña.
