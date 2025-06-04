import { create } from "zustand";
import { ProcessingStatus } from "../modules/workspace/workspace-details";

// Define the Workspace interface reflecting a single workspace entity
interface Audit {
  createdAt?: string;
  updatedAt?: string;
}

export interface Skill extends Audit {
  is_favorited: any;
  logo: string | undefined;
  id: number;
  name: string;
  domain: string;
  description: string;
  processing_status: ProcessingStatus;
  is_processed_for_rag: boolean;
  workspace?: string | number;
  updated_at?: string;
  questions: string;
  chat_sessions_count:number;
  created_by: string;
}
export interface Workspace extends Audit {
  id: number;
  name: string;
  description?: string;
  category?: string;
  icc?: string;
  cost_center?: string;
  responsible_wl3?: string;
  skills: Skill[];
  created_by: string
}

// Define the Zustand store interface for workspaces
interface WorkspaceStore {
  setIsLoading: any;
  workspaces: Workspace[];
  isLoading: boolean;
  selectedWorkspaceId: number;
  setSelectedWorkspaceId: (workspaceId: number) => void;
  selectedSkillId: number;
  setSelectedSkillId: (skillId: number) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (workspace: Workspace) => void;
  clearWorkspaces: () => void;
  updateSkillStatus: (
    skillId: number,
    processing_status: ProcessingStatus,
    is_processed_for_rag: boolean,
    last_modified: string
  ) => void;
  removeSkill: (skillId: number) => void;
  roles: string[];
  setRoles: (roles: string[]) => void;
}

// Create the Zustand store with initial state and setters
export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  workspaces: [],
  isLoading:false,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  selectedWorkspaceId: 0,
  setSelectedWorkspaceId: (workspaceId: number) =>
    set({ selectedWorkspaceId: workspaceId }),
  selectedSkillId: 0,
  setSelectedSkillId: (skillId: number) => set({ selectedSkillId: skillId }),
  // Set the entire workspaces array
  setWorkspaces: (workspaces: Workspace[]) => set({ workspaces }),
  // Add a new workspace to the array
  addWorkspace: (workspace: Workspace) =>
    set((state: WorkspaceStore) => ({
      workspaces: [...state.workspaces, workspace],
    })),
  // Update an existing workspace by matching workspaceId
  updateWorkspace: (workspace: Workspace) =>
    set((state: WorkspaceStore) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === workspace.id ? { ...w, ...workspace } : w
      ),
    })),
  // Clear all workspaces
  clearWorkspaces: () => set({ workspaces: [] }),
  // Update a specific skill's processing status
  updateSkillStatus: (
    skillId: number,
    processing_status: ProcessingStatus,
    is_processed_for_rag: boolean,
    last_modified: string
  ) =>
    set((state: WorkspaceStore) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        skills: workspace.skills.map((skill) =>
          skill.id === skillId
            ? {
                ...skill,
                processing_status,
                is_processed_for_rag,
                updated_at: last_modified,
              }
            : skill
        ),
      })),
    })),
    removeSkill: (skillId: number) =>
      set((state: WorkspaceStore) => ({
        workspaces: state.workspaces.map((workspace) => ({
          ...workspace,
          skills: workspace.skills.filter((skill) => skill.id !== skillId),
        })),
      })),
      roles: [],
      setRoles: (roles: string[]) => set({ roles }),
}));
