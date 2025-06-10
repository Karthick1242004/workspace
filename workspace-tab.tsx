import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Workspace } from "@/@logic/workspaceStore";

interface WorkspaceTabProps {
  workspaces: Workspace[];
  onTabChange?: (value: string) => void;
  value?: string;
}

export default function WorkspaceTab({ workspaces, onTabChange, value = "created-by-me" }: WorkspaceTabProps) {
  const handleTabChange = (value: string) => {
    onTabChange?.(value);
  };

  return (
    <Tabs value={value} onValueChange={handleTabChange}>
      <TabsList className="h-[38px] bg-white border border-gray-200">
        <TabsTrigger value="created-by-me" className="cursor-pointer">
          Created by Me
        </TabsTrigger>
        <TabsTrigger value="shared-by-me" className="cursor-pointer">
          Shared with Me
        </TabsTrigger>
      </TabsList>
      <TabsContent value="created-by-me">
       
      </TabsContent>
      <TabsContent value="shared-by-me">
        
      </TabsContent>
    </Tabs>
  );
}
