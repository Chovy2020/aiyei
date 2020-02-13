const initState = {
  chartSelected: {},
  chartWafers: {}
}

export default (state = initState, action) => {
  switch (action.type) {
    case 'CHANGE_IMAGE_SELETED': {
      const { name, selected } = action.payload
      state.chartSelected[name] = selected
      return state
    }
    case 'CHANGE_IMAGE_WAFERS': {
      const { name, wafers } = action.payload
      state.chartWafers[name] = wafers
      return state
    }
    default:
      return state
  }
}
