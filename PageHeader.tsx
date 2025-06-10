import React from "react";
import { useAccessControlStore } from "../lib/store";
import { useMutateHandler } from "@/@logic/mutateHandlers";
import { HTTPMethod } from "@/@logic";
import { useQueryClient } from "@tanstack/react-query";
import AdminContolImg from "../../../assets/icons/AdminControl.svg";
import { RotateCw, Search, Plus, X } from "lucide-react";
import { TABS_CONFIG, TAB_API_MAP } from "../lib/constants";
import axiosInstance from "@/utils/axiosInstance";

type RemovePayload = {
  resource_ids: (number | string)[];
  resource_type: "persona" | "category" | "skill" | "workspace";
};

export default function PageHeader() {
  const { activeTab, searchText, selectedIds, setSearchText, openPanel, resetSelections } = useAccessControlStore();
  const queryClient = useQueryClient();

  const currentTabConfig = TABS_CONFIG.find((t) => t.value === activeTab);

  const handleRemove = async () => {
    if (selectedIds.length === 0) return;

    const resourceType = activeTab === "persona" 
      ? "persona" 
      : activeTab === "category" 
      ? "category" 
      : activeTab.includes("skill") 
      ? "skill" 
      : "workspace";

    try {
      await axiosInstance.post("access-control/remove-access", {
        resource_ids: selectedIds,
        resource_type: resourceType
      });
      queryClient.invalidateQueries({ queryKey: [activeTab] });
      resetSelections();
    } catch (error) {
      console.error("Error removing items:", error);
    }
  };

  return (
    <>
      <h2 className="text-lg font-semibold mt-6 mb-4 flex items-center gap-2 font-unilever">
        <img src={AdminContolImg} alt="Admin Controls" />
        Admin Controls
      </h2>
      <div className="flex items-center justify-end gap-4 mb-4">
        <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-md px-3 py-1.5">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 text-sm focus:outline-none bg-transparent"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        {currentTabConfig?.canAdd && (
          <button
            className="text-sm font-medium flex items-center gap-2"
            onClick={() => openPanel(currentTabConfig.label as any, null)}
          >
            <Plus className="h-4 w-4 text-blue-600" /> {currentTabConfig.label}
          </button>
        )}
        <button
          className="text-sm font-medium flex items-center gap-2"
          onClick={() => queryClient.invalidateQueries({ queryKey: [activeTab] })}
        >
          <RotateCw className="h-4 w-4 text-blue-600" /> Refresh
        </button>
        <div className="h-6 w-px bg-gray-300" />
        <button
          className="text-sm font-medium flex items-center gap-2 text-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed"
          onClick={handleRemove}
          disabled={selectedIds.length === 0}
        >
          <X className="h-4 w-4" /> Remove
        </button>
      </div>
    </>
  );
}
