import React from "react";
import {Button, Icon} from "../../ui";
import {TextInput} from "../../ui/text-input/text-input";
import type {ValidateResult} from "../../ui/text-input/text-input";
import {APIRequest} from "../APITools";
import type {LoginResponse} from "../APITools";
import {CookieTools} from "../cookie-tools";
import {Redirect} from "react-router-dom";

export type OCTAgentDashboardLoginStates = {
    info:string,
    submitDisabled: boolean,
    isNameOK: ValidateResult,
    isPasswordOK: ValidateResult,
    submitIcon: string,
    submitSpin: boolean,
    redirect: boolean
}

export class OCTAgentDashboardLogin extends React.Component<any, OCTAgentDashboardLoginStates> {
    accountRef: TextInput;
    passwordRef: TextInput;
    constructor(props: any){
        super(props);
        this.state = {
            info: '',
            isNameRet: null,
            isPasswordRet: null,
            submitDisabled: true,
            submitIcon: 'sign-in',
            submitSpin: false,
            redirect: false
        }
    }
    getInfo(){
        if(this.state.info !== ''){
            return this.state.info;
        }
        if(this.state.isNameRet!== null && this.state.isPasswordRet !== null){
            if(!this.state.isNameRet.isOK){
                return this.state.isNameRet.msg
            } else if(!this.state.isPasswordRet.isOK){
                return this.state.isPasswordRet.msg
            } else {
                return "";
            }
        } else {
            return "";
        }
    }
    disableSubmitByInput(){
        let ret = true;
        if(this.state.isNameRet!== null && this.state.isPasswordRet !== null){
            ret = !(this.state.isNameRet.isOK && this.state.isPasswordRet.isOK);
        } else {
            ret = true;
        }
        this.setState({
            submitDisabled: ret
        })
    }
    async beforeSubmit(){
        return new Promise((resolve) => {
            this.setState({
                info:"",
                submitDisabled: true,
                submitIcon: 'spinner',
                submitSpin: true
            }, ()=>{
                resolve();
            })
        });
    }
    async afterSubmit(err: Error, ret: LoginResponse){
        return new Promise((resolve) => {
            if(err) {
                this.setState({
                    info: err.message,
                    submitDisabled: false,
                    submitIcon: 'sign-in',
                    submitSpin: false
                }, ()=>{
                    resolve();
                });
            } else {
                CookieTools.setCookie(ret.name);
                this.setState({
                    redirect: true
                });
                resolve();
            }
        });
    }

    async doSubmit(){
        await this.beforeSubmit();
        let resp:LoginResponse = null;
        let hasError: Error = null;
        try{
            resp = await APIRequest.doLogin(this.accountRef.value(), this.passwordRef.value());
        } catch (e) {
            hasError = e;
        }
        if (hasError !== null) {
            console.error(hasError);
        }
        await this.afterSubmit(hasError, resp);
    }
    render(){
        if(this.state.redirect) {
            return <Redirect to={'/'}/>
        }
        return <div className={'login-view'}>
            <div className={'login-panel'}>
                <div className={'title'}>
                    <Icon iconName={'sign-in'}/>
                    <span className={'label'}>登录 OCTAgent 管理面板</span>
                </div>
                <div className={'login-form'}>
                    <div className={'input-range'}>
                        <div className={'user-name-input'}>
                            <TextInput
                                onRef={(ref)=>{this.accountRef = ref;}}
                                label={'用户名'}
                                onValidateResult={(ret: ValidateResult)=>{
                                    this.setState({
                                        isNameRet: ret,
                                        info: ''
                                    },()=>{
                                        this.disableSubmitByInput();
                                    })
                                }}
                                validator={(val: string)=>{
                                return {
                                    isOK: val.length > 0,
                                    msg: val.length > 0 ? "" : "用户名不能为空！"
                                }
                            }}/>
                        </div>
                        <div className={'password-input'}>
                            <TextInput
                                onRef={(ref)=>{this.passwordRef = ref;}}
                                label={'密码'}
                                password={true}
                                onValidateResult={(ret: ValidateResult)=>{
                                    this.setState({
                                        isPasswordRet: ret,
                                        info: ''
                                    }, ()=>{
                                        this.disableSubmitByInput();
                                    })
                                }}
                                validator={(val: string)=>{
                                    return {
                                        isOK: val.length > 0,
                                        msg: val.length > 0 ? "" : "密码不能为空！"
                                    }
                            }}/>
                        </div>
                    </div>
                    <div className={'info'}>
                        {this.getInfo()}
                    </div>
                    <div className={'submit-button'}>
                        <Button label={'登录'}
                                onClick={()=>{
                                    this.doSubmit().then();
                                }}
                                disabled={this.state.submitDisabled}
                                graph={<Icon iconName={this.state.submitIcon} spin={this.state.submitSpin}/>}/>
                    </div>
                </div>
            </div>
        </div>
    }
}