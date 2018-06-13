import React from "react";
import type {SetupPackage} from "../download-item/download-item";
import {Button, Icon} from "../../ui";
import {UtilTools} from "../util/tools";
import type {ConfigType} from "../util/tools";
const path = require('path');
const cp = require('child_process');
const iconv = require('iconv-lite');
const os = require('os');
import {ipcRenderer, shell} from 'electron';

export type FileDownloadApplicationProps = {
    package: SetupPackage,
    onRequestDownloadAgain?: (file: SetupPackage) => void,
    onRequestSetup?:(file:SetupPackage)=>void
}

export type FileDownloadApplicationStates = {
    isSetup: boolean,
    reDownloadDisabled: boolean,
    reInstallDisabled: boolean,
    installDisabled: boolean
}

export class FileDownloadedApplication extends React.Component<FileDownloadApplicationProps, FileDownloadApplicationStates> {
    constructor(props: FileDownloadApplicationProps) {
        super(props);
        this.state = {
            reDownloadDisabled: false,
            reInstallDisabled: false,
            installDisabled: false,
            isSetup: this.props.package.installState === 'installed'
        }
    }
    concatClassName() {
        let names = ['file-item'];
        if(this.state.isSetup) {
            names.push('setup')
        }
        return names.join(" ");
    }
    getStateTag() {
        return this.state.isSetup?"已安装":"已下载"
    }
    makeReSetupIcon() {
        return <div className={'re-setup-icon'}>
            <div className={'refresh-part'}>
                <Icon iconName={'refresh'}/>
            </div>
            <div className={'check-part'}>
                <Icon iconName={'check'}/>
            </div>
        </div>
    }
    doInstall(){
        if(this.props.onRequestSetup){
            this.props.onRequestSetup(this.props.package);
        }
        UtilTools.getConfig().then((config: ConfigType)=>{
            let file_path = path.join(config.downloadPath, this.props.package.uuid, this.props.package.name);
            cp.exec("\""+file_path+"\"", {encoding: 'binary'}, (err, stdout, stderr)=>{
                if(err){
                    let error = "";
                    if(os.platform() === 'win32'){
                        error = iconv.encode(iconv.decode(new Buffer(stderr, 'binary'), 'GBK'), 'utf-8');
                    } else {
                        error = new Buffer(stderr, 'utf-8');
                    }
                    ipcRenderer.send('show-error', {
                        title: this.props.package.name + " 安装失败",
                        msg: error.toString()
                    }, ()=>{
                        this.setState({
                            reInstallDisabled: false
                        });
                    });
                    UtilTools.dumpLog('ERR', error);
                } else {
                    let info = "";
                    if(os.platform() === 'win32'){
                        info = iconv.encode(iconv.decode(new Buffer(stdout, 'binary'), 'GBK'), 'utf-8');
                    } else {
                        info = new Buffer(stdout, 'utf-8');
                    }
                    UtilTools.dumpLog('INFO', this.props.package.name + " setup over " + info);
                    this.setState({
                        reInstallDisabled: false
                    });
                }
            })
        })
    }
    render() {
        return <div className={this.concatClassName()}>
            <div className={'view-gap'}>
                <div className={'main-view'}>
                    <span className={'graph'}>
                    {this.props.package.img && <img src={"data:image;base64,"+this.props.package.img}/>}
                </span>
                    <div className={'name'}>
                        {this.props.package.name && <span className={'name'} title={this.props.package.name}>{this.props.package.name}</span>}
                    </div>
                    <div className={'state-tag'}>
                        {this.getStateTag()}
                    </div>
                </div>
                <div className={'action-info'}>
                    <div className={'open-action'} title={'打开文件目录'}>
                        <Button
                            graph={<Icon iconName={"folder-open-o"}/>}
                            onClick={()=>{
                                UtilTools.getConfig().then((config: ConfigType)=> {
                                    let file_path = path.join(config.downloadPath, this.props.package.uuid, this.props.package.name);
                                    if(!shell.showItemInFolder(file_path)){
                                        ipcRenderer.send('show-error', {
                                            title: this.props.package.name + " 文件路径异常",
                                            msg: "目录["+file_path+"]不存在！"
                                        });
                                    }
                                });
                            }}/>
                    </div>
                    <div className={'retry-action'} title={'重新下载'}>
                        <Button
                            graph={<Icon iconName={"repeat"}/>}
                            disabled={this.state.reDownloadDisabled}
                            label={'重新下载'}
                            onClick={()=>{
                                this.setState({
                                    reDownloadDisabled: true
                                },()=>{
                                    if (this.props.onRequestDownloadAgain) {
                                        this.props.onRequestDownloadAgain(this.props.package)
                                    }
                                });
                            }}/>
                    </div>
                    <div className={'setup-action'} title={'安装程序'}>
                        <Button graph={<Icon iconName={"check"}/>}
                                disabled={this.state.installDisabled}
                                onClick={()=>{
                                    this.setState({
                                        isSetup: true,
                                        reInstallDisabled: true
                                    });
                                    this.doInstall();
                                }}
                                label={'安装程序'}/>
                    </div>
                    <div className={'retry-setup-action'} title={'重新安装'}>
                        <Button graph={this.makeReSetupIcon()}
                                disabled={this.state.reInstallDisabled}
                                onClick={()=> {
                                    this.setState({
                                        reInstallDisabled: true
                                    });
                                    this.doInstall();
                                }}
                                label={'重新安装'}/>
                    </div>
                </div>
            </div>
        </div>
    }
}