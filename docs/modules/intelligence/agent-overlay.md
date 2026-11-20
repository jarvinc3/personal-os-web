# Overlay de chat del agente (#407)

El chat con el agente es una superficie global de la web autenticada. Se abre desde cualquier vista o sheet y no cambia de página: vive en la URL con `useSheetParam` (`?sheet=agent-chat`) y se cierra con Atrás.

## Apertura

- Pulsación larga en el `+` del tab bar o del FAB, con un anillo que se llena durante 500 ms. Un toque normal conserva la acción de crear.
- Clic derecho y pulsación larga con el clic izquierdo en desktop.
- `Ctrl/Cmd+K`.
- Si la vista con tab bar no registra acciones para el `+`, el tab bar muestra un botón del agente en su lugar, para que el overlay siga teniendo entrada en móvil.
- Botón del agente a la derecha del header de cualquier `BottomSheet` (`AgentChatTriggerButton`).
- `AgentChatLauncherProvider` conecta esos controles del shell con `AgentChatHost` sin que `src/shared` importe el feature.

## Aspecto y cierre

- Fondo desenfocado sobre toda la pantalla, también sobre un sheet. Con `prefers-reduced-motion` se reduce la animación y con `prefers-reduced-transparency` se pinta opaco y sin desenfoque.
- Panel de altura completa. En una vista con tab bar, el composer ocupa el lugar del tab bar y el `+` se cambia por enviar; en una vista sin tab bar, el composer sube desde abajo con otra animación.
- Se cierra con la X, Esc, Atrás y un tirón hacia abajo desde el inicio de la lista. No se cierra al tocar el fondo ni al desplazar el chat.
- El foco entra al campo al abrir, queda atrapado en el panel y vuelve al control que abrió el overlay al cerrar.

## Contexto

Al abrir el overlay se guarda en `?agentContext=` el contexto de invocación: ruta, `view` o `sheet`, entidad de una ruta de detalle de Finanzas y filtros de la URL. Viaja al crear la conversación y en cada mensaje. El chip del header muestra la sección actual («Finanzas · Planificación»).

El contexto se serializa en base64url para que recargar la página reabra el mismo chat. `agentInvocationContextKey` calcula la misma clave SHA-256 canónica que usa el back para `GET /intelligence/conversations/latest`; así se retoma la última conversación de esa vista.

## Conversaciones

- La última conversación del contexto se retoma al abrir. Si no hay, el overlay arranca vacío.
- El historial abre un `BottomSheet` por URL (`?picker=agent-history`) con las conversaciones del dueño; elegir una cambia `sheetId` y nuevo chat deja el overlay sin conversación.
- Un chat nuevo usa el contexto actual por defecto y permite quitarlo antes del primer mensaje. Sin contexto, la conversación no se agrupa por la vista.
- El título sale del primer mensaje; el header lo muestra cuando existe.

## Respuesta y estados

- El envío usa `POST /intelligence/conversations/:id/messages` con `stream: true` y un `clientMessageId` UUID por turno. El back responde SSE (`start`, `status`, `chunk`, `reset`, `done`, `error`); el cliente pinta los trozos en el mismo mensaje y limpia el texto parcial cuando llega `reset`.
- Si el turno falla después de guardar el mensaje, «Reintentar» reenvía el mismo `clientMessageId` y el mismo texto. El back no duplica el mensaje del usuario y retoma la generación; si la respuesta ya existe, la devuelve guardada.
- Mientras responde se ve el estado pendiente y el composer se bloquea. Sin conexión o con un error, el mensaje del usuario y el botón de reintento se quedan en la conversación.
- El composer envía texto. Voz y adjuntos quedan fuera hasta que exista su contrato en el back.

## Código

- `src/modules/intelligence/components/agent-chat-host.tsx` — estado de URL, registro del launcher y atajo de teclado.
- `agent-chat-overlay.tsx`, `agent-chat-composer.tsx`, `agent-chat-message.tsx`, `agent-chat-markdown.tsx`, `agent-chat-history-sheet.tsx`.
- `src/modules/intelligence/hooks/use-agent-chat.ts` — queries, creación y envío.
- `src/modules/intelligence/lib/agent-chat-context.ts` y `agent-chat-stream.ts` — reglas puras con sus specs.
- `src/shared/components/agent-chat/agent-chat-launcher.tsx` — puente del shell.
- `src/shared/context/tab-bar-context.tsx` — visibilidad del tab bar para la animación.
- `src/config/api-client.ts` — `apiPostEventStream` sin reintento automático.

Implementación del back: [personal-os-back#421](https://github.com/jarvinc3/personal-os-back/issues/421).
