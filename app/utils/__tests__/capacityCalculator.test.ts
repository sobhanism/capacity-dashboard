import { describe, it, expect } from 'vitest'
import { calculateUsedPlaces } from '../capacityCalculator'
import type { Enrolment } from '~/types/capacity'

function enrolment(partial: Partial<Enrolment> & { attendance_type: Enrolment['attendance_type'] }): Enrolment {
  return {
    id: partial.id ?? 'e-1',
    centre_id: 'c1',
    starts_on: '2025-01-01',
    ends_on: null,
    age_group: 'toddler',
    child: {
      id: 'child-1',
      first_name: 'Test',
      last_name: 'Child',
      date_of_birth: '2021-01-01'
    },
    assignment: null,
    ...partial
  }
}

function assigned(enrolment: Enrolment): Enrolment {
  return {
    ...enrolment,
    assignment: {
      id: 'a-1',
      classroom_id: 'room-1',
      starts_on: '2025-01-01',
      ends_on: null
    }
  }
}

describe('calculateUsedPlaces', () => {
  it('یک کودک تماموقت = یک صندلی', () => {
    const enrolments = [
      assigned(enrolment({ attendance_type: 'full_time' }))
    ]
    expect(calculateUsedPlaces(enrolments)).toBe(1)
  })

  it('یک ثبتنام سه‌روزه + یک دو‌روزه = یک صندلی مشترک', () => {
    const enrolments = [
      assigned(enrolment({ attendance_type: 'three_days_per_week' })),
      assigned(enrolment({ attendance_type: 'two_days_per_week' }))
    ]
    expect(calculateUsedPlaces(enrolments)).toBe(1)
  })

  it('دو سه‌روزه = دو صندلی (چون هر کدام بدون جفت)', () => {
    const enrolments = [
      assigned(enrolment({ attendance_type: 'three_days_per_week' })),
      assigned(enrolment({ attendance_type: 'three_days_per_week' }))
    ]
    expect(calculateUsedPlaces(enrolments)).toBe(2)
  })

  it('کودک unassigned به ظرفیت حساب نمی‌شود', () => {
    const enrolments = [
      enrolment({ attendance_type: 'full_time' }) // بدون assignment
    ]
    expect(calculateUsedPlaces(enrolments)).toBe(0)
  })

  it('ترکیب تمام‌وقت + سه‌روزه + دو‌روزه', () => {
    const enrolments = [
      assigned(enrolment({ attendance_type: 'full_time' })),
      assigned(enrolment({ attendance_type: 'three_days_per_week' })),
      assigned(enrolment({ attendance_type: 'two_days_per_week' }))
    ]
    // 1 (full) + 1 (pair of 3+2) = 2
    expect(calculateUsedPlaces(enrolments)).toBe(2)
  })
})