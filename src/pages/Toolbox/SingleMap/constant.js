export const SORT_LIST = [
  { label: 'STEP_ID', value: '1' },
  { label: 'SCAN_TM', value: '2' }
]

export const SORT_ORDER_LIST = [
  { label: '升序', value: '1' },
  { label: '降序', value: '2' }
]

export const COMMANDS = ['Rotation', 'Export to CSV', 'Export klarf', 'Send to review', 'Overlap']

export const TOOL_TIPS = [
  { content: '截取', i: 'select', func: 'chooseArea' },
  { content: '取消选中', i: 'undo', func: 'reply' },
  { content: '标记', i: 'pushpin', func: 'podcast' },
  { content: '显示选中点', i: 'check', func: 'star' },
  { content: '显示非选中点', i: 'close', func: 'star0' },
  { content: '选中点重新分类', i: 'apartment', func: 'reclassify' },
  { content: '删除选中点', i: 'delete', func: 'trash' },
  { content: '刷新', i: 'sync', func: 'refresh' }
]

export const MAP_TYPES = { 'Map/Pareto': '', 'Die Stack': '/ds', 'Reticle Stack': '/rs', 'Heat Map': '' }

export const DEFECT_CLASS_LIST = [
  ['mb', 'mbs'],
  ['adc', 'adc'],
  ['rb', 'rbs']
]