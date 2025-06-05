import React, { useState, useEffect } from "react";
import WorkspaceCard from "./workspace-card";
import WorkspaceDetails from "./workspace-details";
import { useWorkspaceStore, Workspace } from "@/@logic/workspaceStore";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import WorkspaceCreateModal from "./dynamic-form/components/WorkspaceCreate"; // Import the modal
import { useForm } from "react-hook-form";
import { formConfigs, WorkspaceFormData } from "./dynamic-form/formtypes";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@/hooks/navigationHook";
import { DropdownMenuCheckboxes } from "@/shared/DropdownMenuCheckboxes";

interface WorkspaceProp {
  workspacesData: Workspace[];
  isLoading: boolean;
  selectedCategory: string; 
}

export default function WorkSpace({ workspacesData,selectedCategory }: WorkspaceProp) {
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [columnCount, setColumnCount] = useState(3);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortedWorkspaces, setSortedWorkspaces] = useState<Workspace[]>([]);
  const [currentSort, setCurrentSort] = useState("Alphabetical");

  const queryClient = useQueryClient();
  const { navigateTo } = useNavigation();
  const config = formConfigs["workspace"];
  const formMethods = useForm<WorkspaceFormData>({
    defaultValues: config.defaultValues,
  });

  useEffect(() => {
    const updateColumnCount = () => {
      if (window.innerWidth >= 1280) {
        setColumnCount(3);
      } else {
        setColumnCount(2);
      }
    };
    updateColumnCount();
    window.addEventListener("resize", updateColumnCount);
    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  useEffect(() => {
    if (workspacesData) {
      handleSort(currentSort);
    }
  }, [workspacesData, currentSort]);

  const handleSort = (sortType: string) => {
    let sorted = [...workspacesData];


    sorted.sort((a, b) => {
      if (a.is_favorited && !b.is_favorited) return -1;
      if (!a.is_favorited && b.is_favorited) return 1;
      return 0;
    });


    switch (sortType) {
      case "Alphabetical":
      case "Ascending":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Descending":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setSortedWorkspaces(sorted);
    setCurrentSort(sortType);
  };

  const handleSelectCard = (idx: number) => {
    setSelectedIndex(selectedIndex === idx ? null : idx);
  };

  const getRowNumber = (index: number) => {
    return Math.floor(index / columnCount);
  };

  const renderCards = () => {
    if (!sortedWorkspaces) return null;

    let content: React.ReactNode[] = [];
    let currentRow = -1;

    sortedWorkspaces.forEach((value: Workspace, idx: number) => {
      const rowNumber = getRowNumber(idx);
      if (rowNumber !== currentRow) {
        currentRow = rowNumber;
        if (content.length > 0) {
          const prevRowSelectedIndex =
            selectedIndex !== null &&
            getRowNumber(selectedIndex) === rowNumber - 1
              ? selectedIndex
              : null;
          if (prevRowSelectedIndex !== null) {
            content.push(
              <div
                key={`details-${rowNumber - 1}`}
                className="col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-3 w-full"
              >
                <WorkspaceDetails
                  workspace={sortedWorkspaces[prevRowSelectedIndex]}
                />
              </div>
            );
          }
        }
      }

      content.push(
        <div key={idx} className="w-full">
          <div
            className="cursor-pointer transition-all duration-300 ease-in-out"
            onClick={() => handleSelectCard(idx)}
          >
            <WorkspaceCard
              data={value as unknown as Workspace}
              isSelected={selectedIndex === idx}
            />
          </div>
        </div>
      );

      if (
        idx === sortedWorkspaces.length - 1 &&
        selectedIndex !== null &&
        getRowNumber(selectedIndex) === rowNumber
      ) {
        content.push(
          <div
            key={`details-${rowNumber}`}
            className="col-span-1 font-unilever md:col-span-2 lg:col-span-2 xl:col-span-3 w-full"
          >
            <WorkspaceDetails workspace={sortedWorkspaces[selectedIndex]} />
          </div>
        );
      }
    });

    return content;
  };

  const renderSkeleton = () => {
    return Array(6)
      .fill(0)
      .map((_, index) => (
        <div key={`skeleton-${index}`} className="w-full">
          <Skeleton className="h-[170px] w-full rounded-lg" />
        </div>
      ));
  };

  return (
    <div className="p-3 rounded-xl max-w-[1300px] mx-auto flex flex-col h-full shadow-md overflow-y-auto font-unilever bg-gray-50">
      <div className="flex justify-between">
        <p className="font-semibold mb-3 font-unilever-medium text-[14px] text-[#4B4B53]">
          AI Workspaces and Skills
        </p>
        <div className="flex flex-row gap-2">
          <DropdownMenuCheckboxes onSort={handleSort} currentSort={currentSort} isWorkspace={true}/>
          <button
            className="mb-3 cursor-pointer font-unilever text-xs flex flex-row gap-1 justify-center items-center text-white bg-[var(--workspace-color-highlight)] px-2 py-2 rounded-sm"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            Add Workspaces
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto">
        {isLoading ? renderSkeleton() : renderCards()}
      </div>

      <WorkspaceCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={config}
        selectedCategory={selectedCategory} 
      />
    </div>
  );
}
