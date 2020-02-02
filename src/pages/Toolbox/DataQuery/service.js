import { post } from '@/utils/api'

export const dataQuerySearch = data => post('gallery_map_filter/data_query', data)

// 加载可显示的过滤条件
export const getTags = data => post('gallery_map_bak/checkbox', data)

