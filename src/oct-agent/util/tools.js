import {PackageListResponse, ResponseItem} from "../window-views/list-view";
const request = require("request");
const {remote} = require("electron");
const path = require("path");
const fs = require('fs');
const os = require('os');
const mkdir = require("mkdirp");
import uuid from "uuid/v4";
const configPath: string = path.join(remote.app.getPath('appData'), remote.app.getName());
const configName: string = "config.json";
const defaultDownloadPath: string = path.join(configPath, "download");
const logPath: string = path.join(configPath, "log.json");
export type ConfigType = {
    ip:string,
    mac: string,
    uuid: string,
    downloadPath: string,
    server: string
}

export class UtilTools {
    static dumpLog(level: string, log: string){
        return new Promise((resolve, reject) => {
            let date = new Date();
            let info = "[" + level + "][" + date.toLocaleDateString() + "]:" + log + "\r\n";
            fs.writeFile(logPath, info, {flag: 'a'}, (err)=>{
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    static readAddresses():{ip: string, mac: string} {
        let niList = os.networkInterfaces();
        let nameList = Object.getOwnPropertyNames(niList);
        let name = nameList.find((name: string)=>{
            return name.indexOf('Loop') < 0;
        });
        let item = niList[name].find((item)=>{
            return item.family === "IPv4";
        });
        return {
            ip: item.address,
            mac: item.mac
        };
    }
    static makeNewConfig() {
        let addresses = this.readAddresses();
        return {
            ip: addresses.ip,
            mac: addresses.mac,
            uuid: uuid(),
            downloadPath: defaultDownloadPath,
            server: ""
        };
    }
    static async getConfig():Promise {
        return new Promise((resolve, reject) => {
           fs.readFile(path.resolve(this.getConfigFilePath()), (err, data)=>{
               if (err) {
                   reject(err);
               } else {
                   if(data && data.length > 0){
                       try{
                           let config = JSON.parse(data);
                           resolve(config);
                       } catch (e) {
                           reject(e);
                       }
                   } else {
                       resolve({});
                   }
               }
           })
        });
    }
    static async checkServer(config:ConfigType):Promise<ResponseItem[]> {
        return new Promise((resolve, reject) => {
            let options = {
                url: config.server + "/api/",
                method: "POST",
                json : {
                    "module": "software",
                    "api": "octlink.quantum.v1.software.APIShowAllSoftware",
                    "paras": {
                        "clientId": config.uuid,
                        "start": 0,
                        "limit": 9998888889,
                        "timeout": 0
                    },
                    "async": false,
                    "session": {
                        "uuid": "00000000000000000000000000000000",
                        "skey": "00000000000000000000000000000000"
                    }
                }
            };
            request(options, (err, resp, body: PackageListResponse)=>{
                if (err) {
                    reject(err);
                } else {
                    if (resp.statusCode !== 200) {
                        reject(new Error(resp.statusCode + resp.statusMessage));
                    } else {
                        if(body.errorObj.errorNo !== 0) {
                            reject(new Error(body.errorObj.errorMsg));
                        } else {
                            resolve(body.data.softwares);
                        }
                    }
                }
            })
        });
    }
    static isConfigItemNotEmpty(value: string):boolean{
        return !!(value && value.length > 0);
    }
    static isConfigAllNotEmpty(config: ConfigType){
        return this.isConfigItemNotEmpty(config.ip)
            && this.isConfigItemNotEmpty(config.mac)
            && this.isConfigItemNotEmpty(config.uuid)
            && this.isConfigItemNotEmpty(config.downloadPath)
            && this.isConfigItemNotEmpty(config.server);
    }
    static async updateConfig(config):Promise {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.getConfigFilePath(), JSON.stringify(config, null, "  "), (err)=>{
                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    static async initConfig(): Promise {
        return new Promise((resolve, reject) => {
            mkdir(configPath, (err) => {
                if(err) {
                    reject(err);
                } else {
                    fs.writeFile(this.getConfigFilePath(), JSON.stringify(this.makeNewConfig(),null, "  "), (err)=>{
                        if(err) {
                            reject(err);
                        } else {
                            mkdir(defaultDownloadPath, (err) => {
                                if(err) {
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        }
                    });
                }
            });
        });
    }
    static getAppPath(): string {
        return configPath;
    }
    static getConfigFilePath(): string {
        return path.join(configPath, configName);
    }
    static async isConfigExist():Promise<boolean> {
        let configFilePath = this.getConfigFilePath();
        return new Promise((resolve,reject)=>{
           fs.stat(configFilePath, (err) => {
               if (err) {
                   if (err.code === 'ENOENT') {
                       console.log("has not config file");
                       resolve(false);
                   } else {
                       console.log("other error");
                       reject(err);
                   }
               } else {
                   console.log("has config file");
                   resolve(true);
               }
           })
        });
    }
}