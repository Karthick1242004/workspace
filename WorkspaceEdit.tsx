import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Save, CircleArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormConfig } from "../formtypes";
import { FormFieldWithLabel } from "./FormField";
import { UseFormReturn, useForm } from "react-hook-form";
import { useNavigation } from "@/hooks/navigationHook";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import toast from "react-hot-toast";
import { HTTPMethod } from "@/@logic";
import { useMutateHandler } from "@/@logic/mutateHandlers";
import { useFetchHandler } from "@/@logic/getHandlers";
import { AxiosError } from "axios";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import DeleteDialog from "@/shared/DeleteDialog";
import RegularFormSkeleton from "@/modules/workspace/dynamic-form/components/RegularFormSkeleton";
import { useLocation } from "react-router-dom";

interface WorkspaceEditProps {
  id: string;
  config: FormConfig<any>;
  initialData: any;
}

async function fetchWorkspace(id: string, setLocalWorkspaceData: React.Dispatch<React.SetStateAction<any>>, reset: UseFormReturn<any>['reset']) {
  try {
    const response = await axiosInstance.get(`workspaces/${id}`);
    const workspace = response.data.data;
    setLocalWorkspaceData(workspace);
    reset({
      name: workspace.name,
      description: workspace.description,
      category: workspace.category?.toLowerCase(),
      icc: workspace.icc,
      costCenter: workspace.costCenter,
      responsible: workspace.responsible,
      note: workspace.note,
    });
  } catch (error) {
    toast.error("Failed to fetch workspace data");
  }
}

const WorkspaceEdit: React.FC<WorkspaceEditProps> = ({ id, config, initialData }) => {
  const { navigateTo } = useNavigation();
  const queryClient = useQueryClient();
  const [localWorkspaceData, setLocalWorkspaceData] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: categories = [] } = useFetchHandler('workspaces/categories', 'workspace-categories');
  const formMethods = useForm({ defaultValues: initialData });
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = formMethods;
  const location = useLocation();
  const workspaceDataFromState = location.state?.workspace;

  const categoryOptions = React.useMemo(() => {
    if (!categories) return [];
    const options = categories.map((cat: any) => {
      const value = typeof cat === 'object' ? cat.name : cat;
      return value.toLowerCase();
    });
    return options;
  }, [categories]);

  useEffect(() => {
    if (workspaceDataFromState) {
      setLocalWorkspaceData(workspaceDataFromState);
      reset({
        name: workspaceDataFromState.name,
        description: workspaceDataFromState.description,
        category: workspaceDataFromState.category?.toLowerCase(),
        icc: workspaceDataFromState.icc,
        costCenter: workspaceDataFromState.costCenter,
        responsible: workspaceDataFromState.responsible,
        note: workspaceDataFromState.note,
      });
    } else if (id) {
      fetchWorkspace(id, setLocalWorkspaceData, reset);
    }
  }, [id, reset, workspaceDataFromState]);

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("icc", data.icc);
    formData.append("costCenter", data.costCenter);
    formData.append("responsible", data.responsible);
    formData.append("note", data.note);

    const logoInput = document.querySelector('input[name="logoFile"]') as HTMLInputElement;
    if (logoInput && logoInput.files && logoInput.files.length > 0) {
      formData.append('logo', logoInput.files[0]);
    }

    try {
      await axiosInstance.post(`workspaces/edit-workspace/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast.success("Workspace updated successfully!");
      navigateTo({ path: "/workspace/my-workspace" });
    } catch (error) {
      const err = error as AxiosError<any>;
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Unknown error";
      toast.error(`Failed to update workspace due to ${errorMessage}`);
    }
  };

  const deleteMutation = useMutateHandler({
    endUrl: 'workspaces/delete',
    method: HTTPMethod.POST,
    onSuccess: () => {
      setIsDialogOpen(false);
      navigateTo({path: "/workspace/my-workspace"});
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast.success("Workspace deleted successfully!");
    },
    onError: (error: AxiosError<any>) => {
      console.error('Error deleting workspace:', error);
      toast.error("Failed to delete workspace");
    }
  });

  const handleDelete = () => {
    if (!id) return;
    deleteMutation.mutate({
      workspace_id: id
    });
  };

  if (!workspaceDataFromState && id && !localWorkspaceData) {
    return <RegularFormSkeleton />;
  }

  return (
    <div className="font-unilever h-[var(--edit-content-height)] bg-[#F4FAFC] shadow-lg overflow-y-auto mt-2 rounded-xl w-full">
      <div className="max-w-full mx-auto px-5 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 ml-[-1%] text-[12px] cursor-pointer"
          onClick={() => navigateTo({ path: "/workspace/my-workspace" })}
        >
          <CircleArrowLeft size={12} className="mt-1" />
          Back
        </Button>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <h1 className="text-md font-unilever-medium flex items-center">
                <Pencil className="h-5 w-5 mr-2" /> Edit {config.title}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {id && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-500 cursor-pointer text-xs text-red-500 !px-2 hover:bg-red-50"
                      type="button"
                    >
                      Delete {config.title}
                      <Trash2 className="h-4 w-4 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[480px] bg-white">
                    <DeleteDialog
                      setIsDialogOpen={setIsDialogOpen}
                      handleDelete={handleDelete}
                      itemType="workspace"
                      itemName={localWorkspaceData?.name || "this workspace"}
                      id={id}
                    />
                  </DialogContent>
                </Dialog>
              )}

              <Button
                className="bg-blue-600 text-xs text-white cursor-pointer hover:bg-blue-700"
                type="submit"
                disabled={isSubmitting}
              >
                Save Changes
                <Save className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {config.fields.map((field) => (
              <FormFieldWithLabel
                key={field.name}
                field={{
                  ...field,
                  options: field.name === 'category' ? categoryOptions : field.options
                }}
                control={control}
                errors={errors}
                isModal={false}
                type="workspace"
                id={id}
              />
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceEdit;
