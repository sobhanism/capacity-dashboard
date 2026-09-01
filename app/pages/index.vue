<script setup lang="ts">
import type { Centre, Classroom } from '~/types/capacity'
import { getClassroomStats } from '~/utils/capacityCalculator'

const selectedMonth = ref<string | undefined>(undefined)

const { data, pending, error, refresh } = useCapacity(selectedMonth)

const classroomsByCentre = computed(() => {
  if (!data.value) return {} as Record<string, Classroom[]>

  const map: Record<string, Classroom[]> = {}

  for (const classroom of data.value.classrooms) {
    const list = map[classroom.centre_id] ?? []
    list.push(classroom)
    map[classroom.centre_id] = list
  }

  return map
})

const unassignedEnrolments = computed(() => {
  if (!data.value) return []
  return data.value.enrolments.filter(e => e.assignment === null)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-8">
    <header class="mb-8">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900">
        Capacity Management Dashboard
      </h1>
      <p class="text-gray-600 mt-1">
        Overview of centres, classrooms and enrolment capacity
      </p>
    </header>

    <div v-if="pending" class="text-center py-20 text-gray-500">
      Loading capacity data...
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
      <p class="font-semibold">Failed to load data</p>
      <p class="text-sm mt-1">{{ error.message }}</p>
      <button
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        @click="refresh()"
      >
        Try again
      </button>
    </div>

    <div v-else-if="data && data.centres.length === 0" class="text-center py-20 text-gray-500">
         No capacity data available for this period.
    </div>

    <div v-else-if="data" class="space-y-8">
      <div class="bg-white rounded-lg shadow-sm p-4 flex flex-wrap items-center gap-4">
        <label class="font-medium text-gray-700">Reporting month:</label>
        <select
          v-model="selectedMonth"
          class="border border-gray-300 rounded px-3 py-2"
        >
          <option :value="undefined">
            Current ({{ data.meta.month }})
          </option>
          <option
            v-for="month in data.meta.available_months"
            :key="month"
            :value="month"
          >
            {{ month }}
          </option>
        </select>
        <span class="text-sm text-gray-500">
          Effective on: {{ data.meta.effective_on }}
        </span>
      </div>

      <div
        v-for="centre in data.centres"
        :key="centre.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div class="bg-gray-100 px-5 py-3 border-b">
          <h2 class="text-lg font-semibold text-gray-800">
            {{ centre.name }}
            <span class="text-sm font-normal text-gray-500 ml-2">({{ centre.abbreviation }})</span>
          </h2>
        </div>

        <div class="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="classroom in classroomsByCentre[centre.id] || []"
            :key="classroom.id"
            class="border rounded-lg p-4"
            :class="{
              'border-red-300 bg-red-50': getClassroomStats(classroom, data.enrolments).isOverCapacity,
              'border-amber-300 bg-amber-50': getClassroomStats(classroom, data.enrolments).incompatibleCount > 0 && !getClassroomStats(classroom, data.enrolments).isOverCapacity,
              'border-gray-200': !getClassroomStats(classroom, data.enrolments).isOverCapacity && getClassroomStats(classroom, data.enrolments).incompatibleCount === 0
            }"
          >
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-medium text-gray-900">Room {{ classroom.name }}</h3>
              <span
                v-if="getClassroomStats(classroom, data.enrolments).isOverCapacity"
                class="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-700"
              >
                Over capacity
              </span>
              <span
                v-else-if="getClassroomStats(classroom, data.enrolments).incompatibleCount > 0"
                class="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700"
              >
                Age mismatch
              </span>
            </div>

            <div class="text-sm text-gray-600 space-y-1">
              <p>
                Capacity:
                <span class="font-medium text-gray-900">{{ classroom.capacity }}</span>
              </p>
              <p>
                Used:
                <span class="font-medium text-gray-900">
                  {{ getClassroomStats(classroom, data.enrolments).used }}
                </span>
              </p>
              <p>
                Available:
                <span
                  class="font-medium"
                  :class="getClassroomStats(classroom, data.enrolments).available < 0 ? 'text-red-600' : 'text-green-600'"
                >
                  {{ getClassroomStats(classroom, data.enrolments).available }}
                </span>
              </p>
              <p>
                Utilization:
                <span class="font-medium">
                  {{ getClassroomStats(classroom, data.enrolments).utilization }}%
                </span>
              </p>
            </div>

            <div class="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="getClassroomStats(classroom, data.enrolments).isOverCapacity ? 'bg-red-500' : 'bg-blue-500'"
                :style="{ width: Math.min(getClassroomStats(classroom, data.enrolments).utilization, 100) + '%' }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Unassigned children -->
      <div v-if="unassignedEnrolments.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-3">
          Unassigned children
          <span class="text-sm font-normal text-gray-500">({{ unassignedEnrolments.length }})</span>
        </h2>
        <p class="text-sm text-gray-500 mb-4">
          These children are not assigned to any classroom and do not count against capacity.
        </p>
        <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="enrolment in unassignedEnrolments"
            :key="enrolment.id"
            class="text-sm border rounded-lg px-3 py-2 bg-gray-50"
          >
            {{ enrolment.child.first_name }} {{ enrolment.child.last_name }}
            <span class="text-gray-500">— {{ enrolment.age_group }} / {{ enrolment.attendance_type }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
