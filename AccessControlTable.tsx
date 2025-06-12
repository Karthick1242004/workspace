import React, { useEffect, useState } from "react";
import { InfoIcon, PanelRight } from "lucide-react";
import { useAccessControlStore } from "../../lib/store";
import { WorkspacePermission } from "../../lib/types";

type Props = {
  workspaces: WorkspacePermission[];
  columns: string[];
};

export default function AccessControlTable({ workspaces, columns }: Props) {
  const { setSelectedIds, resetSelectionCounter, openPanel } = useAccessControlStore();
  const [localSelectedIds, setLocalSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    setSelectedIds(localSelectedIds);
  }, [localSelectedIds, setSelectedIds]);

  useEffect(() => {
    setLocalSelectedIds([]);
    setSelectAll(false);
  }, [resetSelectionCounter]);

  const toggleSelectAll = () => {
    if (selectAll) {
      setLocalSelectedIds([]);
    } else {
      setLocalSelectedIds(workspaces.map((p) => p.resource_id));
    }
    setSelectAll(!selectAll);
  };

  const toggleRowSelection = (id: number) => {
    setLocalSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="rounded-md bg-white overflow-x-auto h-[calc(100vh-var(--navbar-height)-33vh)] font-unilever">
      <div className="min-w-max">
        <div className="bg-gray-100 flex text-[14px] font-bold text-gray-700 border-b border-gray-200">
          <div className="min-w-[280px] p-3 flex items-center gap-2 whitespace-nowrap mr-1">
            <input type="checkbox" className="h-4 w-4 shrink-0 mt-0.5 mr-1 cursor-pointer" checked={selectAll} onChange={toggleSelectAll}/>
            {columns[0]}
          </div>
          {columns.slice(1).map((label) => (
            <div key={label} className="min-w-[220px] p-3 flex items-center gap-2 whitespace-nowrap">
              {label}
              {label!=="Workspace Name" &&
              <span title={`${label} Info`}>
                <InfoIcon className="h-4 w-4 mt-1" />
              </span>}
            </div>
          ))}
        </div>
        {/* Table Body */}
        <div className="overflow-y-auto h-full">
          {workspaces?.map((ws) => (
            <div
              key={ws.resource_id}
              className="flex text-[13px] text-gray-800 hover:bg-gray-50 transition-colors border-b border-gray-100 items-center"
            >
              <div className="min-w-[280px] p-3 flex items-center gap-2 font-light whitespace-nowrap mr-1">
              <input type="checkbox" className="h-4 w-4 shrink-0 mt-0.5 mr-1 cursor-pointer" checked={localSelectedIds.includes(ws.resource_id)} onChange={() => toggleRowSelection(ws.resource_id)} />
                <span className="overflow-hidden text-ellipsis" title={ws.resource_name}>
                  {ws.resource_name}
                </span>
              </div>
              {columns.includes("Skill Name") && (
                <div className="min-w-[220px] p-3 overflow-hidden">
                  <span className="overflow-hidden text-ellipsis block" title={ws.workspace_name}>
                    {ws.workspace_name}
                  </span>
                </div>
              )}
              {(["owners", "editors", "viewers"] as const).map((groupType) => (
                <div
                  key={groupType}
                  className="min-w-[220px] p-3 font-light group flex items-center gap-x-2"
                >
                  <div className="flex items-center gap-x-2 flex-1 overflow-hidden">
                    {(ws[groupType] || []).slice(0, 2).map((member, i) => (
                      <span
                        key={i}
                        className="text-blue-500 hover:underline cursor-pointer bg-[#005EEF0F] px-2 py-1 rounded-lg whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis flex-shrink-0"
                        title={member.principal_name}
                      >
                        {member.principal_name}
                      </span>
                    ))}

                    {(ws[groupType]?.length || 0) > 2 && (
                      <span
                        className="text-blue-500 hover:underline cursor-pointer bg-[#005EEF0F] px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0"
                        title={`${ws[groupType]!.length - 2} more`}
                      >
                        +{ws[groupType]!.length - 2}
                      </span>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0" onClick={() => openPanel("Permissions",{...ws, selectedGroup: groupType})}>
                    <PanelRight className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
