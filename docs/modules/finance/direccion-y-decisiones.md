# Finanzas: dirección y decisiones

Fecha: 14 oct 2026 (web v0.28.2, back v0.26.1).

## Qué es Personal OS

Personal OS es una app personal de uso diario, no un software empresarial ni bancario. Un solo usuario maneja varios bancos (BHD, Popular, Qik), varias cuentas y tarjetas, y movimientos que llegan por correo, captura rápida, PDF y el agente. El rigor se mide en dos cosas: que la app sea coherente consigo misma y que cerrar cada mes contra el banco sea rápido.

## Decisiones

1. **Integridad interna obligatoria.** El saldo de cada cuenta y tarjeta debe ser siempre la suma de sus movimientos confirmados (invariante I1 de la spec). Se verifica y se alerta ([10](./pendientes/10-integridad-saldos.md)).
2. **Coincidir con el banco vía conciliación, no automáticamente.** La ingesta de correo no captura impuestos (DGII 0.15 %), comisiones, cargos por plástico ni intereses, así que a fin de mes los saldos no coinciden. El usuario escribe el saldo real y la diferencia se registra como ajustes categorizados ([09](./pendientes/09-conciliacion-ajustes.md)).
3. **Sin cálculo de intereses.** Lo hace el banco; entra como ajuste `INTERES` en la conciliación. Las tarjetas se quedan en lo práctico: crédito disponible, fechas y corte automático ([11](./pendientes/11-tarjetas-practicas.md)).
4. **Sin bitácora de auditoría por ahora.** Para un solo usuario basta el historial de conciliaciones y el diario de borrados.
5. **Desconfirmar se mantiene.** Un banco haría una reversa; para uso personal editar tras desconfirmar es práctico.
6. **Dinero exacto de punta a punta** ([12](./pendientes/12-decimales-exactos.md)), complementando ADR-002.
7. **Navegación:** Suscripciones es vista principal del tab bar de Finanzas, entre Planificación y Productos, y sus ajustes viven en `/settings/finance`. Comercios es solo un atajo dentro de Productos.
8. **Fuera de alcance:** la app móvil (fuera de servicio) y la configuración externa de OAuth.

## Camino a 1.0

1. 09 Conciliación con ajustes (web v0.29.0 / back v0.27.0)
2. 10 Integridad de saldos (v0.30.0 / v0.28.0)
3. 11 Tarjetas prácticas (v0.31.0 / v0.29.0)
4. 12 Decimales exactos (v0.32.0 / v0.30.0)

Cada pendiente se implementa en una sesión y se revisa en otra que publica PATCH. Al completar 09–12, el usuario decide cuándo declarar el núcleo estable y publicar `1.0.0` (ver `docs/versionado.md`).
