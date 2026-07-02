export interface EngineerStoreState {
  readonly hydrated: boolean;
  readonly activeTaskCount: number;
  readonly mapReady: boolean;
}

export const engineerStore: EngineerStoreState = {
  hydrated: false,
  activeTaskCount: 0,
  mapReady: false,
};
export const engineerstoreModule = {
  name: "engineerstore",
} as const;
