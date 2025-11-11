// parse detail
const getDetail = (ori) => {
    return ori.map(m => {
        const mth = m.match(/\(\S*\)/);
        if (!mth) return m;
        return {
            name: m.replace(`${mth[0]}`, ''),
            desc: mth[0].replace('(','').replace(')','')
        }
    })
}

export const strFormat = (s) =>{
    return s.replaceAll('：', ':')
    .replaceAll('，', ',')
    .replaceAll('（', '(')
    .replaceAll('）', ')');
}


// 字串轉換成資料
/**
工地A:aaa bbb ccc ddd
工地A-OO工項:aaa bbb ccc ddd
工地A-OO工項,工地B-XX工項：aaa bbb ccc ddd

{
    name: '',content: [], subs: [{name: '', content: ''},{name: '', content: ''}]
}
 */
export const stringToData = (value) => {
    return strFormat(value).split('\n').reduce((map, v) => {
        if (!v.includes(':')) return map;
        const s = v.split(":");
        const members = {content: getDetail(s[1].split(' '))};
        if (s[0].includes(',')) {
            const subPlaces = s[0].split(',');
            let spd = {};
            let target_place = ''
            subPlaces.forEach((sp, i) => {
                let [place, desc, ...sub_desc] = sp.includes('-') ? sp.split('-') : [sp, null];
                if (sub_desc) desc = [desc, ...sub_desc].join('-')
                if (!map[place] && (i === 0)){
                    map[place] = []
                }
                target_place = i === 0 ? place : target_place;
                spd = (i === 0) ? (sp.includes('-') ? ({name: desc, ...members, subs:[]}) : ({...members, subs: []})) : {...spd, subs: [...spd.subs, desc ? ({name: place, content: desc}) : {name: place}]}
            })
            map[target_place].push(spd);
        } else {
            let [place, desc, ...sub_desc] = s[0].includes('-') ? s[0].split('-') : [s[0], null];
            if (sub_desc) desc = [desc, ...sub_desc].join('-');
            if (!map[place]) map[place] = []
            map[place].push(desc ? {name: desc, ...members} : members)
        }
        return map;
    }, {})
}

export const singleDataToString = (c) => {
    const s = Object.keys(c)
        .reduce((map, key) => [
            ...map, 
            c[key].map(v => `${v.name ? `${key}-${v.name}` : key}${v.subs?.length > 0 ? ',' :''}${v.subs ? v.subs.map(vsub => `${vsub.name}${vsub.content ? `-${vsub.content}` : ''}`).join(',') : ''}:${v.content.filter(cont => (typeof cont === 'string') ? (cont !== '') : (cont.name !== '')).map(cont => cont.name ? `${cont.name}(${cont.desc})` : cont).join(' ')}`)
        ], []).reduce((map, item) => [...map, ...item] , [])
    return s;
}

export const traceMachineInfo = (ori) => {
    if (!ori.content) return {usage: {}, history: {}};
    const data = ori.content;
    // 工地 機具使用紀錄
    const usage = Object.keys(data)
        .reduce((map, wp) => {
            const x = data[wp].reduce((m, item) => {
                const s = item.content?.reduce((m2, it) => {
                    if(!(it.desc && it.desc.includes('#') && !it.desc.includes('>'))) return m2;
                    return [{name: item.name, emp: it.name, machines: it.desc.split(',').filter(c => c.includes('#'))}, ...m2];
                },[])
                return s.length > 0 ? [...s,...m] : m;
            }, [])
            return x.length > 0 ? {...map, [wp]: x} : map;
        }, {})

    const history = Object.keys(data)
        .reduce((map, wp) => {
            const x = data[wp].reduce((m, item) => {
                const s = item.content?.reduce((m2, it) => {
                    if(!(it.desc && it.desc.includes('#') && it.desc.includes('>'))) return m2;
                    return [
                            {
                                name: item.name, 
                                emp: it.name, 
                                machines: it.desc.split(',').filter(s => s.includes('>')).map(s => s.split('>'))}, ...m2];
                },[])
                return s.length > 0 ? [...s,...m] : m;
            }, [])
            return x.length > 0 ? {...map, [wp]: x} : map;
        }, {})
    return {usage, history}
}

export const dataToString = (list) => {
    return list.map(litem => {
        const {content, date} = litem;
        const c = content.content;
        const s = singleDataToString(c)
        return {date, dayoff: content.dayoff, content: s, desc: content.desc, createdAt: content.createdAt, createdBy: content.createdBy, state: content.state ? content.state : 'Editable'}
    })
}


export const dayOffStringToData = (value) => {
    return strFormat(value).replaceAll('\n', ' ').split(' ').reduce((map, v) => {
        if (v.includes('(') && v.includes(')')){
            const [name, desc] = v.replace('(', ' ').replace(')','').split(' ');
            return [...map, {name, desc}]
        }
        return [...map, {name: v}]
    }, [])
}

export const dayOffDataToString = (data) => {
    return data.map(d => `${d.name}${d.desc ? `(${d.desc})` : ''}`)
}

export const traceNumber = (v2) => {
    if (!v2.sub_desc) return 1; //沒有標記就是1
    const tn = /x(\d+\.*\d*)/g
    const t = v2.sub_desc.match(tn);
    if (!t) return 1; //如果沒寫內容就是1
    return t.map(ti => parseFloat(ti.replace('x',''))).reduce((m, v) => m + v, 0)
}


export const toOutSourcing = (wp, data, outSourcing) => {
    return Object.keys(data[wp]).reduce((map, key) => 
        map + data[wp][key].filter(emp => outSourcing.map(os => os.name).includes(emp.name))
            .reduce((map2, v2) =>map2 + (!v2.sub_desc ? 1 : traceNumber(v2)), 0)
    , 0)
}

export const toNotOutSourcing = ( wp, data,outSourcing) => {
    return Object.keys(data[wp])
            .reduce((map, key) => map + data[wp][key].filter(emp => !outSourcing.map(os => os.name).includes(emp.name)).length, 0)
}


