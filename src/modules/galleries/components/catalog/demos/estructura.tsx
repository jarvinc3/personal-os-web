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
import { ScrollArea } from "@/src/shared/components/ui/scroll-area"
import { Separator } from "@/src/shared/components/ui/separator"

import type { GalleryDemoMap } from "@/src/modules/galleries/components/catalog/types"

export const estructuraDemos: GalleryDemoMap = {
  card: [
    {
      label: "Card completa",
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
