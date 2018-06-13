import React from "react";
import {Button, Icon} from "../../ui";
import './prepare-view.scss';
import {UtilTools} from "../util/tools";

export type PrepareViewProps = {
    onConfigOK?: ()=>void,
    onConfigError?: (err:Error)=>void,
    onRequestConfig?:()=>void,
    onRef?:(ref)=>void
}
export type PrepareViewStates = {
    errorInfo: string,
    isError: boolean,
    isSuccess: boolean,
    iconStyle: any,
    iconName: string,
    iconSpin: boolean,
    repeatDisabled: boolean,
    configDisabled: boolean,
}
export class PrepareView extends React.Component<PrepareViewProps, PrepareViewStates>{
    constructor(props: PrepareViewProps) {
        super(props);
        this.state = {
            errorInfo:"检查配置信息......",
            isError: false,
            isSuccess: false,
            iconStyle:{
            },
            iconName: 'spinner',
            iconSpin: true,
            repeatDisabled: true,
            configDisabled: true
        };
    }
    componentDidMount() {
        if(this.props.onRef){
            this.props.onRef(this);
        }
        this.doCheckConfig().then();
    }
    async setIconStyle(style, delay) {
        return new Promise((resolve) => {
            this.setState({
                iconStyle: style
            }, ()=>{
                setTimeout(()=>{resolve()}, delay)
            })
        })
    }
    async showError(errorInfo){
        this.setState({
            errorInfo: errorInfo,
            isError: true,
            isSuccess: false,
        }, ()=>{
            if(this.props.onConfigError) {
                this.props.onConfigError(new Error(this.state.errorInfo))
            }
        });
        await this.updateIcon({iconSpin: false});
        await this.setIconStyle({
            transform: "scale(.5)",
            opacity: 0
        }, 200);
        await this.updateIcon({iconName: 'close'});
        await this.setIconStyle({
            transform: "scale(1)",
            opacity: 1,
            color: "#ff5555",
            textShadow: "0 0 1rem #ff5555"
        }, 200);

    }
    async doCheckConfig(){
        try{
            let isExist = await UtilTools.isConfigExist();
            console.log(isExist);
            if (!isExist) {
                await UtilTools.initConfig();
                setTimeout(()=>{
                    if(this.props.onRequestConfig){
                        this.props.onRequestConfig(); // if no config file create it and trans to config page
                    }
                }, 1000);
            } else {
                let config = await UtilTools.getConfig();
                if(!UtilTools.isConfigAllNotEmpty(config)){
                    await UtilTools.initConfig();
                    await this.showError("配置信息不完整!");
                    setTimeout(()=>{
                        if(this.props.onRequestConfig){
                            this.props.onRequestConfig();// if config info has empty create it and trans to config page
                        }
                    }, 1000);
                } else {
                    await UtilTools.checkServer(config);
                    await this.showSuccess();
                    setTimeout(()=>{
                        if(this.props.onConfigOK) {
                            this.props.onConfigOK(); //if config info and server all right, trans to list page
                        }
                    }, 1000);
                }
            }
        } catch (e) {
            this.setState({
                repeatDisabled: false,
                configDisabled: false
            }, ()=>{
                this.showError(e.message).then();
            })
        }

    }

    async showSuccess(){

        await this.updateIcon({iconSpin: false});
        await this.setIconStyle({
            transform: "scale(.5)",
            opacity: 0
        }, 200);
        await this.updateIcon({iconName: 'check'});
        await this.setIconStyle({
            transform: "scale(1)",
            opacity: 1,
            color: "#55bb55",
            textShadow: "0 0 1rem #55bb55"
        }, 200);
        this.setState({
            errorInfo: "配置信息加载成功!",
            isError: false,
            isSuccess: true,
        })
    }
    async showChecking(){
        this.setState({
            errorInfo: "检查配置信息......",
            isError: false,
            isSuccess: false,
        }, ()=>{
        });
        await this.setIconStyle({
            transform: "scale(.5)",
            opacity: 0
        }, 200);
        await this.updateIcon({iconName: 'spinner', iconSpin: true});
        await this.setIconStyle({
            transform: "scale(1)",
            opacity: 1,
            color: "#64A9EC",
            textShadow: "0 0 1rem #64A9EC"
        }, 200);

    }
    async updateIcon(setting){
        return new Promise((resolve) => {
            this.setState(setting, ()=>{
                resolve();
            })
        });
    }
    concatClassNames(): string {
        let names = ['prepare-view'];
        if (this.state.isError) {
            names.push('error');
        }
        if(this.state.isSuccess) {
            names.push("success");
        }
        return names.join(' ');
    }
    processCheckAction(){
        this.setState({
            repeatDisabled: true,
            configDisabled: true
        }, ()=>{
            this.showChecking().then(()=>{
                this.doCheckConfig().then();
            });
        });
    }
    render(){
        return <div className={this.concatClassNames()}>
            <div className={'check-spinner'}>
                <div className={'state-icon'} style={this.state.iconStyle}>
                    <Icon iconName={this.state.iconName} spin={this.state.iconSpin}/>
                </div>
                <div className={'check-desc'}>
                    {this.state.errorInfo}
                </div>
            </div>
            <div className={'action-buttons'}>
                {/*<Button label={"Error"} onClick={()=>{*/}
                    {/*this.showError("检查异常").then();*/}
                {/*}}/>*/}
                {/*<Button label={"checking"} onClick={()=>{*/}
                    {/*this.showChecking().then();*/}
                {/*}}/>*/}
                {/*<Button label={"success"} onClick={()=>{*/}
                    {/*this.showSuccess().then();*/}
                {/*}}/>*/}
                <div className={'re-check'}>
                    <Button graph={<Icon iconName={'repeat'}/>} label={"重试"} disabled={this.state.repeatDisabled} onClick={()=>{
                        this.processCheckAction()
                    }}/>
                </div>
                <div className={'config'}>
                    <Button graph={<Icon iconName={'cog'}/>} label={"配置"} disabled={this.state.repeatDisabled} onClick={()=>{
                        if(this.props.onRequestConfig) {
                            this.props.onRequestConfig();
                        }
                    }}/>
                </div>
            </div>
        </div>
    }
}