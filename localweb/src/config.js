
import CryptoJS from 'crypto-js'
export const OS_NAME ="JobAssignService"
export const OS_CLIENTID = "16d7ec86-8187-43a6-b51f-0ad944d3928f";
export const OS_CLIENTSECRET = "a47ef81384e6511f74005ef12ded5781";
export const AUTH_URL = "https://odskey.kmn.tw";
export const CLIENT_SECRET = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(`${OS_CLIENTID}:${OS_CLIENTSECRET}`));