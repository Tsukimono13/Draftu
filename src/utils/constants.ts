import type { ContentType, ContentStatus } from "../store/types";

export const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  post: "Пост",
  story: "Сторис",
  reels: "Рилс",
  carousel: "Карусель",
};

export const CONTENT_TYPE_ICON: Record<ContentType, string> = {
  post: "📸",
  story: "⏳",
  reels: "🎬",
  carousel: "🎠",
};

export const STATUS_LABEL: Record<ContentStatus, string> = {
  planned: "Запланировано",
  ready: "Готово",
  published: "Опубликовано",
};

export const STORAGE_KEY = "draftu-calendar-v2";

export const WEEKDAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const WEEKDAY_NAMES_FULL = [
  "Воскресенье", "Понедельник", "Вторник", "Среда",
  "Четверг", "Пятница", "Суббота",
];

export const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export const TAG_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: "promo", label: "Промо", color: "#ef4444" },
  { value: "lifestyle", label: "Лайфстайл", color: "#f59e0b" },
  { value: "product", label: "Продукт", color: "#3b82f6" },
  { value: "education", label: "Обучение", color: "#10b981" },
  { value: "entertainment", label: "Развлечение", color: "#8b5cf6" },
  { value: "backstage", label: "Бэкстейдж", color: "#ec4899" },
];

export const MONTH_NAMES_GENITIVE = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];
