import { HelpGuideScreen } from "@/src/modules/help/screens/guide-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { Suspense } from "react"

type HelpGuidePageProps = {
  params: Promise<{ slug: string }>
}

export default async function HelpGuideRoute({ params }: HelpGuidePageProps) {
  const { slug } = await params
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <HelpGuideScreen slug={slug} />
    </Suspense>
  )
}
