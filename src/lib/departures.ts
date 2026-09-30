// Shared logic for fixed weekly departures (Tue/Fri rotation).
// A package's `checkin_weekday` (0=Sun … 6=Sat) determines which days
// customers may depart; `nights` derives the check-out date.

const MS_PER_DAY = 86400000

/** Format a Date as a local YYYY-MM-DD string (no UTC shift). */
export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse a YYYY-MM-DD string to a local Date at midnight. */
export function parseDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Day of week (0=Sun … 6=Sat) for a YYYY-MM-DD string, local time. */
export function weekdayOf(dateStr: string): number {
  return parseDateStr(dateStr).getDay()
}

/** Given a check-in date string and night count, return the check-out date string. */
export function deriveCheckout(checkInStr: string, nights: number): string {
  const d = parseDateStr(checkInStr)
  d.setDate(d.getDate() + nights)
  return toDateStr(d)
}

/**
 * Upcoming departure dates for a package's check-in weekday.
 * Returns `count` future YYYY-MM-DD strings, starting from the next matching
 * weekday on/after `from` (default: today).
 */
export function upcomingDepartureDates(
  checkinWeekday: number,
  count = 26,
  from: Date = new Date()
): string[] {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  // Advance to the next matching weekday (today counts if it matches)
  const delta = (checkinWeekday - start.getDay() + 7) % 7
  start.setDate(start.getDate() + delta)

  const dates: string[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(start.getTime() + i * 7 * MS_PER_DAY)
    dates.push(toDateStr(d))
  }
  return dates
}

/** Human label for a weekday number. */
export function weekdayName(weekday: number): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weekday] ?? ''
}
