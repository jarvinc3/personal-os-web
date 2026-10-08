# Propuesta: nueva vista "Resumen" del módulo de Finanzas

**Personal OS · 8 de octubre de 2026**

Esta propuesta reemplaza las dos vistas actuales, **Resumen** y **Estadísticas**, por una sola vista **Resumen**. Su objetivo es responder lo que de verdad importa: cómo voy este mes, qué tengo que pagar pronto, en qué se me va el dinero y qué debería cambiar.

> Mockup interactivo: `mockup.html`, un archivo autocontenido que funciona sin conexión. Todos los números del mockup son **datos de ejemplo** parecidos a los reales.

---

## 1. Diagnóstico de las vistas actuales

### Resumen (hoy)

| Problema | Por qué importa |
|---|---|
| El **patrimonio neto** (DOP -378,311.80) ocupa el bloque principal, pero casi no se mueve de un día a otro y ya aparece en **Cuentas**. | Lo más visible de la pantalla no ayuda a decidir nada. |
| **Transacciones recientes** repite lo que ya está en **Movimientos**. | Es contenido duplicado y no aporta contexto. |
| Los botones **Gasto / Ingreso / Transf.** repiten el botón **+** que ya existe. | Son acciones rápidas, no resumen. |
| **Gastos frecuentes** son atajos de navegación, no información. | No responde ninguna pregunta. |
| El único "atajo" lleva a Estadísticas. | Señal de que el análisis está en otra pantalla. |

### Estadísticas (hoy)

| Problema | Por qué importa |
|---|---|
| Muestra **totales sueltos** (Cuentas, Deuda tarjetas, Ingresos, Gastos) sin ningún contexto. | Un número sin comparación no dice si vas bien o mal. |
| Las **gráficas no tienen montos** ni comparación con el mes anterior o con un promedio. | Hay que adivinar los valores. |
| **No hay selector de mes** (solo Semana / Mes / Año relativos). | No se puede revisar un mes pasado. |
| **Cuenta las Transferencias como gasto.** | Infla el gasto real y distorsiona las categorías. |
| **Ingresos en DOP 0.** | El salario no se está registrando, así que no se puede calcular el ahorro ni el flujo. |
| Las secciones vienen **colapsadas**, incluidos los presupuestos. | Lo más útil queda escondido. |
| Bugs de presentación: fechas ISO, etiquetas de año que se enciman en el eje, eje cortado en móvil. | Da una impresión de poco acabado. |

**Conclusión:** entre las dos vistas tienen datos, pero ninguna responde preguntas. Resumen es un menú de acciones y Estadísticas es una tabla de totales.

---

## 2. Recomendación

**Eliminar las dos vistas y crear una sola vista "Resumen"** con:

- **Selector de mes** (`‹ Octubre 2026 ›`) y **comparación contra el mes anterior** (`vs. septiembre`, con opción de "promedio 3 meses").
- Secciones ordenadas por urgencia: primero lo que requiere acción (alertas, pagos), luego el ritmo del mes y al final el análisis de largo plazo.
- Gráficas **con montos visibles y comparación**, sin transferencias.
- En la navegación queda **un solo ítem "Resumen"** (sidebar en escritorio, barra inferior en móvil). Estadísticas desaparece.
- El patrimonio neto se queda en **Cuentas** y además aparece como tendencia en la sección "Deuda y patrimonio". Las transacciones recientes se quedan en **Movimientos**.

---

## 3. Secciones de la vista

