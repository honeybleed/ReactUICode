import React from "react";
import {IncomingMessage} from "http";
import {UtilTools} from "../util/tools";
import type {ConfigType} from "../util/tools";
const path = require("path");
const fs = require("fs");
const mkdir = require("mkdirp");
const url = require('url');
import {ipcRenderer} from 'electron';

export type DownloadItemProps = {
    onRef?:(ref: DownloadApplicationItem) => void,
    url: string,
    package: SetupPackage,
    chunk: number, //download chunk
    onError?: (at:number, err: Error) => void,
    onStart?: () => void,
    onReady?: (file:SetupPackage) => void,
    onFinished?: (file:SetupPackage) => void,
    isDownload?: boolean
}

export type SetupPackage = {
    uuid: string,
    name: string,
    img: string,
    size: number,
    installState: 'new'|'installed'|'downloaded'
}

export type DownloadItemStates = {
    errorInfo: string,
    fullPath: string,
    response: IncomingMessage,
    state: "preparing"|"ready" | "downloading" | "error" | "success",
    hasSize: number,
    toRemove: boolean
}

export class DownloadApplicationItem extends React.Component<DownloadItemProps, DownloadItemStates> {
    constructor(props: DownloadItemProps) {
        super(props);
        this.state = {
            fullPath: null,
            response:null,
            state: "preparing",
            hasSize: 0,
            toRemove: false
        };
    }
    componentDidMount() {
        if(this.props.onRef) {
            this.props.onRef(this);
        }
    }
    componentWillUnmount() {
        this.setState({
            toRemove: true
        })
    }
    async readyComponentState() {
        try {
            await this.initDownloadPath();
            await this.checkOldFile();
            if (this.props.onReady) {
                this.props.onReady();
            }
            // if (checkResult === 1) {
            //     if(this.props.onFinished) {
            //         this.props.onFinished(this.props.package);
            //     }
            // }
        } catch (e) {
            console.trace(e);
            this.catchError(0, "下载准备过程异常!");
        }
    }

    concatClassName() {
        let names = ['download-item', this.state.state];
        return names.join(" ");
    }
    async initDownloadPath() {
        let config: ConfigType = await UtilTools.getConfig();
        let downloadPath = path.join(config.downloadPath, this.props.package.uuid);
        return new Promise((resolve, reject) => {
            mkdir(downloadPath, (err) => {
                if(err) {
                    reject(err);
                } else {
                    this.setState({
                        fullPath: downloadPath
                    }, () => {
                        resolve();
                    })
                }
            });
        });
    }

    catchError(at:number, errorInfo: string) {
        this.setState({
            state: "error",
            errorInfo: errorInfo
        }, () => {
            if (this.props.onError) {
                this.props.onError(at, errorInfo);
            }
        })
    }

