# Formato monetario consistente en Finanzas

## Objetivo

Todo monto presentado al usuario dentro del módulo de Finanzas debe mostrar primero el código ISO de la moneda, seguido por su símbolo real y el valor:

- `DOP $78,224.48`
- `USD $510`
- `EUR €1,000`

Los campos editables mantienen valores numéricos sin código ni símbolo para no interferir con la captura y validación.

## Diseño

`formatFinanceMoney` será la única fuente de formato monetario. La función:

- normaliza el código ISO a mayúsculas;
- obtiene mediante `Intl.NumberFormat` el símbolo propio de la moneda;
- produce siempre la estructura `<ISO> <símbolo><monto>`;
- conserva las preferencias existentes de centavos y números compactos;
- devuelve `—` para valores o códigos de moneda inválidos.

Todos los lugares que ya llaman a esta función adoptarán el formato automáticamente. Las presentaciones que hoy usan valores crudos se migrarán al helper, incluyendo:

- saldos dentro del selector de monedas de una tarjeta;
- montos extraídos de correos en la cola de sincronización y su hoja de asignación;
- el saldo inicial mostrado después de crear una cuenta.

Los textos con signo externo, como débitos y créditos, conservarán su semántica actual alrededor del monto ya formateado.

## Flujo de datos

Cada vista entrega el valor, la moneda correspondiente y las preferencias de visualización a `formatFinanceMoney`. Para montos en moneda base se usa la moneda configurada o la devuelta por el balance general; para cuentas, tarjetas, préstamos, transacciones y correos se usa la moneda propia de la entidad.

## Pruebas y verificación

Se agregarán pruebas exactas para DOP, USD y EUR, además de centavos, números compactos, códigos en minúsculas y entradas inválidas. Las presentaciones crudas tendrán cobertura en funciones puras cuando resulte necesario. La verificación final ejecutará las pruebas del módulo, ESLint y TypeScript.

## Restricciones

- No se cambian contratos de API ni valores enviados al backend.
- No se agregan dependencias.
- No se reformatean campos de entrada.
- Se preservan los cambios locales existentes y se limita el parche al formato monetario.
