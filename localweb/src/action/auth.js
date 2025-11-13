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