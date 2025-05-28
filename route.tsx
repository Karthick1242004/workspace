import React from "react";
import { Navigate, createBrowserRouter, useParams } from "react-router-dom";
import { AuthenticatedTemplate } from "@azure/msal-react";
import Layout from "./shared/layout/layout";

const routes = [
  {
    path: "/",
    element: (
      // <AuthenticatedTemplate>
        <Layout />
      // </AuthenticatedTemplate>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/chat" />,
      },
      {
        path: "workspace",
        children: [
          {
            index: true,
            element: <Navigate to="/workspace/my-workspace" />,
          },
          {
            path: "my-workspace",
            lazy: async () => {
              const { default: Component } = await import("./shared/tab/tab");
              return { Component };
            },
          },
          {
            path: ":workspacecategory",
            lazy: async () => {
              const { default: Component } = await import("./shared/tab/tab");
              return { Component };
            },
          },
          {
            path: "edit/:id",
            lazy: async () => {
              const { default: WorkspaceEdit } = await import("./modules/workspace/dynamic-form/components/WorkspaceEdit");
              const { formConfigs } = await import("./modules/workspace/dynamic-form/formtypes");
              const Component = () => {
                const { id } = useParams();
                if (!id) {
                  return <Navigate to="/workspace" />;
                }
                return <WorkspaceEdit id={id} config={formConfigs.workspace} initialData={{}} />;
              };
              return { Component };
            },
          },
          {
            path: "skill/edit/:id",
            lazy: async () => {
              const { default: SkillEdit } = await import("./modules/workspace/dynamic-form/components/SkillEdit");
              const { formConfigs } = await import("./modules/workspace/dynamic-form/formtypes");
              const Component = () => {
                const { id } = useParams();
                if (!id) {
                  return <Navigate to="/workspace" />;
                }
                return <SkillEdit id={id} config={formConfigs.skill} initialData={{}} />;
              };
              return { Component };
            },
          },
        ],
      },
      {
        path: "chat",
        lazy: async () => {
          const { default: Component } = await import("./modules/chat/Chat");
          return { Component };
        },
      },
      {
        path: "chat/:workspaceName/:skill-name",
        lazy: async () => {
          const { default: Component } = await import("./modules/chat/Chat");
          return { Component };
        },
      },
      {
        path: "chat/:chatId",
        lazy: async () => {
          const { default: Component } = await import("./modules/chat/Chat");
          return { Component };
        },
      },
    ],
  },
  {
    path: "/auth",
    element: <Navigate to="/" />,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
];

const router = createBrowserRouter(routes);
export default router;
