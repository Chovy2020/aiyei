import { get, post, put, Delete,download } from '@/utils/api'

// HoldLotList
export const getHoldLotList = data => get(`excursion/hold`)

// Map & Pareto
export const getMapPareto = (lotId, productId, stepId) => get(`excursion/mp/list/${lotId}/${productId}/${stepId}`)

export const getY = data => get('swp/yaxis/mb,')

export const changeMapPareto = (lotId, wafer, productId, stepId, yValue) => get(`excursion/mp/get/${lotId}/${wafer}/${productId}/${stepId}/${yValue}`)

export const getMoreMap = (lotId, wafer, productId) => get(`excursion/more/${lotId}/${wafer}/${productId}`)

// generater report
export const getReportUrl = data => post(`excursion/generatereport`, data)
// 7Days PPT
export const getPPTList = (lotId, productId, stepId, ) => get(`excursion/pptlist/${lotId}/${productId}/${stepId}`)
// 下载PPT
export const downloadPPT = (fileName) => download(`excursion/download/${fileName}`, null, 'get')

// History
export const getHistory = (lotId, productId, select) => get(`excursion/history/${lotId}/${productId}/${select}`)

// trendChart
export const getTrendChart = (lastmonth, data) => post(`excursion/tc/${lastmonth}`, data)

export const getTrendChartBox = (lastmonth, data) => post(`excursion/tc/box/${lastmonth}`, data)

// CrossModuleChart
export const getStep = (lastmonth, data) => post(`excursion/cm/step/${lastmonth}`, data)

export const getCrossModule = (lastmonth, data) => post(`excursion/cm/${lastmonth}`, data)