import { Suspense } from 'react';

import { ChatClient } from '@/src/modules/ai/components/chat-client';
import { LoadingView } from '@/src/shared/components/layout/loading-view';

export default function ChatPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <ChatClient />
    </Suspense>
  );
}
