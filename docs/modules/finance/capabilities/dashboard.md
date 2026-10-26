# Capacidad: dashboard y estadísticas

| Path                  | Página                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/finance`            | Overview: `GET /finance/balance-sheet` net worth; `/finance/wealth` abre el desglose atómico. Ver [wealth.md](./wealth.md). En Productos el hero dibuja el anillo y la leyenda de una moneda con su selector (por defecto la base; si la base no tiene saldo, la primera que sí), y las tarjetas «Por moneda» quedan debajo como complemento; no se muestra una cifra única convertida ni se convierten monedas en el cliente. Las tarjetas de institución hacen lo mismo por moneda. `analytics/summary` cash flow periodo; spending-by-category; spending-over-time `points`; budget-status. Charts `ChartContainer` + Recharts. Empty shell no monta charts. `baseCurrency` del balance-sheet. Period selectors no cambian el snapshot. |
| `/finance/statistics` | Estadísticas (sidebar only)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

## Vocabulario de saldos

Un término, un concepto. Los nombres son los del glosario del Centro de ayuda y cada uno lleva su ayuda al lado (#293):

| Cifra                                                 | Nombre                                     | Glosario                                                  |
| ----------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| Suma de productos por moneda, en el hero              | Patrimonio neto (por moneda si hay varias) | `patrimonio`                                              |
| Cifra de una institución                              | Patrimonio (por moneda si hay varias)      | `patrimonio`                                              |
| Cobros pendientes que ya suman al total               | Por cobrar                                 | `por-cobrar`                                              |
| Cuenta                                                | Saldo                                      | `saldo`                                                   |
| Tarjeta de crédito                                    | Disponible, Deuda, Límite y Utilización    | `disponible`, `deuda`, `limite-de-credito`, `utilizacion` |
| Préstamo                                              | Deuda (lo que queda por pagar)             | `deuda`                                                   |
| Producto con saldo pendiente de comparar con el banco | Sin conciliar                              | `sin-conciliar`                                           |

No se usa «balance» para dos cifras distintas ni «balance disponible» para el crédito que queda. «Sin conciliar» lista solo productos con saldo distinto de cero, uno por línea y sin repetir la institución ni la moneda.

`FinCardBalance.balance` = crédito **disponible**, no deuda.

Evidencia: `components/dashboard/`, `hooks/use-balance-sheet.ts`, `use-analytics.ts`.
