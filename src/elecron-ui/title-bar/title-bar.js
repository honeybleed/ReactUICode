import React from "react";
import {Button} from "../../ui/button/button";

export type TitleBarProps = {
    icon?: any,
    title?: string,
    buttons?: [Button]
}

export class TitleBar extends React.Component<TitleBarProps> {
    render() {
        return (
            <div className={"electron-ui-title-bar"}>
                <div className={"drag-zone"}>
                    {this.props.icon && <div className={"win-icon"}>{this.props.icon}</div>}
                    {this.props.title && <div className={"win-title"}>{this.props.title}</div>}
                </div>
                {this.props.buttons && this.props.buttons.length > 0 && <div className={"win-buttons"}>
                    {this.props.buttons}
                </div>}
            </div>
        )
    }
}