import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Workspace } from "@/@logic/workspaceStore";

interface WorkspaceTabProps {
  workspaces: Workspace[];
  onTabChange?: (value: string) => void;
}

export default function WorkspaceTab({ workspaces, onTabChange }: WorkspaceTabProps) {
  const [selectedTab, setSelectedTab] = useState("created-by-me");

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    onTabChange?.(value);
  };

  const createdByMeWorkspaces = workspaces?.filter(workspace => workspace.created_by_me) || [];
  const sharedByMeWorkspaces = workspaces?.filter(workspace => !workspace.created_by_me) || [];

  return (
    <Tabs defaultValue="created-by-me" className="w-[300px]" onValueChange={handleTabChange}>
      <TabsList className="h-[36px] bg-white">
        <TabsTrigger value="created-by-me" className="cursor-pointer">
          Created by Me ({createdByMeWorkspaces.length})
        </TabsTrigger>
        <TabsTrigger value="shared-by-me" className="cursor-pointer">
          Shared by Me ({sharedByMeWorkspaces.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="created-by-me">
        {/* Content will be handled by parent component */}
      </TabsContent>
      <TabsContent value="shared-by-me">
        {/* Content will be handled by parent component */}
      </TabsContent>
    </Tabs>
  );
}
