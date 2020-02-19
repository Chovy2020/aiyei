const initState = {
  chartSelected: {},
  chartWafers: {},
  /**
   * chartParams: { name: params }
   * params: { x, x2n, y, bars: [] }
   */
  chartParams: {},
}

export default (state = initState, action) => {
  switch (action.type) {
    case 'CHANGE_CHART_SELETED': {
      const { name, selected } = action.payload
      state.chartSelected[name] = selected
      return state
    }
    case 'CHANGE_CHART_WAFERS': {
      const { name, wafers } = action.payload
      state.chartWafers[name] = wafers
      return state
    }
    case 'CHANGE_CHART_PARAMS': {
      const { name, params } = action.payload
      state.chartParams[name] = params
      return state
    }
    default:
      return state
  }
}
