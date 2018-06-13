import React from "react";
import {ipcRenderer} from 'electron';
import {Button, Icon} from "../../ui";

export type PathChooserProps = {
    graph?: any,
    label?: string,
    disabled?: boolean,
    placeholder?:string,
    onClick?: () => void,
    className?: [string],
    onRef?:(ref:PathChooser)=>void
}
export type PathChooserStates = {
    value: string
}

export class PathChooser extends React.Component<PathChooserProps, PathChooserStates> {
    constructor(props: PathChooserProps) {
        super(props);
        this.state = {
            value: ""
        }
    }
    componentDidMount() {
        if(this.props.onRef) {
            this.props.onRef(this);
        }
    }
    value(value: string): string {
        if(value){
            this.setState({
                value : value
            });
        } else {
            return this.state.value;
        }
    }
    concatClassName(): string {
        let names: [string] = ["u-path-chooser"];
        if (this.props.disabled) {
            names.push("disabled");
        } else {
        }
        if (this.props.className) {
            let uniqueNames = Array.from(new Set(this.props.className));
            names.push(...uniqueNames);
        }
        return names.join(" ");
    }
    buttonClick(){
            ipcRenderer.send('open-download-path', this.state.value);
            ipcRenderer.once('download-path-choose', (event, args)=>{
                this.setState({
                    value: args[0]
                });
            })
    }
    render(){
        return <div className={this.concatClassName()}>
            {this.props.graph && <span className={"graph"}> {this.props.graph} </span>}
            {this.props.label && <span className={"label"}> {this.props.label} </span>}
            <div className={'input-part'} title={this.state.value}>
                <input className={'input'} type={'text'} readOnly={true} value={this.state.value} placeholder={this.props.placeholder}/>
                <Button graph={<Icon iconName={"folder-open-o"}/>} onClick={()=>{
                    this.buttonClick();
                }}/>
            </div>
        </div>
    }
}