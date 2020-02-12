import { post, download } from '@/utils/api'

// export to csv
export const downloadCSV = data => download('gallery_map/export_excel', data)

// new api
export const getNewMap = data => post('gallery_map/test', data)

export const getNewStack = data => post('gallery_map/test2', data)
