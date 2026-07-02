export interface EngineerProgressFormValues {
  readonly taskId: string;
  readonly note: string;
  readonly percentComplete: number;
}

export interface EngineerProofUploadFormValues {
  readonly taskId: string;
  readonly fileUri: string;
}
export const engineertypesModule = {
  name: "engineertypes",
} as const;
