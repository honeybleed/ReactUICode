import React from "react";
import {TitleBar} from "../../../elecron-ui";
import {Icon} from "../../../ui";
import {Button} from "../../../ui/button/button";
import './electron-title-bar-view.scss';

export class ElectronTitleBarView extends React.Component<any, any>{
    render() {
        return (
            <div>
                <div className={'win-group'}>
                    <div className={'win-container'}>
                        <TitleBar icon={<Icon iconName={"star"}/>} title={"hello world"} buttons={
                            [<Button key={'minus'} graph={<Icon iconName={"minus"}/>}/>,
                                <Button key={'close'} graph={<Icon iconName={"close"}/>}/>]
                        }/>
                    </div>
                    <div className={'win-container'}>
                        <TitleBar icon={<Icon iconName={"star"}/>} title={"hello world"} buttons={
                            [<Button key={'minus'} graph={<Icon iconName={"minus"}/>}/>,
                                <Button key={'close'} graph={<Icon iconName={"close"}/>}/>]
                        }/>
                    </div>
                    <div className={'win-container'}>
                        <TitleBar icon={<Icon iconName={"star"}/>} title={"hello world"} buttons={
                            [<Button key={'minus'} graph={<Icon iconName={"minus"}/>}/>,
                                <Button key={'close'} graph={<Icon iconName={"close"}/>}/>]
                        }/>
                    </div>
                </div>
                <div className={'css-list'}>
                    <h1 className={'title'}> css - list </h1>
                    <li>
                        .electron-ui-title-bar
                    </li>
                    <li>
                        .electron-ui-title-bar (.win-icon | .win-title | .win-buttons)
                    </li>
                </div>
            </div>
        )
    }
}