| # | Sección | Qué pregunta responde | Datos necesarios | Tipo de gráfica |
|---|---|---|---|---|
| 0 | **Encabezado** | ¿Qué periodo estoy viendo y contra qué lo comparo? | Mes seleccionado y mes de comparación | Selector de mes y chip de comparación |
| 1 | **Alertas del agente** | ¿Qué debería saber o hacer hoy? | Insights que genera y guarda el agente, con severidad, texto y acción | 3–4 tarjetas con ícono y color por severidad (rojo, ámbar, azul) y un botón de acción |
| 2 | **¿Cómo voy este mes?** | ¿Voy bien o mal comparado con el mes pasado y con mi presupuesto? ¿Cómo voy a cerrar? | Gasto diario acumulado del mes actual y del anterior, presupuesto mensual total, cargos fijos pendientes | Línea acumulada por día: mes actual (sólida), mes anterior (discontinua), presupuesto (diagonal), proyección (punteada). Al lado, 3 KPIs |
| 2b | **Cuánto queda por día** | ¿Cuánto puedo gastar al día sin pasarme? | Presupuesto restante, cargos fijos pendientes, días que faltan | KPI destacado: "Puedes gastar unos DOP 560 por día; ahora vas a DOP 583/día" |
| 3 | **Tarjetas de crédito** | ¿Cuánto debo en cada tarjeta, qué tan cerca del límite estoy y cuándo pago? | Saldo, límite, fecha de corte, fecha de pago, saldo al corte y pago mínimo | Fila por tarjeta con barra de utilización coloreada (<30% sana, 30–70% media, >70% alta), corte, pago, monto a pagar y días restantes |
| 4 | **¿En qué se me va el dinero?** | ¿En qué categorías gasto más y cuáles se dispararon? | Gasto por categoría del mes (sin transferencias) y promedio de 3 meses a la misma fecha | Barras horizontales con monto, % del total y delta vs. promedio (↑ rojo, ↓ verde) |
| 5 | **Gastos fijos y suscripciones** | ¿Qué cargos se repiten, cuándo es el próximo y cuánto suman al mes? | Cargos recurrentes que detecta el agente, con moneda, próxima fecha y tarjeta | Lista con próximo cobro, monto (USD con su equivalente en DOP), etiquetas "Pendiente" y "Nuevo", y total mensual |
| 6 | **Deuda y patrimonio** | ¿Estoy mejorando con el tiempo? ¿Cuánto me falta para salir del préstamo? | Patrimonio neto mensual de 12 meses, activos, deuda de tarjetas, préstamos y cuotas | Área de 12 meses, desglose (activos / tarjetas / préstamos) y barra de progreso del préstamo |
| 7 | **Pregúntale a tu agente** | Cualquier pregunta que no cubre el tablero | Transacciones históricas y la API de consultas del agente | Caja de pregunta con sugerencias. La respuesta trae texto, número clave y una gráfica generada en el momento (en el mockup, barras apiladas por mes) |

### Detalle de los cálculos clave (con los datos de ejemplo)

- **Gastado:** DOP 7,780.49 al 8 oct, **+12%** frente a la misma fecha de septiembre (DOP 6,947).
- **Proyección al cierre:** gasto actual + ritmo de gasto **variable** × días restantes + **cargos fijos pendientes**.
  - 7,780 + 583 × 23 + 4,370 (Altice, Claro, Typesafe) ≈ **DOP 25,555**, que son DOP 555 por encima de un presupuesto de DOP 25,000.
  - Esto es más preciso que solo multiplicar el ritmo diario, porque el gimnasio y Netflix ya se cobraron y no se repiten.
- **Por día:** (presupuesto restante − fijos pendientes) / días restantes = (17,219 − 4,370) / 23 ≈ **DOP 560/día**.

---

## 4. Rol del agente IA

Toda la app ya se alimenta de un agente que lee transacciones y correos bancarios. Eso permite que la vista sea más que un tablero fijo.

### 4.1 Alertas e insights
- El agente genera de 3 a 5 observaciones **una vez al día** y **cada vez que entra una transacción relevante**, y las **guarda** en la base de datos. La vista solo las lee, así que no espera al modelo.
- Ejemplos:
  - "Gastaste 40% más en Cafetería que tu promedio"
  - "El pago de la Visa vence en 3 días: DOP 18,450"
  - "Alimentación va al 90% del presupuesto"
  - "Ingresos en DOP 0: ¿registramos tu salario?"
- Cada alerta lleva una **severidad** (alta, media o info), una **acción** (ver tarjeta, ver movimientos, ajustar tope, registrar salario) y una **fecha de generación** ("hace 2 h").
- Debe poder descartarse o marcarse como útil, para que el agente aprenda qué le interesa al usuario.

### 4.2 Limpieza de datos (la base para que las gráficas sirvan)
- **Detección de recurrentes:** identifica suscripciones y gastos fijos (Netflix, Jersey Fitness, Altice, Railway, Typesafe…) con su periodicidad y próxima fecha. Si aparece uno nuevo, lo marca como "Nuevo".
- **Transferencias vs. gasto real:** separa transferencias entre cuentas propias y pagos de tarjeta para que no cuenten como gasto.
- **Detección de salario desde correos:** reconoce correos de nómina o depósitos y propone registrarlos como ingreso. Sin esto, Ingresos sigue en DOP 0.
- **Normalizar nombres de comercios:** por ejemplo, `UBER*RIDES` pasa a "Uber" y `SM NACIONAL LOPE DE VE` pasa a "Supermercado Nacional". Así las agrupaciones y los "top comercios" tienen sentido.

