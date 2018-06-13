import React from "react";
import {Route, Switch} from "react-router-dom";
import {NavItem, NavList} from "../../components/index";
import {Icon} from "../../../ui/index";
import * as styles from "./layout.scss";
import {IconMapView} from "../icon-views/icon-map-view";
import {ButtonView} from "../button-views/buton-view";
import {ElectronTitleBarView} from "../electron-title-bar-views/electron-title-bar-view";
import {TextInputView} from "../text-input-views/text-input-view";

export type ShowLayoutProps = {
    date: Date
}

export class LayoutView extends React.Component<ShowLayoutProps> {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className={styles.layout}>
                <div className={styles.top}>
                    <span className={styles.title}>UI 组件表</span>
                    <span className={styles.label}>last update:</span>
                    <span className={styles.date}>{this.props.date.toLocaleString()}</span>
                </div>
                <nav className={styles["nav-range"]}>
                    <NavList>
                        <NavItem path={"/"} graph={<Icon className={['bbb', 'ssss', 'bbb']} iconName={"fonticons"}/>} label={"Font Icons"}/>
                        <NavItem path={"/button"} graph={<Icon iconName={"hand-o-up"}/>} label={"Button"}/>
                        <NavItem path={"/title-bar"} graph={<Icon iconName={"window-maximize"}/>} label={"Electron Title Bar"}/>
                        <NavItem path={"/text-input"} graph={<Icon iconName={"italic"}/>} label={"Text Input"}/>
                    </NavList>
                </nav>
                <main className={styles.main}>
                    <Switch>
                        <Route path={"/"} exact component={IconMapView}/>
                        <Route path={"/button"} component={ButtonView}/>
                        <Route path={"/title-bar"} component={ElectronTitleBarView}/>
                        <Route path={'/text-input'} component={TextInputView}/>
                    </Switch>
                </main>
            </div>
        );
    }
}