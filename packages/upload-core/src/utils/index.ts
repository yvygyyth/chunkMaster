export const createFormData = (data: Record<string, any>) => {
    const formData = new FormData()
    for (const key in data) {
      formData.append(key, data[key])
    }
    return formData
}

export function mergeObjects<T extends object, U extends object>(
  obj1: T,
  obj2: U
): T & U {
  const merged = { ...obj1 } as T & U;
  Object.entries(obj2).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      merged[key as keyof (T & U)] = value as any;
    }
  });
  return merged;
}