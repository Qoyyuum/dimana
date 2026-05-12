import { ref } from 'vue'

export interface AreaInfo {
  id: string
  name: string
  district: string
  mukim?: string
  type: 'district' | 'mukim' | 'kampong'
}

interface AreasData {
  districts: AreaInfo[]
  mukims: AreaInfo[]
  kampongs: AreaInfo[]
}

const areasData = ref<AreasData | null>(null)
const loading = ref(false)

export function useAreas() {
  async function loadAreas(): Promise<AreasData> {
    if (areasData.value) return areasData.value
    if (loading.value) {
      // Wait for ongoing load
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (areasData.value) {
            clearInterval(check)
            resolve(areasData.value)
          }
        }, 50)
      })
    }

    loading.value = true
    try {
      const res = await fetch('/data/areas.json')
      areasData.value = await res.json()
      return areasData.value!
    } finally {
      loading.value = false
    }
  }

  function getAreasByDistrict(district: string): AreaInfo[] {
    if (!areasData.value) return []
    return areasData.value.mukims.filter(m => m.district === district)
  }

  function getKampongsByDistrict(district: string): AreaInfo[] {
    if (!areasData.value) return []
    return areasData.value.kampongs.filter(k => k.name && k.district === district)
  }

  function getValidKampongs(): AreaInfo[] {
    if (!areasData.value) return []
    return areasData.value.kampongs.filter(k => k.name && k.district)
  }

  function getDistrictNames(): string[] {
    if (!areasData.value) return []
    return areasData.value.districts.map(d => d.name)
  }

  function getAllMukims(): AreaInfo[] {
    if (!areasData.value) return []
    return areasData.value.mukims
  }

  function getAllKampongs(): AreaInfo[] {
    if (!areasData.value) return []
    return areasData.value.kampongs
  }

  function findAreaByName(name: string, type?: string): AreaInfo | undefined {
    if (!areasData.value) return undefined
    const lower = name.toLowerCase()
    const all = [
      ...areasData.value.districts,
      ...areasData.value.mukims,
      ...areasData.value.kampongs,
    ]
    return all.find(a => {
      if (type && a.type !== type) return false
      return a.name && a.name.toLowerCase() === lower
    })
  }

  function searchAreas(query: string, type?: string, limit = 8): AreaInfo[] {
    if (!areasData.value || !query) return []
    const lower = query.toLowerCase()
    const all = type
      ? (type === 'district' ? areasData.value.districts :
         type === 'mukim' ? areasData.value.mukims :
         areasData.value.kampongs)
      : [...areasData.value.mukims, ...areasData.value.kampongs]

    return all
      .filter(a => a.name && a.name.toLowerCase().includes(lower))
      .slice(0, limit)
  }

  return {
    areasData,
    loading,
    loadAreas,
    getAreasByDistrict,
    getKampongsByDistrict,
    getValidKampongs,
    getDistrictNames,
    getAllMukims,
    getAllKampongs,
    findAreaByName,
    searchAreas,
  }
}
