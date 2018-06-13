import React from "react";
import {ipcRenderer} from 'electron';
import './config-view.scss';
import {Button, Icon} from "../../ui";
import {TextInput} from "../../ui/text-input/text-input";
import {PathChooser} from "../path-chooser/path-chooser";
import type {ConfigType} from "../util/tools";
import {UtilTools} from "../util/tools";
import type {ValidateResult} from "../../ui/text-input/text-input";
const url = require('url');

export type ConfigViewProps = {
    onSubmitFinish?: ()=>void,
    onCancelClick?: ()=>void,
    onRef?:(ref)=>void
}

export type ConfigViewStates = {
    uuidRef: TextInput,
    serverRef: TextInput,
    downloadPathRef: PathChooser,
    serverResult: ValidateResult,
    submitEnable: boolean,
    submitSpin: boolean,
    cancelEnable: boolean,
}

export class ConfigView extends React.Component<ConfigViewProps, ConfigViewStates>{
    configCache: ConfigType;
    triggerCount: number;
    triggerZeroInterval: number;
    constructor(props: ConfigViewProps) {
        super(props);
        this.state={
            uuidRef: null,
            serverRef: null,
            downloadPathRef: null,
            serverResult: null,
            submitEnable: false,
            submitSpin: false,
            cancelEnable: true
        };
        this.triggerCount= 0;
    }
    doDevTrigger(){
        if(this.triggerCount === 5) {
            ipcRenderer.send('open-dev');
        } else {
            this.triggerCount += 1;
        }
    }
    componentDidMount() {
        if(this.props.onRef){
            this.props.onRef(this);
        }
       this.flushDefaultInfo();
        this.triggerZero();
    }
    componentWillUnmount(){
        clearImmediate(this.triggerZeroInterval);
    }
    triggerZero(){
        this.triggerZeroInterval = setInterval(()=>{
            this.triggerCount = 0;
        }, 10*1000);
    }
    flushDefaultInfo(){
        return new Promise((resolve) => {
            UtilTools.getConfig().then((val)=>{
                this.configCache = val;
                this.state.serverRef.value(this.configCache.server);
                this.state.serverRef.validate();
                this.state.downloadPathRef.value(this.configCache.downloadPath);
                this.state.uuidRef.value(this.configCache.uuid);
                resolve();
            })
        });

    }
    serverClass(){
        if(this.state.serverResult && !this.state.serverResult.isOK){
            return " error";
        }else{
            return "";
        }
    }
    doConfigSubmit(){
        let changeToSubmit = () => new Promise((resolve) => {
            this.setState({
                submitEnable: false,
                submitSpin: true,
                cancelEnable: false
            }, ()=>{
                resolve();
            })
        });
        let doCheckServer = () => new Promise((resolve, reject) => {
            this.configCache.server = this.state.serverRef.value();
            this.configCache.downloadPath = this.state.downloadPathRef.value();
            UtilTools.checkServer(this.configCache).then(()=>{
                resolve();
            }).catch((err)=>{
                reject(err);
            })
        });
        let doSubmit = () => new Promise((resolve, reject) => {
            UtilTools.updateConfig(this.configCache).then(()=>{resolve()}).catch((err)=>{reject(err)});
        });
        let processOK = ()=>{
            if(this.props.onSubmitFinish){
                this.props.onSubmitFinish();
            }
            this.setState({
                submitEnable:true,
                submitSpin: false,
                cancelEnable: true
            });
        };
        let processError = (err)=>{
            this.setState({
                submitEnable:true,
                submitSpin: false,
                cancelEnable: true,
                serverResult: {
                    isOK: false,
                    msg: err.message
                }
            });
        };
        changeToSubmit().then(()=>{
            doCheckServer().then(()=>{
                doSubmit().then(()=>{
                    processOK();
                }).catch((err)=>{
                    processError(err);
                })
            }).catch((err)=>{
                processError(err);
            })
        })
    }
    render(){
        return <div className={'config-view'}>
            <div className={'config-form'}>
                <div className={'uuid'}>
                    <TextInput
                        label={'终端标识'}
                        readOnly={true}
                        onRef={(ref)=>{
                            this.setState({
                                uuidRef: ref
                    })}}/>
                </div>
                <div className={'server-input'+this.serverClass()}>
                    <div className={'input-and-tag'}>
                        <TextInput
                            placeHolder={'http://xxx.xxx.xxx.xxx:8008/'}
                            onRef={(ref)=>{
                                this.setState({
                                    serverRef: ref
                                });
                            }}
                            validator={(val)=>{
                                try{
                                    let server =  url.parse(val);
                                    if (!server.host || !server.protocol){
                                        return {
                                            isOK:false,
                                            msg:'服务地址异常！'
                                        }
                                    } else {
                                        return {
                                            isOK:true,
                                            msg:'配置服务地址URL'
                                        }
                                    }
                                } catch (e) {
                                    return {
                                        isOK:false,
                                        msg:'服务地址异常！'
                                    }
                                }
                            }}
                            onValidateResult={(ret)=>{
                                this.setState({
                                    submitEnable: ret.isOK,
                                    serverResult: ret
                                })
                            }}
                            label={"服务地址"}
                        />
                        <div className={'error-tag'}>
                           <Icon iconName={'close'}/>
                        </div>
                    </div>
                    <div className={'server-msg'}>
                        {this.state.serverResult && this.state.serverResult.msg}
                    </div>
                </div>
                <div className={'path-input'}>
                    <PathChooser
                        onRef={(ref)=>{
                            this.setState({
                                downloadPathRef: ref
                            });
                        }}

                        label={"存储路径"}/>
                </div>
                <div className={'dev-trigger'} onClick={()=>{
                    this.doDevTrigger();
                }} style={{
                    position: 'absolute',
                    bottom:0,
                    right: 0,
                    width: '2rem',
                    height: '2rem'
                }}>

                </div>
            </div>
            <div className={'action-buttons'}>
                    <Button className={['submit']} graph={<Icon spin={this.state.submitSpin} iconName={'cog'}/>} label={"提交配置"}
                            disabled={!this.state.submitEnable}
                            onClick={()=>{
                                this.doConfigSubmit();
                            }}/>
                    <Button disabled={!this.state.cancelEnable} className={['cancel']} label={"取消"} onClick={()=>{
                        if(this.props.onCancelClick) {
                            this.props.onCancelClick();
                        }
                    }}/>
            </div>
        </div>
    }
}