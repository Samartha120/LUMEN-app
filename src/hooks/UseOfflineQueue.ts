export interface UseOfflineQueueState {
  readonly pendingItems: number;
  readonly syncing: boolean;
}

export function useOfflineQueue(): UseOfflineQueueState {
  return {
    pendingItems: 0,
    syncing: false,
  } as const;
}
