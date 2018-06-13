import React from "react";
import * as styles from "./nav-list.scss";

export class NavList extends React.Component{
    constructor(props) {
        super(props);
    }
    render() {
        return (
              <ul className={styles["nav-ul"]}>
                  {this.props.children}
              </ul>
        );
    }
}