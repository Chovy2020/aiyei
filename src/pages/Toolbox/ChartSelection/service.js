import { get, post } from '@/utils/api'

export const getX = () => get('swp/1stxaxis')

export const getX2n = (x) => get(`swp/2ndxaxis/${x}`)

export const getY = (x, x2n) => get(`swp/yaxis/${x},${x2n}`)

export const getChartData = data => post('swp', data)

export const getPcCmStep = data => post('pc/cm/step', data)

export const getPcCm = data => post('pc/cm', data)
// ca
export const getCaWatTreeData = data => post('pc/correlation/step', data)

export const searchCA = data => post('pc/correlation', data)
