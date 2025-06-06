import React from "react";
import { PencilLine, Pin, Trash2, UserRound } from "lucide-react";
import { Workspace } from "@/@logic/workspaceStore";
import Dot from "../../shared/dot/dot";
import { useFetchHandler } from "@/@logic/getHandlers";
import { Skeleton } from "@/components/ui/skeleton";
import FallbackLogo from "../../assets/icons/logo_unilever.svg";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMutateHandler } from "@/@logic/mutateHandlers";
import { HTTPMethod } from "@/@logic";
import { useQueryClient } from "@tanstack/react-query";
import Strokepin from "@/assets/icons/Stroke Pin.svg";
import Filledpin from "@/assets/icons/Filled pin.svg";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import DeleteDialog from "@/shared/DeleteDialog";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface Props {
  data: Workspace;
  isSelected: boolean;
}

export default function WorkspaceCard({ data, isSelected }: Props) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const isSkill = false;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: workspaceLogo, isLoading } = useFetchHandler(
    `/workspaces/logo/${data.id}/download`,
    `${data.id}-${data.name}`,
    true,
    true
  );
  const imgUrl = workspaceLogo
    ? URL.createObjectURL(workspaceLogo)
    : FallbackLogo;

  const deleteMutation = useMutateHandler({
    endUrl: `workspaces/delete-workspace/${data.id}`,
    method: HTTPMethod.POST,
    onSuccess: () => {
      setIsDialogOpen(false);
      navigate("/workspace/my-workspace");
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast.success("Workspace deleted successfully!");
    },
    onError: (error: AxiosError<any>) => {
      console.error('Error deleting workspace:', error);
      const err = error as AxiosError<any>;
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Unknown error";
      toast.error(`Failed to delete workspace due to ${errorMessage}`);
    }
  });

  const handleDelete = () => {
    if (!data.id) return;
    deleteMutation.mutate({
      workspace_id: data.id
    });
  };

  const favoriteMutation = useMutateHandler({
    endUrl: "workspaces/favorite-workspace",
    method: HTTPMethod.POST,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    favoriteMutation.mutate({
      resource_id: data.id,
      resource_type: "workspace",
      is_favorite: !data.is_favorited,
    });
  };

  return (
    <div
      className={`group border rounded-lg p-4 relative transition-all duration-300 hover:border-[var(--workspace-color-highlight)] hover:shadow-[0_0_10px_rgba(96,165,250,0.5)] ${isSelected
        ? "border-[var(--workspace-color-highlight)] bg-[var(--workspace-color-highlight)] text-white"
        : "bg-white border-[#b5d3ff] text-gray-600"
        }`}
      style={{
        backgroundImage: 'url("@/assets/icons/Frame-2106257085-copy.svg")',
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom",
        backgroundBlendMode: isSelected ? "soft-light" : "normal",
        backgroundSize: "100px",
      }}
    >
      {/* {(data.access_level === "owner" || data.access_level === "editor") &&
        <button
          onClick={(e) => { e.stopPropagation(), navigate(`/workspace/edit/${data.id}`, { state: { workspace: data } }) }}
          className="absolute top-0 right-2 p-1.5 rounded-full text-xs text-[var(--workspace-color-highlight)]"
          aria-label="Edit workspace"
        >
          <span className="inline-block cursor-pointer opacity-0 bg-white border p-1 rounded-sm z-10 border-gray-200 translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0">
            <PencilLine size={16} />
          </span>
        </button>
       } */}
        {(data.access_level === "owner" || data.access_level === "editor") && 
        <div className=" mt-[-0.5rem] flex flex-row  rounded-sm">
        <Tooltip>
          <TooltipTrigger>
            <button
               onClick={(e) => { e.stopPropagation(), navigate(`/workspace/edit/${data.id}`, { state: { workspace: data } }) }}
              className="bg-white rounded-l-sm border-t border-l border-b border-blue-200 p-1 text-xs text-[var(--workspace-color-highlight)] opacity-0 group-hover:opacity-100 transition cursor-pointer"
              aria-label="Edit skill"
            >
              <PencilLine size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={2} disableArrow>
            <p>Edit</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-r-sm border-b border-t border-r border-blue-200 p-1 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  aria-label="Edit skill"
                >
                  <Trash2 size={16} />
                </button>
              </DialogTrigger>

              <DialogContent
                className="sm:max-w-[480px] bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <DeleteDialog
                  setIsDialogOpen={setIsDialogOpen}
                  handleDelete={handleDelete}
                  itemType="workspace"
                  itemName={data.name || "this workspace"}
                  id={data.id}
                  isSkill={isSkill}
                />
              </DialogContent>
            </Dialog>
          </TooltipTrigger>

          <TooltipContent side="bottom" sideOffset={2} disableArrow>
            <p>Delete</p>
          </TooltipContent>
        </Tooltip>
      </div>
        }
      <div className="flex gap-4 items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <h2
              className={`font-unilever-medium text-base truncate ${isSelected
                ? "text-white"
                : "text-[var(--workspace-color-highlight)]"
                }`}
            >
              {data.name}
            </h2>
            <button
              onClick={handleFavorite}
              className={`text-xs  cursor-pointer
                 ${!data.is_favorited ? " opacity-0 transition delay-100  group-hover:opacity-100" : "opacity-100"}`}
            >
              {data.is_favorited ? (
                <img src={Filledpin} />
              ) : (
                <img src={Strokepin} />
              )}
            </button>

          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Tooltip>
              <TooltipTrigger>
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${isSelected
                    ? "bg-white/20"
                    : "bg-[var(--workspace-color-bg-light)] text-[var(--workspace-color-highlight)]"
                    }`}
                >
                  <UserRound size={14} />
                  {data.created_by?.length > 12
                    ? `${data.created_by.substring(0, 12)}...`
                    : data.created_by}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4} disableArrow>
                <p>{data.created_by}</p>
              </TooltipContent>
            </Tooltip>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${isSelected
                ? "bg-white/20"
                : "bg-[var(--workspace-color-bg-light)] text-[var(--workspace-color-highlight)]"
                }`}
            >
              <Dot
                bgcolor={
                  isSelected
                    ? "bg-white"
                    : "bg-[var(--workspace-color-highlight)]"
                }
              />
              {data.skills?.length ?? 0} Skills
            </div>
          </div>
          <p className="text-xs font-unilever line-clamp-3">
            {data.description}
          </p>
        </div>
        {/* Logo or Skeleton */}
        <div className="flex-shrink-0 w-[80px] h-[80px] flex items-center justify-center border border-[#eaeff5] rounded-sm bg-white ml-2">
          {isLoading ? (
            <Skeleton className="w-[64px] h-[64px] rounded-sm bg-gray-200" />
          ) : (
            <img
              src={imgUrl}
              alt="Workspace Logo"
              className="w-[64px] h-[64px] p-1 object-contain rounded-sm"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </div>
  );
}
