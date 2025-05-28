import React, { useState } from "react";
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

interface WorkspaceEditProps {
  id: string;
  config: FormConfig<any>;
  initialData: any;
}

const WorkspaceEdit: React.FC<WorkspaceEditProps> = ({ id, config, initialData }) => {
  const { navigateTo } = useNavigation();
  const queryClient = useQueryClient();
  const formMethods = useForm({
    defaultValues: initialData,
  });
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = formMethods;

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const updateMutation = useMutateHandler({
    endUrl: `workspaces/edit-workspace/${id}`,
    method: HTTPMethod.POST,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast.success("Workspace updated successfully!");
      navigateTo({ path: "/workspace/my-workspace" });
    },
  });

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'logo') {
        const fileInput = document.querySelector('input[name="logoFile"]') as HTMLInputElement;
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          formData.append('logo', fileInput.files[0]);
        }
      } else {
        formData.append(key, value !== undefined && value !== null ? String(value) : '');
      }
    });
    updateMutation.mutate(formData as any);
  };

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
                field={field}
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
