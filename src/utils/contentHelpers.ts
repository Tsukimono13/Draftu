import type { ContentItem, ContentType } from "../store/types";
import { generateId } from "./idHelpers";

export const createContentItem = (
  type: ContentType,
  text?: string,
): ContentItem => ({
  id: generateId("c"),
  type,
  text: text ?? "",
  status: "planned",
  time: null,
  images: [],
  createdAt: new Date().toISOString(),
});
