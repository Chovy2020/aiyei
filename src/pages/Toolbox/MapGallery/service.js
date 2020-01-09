import { post, download } from '@/utils/api'

// 加载可显示的过滤条件
export const getTags = data => post('gallery_map_bak/checkbox', data)

// 筛选与分组
export const getFilters = data => post('gallery_map_filter/gallery_map_group', data)

// map & heatmap
export const getMap = data => post('gallery_map_bak/generate', data)

// die stack & reticle stack
export const getStack = data => post('gallery_map_bak/stack_map', data)

// export to csv
export const downloadCSV = data => download('gallery_map/export_excel', data)
