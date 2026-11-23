import { repositoryFromUrl } from "./temporary-preview";

type GalleryEntry = { repository: string; renderedAt: number; description?: string };

export function galleryEntries(input: unknown): GalleryEntry[] {
  if (!Array.isArray(input)) return [];
  return input.flatMap(item => {
    const repo = item && typeof item.repository === "string" && repositoryFromUrl(item.repository);
    return repo && Number.isSafeInteger(item.renderedAt)
      ? [{ repository: `https://github.com/${repo.owner}/${repo.name}`, renderedAt: item.renderedAt,
        description: typeof item.description === "string" ? item.description.slice(0, 140) : undefined }] : [];
  }).slice(0, 100);
}
