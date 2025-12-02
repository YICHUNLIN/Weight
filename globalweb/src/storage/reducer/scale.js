const initState = {
    today:[]
}

export default (state = initState, action) => {
    const {type, payload} = action;
    switch(type){
        case "SET_TODAY":
            return {
                today: payload
            }
        default:
            return state;
    }
}
