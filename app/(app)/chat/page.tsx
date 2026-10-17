import { Suspense } from "react"

import { ChatScreen } from "@/src/modules/ai/chat-screen"
import { LoadingView } from "@/src/shared/components/layout/loading-view"

export default function ChatPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <ChatScreen />
    </Suspense>
  )
}
