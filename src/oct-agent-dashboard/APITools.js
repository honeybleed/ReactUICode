import axios from "axios";
import {AxiosResponse} from "axios";
import { Base64 } from 'js-base64';
export type ErrorObj = {
    errorNo: number,
    errorMsg: string,
    errorMsgEN: string,
    errorLog: string
}
export type APIResponse<T> = {
    data: T,
    errorObj: ErrorObj
}
export type LoginResponse = {
    name: string,
    accountId: string,
    id: string,
    role: number
}
export type ClientItem = {
    id: string,
    name: string,
    ip: string,
    mac: string,
    createTime: number
}

export type ClientListResponse = {
    total: number,
    clients: ClientItem[]
}

export class APIRequest {
    static async doGetClients(start: number, limit: number) {
        return new Promise((resolve, reject) => {
            let body = {
                "module": "client",
                "api": "octlink.quantum.v1.client.APIShowAllClient",
                "paras": {
                    "timeout": 0,
                    "limit": limit,
                    "start": start
                },
                "async": false,
                "session": {
                    "uuid": "00000000000000000000000000000000",
                    "skey": "00000000000000000000000000000000"
                }
            };
            axios.post('/api/', body).then((resp: AxiosResponse)=>{
                if(resp.status !== 200){
                    reject(new Error("status["+resp.status+"]:"+resp.statusText));
                } else {
                    let body:APIResponse<ClientListResponse> = resp.data;
                    if(body.errorObj.errorNo !== 0) {
                        reject(new Error(body.errorObj.errorMsg + "\r\n" + body.errorObj.errorLog));
                    } else {
                        resolve(body.data);
                    }
                }
            }).catch((err)=>{
                reject(err);
            })
        });

    }
    static async doLogin(username: string, password: string) {
        return new Promise((resolve, reject) => {
            let body = {
                "module": "account",
                "api": "octlink.quantum.v1.account.APILoginByAccount",
                "paras": {
                    "password": Base64.encode(password),
                    "timeout": 0,
                    "account": username
                },
                "async": false,
                "session": {
                    "uuid": "00000000000000000000000000000000",
                    "skey": "00000000000000000000000000000000"
                }
            };

            axios.post('/api/', body).then((resp: AxiosResponse)=>{
                if(resp.status !== 200){
                    reject(new Error("status["+resp.status+"]:"+resp.statusText));
                } else {
                    let body:APIResponse<LoginResponse> = resp.data;
                    if(body.errorObj.errorNo !== 0) {
                        reject(new Error(body.errorObj.errorMsg + "\r\n" + body.errorObj.errorLog));
                    } else {
                        resolve(body.data);
                    }
                }
            }).catch((err)=>{
                reject(err);
            })
        });
    }
}