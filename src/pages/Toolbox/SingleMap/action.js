/**
 * @param {String} name
 * @param {Array<Wafer>} selected
 */
export const changeSingleSelected = payload => ({
  type: 'CHANGE_SINGLE_SELETED',
  payload
})

/**
 * @param {String} name
 * @param {Array<Wafer>} wafers
 */
export const changeSingleWafers = payload => ({
  type: 'CHANGE_SINGLE_WAFERS',
  payload
})

export const changeSingleParams = payload => ({
  type: 'CHANGE_SINGLE_PARAMS',
  payload
})
