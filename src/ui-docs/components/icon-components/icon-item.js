import * as React from "react";
import type {IconProps} from "../../../ui";
import {Icon} from "../../../ui";
import * as styles from "./icon-item.scss";

export type IconItemProps = {
    icon: IconProps,
    keyword: string
}

export class IconItem extends React.Component<IconItemProps> {
    constructor(props:IconItemProps) {
        super(props);
    }
    searchKeyWord(): HTMLElement{
        let name = this.props.icon.iconName;
        let index = name.indexOf(this.props.keyword);
        let dumps: [{isKey: boolean, value: string}] = [];
        if (index < 0 || this.props.keyword.length === 0) {
            dumps.push({
                isKey: false,
                value: name
            });
        } else if (index === 0) {
            dumps.push({
                isKey: true,
                value: this.props.keyword
            });
            if (name.length > this.props.keyword.length) {
                dumps.push({
                    isKey: false,
                    value: name.substr(this.props.keyword.length)
                });
            }
        } else {
            dumps.push({
                isKey: false,
                value: name.substr(0, index)
            });
            dumps.push({
                isKey: true,
                value: this.props.keyword
            });
            if (index + this.props.keyword.length < name.length) {
                dumps.push({
                    isKey: false,
                    value: name.substr(index + this.props.keyword.length)
                })
            }
        }
        return <div className={styles["icon-name-part"]}>{
            dumps.map((value, index) => {
                if (value.isKey) {
                    return (<span key={index} className={styles["icon-name-key"]}>{value.value}</span>);
                } else {
                    return (<span key={index} className={styles["icon-name-str"]}>{value.value}</span>);
                }
            })
        }</div>
    }
    render() {
        return (
            <div className={styles["icon-item"]}>
                <div className={styles["icon-part"]}>
                    <Icon {...this.props.icon} />
                </div>
                {this.searchKeyWord()}
            </div>
        );
    }
}