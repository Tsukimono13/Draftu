let counter = 0;

export const generateId = (prefix = "id"): string =>
  `${prefix}_${Date.now().toString(36)}_${(counter++).toString(36)}`;
