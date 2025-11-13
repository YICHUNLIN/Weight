const initState = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    ticket: localStorage.getItem('ticket') || null,
    isAuth: localStorage.getItem('isAuth') || false
}

export default (state = initState, action) => {
    const {type, payload} = action;
    switch(type){
        case "DELETE_USER":
            localStorage.removeItem("user")
            localStorage.removeItem("ticket")
            localStorage.removeItem("isAuth")
            return {
                user: null,
                ticket: null,
                isAuth: false
            }
        case "SAVE_USER":
            localStorage.setItem('user', JSON.stringify(payload.user));
            localStorage.setItem('ticket', payload.ticket)
            localStorage.setItem('isAuth', true)
            return {
                user: payload.user,
                ticket: payload.ticket,
                isAuth: true
            }
        default:
            return state;
    }
}
