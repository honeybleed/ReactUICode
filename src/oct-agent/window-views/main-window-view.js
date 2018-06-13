import React from "react";
import "./main-window-view.scss";
import {Route, Switch} from "react-router-dom";
import {RealView} from "./real-view";

export class MainWinView extends React.Component<any, any> {
    render() {
        return (
            <div className={'main-window-view'}>
                <Switch>
                    <Route path={""} exact component={RealView}/>
                </Switch>
            </div>
        )
    }
}