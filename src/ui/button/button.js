import React from "react";
import "./button.scss";

export type ButtonProps = {
    graph?: any,
    title?:string,
    label?: string,
    disabled?: boolean,
    onClick?: () => void,
    className?: [string],
    onFocus?:()=>void,
    onBlur?:()=>void
}

export type ButtonStates = {
    hover: boolean,
    down: boolean
}

export class Button extends React.Component<ButtonProps, ButtonStates> {
    constructor(props: ButtonProps) {
        super(props);
        this.state = {
            hover:false,
            down: false
        };
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }
    clickCallBack() {
        if(this.props.onClick) {
            this.props.onClick();
        }
    }

    concatClassName(): string {
        let names: [string] = ["u-button"];
        if (this.props.disabled) {
            names.push("disabled");
        } else {
            if (this.state.hover) {
                names.push("hover");
            }
            if (this.state.down) {
                names.push("down");
            }
        }
        if (this.props.className) {
            let uniqueNames = Array.from(new Set(this.props.className));
            names.push(...uniqueNames);
        }
        return names.join(" ");
    }

    onMouseEnter() {
        if (!this.props.disabled && !this.state.hover) {
            this.setState({
                hover: true,
                down: false
            });
        }
    }
    onMouseLeave() {
        if(!this.props.disabled) {
            this.setState({
                hover:false,
                down: false
            })
        }
    }
    onMouseDown() {
        if(!this.props.disabled) {
            this.setState({
                hover:false,
                down: true
            })
        }
    }
    onMouseUp() {
        if(!this.props.disabled && !this.state.down) {
            this.setState({
                hover:false,
                down: false
            })
        }
        if(!this.props.disabled && this.state.down) {
            this.setState({
                hover:true,
                down: false
            })
        }
    }


    render() {
        return (
            <button disabled={this.props.disabled}
                    title={this.props.title && this.props.title}
                    onClick={() => {this.clickCallBack()}}
                    className={this.concatClassName()}
                    onFocus={()=>{
                        if(this.props.onFocus){
                            this.props.onFocus();
                        }
                    }}
                    onBlur={()=>{
                        if(this.props.onBlur){
                            this.props.onBlur();
                        }
                    }}
                    onMouseEnter={this.onMouseEnter}
                    onMouseLeave={this.onMouseLeave} onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp}>
                {this.props.graph && <span className={"graph"}> {this.props.graph} </span>}
                {this.props.graph && this.props.label && <span className={"gap"}/>}
                {this.props.label && <span className={"label"}> {this.props.label} </span>}
            </button>
        )
    }
}