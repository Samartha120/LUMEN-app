import type { EngineerProfile, EngineerProgressEntry, EngineerTaskSummary } from "../domain";
import type {
  LoadEngineerDashboardQuery,
  UpdateEngineerProgressCommand,
  UploadEngineerProofCommand,
} from "../application";

export interface EngineerApiService {
  loadDashboard(
    query: LoadEngineerDashboardQuery
  ): Promise<{ profile: EngineerProfile; tasks: EngineerTaskSummary[] }>;
  updateProgress(command: UpdateEngineerProgressCommand): Promise<EngineerProgressEntry>;
  uploadProof(command: UploadEngineerProofCommand): Promise<{ taskId: string; uploaded: boolean }>;
}

export const engineerApiService: EngineerApiService = {
  async loadDashboard() {
    return {
      profile: { id: "", name: "", email: "" },
      tasks: [],
    };
  },
  async updateProgress(command) {
    return {
      taskId: command.taskId,
      note: command.note,
      percentComplete: command.percentComplete,
    };
  },
  async uploadProof(command) {
    return {
      taskId: command.taskId,
      uploaded: false,
    };
  },
};
export const engineerservicesModule = {
  name: "engineerservices",
} as const;
