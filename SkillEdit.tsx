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

interface SkillEditProps {
  id: string;
  config: FormConfig<any>;
  initialData: any;
  skillData?: any;
}

const SkillEdit: React.FC<SkillEditProps> = ({ id, config, initialData, skillData }) => {
  const { navigateTo } = useNavigation();
  const queryClient = useQueryClient();
  const formMethods = useForm({
    defaultValues: initialData,
  });
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = formMethods;
  const [filesToDelete, setFilesToDelete] = useState<number[]>([]);

  const dataSourceType = watch("category");
  const isADLS = dataSourceType === "File upload";

  const updateMutation = useMutateHandler({
    endUrl: `skills/edit-skill/${id}`,
    method: HTTPMethod.POST,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast.success("Skill updated successfully!");
      navigateTo({ path: "/workspace/my-workspace" });
    },
  });

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    const skillDetails = {
      skill_name: data.name,
      description: data.description,
      system_prompt: data.systemPrompt || "",
      files_to_delete: filesToDelete
    };
    formData.append('payload', JSON.stringify(skillDetails));

    const fileInputs = document.querySelectorAll('input[name="fileInput"]');
    if (fileInputs && fileInputs.length > 0) {
      const fileInput = fileInputs[0] as HTMLInputElement;
      if (fileInput.files && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
          formData.append("files", fileInput.files[i]);
        }
      }
    }

    const logoInputs = document.querySelectorAll('input[name="logoFile"]');
    if (logoInputs && logoInputs.length > 0) {
      const logoInput = logoInputs[0] as HTMLInputElement;
      if (logoInput.files && logoInput.files.length > 0) {
        formData.append("logo_file", logoInput.files[0]);
      }
    }

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
            {config.fields
              .filter(field =>
                field.type !== 'uploader' &&
                !(id && field.name === 'category')
              )
              .map((field) => (
                <FormFieldWithLabel
                  key={field.name}
                  field={field}
                  control={control}
                  errors={errors}
                  isModal={false}
                  type="skill"
                  id={id}
                />
              ))}
            <div className="flex flex-row gap-4 mt-4">
              {config.fields
                .filter(field =>
                  field.type === 'uploader' &&
                  ((isADLS && (field.uploaderType === 'files' || field.uploaderType === 'logo')) ||
                    (!isADLS && field.uploaderType === 'logo'))
                )
                .map((field) => (
                  <FormFieldWithLabel
                    key={field.name}
                    field={field}
                    control={control}
                    errors={errors}
                    isModal={false}
                    type="skill"
                    id={id}
                    className="flex-1"
                  />
                ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillEdit;
