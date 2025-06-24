import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { X, Save, Loader2, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import MultipleSelector, { Option } from "@/components/ui/multiselect";
import CustomUploader from "@/shared/Uploader";
import { formConfigs, SkillFormData } from "../formtypes";
import { FormFieldWithLabel } from "./FormField";
import { useFetchHandler } from "@/@logic/getHandlers";
import { useMutateHandler } from "@/@logic/mutateHandlers";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-hot-toast";
import { baseURL, HTTPMethod } from "@/@logic";
import { useNavigation } from "@/hooks/navigationHook";
import { AxiosError } from "axios";

interface SkillCreateProps {
  workspaceId?: number;
  userId?: string;
  workspaceName?: string;
  isOpen: boolean;
  onClose: () => void;
}

const SkillCreate: React.FC<SkillCreateProps> = ({
  workspaceId,
  userId = "1",
  workspaceName,
  isOpen,
  onClose,
}) => {
  const { id } = useParams<{ id?: string }>();
  const queryClient = useQueryClient();
  const { navigateTo } = useNavigation();
  const config = formConfigs["skill"];

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormData>({
    defaultValues: config.defaultValues,
  });

  const skillName = watch("name");
  const skillDescription = watch("description");
  const category = watch("category");

  const [selectedFormats, setSelectedFormats] = useState<Option[]>([]);
  const [formTypes, setFormTypes] = useState<Option[]>([]);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isLoadingSkill, setIsLoadingSkill] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { data: fileOptionsData, isLoading: loadingFileOptions } =
    useFetchHandler( "skills/file-options", "fileOptions",isOpen);

  const { data: aiModelsData, isLoading: loadingAiModels } =
    useFetchHandler("chats/ai-models", "ai-models-list", isOpen);

  const { data: fetchedSkillData, isLoading: loadingSkillData } =
    useFetchHandler(id ? `skills/${id}` : "", "skillData");

 let opts =[]
    if (fileOptionsData?.file_format_options?.length) {
      opts = fileOptionsData.file_format_options.map((f: string) => ({
        label: f,
        value: f,
      }));
    }

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
    if (fetchedSkillData) {
      reset({
        name: fetchedSkillData.name,
        description: fetchedSkillData.description,
        systemPrompt: fetchedSkillData.system_prompt || "",
        aiModelID: fetchedSkillData.ai_model_id || "",
        publicURL:
          fetchedSkillData.attachments?.find(
            (a: any) => a.source_type === "URL"
            
          )?.url || "",
        sharePointURL:
          fetchedSkillData.attachments?.find(
            (a: any) => a.source_type === "SharePoint"
          )?.url || "",
        category:
          fetchedSkillData.attachments?.[0]?.source_type === "ADLS"
            ? "File upload"
            : fetchedSkillData.attachments?.[0]?.source_type === "SharePoint"
              ? "Sharepoint URL"
              : "Public URL",
      });
    }
  }, [fetchedSkillData, reset]);


  useEffect(() => {
    if (fetchedSkillData && aiModelOptions.length > 0) {
      const aiModelLabel = aiModelOptions.find(model => model.value === Number(fetchedSkillData.ai_model_id))?.label || "";
      if (aiModelLabel) {
        setValue("aiModelID", aiModelLabel);
      }
    }
  }, [fetchedSkillData, aiModelOptions, setValue]);

  useEffect(() => {
    setIsLoadingSkill(loadingSkillData);
  }, [loadingSkillData]);

  const systemPromptMutation = useMutateHandler({
    endUrl: "skills/system-prompt",
    method: HTTPMethod.POST,
    onSuccess: (data: any) => {
      if (data?.data) setValue("systemPrompt", data.data);
      setIsGeneratingPrompt(false);
    },
  });

  const generateSystemPrompt = async () => {
    if (!skillName || !skillDescription) return;
    setIsGeneratingPrompt(true);
    systemPromptMutation.mutate({
      name: skillName,
      description: skillDescription,
    });
  };

  const onFilesChange = (files: File[] = []) => {
    setUploadedFiles(files);
  };

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles((files) => files.filter((f) => f !== fileToRemove));
  };

  const onSubmit = async (data: SkillFormData) => {
    try {
      const formData = new FormData();
      const selectedAiModel = aiModelOptions.find(model => model.label === data.aiModelID);
      const aiModelID = selectedAiModel ? selectedAiModel.value : null;

      formData.append("skill_name", data.name);
      formData.append("description", data.description);
      formData.append("system_prompt", data.systemPrompt || "");
      if (aiModelID !== null) {
        formData.append("aimodelID", String(aiModelID));
      }

      if (workspaceId) formData.append("workspaceId", workspaceId.toString());

      if (data.category === "File upload") {
        formData.append("dataSource", "ADLS");
        if (uploadedFiles.length > 0) {
          uploadedFiles.forEach((file) => {
            formData.append("fileInput", (file as any).data || file);
          });
        }
        formData.append(
          "fileFormats",
          selectedFormats.map((f) => f.value).join(",")
        );
      } else if (data.category === "Sharepoint URL") {
        formData.append("dataSource", "SharePoint");
        formData.append("sharePointURL", data.sharePointURL || "");
        formData.append(
          "fileFormats",
          selectedFormats.map((f) => f.value).join(",")
        );
      } else if (data.category === "Public URL") {
        formData.append("dataSource", "URL");
        formData.append("publicURL", data.publicURL || "");
      }
      const logoInput = document.querySelector(
        'input[name="logoFile"]'
      ) as HTMLInputElement;
      if (logoInput?.files?.length) {
        formData.append("logoFile", logoInput.files[0]);
      }

      const url = `${baseURL}skills/create-skill?${workspaceId ? `&workspaceId=${workspaceId}` : ""
        }`;

      await axiosInstance.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      if (workspaceId && workspaceName)
        queryClient.invalidateQueries({
          queryKey: [`${workspaceId}-${workspaceName}`],
        });

      toast.success(`Skill ${id ? "updated" : "created"} successfully!`);
      onClose();
      navigateTo({ path: "/workspace/my-workspace" });
    } catch (error) {
      const err = error as AxiosError<any>;
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Unknown error";
      toast.error(`Failed to ${id ? "update" : "create"} skill due to ${errorMessage}`);
    }
  };

  const handleClose = () => {
    reset(config.defaultValues);
    setUploadedFiles([]);
    
    onClose();
    setSelectedFormats([])
  };

  useEffect(() => {
    if (!isOpen) {
      reset(config.defaultValues);
      setUploadedFiles([]);
      
      setSelectedFormats([])
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (isLoadingSkill)
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="animate-spin" />
      </div>
    );

  const shouldShowFileUploader = category === "File upload";
  const shouldShowSharePointInput = category === "Sharepoint URL";
  const shouldShowPublicURLInput = category === "Public URL";

  const hasColumns = config.fields.some((field) => field.column);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="skill-create-title"
    >
      <div
        className={`bg-white rounded-lg  my-auto w-full ${hasColumns ? "max-w-6xl" : "max-w-xl"
          } px-2 shadow-lg flex flex-col min-h-fit max-h-[85vh]`}
      >
        <div className="flex justify-between items-center p-4 sticky top-0 bg-white z-10  border-gray-200">
          <div>
            <h2 className="text-md font-unilever-medium" id="skill-create-title">
              {id ? `Edit ${config.title}` : `New ${config.title}`}
            </h2>
            <p className="text-gray-500 font-thin text-xs">
              Fill out the details below to {id ? "edit" : "create"} a{" "}
              {config.title.toLowerCase()} seamlessly.
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-4">
          <div className="h-[1px] w-[100%] bg-black"></div>
        </div>
        <div className="p-4 overflow-y-auto flex-grow ">
          <form onSubmit={handleSubmit(onSubmit)} className=" max-h-[85vh] overflow-y-auto">
            <div className="border-b border-gray-200 pb-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  {modifiedConfig.fields
                    .filter((field) => field.column === "left")
                    .map((field) => (
                      <FormFieldWithLabel
                        key={field.name}
                        field={field}
                        control={control}
                        errors={errors}
                        isModal={true}
                        type="skill"
                        id={id}
                        skillName={skillName}
                        skillDescription={skillDescription}
                        isGeneratingPrompt={isGeneratingPrompt}
                        generateSystemPrompt={generateSystemPrompt}
                        className="block"
                      />
                    ))}
                </div>

                <div className="space-y-6 border-l border-gray-200 pl-6">
                  {modifiedConfig.fields
                    .filter(
                      (field) =>
                        field.column === "right" && field.name === "category"
                    )
                    .map((field) => (
                      <FormFieldWithLabel
                        key={field.name}
                        field={field}
                        control={control}
                        errors={errors}
                        isModal={true}
                        type="skill"
                        id={id}
                        className="block"
                      />
                    ))}

                  {(shouldShowFileUploader || shouldShowSharePointInput) && (
                    <div className="*:not-first:mt-2">
                      <Label className="block text-sm font-unilever-medium text-gray-700 mb-1">
                        Choose File Format
                      </Label>
                      {loadingFileOptions ? (
                        <div className="flex items-center justify-center h-10 border border-gray-200 rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        </div>) :
                        (
                          <MultipleSelector
                            className="cursor-pointer"
                            commandProps={{
                              label: "Select file formats",
                            }}
                            options={opts}
                            placeholder="Select file formats"
                            hideClearAllButton
                            hidePlaceholderWhenSelected
                            onChange={setSelectedFormats}
                            value={selectedFormats}
                          />
                        )}
                    </div>
                  )}

                  <div>
                    <Label
                      htmlFor={
                        shouldShowFileUploader
                          ? `skill-files-${id || "new"}`
                          : shouldShowSharePointInput
                            ? "sharePointURL"
                            : "publicURL"
                      }
                      className="block text-sm font-unilever-medium text-gray-700 mb-1"
                    >
                      {shouldShowFileUploader
                        ? "Upload Files"
                        : shouldShowSharePointInput
                          ? "SharePoint URL"
                          : "Public URL"}
                    </Label>

                    {shouldShowFileUploader ? (
                      <>
                        <CustomUploader
                          id={`skill-files-${id || "new"}`}
                          label="Choose files or drag & drop them here"
                          accept=".pdf,.docx,.doc,.txt,.xlsx,.xls"
                          multiple={true}
                          fieldName="fileInput"
                          onFilesChange={onFilesChange}
                          uploadDescription="PPT, DOCX, XLXS CSV, PDF, JPEG, PNG, TXT up to 50MB"
                        />
                      </>
                    ) : shouldShowSharePointInput ? (
                      <Controller
                        name="sharePointURL"
                        control={control}
                        rules={{
                          required: "SharePoint URL is required",
                          pattern: {
                            value:
                              /^(https?:\/\/)?([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,63}(\/[^\s]*)?$/
                            ,
                            message: "Enter a valid URL",
                          },
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            placeholder="Enter SharePoint URL"
                            className={`w-full bg-white border ${errors.sharePointURL ? "border-red-500" : "border-gray-200"
                              } !text-xs px-2 py-1 rounded`}
                          />
                        )}
                      />
                    ) : shouldShowPublicURLInput ? (
                      <Controller
                        name="publicURL"
                        control={control}
                        rules={{
                          required: "Public URL is required",
                          pattern: {
                            value:
                              /^(https?:\/\/)?([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,63}(\/[^\s]*)?$/,
                            message: "Enter a valid URL",
                          },
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            placeholder="Enter public URL"
                            className={`w-full bg-white border ${errors.publicURL ? "border-red-500" : "border-gray-200"
                              } !text-xs px-2 py-1 rounded`}
                          />
                        )}
                      />
                    ) : null}
                    {(errors.publicURL || errors.sharePointURL) && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.publicURL?.message || errors.sharePointURL?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end mt-3 space-x-2 flex-shrink-0 sticky bottom-0 bg-white border-gray-200">
              <Button
                variant="outline"
                className="border-red-500 cursor-pointer text-xs text-red-500 !px-2 hover:bg-red-50"
                type="button"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 text-xs cursor-pointer text-white hover:bg-blue-700"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    {id ? "Saving..." : "Creating...."}
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  </>
                ) : (
                  <>
                    {id ? "Save Changes" : `Create ${config.title}`}
                    <Save className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>

  );
};

export default SkillCreate;
