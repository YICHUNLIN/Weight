import axios from 'axios';
import {SCALE_URL,CLIENT_SECRET} from '../config'

export const findDataByDate = (date) => {
    const ticket = localStorage.getItem('ticket');
    const config ={
        headers: {
            'authorization-client': `Basic ${CLIENT_SECRET}`,
            'authorization': `Bearer ${ticket}`
        }
    }
    return new Promise((resolve, reject) => {
        axios.get(`${SCALE_URL}/api/record?date=${date}`, config)
            .then(r => {
                const d = r.data.data;
                resolve(d.hasOwnProperty(date) ? d[date].map(t => t[t.length - 1]) : [])
            })
            .catch(err => reject(err))
    })
}

/**
 * @description 取得一個range的紀錄
 * @param {*} start 
 * @param {*} end 
 * @returns 
 */
export const getRangeRecord = (start, end) => {
    const ticket = localStorage.getItem('ticket');
    const config ={
        headers: {
            'authorization-client': `Basic ${CLIENT_SECRET}`,
            'authorization': `Bearer ${ticket}`
        }
    }
    return new Promise((resolve, reject) => {
        axios.get(`${SCALE_URL}/api/record/range?start=${start}&end=${end}`, config)
            .then(r => {
                const d = r.data.data;
                resolve(d)
            })
            .catch(err => reject(err))
    })
}

export const createRecord = (data) => {
    const ticket = localStorage.getItem('ticket');
    const config ={
        headers: {
            'authorization-client': `Basic ${CLIENT_SECRET}`,
            'authorization': `Bearer ${ticket}`
        }
    }
    return new Promise((resolve, reject) => {
        axios.post(`${SCALE_URL}/api/record`, data, config)
            .then(resolve)
            .catch(err => reject(err))
    })
}

/**
 * @description 更新Record
 * @param {*} date 
 * @param {*} id 
 * @param {*} data 
 * @returns 
 */
export const updateRecord = (date, id, data) => {
    const ticket = localStorage.getItem('ticket');
    const config ={
        headers: {
            'authorization-client': `Basic ${CLIENT_SECRET}`,
            'authorization': `Bearer ${ticket}`
        }
    }
    return new Promise((resolve, reject) => {
        axios.patch(`${SCALE_URL}/api/record/${date}/${id}`, data, config)
            .then(resolve)
            .catch(reject)
    })
}

/**
 * @description 刪除紀錄
 * @param {*} date 
 * @param {*} id 
 * @returns 
 */
export const deleteRecord = (date, id) => {
    const ticket = localStorage.getItem('ticket');
    const config ={
        headers: {
            'authorization-client': `Basic ${CLIENT_SECRET}`,
            'authorization': `Bearer ${ticket}`
        }
    }
    return new Promise((resolve, reject) => {
        axios.delete(`${SCALE_URL}/api/record/${date}/${id}`, config)
            .then(resolve)
            .catch(reject)
    })
}

export const undoDeleteRecord = (date, id, data) => {
    const ticket = localStorage.getItem('ticket');
    const config ={
        headers: {
            'authorization-client': `Basic ${CLIENT_SECRET}`,
            'authorization': `Bearer ${ticket}`
        }
    }
    return new Promise((resolve, reject) => {

    })
}

/**
 * @description 取得被刪除的資料
 */
export const getDeletedRecord = () => {
    const ticket = localStorage.getItem('ticket');
    const config ={
        headers: {
            'authorization-client': `Basic ${CLIENT_SECRET}`,
            'authorization': `Bearer ${ticket}`
        }
    }
    return new Promise((resolve, reject) => {
        let url = `${SCALE_URL}/api/record/deleted`
        axios.get(url, config)
            .then(r => {
                const d = r.data.data;
                
                resolve(Object.keys(d).reduce((map, v) => ({...map, [v]: d[v].map(dv => dv[dv.length-1])}),{}))
            })
            .catch(err => reject(err))
    })
}