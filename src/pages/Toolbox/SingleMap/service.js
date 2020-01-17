import { post } from '@/utils/api'

export const reclassifyParams = data => post('correct/reclassifyParams', data)

export const getMapData = (url, data) => post(url, data)

export const getImages = data => post('wafer_image/upload_gallery_image/single', data)

export const updateCorrect = data => post('correct/update', data)

export const deleteCorrect = data => post('correct/delete', data)
