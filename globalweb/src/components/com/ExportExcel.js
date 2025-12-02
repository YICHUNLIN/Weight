import { utils, writeFile } from 'xlsx';


export const XLSX_write_ForRangeRecordsBydate = (data, users) => {
    const headers = ['序號', '日期-時間', '進/出','客戶' ,'來源/目的地', '貨物內容','貨物說明', '總重', '空車重', '淨重', '車輛/司機', '紀錄者'];
    const wb = utils.book_new();
    Object.keys(data)
        .forEach(date => {
            const r = data[date].map((d,i) => {
                return [
                        i+1,
                        (new Date(d.createdAt)).toLocaleString(),
                        d.inorout === "INPORT" ? "進場" : "出場",
                        d.client,
                        d.source_or_destination,
                        d.item,
                        d.desc,
                        d.number,
                        d.empty,
                        d.number - d.empty,
                        `${d.car} / ${d.driver}`,
                        users[d.createdBy].account
                    ]
            })
            const ws = utils.aoa_to_sheet([headers].concat(r));
            utils.book_append_sheet(wb, ws, date);
        })
        writeFile(wb, `過磅紀錄-${(new Date()).toLocaleString()}.xlsx`);
}


// 輸出資料
export const XLSX_write_ForRangeDateRecords = ( data, users, fn) => {
    if (data.length <= 0) return false;

    const headers = ['序號', '日期-時間', '進/出', '來源/目的地', '貨物內容', '總重', '空車重', '淨重', '車輛/司機', '紀錄者'];
    const r = data.map((d,i) => {
        return [
                i+1,
                (new Date(d.createdAt)).toLocaleString(),
                d.inorout,
                d.source_or_destination,
                d.item,
                d.number,
                d.empty,
                d.number - d.empty,
                `${d.car} / ${d.driver}`,
                users[d.createdBy].account
            ]
    })
    const ws = utils.aoa_to_sheet([headers].concat(r));
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "工作表");
    writeFile(wb, `過磅紀錄-${(new Date()).toLocaleString()}.xlsx`);
}