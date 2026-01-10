import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexus - Capstone Project Monitor",
    short_name: "Nexus",
    description:
      "Internal project progress monitoring system for capstone teams using Water-Scrum-Fall methodology",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    categories: ["productivity", "business"],
    screenshots: [
      {
        src: "/screenshot-dashboard.png",
        sizes: "540x720",
        type: "image/png",
        form_factor: "narrow",
      },
      {
        src: "/screenshot-dashboard-wide.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
      },
    ],
    icons: [
      {
        src: "/ui-dark.png",
        sizes: "any",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "View project progress dashboard",
        url: "/dashboard",
        icons: [{ src: "/shortcut-dashboard.png", sizes: "96x96" }],
      },
      {
        name: "Sprints",
        short_name: "Sprints",
        description: "Manage sprints and tasks",
        url: "/sprints",
        icons: [{ src: "/shortcut-sprints.png", sizes: "96x96" }],
      },
    ],
  };
}
