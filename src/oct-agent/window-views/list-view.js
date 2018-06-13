import React from "react";
import type {SetupPackage} from "../download-item/download-item";
import {TitlePanel} from "../title-panel/title-panel";
import {Icon} from "../../ui";
import {DownloadApplicationItem} from "../download-item/download-item";
import type {ErrorObj} from "../types/APITypes";
import {FileDownloadedApplication} from "../file-item/file-item";
const request = require("request");
const path = require("path");
const fs = require("fs");
import './list-view.scss';
import {UtilTools} from "../util/tools";
import type {ConfigType} from "../util/tools";

const LOOP_TIME_OUT = 1000 * 5;
export type DownloadListItem = {
    itemObj: SetupPackage,
    ref: DownloadApplicationItem,
    element: any
}
export type PackageListResponse={
    errorObj: ErrorObj,
    data: {
        total: number,
        softwares: ResponseItem[]
    }
}
export type ResponseItem = {
    lastSync: string,
    img: string,
    installState: string,
    createTime: string,
    extName: string,
    size: number,
    uuid: string,
    name: string
}
export type ListViewProps = {
    onRef:(ref)=>{}
}
export type ListViewState = {
    download_list:DownloadListItem[],
    reDownload_list:DownloadListItem[],
    downloaded_list:DownloadListItem[],
    download_list_ref:TitlePanel,
    downloaded_list_ref:TitlePanel,
    randomWidth: number
}

const VIEW_HEIGHT = 422;



export class ListView extends React.Component<ListViewProps, ListViewState> {
    constructor(props) {
        super(props);
        this.state = {
            download_list:[],
            downloaded_list:[],
            reDownload_list:[],
            download_list_ref:null,
            downloaded_list_ref:null,
            randomWidth:0
        };
        //this.startNewDownloadLoop().then();
    }

    componentDidMount() {
        if(this.props.onRef){
            this.props.onRef(this);
        }
        //this.getRandomWidth()
    }

    async startNewDownloadLoop() {
        console.log("new download loop started!");
        try{
            await this.doReDownloadAction();
            let resp:ResponseItem[] = await this.requestList();
            this.setState({
                download_list:[],
                reDownload_list:[],
                downloaded_list:[],
            }, ()=>{
                this.distributeAllItems(resp).then(()=>{
                    this.downloadNextItem();
                });
            });
        } catch (e) {
            console.error(e);
            UtilTools.dumpLog('ERR', e.stack).then();
            setTimeout(()=>{
                this.startNewDownloadLoop().then();
            }, LOOP_TIME_OUT)
        }
    }
    downloadNextItem() {
        if (this.state.download_list.length > 0) {

            let item:DownloadListItem = this.state.download_list.find((value)=>{
                return value.ref.state.state !== 'error';
            });
            console.log("["+this.state.download_list.length+"] download tasks left!");
            if(item) item.ref.doDownload().then();
            else  setTimeout(()=>{this.startNewDownloadLoop().then();}, LOOP_TIME_OUT);
        } else {
            setTimeout(()=>{this.startNewDownloadLoop().then();}, LOOP_TIME_OUT);
        }
    }

    async doReDownloadAction(){
        try {
            for(let i=0; i< this.state.reDownload_list.length; i++) {
                let value = this.state.reDownload_list[i];
                await this.deleteLocalFile(value.itemObj);
                await this.updateItemRemoteState(value.itemObj.uuid, 'new');
            }
        } catch (e) {
            console.error(e);
            UtilTools.dumpLog('ERR', e.stack);
        }
    }
    async distributeAllItems(resp: ResponseItem[]) {

        for(let i=0; i<resp.length; i++) {
            let item = resp[i];
            if(item.installState === 'new') {
                await this.buildDownloadItems(resp[i]);
            } else {
                this.buildDownloadedItems(resp[i]);
            }
        }
    }
    buildDownloadedItems(item:ResponseItem) {
        let cacheItem: DownloadListItem = {};
        let itemPackage: SetupPackage;
        itemPackage = {
            uuid: item.uuid,
            name: item.name + "." + item.extName,
            img: item.img,
            size: item.size,
            installState: item.installState
        };
        cacheItem.itemObj = itemPackage;
        cacheItem.element = <FileDownloadedApplication
            package={cacheItem.itemObj}
            key={cacheItem.itemObj.uuid}
            onRequestDownloadAgain={(file: SetupPackage)=>{
                this.appendReDownloadItem(file);
            }}
            onRequestSetup={(file: SetupPackage)=>{
                this.updateItemRemoteState(file.uuid, 'installed').then(()=>{

                })
            }}
            />;
        this.setState((pre) => {
            pre.downloaded_list.push(cacheItem);
            return pre;
        })
    }
    async actionAfterFinished(file:SetupPackage) {
        await this.updateItemRemoteState(file.uuid, 'downloaded');
        this.startNewDownloadLoop().then();
    }
    async deleteLocalFile(file: SetupPackage) {
        try{
            let config: ConfigType = await UtilTools.getConfig();
            let downloadPath = path.join(config.downloadPath, file.uuid);
            await this.deletePath(downloadPath);
        } catch (e) {
            console.error(e);
            UtilTools.dumpLog('ERR', e.stack);
        }
    }

