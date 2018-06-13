import * as React from "react/cjs/react.development";
export type ValidateResult = {
    isOK: boolean,
    msg: string
}
export type TextInputProps = {
    readOnly?:boolean,
    graph?:any,
    password?: boolean,
    label?:string,
    placeHolder?:string,
    disabled?:boolean,
    className?: string[],
    validator?:(value: string)=>ValidateResult,
    onChange?:(value: string)=>void,
    onValidateResult?:(err:ValidateResult)=>void,
    onRef?:(ref:TextInput)=>void
}

export type TextInputStates = {
    hover:boolean,
    focus: boolean,
    error: boolean
}

export class TextInput extends React.Component<TextInputProps, TextInputStates>{
    inputRef: HTMLInputElement;
    constructor(props: TextInputProps) {
        super(props);
        this.state = {
            hover: false,
            focus: false,
            error: false
        }
    }
    validate(){
        if(this.props.validator) {
            let ret: ValidateResult = this.props.validator(this.inputRef.value);
            if(this.props.onValidateResult) {
                this.props.onValidateResult(ret);
            }
            if(!ret.isOK){
                this.setState({error:true});
            } else {
                this.setState({error:false});
            }
        }
    }
    componentDidMount() {
        if(this.props.onRef) {
            this.props.onRef(this);
        }
        this.validate();
    }
    value(value: string): string {
        if(value !== undefined){
            if(this.inputRef){
                this.inputRef.value = value;
            }
        } else {
            if(this.inputRef){
                return this.inputRef.value;
            }
        }
    }
    concatClassName(): string {
        let names: [string] = ["u-text-input"];
        if (this.props.disabled) {
            names.push("disabled");
        } else {
            if (this.props.readOnly){
                names.push('lock');
            } else {
                if (this.state.hover) {
                    names.push("hover");
                }
                if (this.state.error) {
                    names.push("error");
                }
                if (this.state.focus) {
                    names.push("focus");
                }
            }
        }
        if (this.props.className) {
            let uniqueNames = Array.from(new Set(this.props.className));
            names.push(...uniqueNames);
        }
        return names.join(" ");
    }

    render() {
        return <div
            onMouseLeave={()=>{
                this.setState({
                    hover: false
                })
            }}
            onMouseEnter={()=>{
                this.setState({
                    hover: true
                })
            }}
            className={this.concatClassName()}>
            {this.props.graph && <span className={"graph"}> {this.props.graph} </span>}
            {this.props.label && <span className={"label"}> {this.props.label} </span>}
            <input
                readOnly={this.props.readOnly}
                title={this.value()}
                className={'input'}
                type={this.props.password ? "password" : "text"}
                placeholder={this.props.placeHolder?this.props.placeHolder:""}
                ref={(ref)=>{
                    this.inputRef = ref;
                }}
                onInput={(event)=>{
                    let element = event.target;

                    if(this.props.onChange){
                        this.props.onChange(element.value)
                    }
                    this.validate();
                }}
                onBlur={()=>{this.setState({
                    focus:  false
                })}}
                onFocus={()=>{this.setState({
                    focus:  true
                })}}/>
        </div>
    }
}