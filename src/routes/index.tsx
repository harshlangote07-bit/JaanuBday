import { createFileRoute } from "@tanstack/react-router";
import { StoryApp } from "@/components/story/StoryApp";
import { story } from "@/data/story";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `Happy Birthday, ${story.recipient.name}` },
      { name: "description", content: `A small cinematic story made for ${story.recipient.name}.` },
      { property: "og:title", content: `Happy Birthday, ${story.recipient.name}` },
      { property: "og:description", content: "A little universe, made for one person." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StoryApp,
});
