import React from "react";
import {TextInput} from "../../../ui/text-input/text-input";
import {Icon} from "../../../ui";



export class TextInputView extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            inputRef:null,
            inputValue: ''
        }
    }

    readValue(){
        if(this.state.inputRef){
            this.setState({
                inputValue: this.state.inputRef.value()
            });
        }
    }
    render(){
        return <div>
            <TextInput
                validator={(value)=>{
                    let ret = value.length > 0;
                    return {
                        isOK: ret,
                        msg: ret?"message 正常": "message 错误"
                    }
                }}
                label={"input"}
                graph={<Icon iconName={'star'}/>}
                placeHolder={"Hello World"} onRef={(ref)=>{
                this.setState({
                    inputRef: ref
                },()=>{
                })
            }}/>
            <div onClick={()=>{
                this.readValue();
            }}>
               value <br/>
                {this.state.inputValue}
            </div>
        </div>
    }
}