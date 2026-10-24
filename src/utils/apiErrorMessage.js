export function apiErrorMessage(error, fallback) {
  const data = error.response?.data
  return data
    ? Object.entries(data)
        .map(([key, value]) => key + ': ' + (Array.isArray(value) ? value.join(', ') : value))
        .join(' • ')
    : fallback
}
