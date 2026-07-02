export interface LoadEngineerDashboardQuery {
  readonly engineerId: string;
}

export interface UpdateEngineerProgressCommand {
  readonly taskId: string;
  readonly note: string;
  readonly percentComplete: number;
}

export interface UploadEngineerProofCommand {
  readonly taskId: string;
  readonly fileUri: string;
}
export const engineerapplicationModule = {
  name: "engineerapplication",
} as const;
