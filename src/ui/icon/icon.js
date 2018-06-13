import React from "react";
import styles from "./icon.scss";
import icons from "../assets/style/icons.css";
import camelCase from "camelcase";

export const INNER_ICON_NAME: string = "fa";
export const SPIN_CLASS: string = "icon-spin";
export const PULSE_CLASS: string = "icon-pulse";

export type IconProps = {
    fontFamily?: string,
    iconName: string,
    spin?: boolean,
    pulse?: boolean,
    rotate?: 90 | 180 | 270,
    flip?: "horizontal" | "vertical",
    className?: [string]
};

export class Icon extends React.Component<IconProps> {
    concatClassNames(): string {
        let names = [
            styles["u-icon"],
        ];
        let iconNameStr = (this.props.fontFamily || INNER_ICON_NAME) +"-"+this.props.iconName;
        names.push(iconNameStr);
        if (this.props.rotate) {
            names.push("rotate-" + this.props.rotate);
        }
        if (this.props.flip) {
            names.push("flip-" + this.props.flip);
        }
        if (this.props.spin) {
            names.push(SPIN_CLASS);
        }
        if (this.props.pulse) {
            names.push(PULSE_CLASS);
        }
        if (this.props.className) {
            let uniqueNames = Array.from(new Set(this.props.className));
            names.push(...uniqueNames);
        }
        return names.join(" ");
    }
    render() {
        let familyStyle = {
            fontFamily: this.props.fontFamily || INNER_ICON_NAME
        };
        return <i className={this.concatClassNames()} style={familyStyle} />
    }
}
export class IconHelper {
     static getAllInnerIcons():{(key: string):string} {
        let ret = {};
        Object.getOwnPropertyNames(icons).map((iconName: string)=> {
            let name = camelCase(iconName.substr(3));
            Object.defineProperty(ret, name, {
                enumerable: true,
                value: iconName.substr(3)
            })
        });
        return ret;
    }
}
export const IconMap = IconHelper.getAllInnerIcons();

