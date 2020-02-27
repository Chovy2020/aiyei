/**
 * @param {String} name
 * @param {Array<Wafer>} selected
 */
export const changeMapSelected = payload => ({
  type: 'CHANGE_MAP_SELETED',
  payload
})

/**
 * @param {String} name
 * @param {Array<Wafer>} wafers
 */
export const changeMapWafers = payload => ({
  type: 'CHANGE_MAP_WAFERS',
  payload
})
