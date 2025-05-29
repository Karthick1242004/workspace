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

  // Setup form with default values based on config fields (empty string for each field)
  const defaultValues = config.fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {} as Record<string, any>);

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
      // Create FormData instance
      const formData = new FormData();

      // Map of form field names to expected FormData keys
      const fieldMapping = {
        name: 'name',
        description: 'description', 
        category: 'category',
        icc: 'icc',
        cost_center: 'costCenter', // Note: cost_center maps to costCenter
        responsible_wl3: 'responsible', // Note: responsible_wl3 maps to responsible
        notes: 'note', // Note: notes maps to note
      };

      // Append all non-file fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "icon" && value !== undefined && value !== null && value !== "") {
          // Use the mapped field name or original field name
          const formDataKey = fieldMapping[key as keyof typeof fieldMapping] || key;
          formData.append(formDataKey, String(value));
        }
      });

      // Handle file upload for 'icon' (maps to 'logo' in FormData)
      let fileAdded = false;
      
      // First try to get file from form data
      if (data.icon && data.icon instanceof FileList && data.icon.length > 0) {
        formData.append("logo", data.icon[0]);
        fileAdded = true;
      } else if (data.icon && data.icon instanceof File) {
        formData.append("logo", data.icon);
        fileAdded = true;
      }
      
      // Fallback: try to get file from DOM if not found in form data
      if (!fileAdded) {
        const iconInput = document.querySelector('input[name="icon"]') as HTMLInputElement;
        if (iconInput?.files?.length) {
          formData.append("logo", iconInput.files[0]);
          fileAdded = true;
        }
      }
      
      // If still no file, append empty string
      if (!fileAdded) {
        formData.append("logo", "");
      }

      // Build the URL
      const url = `${baseURL}/workspaces/create?userId=${userId}`;

      // Configure axios to send FormData with proper headers
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Send FormData using axiosInstance
      await axiosInstance.post(url, formData, config);

      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast.success("Workspace created successfully!");
      reset();
      onClose();
      navigateTo({ path: "/workspace/my-workspace" });
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error("Failed to create workspace");
    }
  };

  useEffect(() => {
    if (!isOpen) reset(defaultValues);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-xl w-full p-6 h-fit  overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-unilever-medium">New Workspace</h2>
          <button
            onClick={() => {
              reset();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-gray-500 font-thin text-xs mb-6">
          Fill out the details below to create a new workspace seamlessly.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Dynamic fields from config */}
          <div className="space-y-2">
            {config.fields.map((field: FormFieldType) => (
              <FormFieldWithLabel
                key={field.name}
                field={field}
                control={control}
                errors={errors}
                isModal={true}
                type="workspace"
                className="block"
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              className="border-red-500 text-red-500 px-3 text-xs hover:bg-red-50"
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
              className="bg-blue-600 text-white px-3 text-xs hover:bg-blue-700 flex items-center"
              type="submit"
              disabled={isSubmitting}
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
        </form>
      </div>
    </div>
  );
};

export default WorkspaceCreate;
