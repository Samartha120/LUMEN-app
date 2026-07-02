export interface EngineerCacheAdapter {
  getAssignments(): Promise<string | null>;
  setAssignments(value: string): Promise<void>;
  clear(): Promise<void>;
}

export const engineerCacheAdapter: EngineerCacheAdapter = {
  async getAssignments() {
    return null;
  },
  async setAssignments() {
    return undefined;
  },
  async clear() {
    return undefined;
  },
};
export const engineerinfrastructureModule = {
  name: "engineerinfrastructure",
} as const;
