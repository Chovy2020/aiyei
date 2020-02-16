export const SORT_LIST = [
  { label: 'STEP_ID', value: '1' },
  { label: 'SCAN_TM', value: '2' }
]

export const SORT_ORDER_LIST = [
  { label: 'ASC', value: '1' },
  { label: 'DESC', value: '2' }
]

export const COMMANDS = [
  'Rotation',
  // 'Export to CSV',
  'Export klarf',
  // 'Send to review',
  // 'Overlap'
]

export const TOOL_TIPS = [
  { content: 'Interception', i: 'select', func: 'chooseArea' },
  { content: 'Cancel', i: 'undo', func: 'reply' },
  { content: 'Mark', i: 'pushpin', func: 'podcast' },
  { content: 'Highlight', i: 'check', func: 'star' },
  { content: 'Reverse', i: 'close', func: 'star0' },
  { content: 'Reclassify', i: 'apartment', func: 'reclassify' },
  { content: 'Delete', i: 'delete', func: 'trash' },
  { content: 'Refresh', i: 'sync', func: 'refresh' }
]

export const MAP_TYPES = { 'Map/Pareto': '', 'Die Stack': '/ds', 'Reticle Stack': '/rs', 'Heat Map': '' }

export const DEFECT_CLASS_LIST = ['mb', 'adc', 'rb']

export const DELETE_DEFECTS_OPTIONS = ['clear defects', 'clear defects & export', 'delete defects', 'delete defects & export']

export const OVER_LAP_TYPE_OPTIONS = ['Bin Map', 'Bit Map', 'WAT', 'Metrology']

export const DSA_TABLE_COLUMNS = [
  { title: 'dieIndex', dataIndex: 'dieIndex', key: 'dieIndex' },
  { title: 'step', dataIndex: 'step', key: 'step' },
  { title: 'defectId', dataIndex: 'defectId', key: 'defectId' },
  { title: 'scanTime', dataIndex: 'scanTm', key: 'scanTm' },
  { title: 'image', dataIndex: 'imgUrl', key: 'imgUrl' }
]
export const INFO_COLUMNS = [
  { title: 'Lot ID', dataIndex: 'lotId' },
  { title: 'Wafer No', dataIndex: 'waferNo' },
  { title: 'Product ID', dataIndex: 'productId' },
  { title: 'Step ID', dataIndex: 'stepId' },
  { title: 'Scan Time', dataIndex: 'scanTm' }
]