const initState = {
    today:[],
    url: (() => {
        const defaultURL = window.location.href.slice(0, -1);
        const u = localStorage.getItem("SCALE_URL");
        if (u) return u;
        localStorage.setItem("SCALE_URL", defaultURL)
        return defaultURL
    })()
}

export default (state = initState, action) => {
    const {type, payload} = action;
    switch(type){
        case "SET_TODAY":
            return {
                today: payload
            }
        case "SET_SCALE_URL":
            localStorage.setItem("SCALE_URL", payload)
            return {
                url: payload
            }
        case "GET_SCALE_URL":
            return {
                url: localStorage.getItem("SCALE_URL")
            }
        default:
            return state;
    }
}
