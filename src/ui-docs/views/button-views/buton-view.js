import React from "react";
import {Button} from "../../../ui/button/button";
import {Icon} from "../../../ui";
import "./button-view.scss";

export class ButtonView extends React.Component{

    render() {
        return (
            <div>
                <div className={"button-group"}>
                    <span className={"button-group-title"}>for default style with not style classNames </span>
                    <span className={"button-item"}>
                        <Button graph={<Icon iconName={"star"}/>} label={'default'}/>
                    </span>
                    <span className={"button-item"}>
                        <Button graph={<Icon iconName={"star"}/>} disabled={true} label={'disable'}/>
                    </span>
                    <span className={"button-item"}>
                        <Button graph={<Icon iconName={"star"}/>}/>
                    </span>
                </div>
                <div>
                    <h1>css - list</h1>
                    <li>
                        <span className={"code"} >.u-button</span><br/>
                    </li>
                    <li>
                        <span className={"code"} >.u-button [.disable | .hover | .down | :focus]</span><br/>
                    </li>
                    <li>
                        <span className={"code"} >.u-button (.graph | .label)</span>
                    </li>
                </div>
            </div>
        )
    }
}