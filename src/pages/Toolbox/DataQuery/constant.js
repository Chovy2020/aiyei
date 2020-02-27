// 预设有几个拖拽框
export const DATA_QUERY_QUERY = {
  'Product ID': 'product_id',
  'Step ID': 'step_id',
  'Lot ID': 'lot_id',
  'Wafer ID': 'wafer_no',
  'Scan Time/Date': 'scan_tm',
  'Inspect Equip ID': 'eqp_id',
  'Recipe ID': 'recipe_id',
  'Test ID': 'test_no_group',
  'Slot ID': 'slot_num'
}
// 初始化默认生成的拖拽框与顺序
export const DATA_QUERY_INIT = ['Product ID', 'Step ID', 'Lot ID', 'Wafer ID']
// 拖拽框title显示
export const GET_LABEL = value => {
  for (const key in DATA_QUERY_QUERY) {
    if (DATA_QUERY_QUERY[key] === value) return key
  }
  return null
}