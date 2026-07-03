type UnauthorizedListener = () => void;

const unauthorizedListeners = new Set<UnauthorizedListener>();

export const authEvents = {
  onUnauthorized(listener: UnauthorizedListener) {
    unauthorizedListeners.add(listener);
    return () => {
      unauthorizedListeners.delete(listener);
    };
  },
  emitUnauthorized() {
    for (const listener of unauthorizedListeners) {
      listener();
    }
  },
};
