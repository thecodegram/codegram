export const formatDateMonthDayYear = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }

  return new Intl.DateTimeFormat('en-US', options).format(date)
}
