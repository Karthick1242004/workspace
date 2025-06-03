import * as React from "react"
import { AArrowDown, ArrowDown01, ArrowUp01, Calendar1, ChevronDown, CheckCircle2, XCircle, Clock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DropdownMenuCheckboxesProps<T extends string> {
  onSort: (sortType: T) => void;
  currentSort: T;
  isWorkspace?: boolean;
}

export function DropdownMenuCheckboxes<T extends string>({ onSort, currentSort, isWorkspace = false }: DropdownMenuCheckboxesProps<T>) {
  const workspaceSortOptions = [
    { id: "alphabetical", label: "Alphabetical", icon: <AArrowDown /> },
    { id: "lastModified", label: "Last Modified", icon: <Calendar1 /> },
  ]

  const statusFilterOptions = [
    { id: "completed", label: "Completed", icon: <CheckCircle2 /> },
    { id: "failed", label: "Failed", icon: <XCircle /> },
    { id: "inprogress", label: "In Progress", icon: <Clock /> },
  ]

  const options = isWorkspace ? workspaceSortOptions : statusFilterOptions;

  const handleSortChange = (sortType: string) => {
    onSort(sortType as T);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center text-xs gap-2 px-4 h-9 font-medium text-blue-600 bg-blue-100 rounded-xl hover:bg-blue-200">
          {isWorkspace ? "Sort" : "Filter"}
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50 bg-blue-100 rounded-xl shadow-lg border-[var(--workspace-color-highlight)]">
        {options.map((option, index) => (
          <React.Fragment key={option.id}>
            <DropdownMenuCheckboxItem
              checked={currentSort === option.id}
              onCheckedChange={() => handleSortChange(option.id)}
              className="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-50"
            >
              <span className="flex items-center">
                <span className="w-10 ml-3 text-center text-xs">{option.icon}</span>
                <span className="text-xs">{option.label}</span>
              </span>
            </DropdownMenuCheckboxItem>
            {index < options.length - 1 && (
              <DropdownMenuSeparator className="my-1 border-gray-100" />
            )}
            {isWorkspace && index === workspaceSortOptions.length - 1 && (
              <DropdownMenuSeparator className="my-1 border-gray-100" />
            )}
          </React.Fragment>
        ))}
        {isWorkspace && (
          <>
            <DropdownMenuCheckboxItem
              checked={currentSort === "ascending"}
              onCheckedChange={() => handleSortChange("ascending")}
              className="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-50"
            >
              <span className="flex items-center">
                <span className="w-10 ml-3 text-center text-xs"><ArrowUp01 /></span>
                <span className="text-xs">Ascending</span>
              </span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator className="my-1 border-gray-100" />
            <DropdownMenuCheckboxItem
              checked={currentSort === "descending"}
              onCheckedChange={() => handleSortChange("descending")}
              className="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-50"
            >
              <span className="flex items-center">
                <span className="w-10 ml-3 text-center text-xs"><ArrowDown01 /></span>
                <span className="text-xs">Descending</span>
              </span>
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
