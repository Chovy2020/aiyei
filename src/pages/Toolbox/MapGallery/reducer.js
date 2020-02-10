const initState = {
  mapSelected: {},
  mapWafers: {}
}

export default (state = initState, action) => {
  switch (action.type) {
    case 'CHANGE_SELETED':
      return {
        ...state,
        mapSelected: action.payload
      }
    case 'CHANGE_WAFERS':
      return {
        ...state,
        mapWafers: action.payload
      }
    default:
      return state
  }
}
