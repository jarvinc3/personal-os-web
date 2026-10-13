# 05 · El agente sabe desde qué pantalla o entidad se abrió (`entityRef`)

## Problema

Al abrir el agente desde Finanzas, la sesión lleva `moduleSlug` (filtra las tools), pero no la entidad abierta. Verificado: no existe `entityRef` ni en la web ni en el back (`create-ai-session.dto.ts`, `chat-request.dto.ts`). Si el usuario está en el detalle del préstamo BHD y pregunta "¿cuánto me falta?", el agente no sabe de qué préstamo habla.

## Comportamiento esperado

- Abrir el agente desde un detalle envía la referencia de esa entidad; el chat muestra un chip "Contexto: Préstamo BHD" que se puede quitar.
- El agente responde sobre esa entidad sin pedir el id y usa las tools con ese id.
- Al navegar a otra entidad con el chat abierto, el chip se actualiza en el siguiente mensaje (no reescribe mensajes anteriores).
- Desde listas o el Resumen: `entityRef` vacío, solo módulo y pantalla.

## Contrato

```ts
type EntityRef = {
  type:
    | "transaction"
    | "transfer"
    | "account"
    | "card"
    | "card_statement"
    | "loan"
    | "loan_installment"
    | "receivable"
    | "savings_goal"
    | "budget"
    | "institution"
    | "email_message"
  id: string
}
type ChatContext = {
  moduleSlug: string
  screen?: string
  entityRef?: EntityRef
}
```

## Back (`packages/ai-agent`)

- `CreateAiSessionDto` y `ChatRequestDto`: `context?: ChatContext` validado (`type` enum, `id` UUID).
- El runner resuelve la entidad con la fachada de finanzas (verificando `userId`; si no existe o no es del usuario, se ignora) y agrega al prompt de sistema un resumen corto: tipo, nombre, saldo/estado y el id.
- Guardar el último `context` en la sesión para el historial.
- Specs: entidad válida, ajena, inexistente.

## Web

- `src/modules/ai`: el launcher acepta `context`. Hook `useChatContext()` que cada pantalla de detalle de finanzas registra (`useRegisterChatContext({ type: 'loan', id })`).
- Chip de contexto en `chat-input.tsx` con botón para quitarlo.
- Pantallas a cubrir: los 9 detalles de finanzas, más el detalle de presupuesto y de corte.

## Criterios de aceptación

- [ ] Desde el detalle de un préstamo, "¿cuánto me falta?" responde con el saldo de ese préstamo sin pedir id.
- [ ] Quitar el chip hace que la pregunta vuelva a ser genérica.
- [ ] Un id ajeno no filtra datos de otro usuario.
