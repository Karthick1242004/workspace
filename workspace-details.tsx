import React, { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/@logic/workspaceStore";
import WorkspaceSkillCard from "./skill/workspace-skill-card";
import { DropdownMenuCheckboxes } from "@/shared/DropdownMenuCheckboxes";
import SkillCreate from "./dynamic-form/components/SkillCreate";  // Import your SkillCreate modal

export type ProcessingStatus =
  | "Pending"
  | "Inprogress"
  | "Completed"
  | "Failed";

export default function WorkspaceDetails({
  workspace,
}: {
  workspace: Workspace;
}) {
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSort, setCurrentSort] = useState<ProcessingStatus | "All">("All");

  const handleSort = (sortType: ProcessingStatus | "All") => {
    setCurrentSort(sortType);
  };

  const filteredSkills =
    workspace.skills?.filter((skill) => {
      const name = skill.name?.toLowerCase() || "";
      const desc = skill.description?.toLowerCase() || "";
      const q = searchQuery.toLowerCase();
      const matchesSearch = name.includes(q) || desc.includes(q);

      const matchesStatus =
        currentSort === "All" || skill.processing_status === currentSort;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (a.is_favorited && !b.is_favorited) return -1;
      if (!a.is_favorited && b.is_favorited) return 1;
      return 0;
    }) || [];

  return (
    <div className="w-full border border-[var(--workspace-color-highlight)] rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-md font-unilever-medium text-black pb-2">
          Skills of {workspace.name}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex flex-row gap-2">
            <DropdownMenuCheckboxes
              onSort={handleSort}
              currentSort={currentSort}
              isWorkspace={false}
            />
          </div>
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              aria-label="Search Skills"
              placeholder="Search Skills"
              className="pl-8 pr-4 py-2 border border-[#CBE0FF] rounded-md text-sm focus:outline-none focus:border-[var(--workspace-color-highlight)] w-[260px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <Button
            className="bg-[var(--workspace-color-highlight)] cursor-pointer text-white text-sm h-8 rounded-md px-3 flex items-center gap-1"
            onClick={() => setIsSkillModalOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add Skill
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 mt-3 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto min-h-[10vh] max-h-[46vh] scrollbar-hide">
        {filteredSkills.length > 0 ? (
          filteredSkills.map((skill) => (
            <WorkspaceSkillCard
              key={skill.id}
              skill={skill}
              workspaceId={workspace.id}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-4 text-gray-500">
            {searchQuery
              ? "No skills match your search"
              : "No skills available"}
          </div>
        )}
      </div>

      <SkillCreate
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        workspaceId={workspace.id}
      />
    </div>
  );
}
