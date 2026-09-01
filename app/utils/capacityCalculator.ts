import type { Classroom, Enrolment } from '~/types/capacity'

export function calculateUsedPlaces(enrolments: Enrolment[]): number {
  const assigned = enrolments.filter(e => e.assignment !== null)

  const fullTime = assigned.filter(e => e.attendance_type === 'full_time').length
  const threeDays = assigned.filter(e => e.attendance_type === 'three_days_per_week').length
  const twoDays = assigned.filter(e => e.attendance_type === 'two_days_per_week').length

  const pairs = Math.min(threeDays, twoDays)
  const unpaired = Math.abs(threeDays - twoDays)

  return fullTime + pairs + unpaired
}

export function getClassroomStats(classroom: Classroom, allEnrolments: Enrolment[]) {
  const enrolments = allEnrolments.filter(
    e => e.assignment?.classroom_id === classroom.id
  )

  const used = calculateUsedPlaces(enrolments)
  const available = classroom.capacity - used
  const isOverCapacity = used > classroom.capacity

  const incompatible = enrolments.filter(
    e => !classroom.accepted_age_group_ids.includes(e.age_group)
  )

  return {
    used,
    available,
    isOverCapacity,
    utilization: classroom.capacity > 0 ? Math.round((used / classroom.capacity) * 100) : 0,
    incompatibleCount: incompatible.length,
    enrolments
  }
}