export interface UseConnectivityState {
  readonly online: boolean;
  readonly reachable: boolean;
}

export function useConnectivity(): UseConnectivityState {
  return {
    online: false,
    reachable: false,
  } as const;
}
