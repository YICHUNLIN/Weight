import axios from 'axios';
import {getScaleURL,CLIENT_SECRET} from '../config'


export const GetItems = () => {
    const ticket = localStorage.getItem('ticket');
    const config ={
        headers: {
            'authorization-client': `Basic ${CLIENT_SECRET}`,
            'authorization': `Bearer ${ticket}`
        }
    }
    return new Promise((resolve, reject) => {
        axios.get(`${getScaleURL()}/api/cfg/items`, config)
            .then(r => resolve(r.data.data))
            .catch(reject)
    })
}

export const UpdateItems = (newList) => {
    const ticket = localStorage.getItem('ticket');
    const config ={
        headers: {
            'authorization-client': `Basic ${CLIENT_SECRET}`,
            'authorization': `Bearer ${ticket}`
        }
    }
    return new Promise((resolve, reject) => {
        axios.patch(`${getScaleURL()}/api/cfg/items`,{content: newList}, config)
            .then(r => resolve())
            .catch(reject)
    })
}

export const GetDailyConfig = (date) => {
    const ticket = localStorage.getItem('ticket');
    const config ={
        headers: {
            'authorization-client': `Basic ${CLIENT_SECRET}`,
            'authorization': `Bearer ${ticket}`
        }
    }
    return new Promise((resolve, reject) => {
        axios.get(`${getScaleURL()}/api/cfg/daily/${date}`, config)
            .then(r => resolve(r.data.data))
            .catch(reject)
    })
}

export const GetAppName = () => {
    const ticket = localStorage.getItem('ticket');
    const config ={
        headers: {
            'authorization-client': `Basic ${CLIENT_SECRET}`,
            'authorization': `Bearer ${ticket}`
        }
    }
    return new Promise((resolve, reject) => {
        axios.get(`${getScaleURL()}/api/cfg/app_name`, config)
            .then(r => resolve(r.data.name))
            .catch(reject)
    })
}