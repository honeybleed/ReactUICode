import {render} from "react-dom";
import {HashRouter, Redirect, Route, Switch} from "react-router-dom";
import React from "react";
import './style.scss';
import '../theme-style/theme.default.scss';
import {CookieTools} from "./cookie-tools";
import {OCTAgentDashboard} from "./views/main-view";
import {OCTAgentDashboardLogin} from "./views/login-view";
import {EventEmitter} from "events";
import {global_error_event} from "./EventController";

function checkCookie(): boolean {
    let account = CookieTools.getCookie();
    return account !== '';
}
export class LoginMainSwitcher extends React.Component {
    error_event: EventEmitter;
    constructor(props: any){
        super(props);
        this.error_event = global_error_event;
        this.error_event.on('error', (err)=>{
            console.error(err);
        })
    }
    render(){
        return <Switch>
            <Route exact path={'/'} render={()=>{
                return !checkCookie() ? <Redirect to={'/login'}/> : <Redirect to={'/main'}/>
            }}/>
            <Route exact path={'/login'} render={()=>{
                return checkCookie() ? <Redirect to={'/main'}/> : <OCTAgentDashboardLogin/>
            }}/>
            <Route path={'/main'} render={()=>{
                return !checkCookie() ? <Redirect to={'/login'}/> : <OCTAgentDashboard/>
            }}/>
        </Switch>
    }
}
render((
    <HashRouter>
        <LoginMainSwitcher/>
    </HashRouter>
), document.getElementById("react-root"));

