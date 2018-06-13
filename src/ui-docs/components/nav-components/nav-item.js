import React from "react";
import {NavLink} from "react-router-dom";
import * as styles from "./nav-item.scss";

export type NavItemProps = {
    graph?: React.Component,
    label?: string,
    path: string,
    onActive: (isActive: boolean) => void
}

export type NavItemStates = {
    isActive: boolean
}

export class NavItem extends React.Component<NavItemProps, NavItemStates>{
    constructor (props: NavItemProps) {
        super(props);
        this.state = {
            isActive: false
        };
    }
    render() {
        return (
            <li>
                <NavLink to={this.props.path} replace={true} exact className={styles["nav-item-link"]}>
                    {this.props.graph && (<span className={styles.graph}>{this.props.graph}</span>)}
                    {this.props.label && (<span className={styles.label}>{this.props.label}</span>)}
                </NavLink>
                {this.props.children && (
                    <ul className={styles["sub-nav-ul"]}>
                        {this.props.children}
                    </ul>
                )}
            </li>
        );
    }
}