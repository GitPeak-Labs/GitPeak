import { expect, test, describe } from 'bun:test'
import { accountAge } from './account-age'

function dateYearsAndMonthsAgo(yearsAgo: number, monthsAgo: number): Date {
  const dateInPast = new Date()
  dateInPast.setFullYear(dateInPast.getFullYear() - yearsAgo)
  dateInPast.setMonth(dateInPast.getMonth() - monthsAgo)

  return dateInPast
}

function dateMonthsAgo(monthsAgo: number): Date {
  const dateInPast = new Date()
  dateInPast.setMonth(dateInPast.getMonth() - monthsAgo)

  return dateInPast
}

describe('account-age', () => {
  test('formats multi-year age correctly', () => {
    const oneYearTwoMonthsAgo = dateYearsAndMonthsAgo(1, 2)

    expect(accountAge(oneYearTwoMonthsAgo.toISOString())).toBe('1 yr 2 mos')
  })

  test('formats less than a year correctly', () => {
    const fourMonthsAgo = dateMonthsAgo(4)

    expect(accountAge(fourMonthsAgo.toISOString())).toBe('4 months')
  })
})
