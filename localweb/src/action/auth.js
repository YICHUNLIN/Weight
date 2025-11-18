import MD5 from 'crypto-js/md5'
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import {AUTH_URL, CLIENT_SECRET} from '../config'

export const GetTicket = (user) => {
    const config ={
            headers: {
                'authorization-client': `Basic ${CLIENT_SECRET}`
            }
        }
    return new Promise((resolve, reject) => {
        axios.get(`${AUTH_URL}/api/v3/auth/ticket?account=${user.account}&password=${MD5(user.password).toString()}`, config)
            .then(r => {
                const token = jwtDecode(r.data.ticket);
                resolve({user: token, ticket: r.data.ticket})
            })
            .catch(err => reject(err.response.data))
    })
}


export const doTicketLogin = () => {
    return new Promise((resolve, reject) => {
        const ticket = localStorage.getItem('ticket');
        const config = {
            headers: {
                'authorization-client': `Basic ${CLIENT_SECRET}`,
                'authorization': `Bearer ${ticket}`
            }
        }
        axios.get(AUTH_URL + `/api/v3/auth/user`, config)
        .then(resolve)
        .catch(reject)
    })
}

export const GetUsers = () => {
    const ticket = localStorage.getItem('ticket');
    const config ={
        headers: {
            'authorization-client': `Basic ${CLIENT_SECRET}`,
            'authorization': `Bearer ${ticket}`
        }
    }
    return new Promise((resolve, reject) => {
        axios.get(AUTH_URL + `/api/v3/user`, config)
        .then(res => resolve(res.data))
        .catch(reject)
    })
}

