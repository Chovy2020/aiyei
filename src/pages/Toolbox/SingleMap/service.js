import { get, post } from '@/utils/api'

export const reclassifyParams = data => post('correct/reclassifyParams', data)

export const getMapData = (url, data) => post(url, data)

export const getImages = data => post('wafer_image/upload_gallery_image/single', data)

export const updateCorrect = data => post('correct/update', data)

export const deleteCorrect = data => post('correct/delete', data)

// pareto
export const getX = () => get('swp/1stxaxis')

export const getX2nd = xValue => get(`swp/2ndxaxis/${xValue}`)

export const getY = (xValue, x2ndValue) => get(`swp/yaxis/${xValue},${x2ndValue}`)