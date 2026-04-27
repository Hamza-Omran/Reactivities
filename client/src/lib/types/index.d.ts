// in the file name the d stands for definition
// to avoid typos u can go the api link and copy some of the responses schemas and 
// then paste it into website that covert json to ts

// we don't need to export it
// now we prefer to use type rather than interface so we don't need to add the prefix I (as it is the best naming convention)

// for prettying the code we can right click and choose format document or use the shortcut

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