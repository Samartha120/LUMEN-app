export interface EngineerProfile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

export interface EngineerTaskSummary {
  readonly id: string;
  readonly title: string;
  readonly status: "assigned" | "in_progress" | "blocked" | "done";
}

export interface EngineerProgressEntry {
  readonly taskId: string;
  readonly note: string;
  readonly percentComplete: number;
}
export const engineerdomainModule = {
  name: "engineerdomain",
} as const;
