import React from "react";
import { ChartLine, PencilLine, Trash2, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import DeleteDialog from "@/shared/DeleteDialog";
import { Skill as StoreSkill } from "@/@logic/workspaceStore";

type Skill = StoreSkill & {
  is_favorited?: boolean;
};

interface SkillCardActionToolbarProps {
  skill: Skill;
  onEditClick: (e: React.MouseEvent) => void;
  onViewClick: (e: React.MouseEvent) => void;
  onAnalyticsClick: (e: React.MouseEvent) => void;
  onDelete: (id: string | number) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSkill?: boolean;
}

export default function SkillCardActionToolbar({
  skill,
  onEditClick,
  onViewClick,
  onAnalyticsClick,
  onDelete,
  isDialogOpen,
  setIsDialogOpen,
  isSkill = true,
}: SkillCardActionToolbarProps) {
  return (
    <div className="absolute right-5 top-4 mt-[-0.5rem] flex flex-row rounded-sm border border-blue-200 bg-white opacity-0 group-hover:opacity-100 transition">
      {(skill.access_level === "owner" || skill.access_level === "editor") && (
        <Tooltip>
          <TooltipTrigger>
            <div
              onClick={onEditClick}
              className="p-1 text-xs text-[var(--workspace-color-highlight)] rounded-l-sm cursor-pointer"
              aria-label="Edit skill"
            >
              <PencilLine size={16} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={2} disableArrow>
            <p>Edit</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {(skill.access_level === "owner" || skill.access_level === "editor") && (
        <Tooltip>
          <TooltipTrigger>
            <div
              onClick={onViewClick}
              className="p-1 text-[var(--workspace-color-highlight)] cursor-pointer"
              aria-label="Skill Stats"
              tabIndex={-1}
            >
              <Eye size={16} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={2} disableArrow>
            <p>View</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      <Tooltip>
        <TooltipTrigger>
          <div
            onClick={onAnalyticsClick}
            className="p-1 text-[var(--workspace-color-highlight)] cursor-pointer"
            aria-label="Skill Stats"
            tabIndex={-1}
          >
            <ChartLine size={16} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={2} disableArrow>
          <p>Analytics</p>
        </TooltipContent>
      </Tooltip>
      
      {skill.access_level === "owner" && (
        <Tooltip>
          <TooltipTrigger>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 text-xs text-red-500 rounded-r-sm cursor-pointer"
                  aria-label="Delete skill"
                >
                  <Trash2 size={16} />
                </div>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-[480px] bg-white"
                onClick={(e) => e.stopPropagation()}
              >
                <DeleteDialog
                  setIsDialogOpen={setIsDialogOpen}
                  handleDelete={onDelete}
                  itemType="skill"
                  skill={skill}
                  isSkill={isSkill}
                />
              </DialogContent>
            </Dialog>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={2} disableArrow>
            <p>Delete</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
 