### 4.3 Preguntas libres con gráficas generadas
- Una caja tipo chat dentro de la vista. El agente consulta los datos, devuelve el **número clave** y una **especificación de gráfica** (tipo, series, ejes) que el frontend dibuja con el mismo estilo de la app.
- Así no hace falta adivinar de antemano todas las gráficas posibles.
- Ejemplo del mockup: "¿Cuánto gasté en comida fuera los últimos 3 meses?" → DOP 14,860, barras apiladas Jul/Ago/Sep y un enlace a los 47 movimientos.

### 4.4 Proyecciones con contexto
- La proyección de cierre tiene en cuenta los **cargos fijos que faltan** este mes (internet, celular, suscripciones en USD) y la **cuota del préstamo**, no solo el ritmo diario.
- A futuro puede incluir los ingresos esperados (salario detectado) para proyectar el **ahorro** del mes.

---

## 5. Arquitectura sugerida

```
            ┌──────────────────────────────────────────────┐
            │                Frontend (Next.js)            │
            │   Vista Resumen: lee endpoints, dibuja SVG   │
            └───────────────┬───────────────┬──────────────┘
                            │               │
          (rápido, determinista)     (asíncrono / bajo demanda)
                            │               │
    ┌───────────────────────▼───┐   ┌───────▼─────────────────────┐
    │ Backend (NestJS + Prisma) │   │ Agente IA                   │
    │ Agregados SQL por mes:    │   │ • Alertas diarias / por tx  │
    │ • gasto diario acumulado  │   │   → tabla `insights`        │
    │ • categorías + promedio   │   │ • Limpieza: recurrentes,    │
    │ • tarjetas (corte/pago)   │   │   transferencias, salario,  │
    │ • recurrentes guardados   │   │   comercios normalizados    │
    │ • patrimonio mensual      │   │ • Preguntas libres → número │
    └───────────────────────────┘   │   + spec de gráfica         │
                                    └─────────────────────────────┘
```

- **Gráficas base en el backend, sin agente:** ritmo del mes, tarjetas, categorías, suscripciones ya detectadas y patrimonio. Son consultas SQL y agregados: **rápidas, deterministas y sin costo de tokens**. Se pueden cachear por mes.
- **El agente va encima:** escribe datos ya limpios (categoría, marca de transferencia, recurrente, comercio normalizado, ingreso detectado) y genera **insights guardados**. Las preguntas libres son lo único que corre en tiempo real.
- Endpoints sugeridos:
  - `GET /finance/summary?month=2026-10&compare=prev`: KPIs, serie diaria y proyección.
  - `GET /finance/summary/categories?month=…`
  - `GET /finance/cards/status`
  - `GET /finance/recurring`
  - `GET /finance/net-worth?months=12`
  - `GET /finance/insights?month=…`
  - `POST /agent/ask`
- **Snapshot mensual de patrimonio:** guardar el patrimonio al cierre de cada mes para la gráfica de 12 meses, en vez de recalcularlo.

---

## 6. Prioridad

**Prerrequisito: registrar ingresos y salario.** Hoy Ingresos está en DOP 0. Sin ingresos no hay tasa de ahorro, flujo neto ni proyección de ahorro. Puede empezar como captura manual y pasar después a detección automática desde correos.

### Fase 1 · MVP (sin depender del agente)
1. Selector de mes y comparación vs. mes anterior.
2. **¿Cómo voy este mes?**: línea acumulada, presupuesto, proyección simple y "por día".
3. **Tarjetas de crédito**: utilización, corte, pago y días restantes.
4. **¿En qué se me va el dinero?**: categorías con montos y delta vs. promedio, **sin transferencias**.
5. **Gastos fijos y suscripciones**: al principio con una regla simple de recurrencia (mismo comercio y monto parecido cada mes).
6. Quitar Estadísticas y el Resumen actual del menú.

### Fase 2 · Agente
7. **Alertas del agente** guardadas (diarias y por transacción).
8. Limpieza con el agente: recurrentes, transferencias, salario y comercios.
9. Proyección con contexto de cargos fijos pendientes.

### Fase 3 · Largo plazo y exploración
10. **Deuda y patrimonio** en el tiempo, con snapshots mensuales y progreso del préstamo.
11. **Pregúntale a tu agente** con gráficas generadas.

---

## 7. Mockup

Escritorio (1440 px, página completa):

![Mockup escritorio](mockup-desktop.png)

Móvil (390 px, página completa, con barra inferior):

![Mockup móvil](mockup-mobile.png)

Archivos:
- `mockup.html`: mockup autocontenido (CSS y SVG en línea, funciona offline; responsivo a escritorio y móvil).
- `mockup-desktop.png`: escritorio a 1440 px, página completa.
- `mockup-mobile.png`: móvil a 390 px @2x, página completa.
- `mockup-mobile-viewport.png`: primera pantalla en móvil, como la vería el usuario.
