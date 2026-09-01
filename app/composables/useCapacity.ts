import type { CapacityOverview } from '~/types/capacity'

export function useCapacity(month?: Ref<string | undefined>) {
  const base = 'https://capacity.workshape.dev/api/v1/capacity-overview'

  const url = computed(() => {
    return month?.value ? `${base}?month=${month.value}` : base
  })

  return useFetch<CapacityOverview>(url, { server: false })
}