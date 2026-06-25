// in the file name the d stands for definition
// to avoid typos u can go the api link and copy some of the responses schemas and 
// then paste it into website that covert json to ts

// we don't need to export it
// now we prefer to use type rather than interface so we don't need to add the prefix I (as it is the best naming convention)

// for prettying the code we can right click and choose format document or use the shortcut

type PagedList<T, TCursor> = {
  items: T[],
  nextCursor: TCursor
}

type ResetPassword = {
  email: string
  resetCode: string
  newPassword: string
}

type Activity = {
  id: string
  title: string
  date: Date
  description: string
  category: string
  isCancelled: boolean
  city: string
  venue: string
  latitude: number
  longitude: number
  attendees: Profile[]
  isGoing: boolean
  isHost: boolean
  hostId: string
  hostDisplayName: string
  hostImageUrl?:  string
}

// the type comment does exist in the js so we can't use that word
type ChatComment = {
  id: string
  createdAt: Date
  userId: string
  body: string
  displayName: string
  imageUrl?: string
}

type Profile = {
  id: string
  displayName: string
  bio?: string
  imageUrl?: string
  followersCount?: number // we mad it optional so we don't break things in the app as we added it later
  followingCount?: number
  following?: boolean
}

type Photo = {
  id: string,
  url: string
}

type User = {
  id: string
  email: string
  displayName: string
  imageUrl?: string
}


export type LocationIQSuggestion = {
  place_id: string
  osm_id: string
  osm_type: string
  licence: string
  lat: string
  lon: string
  boundingbox: string[]
  class: string
  type: string
  display_name: string
  display_place: string
  display_address: string
  address: LocationIQAddress
}

export type LocationIQAddress = {
  name: string
  house_number: string
  road: string
  suburb?: string
  town?: string
  village?: string
  city?: string
  county: string
  state: string
  postcode: string
  country: string
  country_code: string
  neighbourhood?: string
}