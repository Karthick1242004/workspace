import React, { useState, useEffect } from "react";
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

interface SkillEditProps {
  id: string;
  config: FormConfig<any>;
  initialData: any;
  skillData?: any;
}

const SkillEdit: React.FC<SkillEditProps> = ({ id, config, initialData, skillData }) => {
  const { navigateTo } = useNavigation();
  const queryClient = useQueryClient();
  const [localSkillData, setLocalSkillData] = useState<any>(null);
  const [filesToDelete, setFilesToDelete] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const formMethods = useForm({ defaultValues: initialData });
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = formMethods;
  const location = useLocation();
  const accessLevel = (location.state as any)?.accessLevel;

  const { data: aiModelsData, isLoading: loadingAiModels } =
    useFetchHandler("chats/ai-models", "ai-models-list", true);

  const aiModelOptions: { label: string; value: number }[] = aiModelsData?.length 
    ? aiModelsData.map((model: any) => ({
        label: model.name,
        value: Number(model.id),
      }))
    : [];

  const modifiedConfig = {
    ...config,
    fields: config.fields.map(field => 
      field.name === "aiModelID" 
        ? { ...field, options: aiModelOptions.map(opt => opt.label), isLoading: loadingAiModels }
        : field
    )
  };

  useEffect(() => {
    async function fetchSkill() {
      try {
        const response = await axiosInstance.get(`skills/${id}`);
        const skill = response.data.data;
        setLocalSkillData(skill);

        reset({
          name: skill.name,
          description: skill.description,
          systemPrompt: skill.system_prompt || "",
          aiModelID: skill.ai_model_id || "",
          category:
            skill.attachments?.[0]?.source_type === "ADLS"
              ? "File upload"
              : skill.attachments?.[0]?.source_type === "SharePoint"
              ? "Sharepoint URL"
              : "Public URL",
        });
      } catch (error) {
        toast.error("Failed to fetch skill data");
      }
    }
    if (id) fetchSkill(); 
  }, [id, reset]);
  
  useEffect(() => {
    if (localSkillData && aiModelOptions.length > 0) {
      const aiModelLabel = aiModelOptions.find(model => model.value === Number(localSkillData.ai_model_id))?.label || "";
      if (aiModelLabel) {
        setValue("aiModelID", aiModelLabel);
      }
    }
  }, [localSkillData, aiModelOptions, setValue]);

  const dataSourceType = watch("category");
  const isADLS = dataSourceType === "File upload";

  const handleDeleteFile = (fileId: number) => {
    if (!localSkillData) return;
    setFilesToDelete(prev => [...prev, fileId]);
    setLocalSkillData({
      ...localSkillData,
      attachments: localSkillData.attachments.filter((a: any) => a.id !== fileId),
    });
  };

  const onSubmit = async (data: any) => {
    const formData = new FormData();

    // Find the actual numeric ID from the selected AI model label
    const selectedAiModel = aiModelOptions.find(model => model.label === data.aiModelID);
    const aiModelID = selectedAiModel ? selectedAiModel.value : null;

    const skillDetails = {
      skill_name: data.name,
      description: data.description,
      system_prompt: data.systemPrompt || "",
      aimodelID: aiModelID,
      files_to_delete: filesToDelete,
    };
    formData.append("payload", JSON.stringify(skillDetails));

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

    try {
      await axiosInstance.post(`skills/edit-skill/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFilesToDelete([]);
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast.success("Skill updated successfully!");
      navigateTo({ path: "/workspace/my-workspace" });
    } catch (error) {
      const err = error as AxiosError<any>;
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Unknown error";
      toast.error(`Failed to update skill due to ${errorMessage}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'PDF';
      case 'doc': case 'docx': return 'Word';
      case 'xls': case 'xlsx': return 'Excel';
      case 'ppt': case 'pptx': return 'PowerPoint';
      case 'txt': return 'Text';
      default: return extension?.toUpperCase() || 'Unknown';
    }
  };

  const hasAttachments = localSkillData?.attachments && localSkillData.attachments.length > 0;
  const isSkill = true;

  const deleteMutation = useMutateHandler({
    endUrl: 'skills/delete',
    method: HTTPMethod.POST,
    onSuccess: () => {
      setIsDialogOpen(false);
      navigateTo({path: "/workspace/my-workspace"});
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast.success("Skill deleted successfully!");
    },
    onError: (error: AxiosError<any>) => {
      console.error('Error deleting skill:', error);
      const err = error as AxiosError<any>;
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Unknown error";
      toast.error(`Failed to delete skill ${errorMessage}`);
    }
  });

  const handleDelete = () => {
    if (!id) return;
    deleteMutation.mutate({
      skill_id: id
    });
  };

  if (!localSkillData) {
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
              {(id && accessLevel==="owner") && (
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
                      itemType="skill"
                      itemName={localSkillData?.name || "this skill"}
                      id={id}
                      isSkill={isSkill}
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
            {modifiedConfig.fields
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
              {modifiedConfig.fields
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
            {id && localSkillData && (
              <div className="mt-6">
                <h2 className="text-xs font-unilever-medium text-gray-600 mb-2">Uploaded Files</h2>
                <div className="bg-white rounded-md shadow-sm overflow-hidden">
                  {hasAttachments ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#c9d0fe]">
                          <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                              Attachment
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {localSkillData?.attachments.map((file: any) => (
                            <tr key={file.id} className="group bg-[#f6f8ff]">
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600">
                                {formatDate(file.uploaded_at)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600">
                                {getFileType(file.name)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs">
                                <a href={file.path_url} className="text-blue-600 hover:underline">
                                  {file.name}
                                </a>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                {isADLS && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteFile(file.id)}
                                    className="disabled:opacity-50 cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-red-500" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500">No files available</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillEdit;
