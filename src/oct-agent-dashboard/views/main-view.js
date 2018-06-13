import React from "react";
import {NavItem, NavList} from "../../ui-docs/components/index";
import {Icon} from "../../ui/index";
import {CookieTools} from "../cookie-tools";
import {Button} from "../../ui";
import {HashRouter, Redirect, Route, Switch} from "react-router-dom";
import {ClientListView} from "./clients/client-list-view";

export type OCTAgentDashboardStates = {
    logout: boolean
}

function checkCookie(): boolean {
    let account = CookieTools.getCookie();
    return account !== '';
}

export class OCTAgentDashboard extends React.Component<any, OCTAgentDashboardStates>{
    constructor(props: any){
        super(props);
        this.state = {
            logout: false
        }
    }
    static getUserName(){
        return CookieTools.getCookie();
    }
    doLogout(){
        this.setState({
            logout: true
        });
    }
    render() {
        if (this.state.logout){
            CookieTools.removeCookie();
            return <Redirect to={'/login'}/>
        } else {
            return <div className={'octa-dashboard'}>
                <div className={'octa-top'}>
                    <span className={'title'}>OCTAgent Dashboard</span>
                    <span className={'user'}>
                        当前用户<span className={'name-tag'}> {OCTAgentDashboard.getUserName()}</span>
                    </span>
                    <span className={'log-out'}>
                    <Button
                        graph={<Icon iconName={'sign-out'}/>}
                        title={"退出登录状态"}
                        label={'退出'}
                        onClick={()=>{
                        this.doLogout();
                    }}/>
                </span>
                </div>
                <div className={'octa-center'}>
                    <div className={'octa-nav'}>
                        <NavList>
                            <NavItem path={"/main/clients"} graph={<Icon iconName={'desktop'}/>} label={"终端列表"}/>
                            <NavItem path={"/main/softwares"} graph={<Icon iconName={'save'}/>} label={"软件列表"}/>
                        </NavList>
                    </div>
                        <div className={'octa-main'}>
                            <Route exact path={'/main'} render={()=>{
                                return <Redirect to={'/main/clients'}/>
                            }}/>
                            <Route exact path={'/main/clients'} render={()=>{
                                return <ClientListView/>
                            }}/>
                            <Route exact path={'/main/softwares'} render={()=>{
                                return <div>softwares</div>
                            }}/>
                        </div>
                </div>
                <div className={'octa-bottom'}>
                    All rights copy to octopuslink <a href={'http://www.octlink.com'} target={'_blank'}> www.octlink.com </a>
                </div>
            </div>
        }

    }
}