    async deleteFile(fullPath) {
        return new Promise((resolve, reject) => {
            fs.unlink(fullPath, (err) => {
                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        })
    }

    async deletePath(fullPath) {
        return new Promise((resolve, reject) => {
            fs.readdir(fullPath, (err, files)=>{
                if(err) {
                    reject(err);
                } else {
                    let fullPathArray = [];
                    files.map((name)=>{
                        fullPathArray.push(path.join(fullPath,name));
                    });
                    this.deletePathFiles(fullPathArray).then(
                        ()=>{
                            fs.rmdir(fullPath, (err)=>{
                                if(err){
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            })
                        }
                    );
                }
            })
        })
    }

    async deletePathFiles(fullPathArray: string[]) {
        if(fullPathArray.length > 0) {
            for(let i=0;i<fullPathArray.length;i++) {
                await this.deleteFile(fullPathArray[i]);
            }
        }
    }


    async buildDownloadItems(item: ResponseItem) {
        return new Promise((resolve, reject) => {
            UtilTools.getConfig().then((config: ConfigType)=>{
                let cacheItem: DownloadListItem = {};
                let itemPackage: SetupPackage;
                itemPackage = {
                    uuid: item.uuid,
                    name: item.name + "." + item.extName,
                    img: item.img,
                    size: item.size
                };
                cacheItem.itemObj = itemPackage;
                cacheItem.element = <DownloadApplicationItem
                    key={cacheItem.itemObj.uuid}
                    url={config.server+"/files/blobdownload/"}
                    package={cacheItem.itemObj}
                    chunk={1024}
                    onRef={(ref) => {
                        cacheItem.ref = ref;
                        ref.readyComponentState().then();
                    }} onReady={()=>{
                    resolve(cacheItem);
                }} onError={(at:number)=>{
                    if (at === 0) {// not ready yet
                        reject();  // so we need reject
                    } else { // during download already
                        this.downloadNextItem(); // just turn next to download status
                    }
                }} onFinished={(file:SetupPackage)=>{
                    this.actionAfterFinished(file).then().catch((e)=>{
                        console.error(e);
                        UtilTools.dumpLog('ERR', e.stack);
                    });
                }}/>;
                this.setState((pre) => {
                    pre.download_list.push(cacheItem);
                    return pre;
                })
            });
        })
    }
    appendReDownloadItem(file: SetupPackage){
        let downloadedItem: DownloadListItem = this.state.downloaded_list.find((value: DownloadListItem) => {
            return value.itemObj.uuid === file.uuid;
        });
        if (downloadedItem) {
            let index = this.state.downloaded_list.indexOf(downloadedItem);
            this.setState((pre)=>{
                pre.downloaded_list.splice(index, 1);
                pre.reDownload_list.push(downloadedItem);
                return pre;
            })
        }
    }
    updateItemRemoteState(id, state) {
        return new Promise((resolve, reject) => {
            UtilTools.getConfig().then((config: ConfigType)=>{
                let options = {
                    url: config.server + '/api/',
                    method: "POST",
                    json : {
                        "module": "software",
                        "api": "octlink.quantum.v1.software.APIUpdateSoftwareState",
                        "paras": {
                            "clientId": config.uuid,
                            "id": id,
                            "state": state,
                            "timeout": 0
                        },
                        "async": false,
                        "session": {
                            "uuid": "00000000000000000000000000000000",
                            "skey": "00000000000000000000000000000000"
                        }
                    }
                };
                request(options, (err, resp, body)=>{
                    if (err) {
                        reject(err);
                    } else {
                        if (resp.statusCode !== 200) {
                            reject(new Error(resp.statusMessage));
                        } else {
                            if(body.errorObj.errorNo !== 0) {
                                reject(new Error(body.errorObj.errorMsg));
                            } else {
                                resolve();
                            }
                        }
                    }
                })
            });

        });


    }
    requestList():Promise<ResponseItem[]> {
        return new Promise((resolve, reject) => {
            UtilTools.getConfig().then((config:ConfigType)=>{
                let options = {
                    url: config.server+"/api/",
                    method: "POST",
                    json : {
                        "module": "software",
                        "api": "octlink.quantum.v1.software.APIShowAllSoftware",
                        "paras": {
                            "clientId": config.uuid,
                            "mac": config.mac,
                            "ip": config.ip,
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
                            reject(new Error(resp.statusMessage));
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
        });
    }

    render() {
        return <div className={'list-view'}>
            <div className={"view-stage"}>
                <TitlePanel
                    viewHeight={VIEW_HEIGHT}
                    graph={<Icon iconName={'download'}/>}
                    title={"下载列表"}
                    onRef={(ref) => {
                        this.setState({
                            download_list_ref:ref
                        }, () => {
                            this.state.download_list_ref.triggerOpen(true);
                        });
                    }}
                    onOpen={()=>{
                        this.state.downloaded_list_ref.triggerOpen();
                        console.log('download open');
                    }}
                    tag={"(" + this.state.download_list.length + ")"}
                    content={
                        this.state.download_list.map((item) => {
                            return item.element;
                        })
                    }/>
                <TitlePanel
                    viewHeight={VIEW_HEIGHT}
                    graph={<Icon iconName={'check'}/>}
                    title={"已下载列表"}
                    onRef={(ref) => {
                        this.setState({
                            downloaded_list_ref:ref
                        }, () => {
                        })
                    }}
                    onOpen={()=>{
                        this.state.download_list_ref.triggerOpen();
                        console.log('already download open');
                    }}
                    tag={"(" + this.state.downloaded_list.length + ")"}
                    content={
                        this.state.downloaded_list.map((item) => {
                            return item.element;
                        })
                    }/>
            </div>
        </div>
    }
}