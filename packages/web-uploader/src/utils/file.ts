export const fileSize = (size: number): string => {
  let number = size
  let unit = 'bype'
  if (number >= 1024 ** 3) {
    number = number / 1024 ** 3
    unit = 'G'
  } else if (number >= 1024 ** 2) {
    number = number / 1024 ** 2
    unit = 'M'
  } else if (number >= 1024) {
    number = number / 1024
    unit = 'KB'
  }
  return +number.toFixed(2) + unit
}

export const extname = (name: string) => {
  const i = name.lastIndexOf('.')
  if (i >= 0) {
    return name.substring(i).toLowerCase()
  }
  return ''
}

export const createFormData = (data: Record<string, any>) => {
  const formData = new FormData()
  for (const key in data) {
    formData.append(key, data[key])
  }
  return formData
}