    async checkOldFile() {
        return new Promise((resolve, reject) => {
            let filePath = path.join(this.state.fullPath, this.props.package.name);
            fs.stat(filePath, (err, stat)=>{
                if(err) {
                    if (err.code === 'ENOENT') {
                        fs.appendFileSync(filePath, "", {flag: 'a'});
                        this.setState({
                            hasSize:0,
                            state: 'ready'
                        }, ()=>{
                            resolve(0);
                        });
                    } else {
                        reject(err);
                    }
                } else {
                    let oldSize = stat.size - 1;
                    this.setState({
                        hasSize: oldSize < 0 ? 0: oldSize,
                        state: 'ready'
                    }, () => {
                        resolve(0);
                    })
                }
            });
        });
    }
    async doDownload() {
        try {
            let chunkNum = Math.ceil((this.props.package.size - this.state.hasSize) / (this.props.chunk * 1024));
            for (let i = 0; i < chunkNum; i++) {
                if (this.state.toRemove) {break;}
                await this.downloadChunk();
                await this.waitMSAsync(10);
            }
            if(this.props.onFinished) {
                this.props.onFinished(this.props.package);
                this.setState({
                    state:"finished"
                })
            }
        } catch (e) {
            console.trace(e);
            this.catchError(1, "网络传输异常!");
        }
    }
    async waitMSAsync(ms: number){
        return new Promise((resolve) => {
            setTimeout(()=>{resolve();}, ms);
        });
    }
    async downloadChunk() {

        return new Promise((resolve, reject) => {
            let baseURL = url.parse(this.props.url);
            baseURL.query = {
                uuid: this.props.package.uuid,
                hasSize: this.state.hasSize,
                chunk: this.props.chunk*1024
            };
            let download_url = url.format(baseURL);
            let file_path = path.join(this.state.fullPath, this.props.package.name);
            let args = {
                download_url: download_url,
                file_path: file_path,
                uuid: this.props.package.uuid,
                start: this.state.hasSize
            };
            ipcRenderer.send('do-download', args);
            ipcRenderer.on('download-error', (event, args)=>{
                if(args.uuid === this.props.package.uuid) {
                    reject(args.error);
                }
            });
            ipcRenderer.on('download-update', (event, args)=>{
                if(args.uuid === this.props.package.uuid) {
                    this.setState((pre) => {
                        return {
                            hasSize: pre.hasSize + args.data
                        };
                    })
                }
            });
            ipcRenderer.on('download-finish', (event, args)=>{
                if(args.uuid === this.props.package.uuid) {
                    ipcRenderer.removeAllListeners('download-error');
                    ipcRenderer.removeAllListeners('download-update');
                    ipcRenderer.removeAllListeners('download-finish');
                    resolve();
                }
            })
        });

        // return new Promise((resolve, reject) => {
        //     let baseURL = url.parse(this.props.url);
        //     baseURL.query = {
        //         uuid: this.props.package.uuid,
        //         hasSize: this.state.hasSize,
        //         chunk: this.props.chunk*1024
        //     };
        //     let download_url = url.format(baseURL);
        //     let fileWriteStream = fs.createWriteStream( path.join(this.state.fullPath, this.props.package.name), {
        //         flags: 'r+',
        //         start: this.state.hasSize});
        //     fileWriteStream.on("finish", ()=>{
        //         resolve();
        //     }).on("error", (err)=>{
        //         reject(err);
        //     });
        //     // start do request
        //     request.get(download_url).on("response", (response) => {
        //         if(response.statusCode === 200) {
        //             response.on("data", (data) => {
        //                 this.setState((pre) => {
        //                     return {
        //                         hasSize: pre.hasSize + data.length
        //                     };
        //                 })
        //             }).pipe(fileWriteStream);
        //
        //         } else {
        //             reject(new Error("Error " + response.statusCode + " " + response.statusMessage));
        //         }
        //     }).on("error", (err) => {
        //         reject(err);
        //     }).on("end", ()=>{
        //         resolve();
        //     });
        // });
    }

    render() {
        return (
            <div className={this.concatClassName()}>
                <div className={'main-view'}>
                    <span className={'graph'}>
                    {this.props.package.img && <img src={"data:image;base64,"+this.props.package.img}/>}
                    </span>
                    <div className={'process-part'}>
                        <div className={'name-and-percent'}>
                            {this.props.package.name && <span className={'name'} title={this.props.package.name}>{this.props.package.name}</span>}
                        </div>
                        <div className={'process-bar'}>
                            <div className={'process-bar-done'} style={{
                                width: (this.state.hasSize / this.props.package.size * 100).toFixed(0) + "%"
                            }} />
                        </div>
                    </div>
                    <div className={'action-part'}>
                        {this.props.package.name &&
                        <div className={'percent'}>
                            {(this.state.hasSize / this.props.package.size * 100).toFixed(2) + "%"}
                        </div>}
                    </div>
                </div>

                <div className={'error-info'}>
                    <div className={'info'}>{this.state.errorInfo}</div>
                </div>
            </div>
        );
    }
}