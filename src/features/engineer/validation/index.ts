import type { EngineerProgressFormValues, EngineerProofUploadFormValues } from "../types";

export function isValidEngineerProgress(values: EngineerProgressFormValues): boolean {
  return (
    values.taskId.length > 0 &&
    values.note.length > 0 &&
    values.percentComplete >= 0 &&
    values.percentComplete <= 100
  );
}

export function isValidEngineerProof(values: EngineerProofUploadFormValues): boolean {
  return values.taskId.length > 0 && values.fileUri.length > 0;
}
export const engineervalidationModule = {
  name: "engineervalidation",
} as const;
