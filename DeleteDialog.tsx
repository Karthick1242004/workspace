import { DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { DialogDescription } from '@radix-ui/react-dialog';
import React from 'react'
import BigTrash from '@/assets/icons/CheckCircle.svg'
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Skill } from '@/@logic/workspaceStore';

interface DeleteDialogProps {
  skill: {
    id: number;
    name: string;
  };
  handleDelete: (id: number) => void;
  setIsDialogOpen: (isOpen: boolean) => void;
}
  const DeleteDialog: React.FC<DeleteDialogProps> = ({
  skill,
  handleDelete,
  setIsDialogOpen,
}) => {
  const [isConfirmed, setIsConfirmed] = React.useState(false);
    return (
      <>
        <DialogHeader>
          <div className="w-full flex justify-center items-center">
            <img src={BigTrash} className="w-16 h-16" alt="Delete Logo" />
          </div>
          <DialogDescription className="text-center font-unilever-medium text-red-500">
            Are you sure you want to delete {skill.name}?
          </DialogDescription>
        </DialogHeader>
  
        <div className="font-unilever mt-3 border-b border-black pb-4">
          <p className="text-black text-xs">The following data will be lost: </p>
          <ul className="text-gray-600 text-xs">
            <li className="mt-1.5 ml-2.5">• All user chats linked to this skill</li>
            <li className="mt-1.5 ml-2.5">• Entire history and conversation threads</li>
            <li className="mt-1.5 ml-2.5">• Any associated/uploaded data source</li>
          </ul>
  
          <div className="flex flex-row items-center gap-1 mt-4 ml-2">
            <input
              type="checkbox"
              className="w-4 h-4"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setIsConfirmed(e.target.checked)}
            />
            <p className="text-xs font-unilever-medium text-black">
              I understand that this action is permanent and cannot be undone
            </p>
          </div>
        </div>
  
        <DialogFooter className="flex flex-row !justify-end !sm:justify-end !font-unilever">
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDialogOpen(false); // Close the dialog
            }}
            className="border p-2 !py-0 border-gray-400 text-xs text-black-500 mt-4 active:bg-gray-100"
          >
            Cancel
          </Button>
  
          <Button
            type="submit"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(skill.id); // Trigger delete
              setIsDialogOpen(false); // Close the dialog
            }}
            className="text-xs bg-red-400 mt-4 text-white hover:bg-red-500 disabled:opacity-50"
            disabled={!isConfirmed}
          >
            Delete Skill <Trash2 className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </>
    );
  }
  
  export default DeleteDialog;