import { useEffect, useState } from "react";
import { Persona } from "./PersonaTable";
import { useMutateHandler } from "@/@logic/mutateHandlers";
import { HTTPMethod } from "@/@logic";
import { TAB_API_MAP } from "./TabAPIEndpoints";

type Props = {
  persona: Persona | null;
  types: "Persona" | "Category";
  refetch: () => void;
  onClosePanel: () => void;
};

export default function PersonaSidePanel({ persona, types, refetch, onClosePanel }: Props) {
  const [description, setDescription] = useState("");
  const [personaName, setPersonaName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!persona;

  useEffect(() => {
    setDescription(persona?.description || "");
    setPersonaName(persona?.name || "");
    setError(null);
  }, [persona]);

  const { mutate: addPersona, isPending: isAdding } = useMutateHandler({
    endUrl: TAB_API_MAP["add-" + types],
    method: HTTPMethod.POST,
    onSuccess: (data: Persona) => {
      refetch();
      onClosePanel();
    },
  });

  const { mutate: editPersona, isPending: isEditing } = useMutateHandler({
    endUrl: `${TAB_API_MAP["edit-" + types]}${persona?.id}`,
    method: HTTPMethod.POST,
    onSuccess: (_data:Persona) => {
      refetch();
      onClosePanel();
    },
  });

  const handleSave = () => {
    if (!personaName.trim() || !description.trim()) {
      setError("Input cannot be empty");
      return;
    }

    setError(null);

    const formData = new FormData();
    formData.append("name", personaName)
    formData.append("description", description)

    if (isEditMode) {
      editPersona(formData);
    } else {
      addPersona(formData);
    }
  };

  return (
    <div className="space-y-6 text-sm font-unilever">
      <div>
        <div className="text-sm text-muted-foreground mb-2">
          {isEditMode ? `Edit ${types}` : `Add New ${types}`}
        </div>
        <input
          className="w-full border rounded px-3 py-2 text-[12px]"
          value={personaName}
          onChange={(e) => setPersonaName(e.target.value)}
        />
      </div>

      <div>
        <div className="text-sm text-muted-foreground mb-2">Description</div>
        <textarea
          className="w-full border rounded px-3 py-2 text-[12px]"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && <div className="text-red-500 text-xs">{error}</div>}

      <div className="flex justify-end gap-2">
        <button
          className="text-gray-500 border border-gray-300 px-3 py-1 rounded text-xs"
          onClick={onClosePanel}
        >
          Cancel
        </button>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded text-xs disabled:opacity-50"
          disabled={isAdding || isEditing}
          onClick={handleSave}
        >
          {isAdding || isEditing ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
