import React, { useState } from "react";
import { useAccessControlStore } from "../lib/store";
import { useQueryClient } from "@tanstack/react-query";
import AdminContolImg from "../../../assets/icons/AdminControl.svg";
import { RotateCw, Search, Plus, X, Loader2 } from "lucide-react";
import { TABS_CONFIG, TAB_API_MAP } from "../lib/constants";
import axiosInstance from "@/utils/axiosInstance";


export default function PageHeader() {
  const { activeTab, searchText, selectedIds, setSearchText, openPanel, resetSelections } = useAccessControlStore();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const currentTabConfig = TABS_CONFIG.find((t) => t.value === activeTab);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: [activeTab] });
    setTimeout(() => setIsRefreshing(false), 1000);
  };

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
      setIsRemoving(true);
      await axiosInstance.post("access-control/remove-access", {
        resource_ids: selectedIds,
        resource_type: resourceType
      });
      queryClient.invalidateQueries({ queryKey: [activeTab] });
      resetSelections();
    } catch (error) {
      console.error("Error removing items:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <h2 className="text-lg font-semibold mt-6 mb-4 flex items-center gap-2 font-unilever">
        <img src={AdminContolImg} alt="Admin Controls" />
        Admin Controls
      </h2>
      <div className="flex items-center justify-end gap-4 mb-4 relative">
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
            className="text-sm font-medium flex items-center gap-2 cursor-pointer"
            onClick={() => openPanel(currentTabConfig.label as any, null)}
          >
            <Plus className="h-4 w-4 text-blue-600" /> {currentTabConfig.label}
          </button>
        )}
        <button
          className="text-sm font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          ) : (
            <RotateCw className="h-4 w-4 text-blue-600" />
          )} 
          Refresh
        </button>
        <div className="h-6 w-px bg-gray-300" />
        <button
          className="text-sm cursor-pointer font-medium flex items-center gap-2 text-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed"
          onClick={handleRemove}
          disabled={selectedIds.length === 0 || isRemoving}
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )} 
          Remove
        </button>
      </div>
    </>
  );
}
