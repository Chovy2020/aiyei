import { post } from '@/utils/api'

// 查询拖拽框的数据
export const dataQuerySearch = data => post('gallery_map_filter/data_query', data)

// 加载全局Filter的预选项
export const getTags = data => post('gallery_map/checkbox', data)

