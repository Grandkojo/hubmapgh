export interface Hub {
  id: string
  name: string
  city: string
  neighborhood: string
  description: string
  tags: string[]
  website: string
  coordinates: {
    lat: number
    lng: number
  }
  verified: boolean
  founded: number
  contact: string
}

export type CityFilter = 'All' | 'Accra' | 'Kumasi' | 'Takoradi' | 'Tamale' | 'Other'
export type TagFilter = string
