const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const MS_PER_DAY = MS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY
const DAYS_PER_YEAR = 365
const DAYS_PER_MONTH = 30

function formatYearsAndMonths(years: number, months: number): string {
  const yearLabel = years === 1 ? 'yr' : 'yrs'

  if (months > 0) return `${years} ${yearLabel} ${months} ${months === 1 ? 'mo' : 'mos'}`

  return `${years} ${yearLabel}`
}

function formatMonthsOrDays(months: number, days: number): string {
  if (months > 0) return `${months} ${months === 1 ? 'month' : 'months'}`

  return `${days} ${days === 1 ? 'day' : 'days'}`
}

export function accountAge(createdAtString: string): string {
  const createdDate = new Date(createdAtString)
  const currentDate = new Date()

  const differenceMs = currentDate.getTime() - createdDate.getTime()
  const differenceDays = Math.floor(differenceMs / MS_PER_DAY)
  const differenceYears = Math.floor(differenceDays / DAYS_PER_YEAR)
  const remainingDays = differenceDays % DAYS_PER_YEAR
  const remainingMonths = Math.floor(remainingDays / DAYS_PER_MONTH)

  if (differenceYears > 0) return formatYearsAndMonths(differenceYears, remainingMonths)

  return formatMonthsOrDays(remainingMonths, differenceDays)
}
