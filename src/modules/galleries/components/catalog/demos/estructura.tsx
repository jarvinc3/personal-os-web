import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card"
import {
  CodeBlock,
  CodeBlockContent,
} from "@/src/shared/components/ui/code-block"
import { ScrollArea, ScrollBar } from "@/src/shared/components/ui/scroll-area"
import { Separator } from "@/src/shared/components/ui/separator"

import type {
  GalleryDemoMap,
  GalleryVariantDemoMap,
} from "@/src/modules/galleries/components/catalog/types"

export const estructuraDemos: GalleryDemoMap = {
  card: [
    {
      label: "Card completa",
      code: `
<Card className="w-full max-w-sm">
  <CardHeader>
    <CardTitle>Resumen del mes</CardTitle>
    <CardDescription>Movimientos y pendientes</CardDescription>
  </CardHeader>
  <CardContent>
    <span className="text-lg font-semibold">12 movimientos</span>
  </CardContent>
  <CardFooter>
    <span className="text-xs text-muted-foreground">
      Actualizado hoy
    </span>
  </CardFooter>
</Card>
`,
      node: (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Resumen del mes</CardTitle>
            <CardDescription>Movimientos y pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-lg font-semibold">12 movimientos</span>
          </CardContent>
          <CardFooter>
            <span className="text-xs text-muted-foreground">
              Actualizado hoy
            </span>
          </CardFooter>
        </Card>
      ),
    },
    {
      label: "Tamaño sm",
      code: `
<Card size="sm" className="w-full max-w-sm">
  <CardTitle>Ajustes rápidos</CardTitle>
  <CardContent>
    <span className="text-sm text-muted-foreground">
      Apariencia y avisos
    </span>
  </CardContent>
</Card>
`,
      node: (
        <Card size="sm" className="w-full max-w-sm">
          <CardTitle>Ajustes rápidos</CardTitle>
          <CardContent>
            <span className="text-sm text-muted-foreground">
              Apariencia y avisos
            </span>
          </CardContent>
        </Card>
      ),
    },
  ],
  separator: [
    {
      label: "Horizontal y vertical",
      code: `
<div className="flex w-full flex-col gap-3">
  <span className="text-sm">Movimientos</span>
  <Separator />
  <span className="text-sm">Presupuestos</span>
  <div className="flex h-10 items-center gap-3 text-sm">
    <span>Gastos</span>
    <Separator orientation="vertical" />
    <span>Ingresos</span>
  </div>
</div>
`,
      node: (
        <div className="flex w-full flex-col gap-3">
          <span className="text-sm">Movimientos</span>
          <Separator />
          <span className="text-sm">Presupuestos</span>
          <div className="flex h-10 items-center gap-3 text-sm">
            <span>Gastos</span>
            <Separator orientation="vertical" />
            <span>Ingresos</span>
          </div>
        </div>
      ),
    },
  ],
  "scroll-area": [
    {
      label: "Lista con scroll",
      code: `
<ScrollArea className="h-40 w-full rounded-2xl border border-border p-3">
  <div className="flex flex-col gap-2">
    {Array.from({ length: 12 }, (_, index) => (
      <div
        key={index}
        className="rounded-xl bg-muted/60 px-3 py-2 text-sm"
      >
        Movimiento {index + 1}
      </div>
    ))}
  </div>
</ScrollArea>
`,
      node: (
        <ScrollArea className="h-40 w-full rounded-2xl border border-border p-3">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 12 }, (_, index) => (
              <div
                key={index}
                className="rounded-xl bg-muted/60 px-3 py-2 text-sm"
              >
                Movimiento {index + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      ),
    },
  ],
  "code-block": [
    {
      label: "Con título y copiar",
      code: `
<CodeBlock className="w-full">
  <CodeBlockContent>
    {\`const total = formatFinanceMoney(amount, display)\`}
  </CodeBlockContent>
</CodeBlock>
`,
      node: (
        <CodeBlock className="w-full">
          <CodeBlockContent>
            {`const total = formatFinanceMoney(amount, display)`}
          </CodeBlockContent>
        </CodeBlock>
      ),
    },
  ],
}

const VARIANT_CODE = `const total = "1850.00"`

export const estructuraVariantDemos: GalleryVariantDemoMap = {
  card: {
    size: [
      {
        label: "default",
        node: (
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Resumen del mes</CardTitle>
              <CardDescription>Movimientos y pendientes</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-lg font-semibold">12 movimientos</span>
            </CardContent>
          </Card>
        ),
      },
      {
        label: "sm",
        node: (
          <Card size="sm" className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Ajustes rápidos</CardTitle>
              <CardDescription>Sin mover el foco</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-sm">3 pendientes</span>
            </CardContent>
          </Card>
        ),
      },
    ],
    className: [
      {
        label: "ajustes de ancho y composición",
        node: (
          <Card className="w-full max-w-xs">
            <CardHeader>
              <CardTitle>Ancho propio</CardTitle>
              <CardDescription>max-w-xs sobre la Card</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-sm">Composición ajustada</span>
            </CardContent>
            <CardFooter>
              <span className="text-xs text-muted-foreground">Hoy</span>
            </CardFooter>
          </Card>
        ),
      },
    ],
  },
  separator: {
    orientation: [
      {
        label: "horizontal",
        node: (
          <div className="flex w-full max-w-xs flex-col gap-2">
            <span className="text-sm">Gastos</span>
            <Separator />
            <span className="text-sm">Ingresos</span>
          </div>
        ),
      },
      {
        label: "vertical",
        node: (
          <div className="flex h-10 items-center gap-3 text-sm">
            <span>Gastos</span>
            <Separator orientation="vertical" />
            <span>Ingresos</span>
          </div>
        ),
      },
    ],
  },
  "scroll-area": {
    orientation: [
      {
        label: "vertical (barra)",
        node: (
          <ScrollArea className="h-32 w-full max-w-xs rounded-xl border border-border/70">
            <div className="flex flex-col gap-2 p-2">
              {Array.from({ length: 8 }, (_, index) => (
                <span key={index} className="text-sm">
                  Fila {index + 1}
                </span>
              ))}
            </div>
          </ScrollArea>
        ),
      },
      {
        label: "horizontal con ScrollBar",
        node: (
          <ScrollArea className="h-20 w-full max-w-xs rounded-xl border border-border/70">
            <div className="flex w-max gap-2 p-2">
              {["Mercado", "Transporte", "Servicios", "Salud"].map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-muted px-2.5 py-1 text-xs whitespace-nowrap"
                >
                  {name}
                </span>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ),
      },
    ],
  },
  "code-block": {
    variant: [
      {
        label: "default",
        node: (
          <CodeBlock className="w-full max-w-xs" size="sm">
            <CodeBlockContent>{VARIANT_CODE}</CodeBlockContent>
          </CodeBlock>
        ),
      },
      {
        label: "destructive",
        node: (
          <CodeBlock
            variant="destructive"
            className="w-full max-w-xs"
            size="sm"
          >
            <CodeBlockContent>{VARIANT_CODE}</CodeBlockContent>
          </CodeBlock>
        ),
      },
    ],
    size: [
      {
        label: "default",
        node: (
          <CodeBlock className="w-full max-w-xs">
            <CodeBlockContent>{VARIANT_CODE}</CodeBlockContent>
          </CodeBlock>
        ),
      },
      {
        label: "sm",
        node: (
          <CodeBlock size="sm" className="w-full max-w-xs">
            <CodeBlockContent>{VARIANT_CODE}</CodeBlockContent>
          </CodeBlock>
        ),
      },
    ],
    states: [
      {
        label: "con wrap",
        node: (
          <CodeBlock size="sm" className="w-full max-w-xs">
            <CodeBlockContent wrap>
              {'const nombre = "Suscripciones y servicios digitales"'}
            </CodeBlockContent>
          </CodeBlock>
        ),
      },
      {
        label: "con números de línea",
        node: (
          <CodeBlock size="sm" className="w-full max-w-xs">
            <CodeBlockContent lineNumbers>
              {'const total = "1850.00"\nconst moneda = "DOP"'}
            </CodeBlockContent>
          </CodeBlock>
        ),
      },
    ],
  },
}
