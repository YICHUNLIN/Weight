
import CryptoJS from 'crypto-js'
export const OS_NAME ="JobAssignService"
export const OS_CLIENTID = "16d7ec86-8187-43a6-b51f-0ad944d3928f";
export const OS_CLIENTSECRET = "a47ef81384e6511f74005ef12ded5781";
export const AUTH_URL = "https://odskey.kmn.tw";
export const CLIENT_SECRET = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`${OS_CLIENTID}:${OS_CLIENTSECRET}`));

const getScaleURL = () => {
    const key = "SCALE_URL";
    let url = localStorage.getItem(key);
    if (!url){
        url = "http://192.168.0.198"
        localStorage.setItem(key, "http://192.168.0.198")
    }
    console.log(url)
    return url;
}


export const SCALE_URL = getScaleURL();