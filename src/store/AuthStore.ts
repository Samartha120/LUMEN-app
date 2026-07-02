export interface AuthStoreState {
  readonly hydrated: boolean;
  readonly sessionActive: boolean;
}

export const authStore: AuthStoreState = {
  hydrated: false,
  sessionActive: false,
};
