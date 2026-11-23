"use client"

import {
  BlocksIcon,
  BracesIcon,
  CodeIcon,
  EyeIcon,
  FileCodeIcon,
  InfoIcon,
  SlidersHorizontalIcon,
} from "lucide-react"

import type {
  GalleryComponentDoc,
  GalleryVariantDemo,
} from "@/src/modules/galleries/components/catalog/types"
import { HighlightedCode } from "@/src/modules/galleries/components/highlighted-code"
import {
  anatomyTree,
  hasAnatomyChildren,
} from "@/src/modules/galleries/lib/anatomy"
import { splitSnippet } from "@/src/modules/galleries/lib/snippet"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { Badge } from "@/src/shared/components/ui/badge"
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/src/shared/components/ui/code-block"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"

function CodeSample({ code, title }: { code: string; title?: string }) {
  return (
    <CodeBlock className="w-full" size="sm">
      <CodeBlockHeader>
        <CodeBlockTitle>
          <FileCodeIcon />
          {title ?? "tsx"}
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton
            value={code}
            aria-label="Copiar código"
            className="opacity-100"
          />
        </CodeBlockActions>
      </CodeBlockHeader>
      <HighlightedCode code={code} />
    </CodeBlock>
  )
}

function PreviewFrame({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/70 p-3">
        {children}
      </div>
    </div>
  )
}

function VariantDemoGroup({
  name,
  demos,
}: {
  name: string
  demos: readonly GalleryVariantDemo[]
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="font-mono text-xs font-medium">{name}</p>
      <div className="flex flex-col divide-y divide-border/60 rounded-xl border border-border/70">
        {demos.map((demo) => (
          <div key={demo.label} className="flex min-w-0 flex-col gap-1.5 p-2">
            <p className="text-xs text-muted-foreground">{demo.label}</p>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {demo.node}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Orden de shadcn: vista previa y su código exacto, descripción, uso copiable
 * en dos bloques, composición en árbol, variantes y estados, y API.
 */
export function ComponentDocTemplate({ doc }: { doc: GalleryComponentDoc }) {
  const { importCode, usageCode } = splitSnippet(doc.snippet)
  const hasNestedComposition = hasAnatomyChildren(doc.anatomy)

  return (
    <div className="flex flex-col gap-4">
      <SummarySection title="Vista previa" icon={EyeIcon}>
        <Tabs defaultValue="preview" className="gap-3 p-2">
          <TabsList>
            <TabsTrigger value="preview">Vista previa</TabsTrigger>
            <TabsTrigger value="code">Código</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <div className="flex flex-col gap-4">
              {doc.demos.map((demo) => (
                <PreviewFrame key={demo.label} label={demo.label}>
                  {demo.node}
                </PreviewFrame>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="code">
            <div className="flex flex-col gap-3">
              {doc.demos.map((demo) => (
                <CodeSample
                  key={demo.label}
                  code={demo.code}
                  title={demo.label}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </SummarySection>

      <SummarySection title="Descripción" icon={InfoIcon}>
        <div className="flex flex-col gap-2 p-2 text-sm">
          <p>{doc.description}</p>
          <p>
            <span className="font-medium">Cuándo usarlo. </span>
            {doc.whenToUse}
          </p>
          <p>
            <span className="font-medium">Cuándo no. </span>
            {doc.whenNotToUse}
          </p>
        </div>
      </SummarySection>

      <SummarySection title="Uso" icon={CodeIcon}>
        <div className="flex flex-col gap-3 p-2">
          {importCode.length > 0 ? (
            <CodeSample code={importCode} title="importación" />
          ) : null}
          <CodeSample code={usageCode} title="uso" />
        </div>
      </SummarySection>

      <SummarySection title="Composición" icon={BlocksIcon}>
        <div className="flex flex-col gap-2 p-2">
          {doc.subcomponents.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {doc.subcomponents.map((name) => (
                <Badge key={name} variant="outline" className="font-mono">
                  {name}
                </Badge>
              ))}
            </div>
          ) : null}
          {hasNestedComposition ? (
            <pre className="w-full min-w-0 overflow-x-auto rounded-md bg-muted p-3 font-mono text-[0.7rem] leading-relaxed text-muted-foreground">
              {anatomyTree(doc.anatomy)}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">
              No tiene una composición anidada.
            </p>
          )}
        </div>
      </SummarySection>

      <SummarySection title="Variantes y estados" icon={SlidersHorizontalIcon}>
        <div className="flex flex-col gap-4 p-2">
          {doc.variants.map((variant) => {
            const demos = doc.variantDemos[variant.name] ?? []
            return demos.length > 0 ? (
              <VariantDemoGroup
                key={variant.name}
                name={variant.name}
                demos={demos}
              />
            ) : null
          })}
          <div className="overflow-x-auto">
            <table className="w-full min-w-0 text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-1 pr-3 font-medium">Propiedad</th>
                  <th className="py-1 font-medium">Valores</th>
                </tr>
              </thead>
              <tbody>
                {doc.variants.map((variant) => (
                  <tr key={variant.name} className="border-t border-border/60">
                    <td className="py-2 pr-3 align-top font-mono text-xs">
                      {variant.name}
                    </td>
                    <td className="py-2 align-top text-muted-foreground">
                      {variant.values}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SummarySection>

      <SummarySection title="API" icon={BracesIcon}>
        <div className="flex flex-col gap-3 p-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-0 text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-1 pr-3 font-medium">Prop</th>
                  <th className="py-1 pr-3 font-medium">Tipo</th>
                  <th className="py-1 font-medium">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {doc.props.map((prop) => (
                  <tr key={prop.name} className="border-t border-border/60">
                    <td className="py-2 pr-3 align-top font-mono text-xs">
                      {prop.name}
                    </td>
                    <td className="py-2 pr-3 align-top font-mono text-xs text-muted-foreground">
                      {prop.type}
                    </td>
                    <td className="py-2 align-top text-muted-foreground">
                      {prop.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground">
              Importación
            </p>
            <code className="block w-full overflow-x-auto rounded-md bg-muted px-2 py-1 font-mono text-[0.7rem] whitespace-nowrap text-muted-foreground">
              {doc.importPath}
            </code>
          </div>
        </div>
      </SummarySection>
    </div>
  )
}
