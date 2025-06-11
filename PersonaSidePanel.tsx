import React, { useEffect, useState } from "react";
import { useMutateHandler } from "@/@logic/mutateHandlers";
import { HTTPMethod } from "@/@logic";
import { useQueryClient } from "@tanstack/react-query";
import { useAccessControlStore } from "../../lib/store";
import { TAB_API_MAP } from "../../lib/constants";
import { Persona } from "../../lib/types";
import { Loader2 } from "lucide-react";

type Props = {
  persona: Persona | null;
  types: "Persona" | "Category";
};

export default function PersonaSidePanel({ persona, types }: Props) {
  const { activeTab, closePanel } = useAccessControlStore();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!persona;

  useEffect(() => {
    setName(persona?.name || "");
    setDescription(persona?.description || "");
    setError(null);
  }, [persona]);

  const { mutate, isPending } = useMutateHandler({
    endUrl: isEditMode ? `${TAB_API_MAP["edit-" + types]}${persona?.id}`: TAB_API_MAP[`add-${types}`],
    method: HTTPMethod.POST,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeTab] });
      closePanel();
    },
  });

  const handleSave = () => {
    if (!name.trim() || !description.trim()) {
      setError("Name and description cannot be empty.");
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    mutate(formData);
  };

  return (
    <div className="space-y-6 text-sm font-unilever">
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          {types} Name
        </label>
        <input
          className="w-full border rounded-md px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Description
        </label>
        <textarea
          className="w-full border rounded-md px-3 py-2 text-sm"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          className="text-gray-500 border border-gray-300 px-3 py-1 rounded text-xs"
          onClick={closePanel}
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50 min-w-[60px] flex items-center justify-center gap-2"
          disabled={isPending}
          onClick={handleSave}
        >
          {isPending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </button>
      </div>
    </div>
  );
}
