import * as React from "react"
import { AArrowDown, ArrowDown01, ArrowUp01, Calendar1, ChevronDown, CheckCircle2, XCircle, Clock, GalleryVerticalEnd, CheckCheck, Hourglass, ListFilter } from "lucide-react"
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
    // { id: "A-Z", label: "Alphabetical", icon: <AArrowDown /> },
    { id: "A-Z", label: "A-Z", icon: <ArrowUp01 /> },
    { id: "Z-A", label: "Z-A", icon: <ArrowDown01 /> },
  ]

  const statusFilterOptions = [
    { id: "All", label: "All", icon: <GalleryVerticalEnd /> },
    { id: "Completed", label: "Completed", icon: <CheckCheck /> },
    { id: "Inprogress", label: "In Progress", icon: <Hourglass /> },
    { id: "Failed", label: "Failed", icon: <XCircle /> },
  ]

  const options = isWorkspace ? workspaceSortOptions : statusFilterOptions;

  const handleSortChange = (sortType: string) => {
    onSort(sortType as T);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center text-xs gap-2 px-4 h-9 font-medium text-blue-600 bg-blue-100 rounded-sm hover:bg-blue-200">
        <ListFilter size={15} className="text-blue-600" />
          {currentSort}
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit mr-7 bg-white rounded-sm shadow-lg border-none">
        {options.map((option, index) => (
          <React.Fragment key={option.id}>
            <DropdownMenuCheckboxItem
              checked={currentSort === option.id}
              onCheckedChange={() => handleSortChange(option.id)}
              className="flex font-unilever items-center px-4 py-2 text-sm cursor-pointer hover:bg-blue-100"
            >
              <span className="flex items-center">
                {/* <span className="w-10 ml-3 text-center text-xs">{option.icon}</span> */}
                <span className="text-xs">{option.label}</span>
              </span>
            </DropdownMenuCheckboxItem>
            {index < options.length - 1 && (
              <DropdownMenuSeparator className="my-1 border-gray-100" />
            )}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
