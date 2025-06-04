import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutateHandler, Payload } from "@/@logic/mutateHandlers";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useNavigation } from "@/hooks/navigationHook";
import { FormConfig, FormField as FormFieldType } from "../formtypes"; // adjust import path
import { FormFieldWithLabel } from "./FormField"; // adjust import path
import { baseURL, HTTPMethod } from "@/@logic";
import axiosInstance from "@/utils/axiosInstance";
import { AxiosError } from "axios";
import { useFetchHandler } from "@/@logic/getHandlers";
import { useWorkspaceStore } from "@/@logic/workspaceStore";

interface WorkspaceCreateProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  config: FormConfig<any>;
}

const WorkspaceCreate: React.FC<WorkspaceCreateProps> = ({
  isOpen,
  onClose,
  userId = "1",
  config,
}) => {
  const queryClient = useQueryClient();
  const { navigateTo } = useNavigation();
  const { data: categories = [] } = useFetchHandler('workspaces/categories', 'workspace-categories');
  const roles = useWorkspaceStore((state) => state.roles);
  const isSuperAdmin = roles.includes("MSB_SUPER_ADMINS");
  const defaultValues = config.fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {} as Record<string, any>);

  const categoryOptions = React.useMemo(() => {
    if (!categories) return [];
    return categories.map((cat: any) => {
      const name = typeof cat === 'object' ? cat.name : cat;
      const cat_id = typeof cat === "object" ? cat.id : cat;
      console.log("ID",cat_id)
      if (!name) return name;
      // return name.charAt(0).toUpperCase() + name.slice(1);
      return name;
    });
  }, [categories]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues,
  });


  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      const fieldMapping = {
        name: 'name',
        description: 'description',
        category: 'category',
        icc: 'icc',
        cost_center: 'cost_center',
        responsible_wl3: 'responsible_wl3',
        notes: 'notes',
      };

      Object.entries(data).forEach(([key, value]) => {
        if (key !== "icon" && value !== undefined && value !== null && value !== "") {
          if(key==="category" && !isSuperAdmin){
            return;
          }
          const formDataKey = fieldMapping[key as keyof typeof fieldMapping] || key;
          formData.append(formDataKey, String(value));
        }
      });

      if (!isSuperAdmin) {
        formData.append("category", "private");
      } else if (data.category) {
        formData.append("category", String(data.category));
        // console.log("category id",data.category.id)
      }

      const logoInput = document.querySelector('input[name="logoFile"]') as HTMLInputElement;
      if (logoInput?.files?.length) {
        formData.append("icon", logoInput.files[0]);
      }

      const url = `${baseURL}/workspaces/create-workspace`;
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      await axiosInstance.post(url, formData, config);

      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast.success("Workspace created successfully!");
      reset();
      onClose();
      navigateTo({ path: "/workspace/my-workspace" });
    } catch (error) {
      console.error('Error in form submission:', error);
      const err = error as AxiosError<any>;
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Unknown error";
      toast.error(`Failed to create workspace due to ${errorMessage}`);
    }
  };

  useEffect(() => {
    if (!isOpen) reset(defaultValues);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-xl w-full max-h-[95vh] flex flex-col p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-unilever-medium">New Workspace</h2>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-500 font-thin text-xs mb-4 flex-shrink-0">
          Fill out the details below to create a new workspace seamlessly.
        </p>
        <div className="flex-1 overflow-y-auto mb-4 ">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              {config.fields
                .filter((field: FormFieldType) => {
                  if (field.name === "category" && !isSuperAdmin) {
                    return false;
                  }
                  return true;
                })
                .map((field: FormFieldType) => (
                  <FormFieldWithLabel
                    key={field.name}
                    field={{
                      ...field,
                      options: field.name === "category" ? categoryOptions : field.options,
                    }}
                    control={control}
                    errors={errors}
                    isModal={true}
                    type="workspace"
                    className="block"
                  />
                ))}
            </div>
          </form>
        </div>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            className="border-red-500 text-red-500 px-3 text-xs hover:bg-red-50 cursor-pointer"
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            className="bg-blue-600 text-white px-3 text-xs hover:bg-blue-700 flex items-center cursor-pointer"
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? (
              <>
                Creating...
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              </>
            ) : (
              <>
                Create Workspace
                <Save className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCreate;       
