import type { GalleryAnatomyNode } from "@/src/modules/galleries/components/catalog/types"

const BRANCH = "├── "
const LAST_BRANCH = "└── "
const PIPE = "│   "
const BLANK = "    "

function nodeLines(
  nodes: readonly GalleryAnatomyNode[],
  prefix: string
): string[] {
  return nodes.flatMap((node, index) => {
    const isLast = index === nodes.length - 1
    const children = node.children ?? []
    const childPrefix = prefix + (isLast ? BLANK : PIPE)
    const descendants = nodeLines(children, childPrefix)

    return [
      `${prefix}${isLast ? LAST_BRANCH : BRANCH}${node.name}`,
      ...descendants,
    ]
  })
}

/**
 * Dibuja la composición como árbol de texto: una línea por elemento, con la
 * raíz sin rama y sus hijos colgando con `├──`, `│` y `└──`.
 */
export function anatomyTree(nodes: readonly GalleryAnatomyNode[]): string {
  return nodes
    .flatMap((root) => [root.name, ...nodeLines(root.children ?? [], "")])
    .join("\n")
}
