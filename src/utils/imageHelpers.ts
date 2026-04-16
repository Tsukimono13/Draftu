const MAX_WIDTH = 1080;
const MAX_HEIGHT = 1350;
const QUALITY = 0.7;
const MAX_VIDEO_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20 MB

const formatSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
};

export const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error(`Картинка слишком большая: ${formatSize(file.size)} (макс. ${formatSize(MAX_IMAGE_BYTES)})`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", QUALITY));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const readVideo = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (file.size > MAX_VIDEO_BYTES) {
      reject(new Error(`Видео слишком большое: ${formatSize(file.size)} (макс. ${formatSize(MAX_VIDEO_BYTES)})`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const isVideo = (dataUrl: string): boolean =>
  dataUrl.startsWith("data:video");

export const processMediaFile = (file: File): Promise<string> => {
  if (file.type.startsWith("video/")) return readVideo(file);
  if (file.type.startsWith("image/")) return compressImage(file);
  return Promise.reject(new Error("Неподдерживаемый формат"));
};
