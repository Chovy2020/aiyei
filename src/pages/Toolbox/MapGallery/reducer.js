const initState = {
  mapSelected: {},
  mapWafers: {}
}

export default (state = initState, action) => {
  switch (action.type) {
    case 'CHANGE_MAP_SELETED': {
      const { name, selected } = action.payload
      state.mapSelected[name] = selected
      return state
    }
    case 'CHANGE_MAP_WAFERS': {
      const { name, wafers } = action.payload
      state.mapWafers[name] = wafers
      return state
    }
    default:
      return state
  }
}
