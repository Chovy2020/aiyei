import { post } from '@/utils/api'

// 获取分类功能的 class code
export const getClassCodes = () => post('gallery_map/gallery_image_classify_list')

// 获取显示设置的筛选条件
export const getViewFilters = data => post('gallery_map/gallery_image_classify_group', data)

// 获取图片链接的列表 + 过滤
export const getImages = data => post('wafer_image/upload_gallery_image/single', data)

// Defect 分类
export const updateDefectGroup = data => post('gallery_map/gallery_image_classify', data)
