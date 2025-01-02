export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export interface Member {
  id: string
  role: string
  memberCode: string
  user?: User | null
}

export interface Location {
  id: string
  name: string
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postalCode?: string | null
}

export interface Activity {
  id: string
  title: string
  description?: string | null
}

export interface Event {
  id: string
  title: string
  description?: string | null
  startDate: Date
  endDate: Date
  status: string
  priority: string
  visibility: string
  capacity?: number | null
  location?: Location | null
  user?: User | null
  members: Member[]
  activities: Activity[]
  _count: {
    activities: number
    members: number
  }
}
