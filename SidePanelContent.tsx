import React, { useEffect, useState } from "react";
import { useMutateHandler } from "@/@logic/mutateHandlers";
import { HTTPMethod } from "@/@logic";
import { Trash } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccessControlStore } from "../../lib/store";
import { WorkspacePermission } from "../../lib/types";
import toast from "react-hot-toast";

type Props = {
  workspace: WorkspacePermission | null;
};

export default function SidePanelContent({ workspace }: Props) {
  const { activeTab } = useAccessControlStore();
  const queryClient = useQueryClient();

  const [inputValue, setInputValue] = useState("");
  const [selectedType, setSelectedType] = useState<"ad_group" | "user">("ad_group");
  const [error, setError] = useState<string | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspacePermission | null>(workspace);

  useEffect(() => {
    setCurrentWorkspace(workspace);
  }, [workspace]);

  const { mutate, isPending } = useMutateHandler({
    endUrl: "access-control/assign",
    method: HTTPMethod.POST,
    onSuccess: (_data, variables) => {
      const { action, principal_name, principal_type, access_type } = variables as any;
      const groupKey = `${access_type}s` as "owners" | "editors" | "viewers";
      const actionText = action === "add" ? "added" : "removed";
      toast.success(`Successfully ${actionText} access as ${access_type}`,{position:"top-right"});
      queryClient.invalidateQueries({ queryKey: [activeTab] });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      setInputValue("");

      setCurrentWorkspace(prev => {
        if (!prev) return prev; // safeguard for null
        const currentGroup = prev[groupKey] || [];
        const updatedGroup = action === "add"
          ? [...currentGroup, { principal_name, principal_type }]
          : currentGroup.filter(u => u.principal_name !== principal_name);

        return {
          ...prev,
          [groupKey]: updatedGroup,
        };
      });
    },

  });

  if (!currentWorkspace) return null;

  const handleAdd = (groupType: "owners" | "editors" | "viewers") => {
    if (!inputValue.trim()) {
      setError("Input cannot be empty");
      return;
    }

    if (
      selectedType === "user" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue.trim())
    ) {
      setError("Please enter a valid email address");
      return;
    }

    setError(null);

    const variables = {
      resource_type: activeTab.includes("skill") ? "skill" : "workspace",
      resource_id: currentWorkspace.resource_id,
      access_type: groupType.slice(0, -1),
      principal_type: selectedType,
      principal_name: inputValue.trim(),
      action: "add",
    };

    mutate(variables, {
      onError: () => {
        toast.error(`Error adding access as ${variables.access_type}`,{position:"top-right"});
      },
    });
  };



  const handleRemove = (
    groupType: "owners" | "editors" | "viewers",
    name: string,
    type: string
  ) => {
    const variables = {
      resource_type: activeTab.includes("skill") ? "skill" : "workspace",
      resource_id: currentWorkspace.resource_id,
      access_type: groupType.slice(0, -1),
      principal_type: type,
      principal_name: name,
      action: "deactivate",
    };

    mutate(variables, {
      onError: () => {
        toast.error(`Error removing access as ${variables.access_type}`, {
          position: "top-right",
        });
      },
    });
  };


  return (
    <div className="text-sm text-gray-800">
      <div className="mb-5">
        <p className="text-gray-600 mb-1">Selected Workspace</p>
        <input
          type="text"
          readOnly
          value={currentWorkspace.resource_name}
          className="rounded px-3 py-2 w-full text-sm bg-gray-100 text-blue-600 cursor-not-allowed"
        />
      </div>

      <div>
        <p className="text-gray-600 mb-2 font-medium">Add new member</p>
        <div className="flex gap-2 items-start">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as "ad_group" | "user")}
            className="border rounded cursor-pointer px-1 py-1.5 mb-5 text-xs text-blue-600 bg-white"
          >
            <option value="ad_group">AD Group</option>
            <option value="user">User ID</option>
          </select>
          <div className="flex-1">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={`Enter ${selectedType}`}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError(null);
                }}
                className={`border rounded px-1 py-2 w-full text-xs ${error ? "border-red-500" : "border-gray-300"
                  }`}
              />
              <button
                onClick={() => handleAdd(currentWorkspace.selectedGroup || "owners")}
                disabled={isPending || !inputValue.trim()}
                className="bg-blue-600 cursor-pointer text-white px-2.5 py-1.5 rounded hover:bg-blue-700 text-sm flex disabled:opacity-50"
              >
                + <span className="pl-2">Add</span>
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-0.5">{error}</p>}
          </div>
        </div>
      </div>

      {currentWorkspace.selectedGroup && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-600 font-medium">
              Current {currentWorkspace.selectedGroup.charAt(0).toUpperCase() + currentWorkspace.selectedGroup.slice(1)}
            </p>
          </div>
          <table className="w-full text-sm border-separate border-spacing-y-3 bg-gray-50 rounded-md">
            <thead className="text-left bg-[#EBEDFB] text-gray-700 rounded-t-md">
              <tr>
                <th className="pr-4 p-3">S.No</th>
                <th>{currentWorkspace.selectedGroup.slice(0, -1).charAt(0).toUpperCase() + currentWorkspace.selectedGroup.slice(1, -1)}</th>
                <th>Type</th>
                <th className="text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {(currentWorkspace[currentWorkspace.selectedGroup] || []).length > 0 ? (
                (currentWorkspace[currentWorkspace.selectedGroup] || []).map((user, idx) => (
                  <tr key={idx} className="text-gray-900">
                    <td className="pr-4 pl-4">{idx + 1}.</td>
                    <td>{user.principal_name}</td>
                    <td>{user.principal_type === "user" ? "User ID" : "AD Group"}</td>
                    <td className="pr-1">
                      <div className="flex justify-center items-center h-full">
                        <Trash
                          onClick={() => handleRemove(currentWorkspace.selectedGroup!, user.principal_name, user.principal_type)}
                          className="text-red-600 hover:text-red-800 cursor-pointer size-[18px]"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center text-gray-500 py-4">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
