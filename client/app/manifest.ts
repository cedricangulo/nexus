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
		icons: [
			{
				src: "/favicon.ico",
				sizes: "any",
				type: "image/png",
			},
		],
	};
}
