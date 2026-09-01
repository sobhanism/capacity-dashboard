export type YearMonth = string

export interface Meta {
  month: YearMonth
  effective_on: string
  timezone: string
  available_months: YearMonth[]
}

export interface AgeGroup {
  id: 'infant' | 'baby' | 'toddler' | 'preschool' | 'kindergarten' | 'school'
  label: string
}

export interface AttendanceType {
  id: 'full_time' | 'three_days_per_week' | 'two_days_per_week'
  label: string
  abbreviation: string
}

export interface Centre {
  id: string
  name: string
  abbreviation: string
}

export interface Classroom {
  id: string
  centre_id: string
  name: string
  capacity: number
  accepted_age_group_ids: string[]
}

export interface Child {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
}

export interface ClassroomAssignment {
  id: string
  classroom_id: string
  starts_on: string
  ends_on: string | null
}

export interface Enrolment {
  id: string
  centre_id: string
  starts_on: string
  ends_on: string | null
  attendance_type: 'full_time' | 'three_days_per_week' | 'two_days_per_week'
  age_group: string
  child: Child
  assignment: ClassroomAssignment | null
}

export interface CapacityOverview {
  meta: Meta
  age_groups: AgeGroup[]
  attendance_types: AttendanceType[]
  centres: Centre[]
  classrooms: Classroom[]
  enrolments: Enrolment[]
}