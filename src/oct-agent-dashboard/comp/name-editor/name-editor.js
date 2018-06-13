import React from "react";
import type {ClientItem} from "../../APITools";
import {TextInput} from "../../../ui/text-input/text-input";
import {Button, Icon} from "../../../ui";

export type OCTANameEditorProps = {
    client: ClientItem,
}

export type OCTANameEditorStates = {
    state: 'edit' | 'show' | 'post'
}

export class OCTANameEditor extends React.Component<OCTANameEditorProps, OCTANameEditorStates>{
    inputRef: TextInput;
    constructor(props: OCTANameEditorProps){
        super(props);
        this.state = {
            state: 'show'
        }
    }
    render(){
        return <div className={'octa-name-editor'}>
            <TextInput 
                readOnly={this.state.state !== 'edit'}
                onRef={(ref)=>{
                    this.inputRef = ref;
                    this.inputRef.value(this.props.client.name);
                }}/>
            {this.state.state === 'show' &&
            <Button
                onClick={()=>{
                    this.setState({
                        state:'edit'
                    })
                }}
                graph={<Icon iconName={'pencil'}/>} title={'编辑'}/>}
            {(this.state.state === 'edit' || this.state.state === 'post') &&
            <Button
                className={['submit']}
                graph={
                    <Icon
                        spin={this.state.state === 'post'}
                        iconName={this.state.state === 'edit' ? "check" : "spinner"}/>
                }
                onClick={()=>{

                }}
                disabled={this.state.state !== 'edit'}
                title={'提交'}/>
            }
            {(this.state.state === 'edit' || this.state.state === 'post') &&
            <Button
                className={['cancel']}
                graph={
                    <Icon iconName={"close"}/>
                }
                onClick={()=>{
                    this.setState({
                        state:'show'
                    })
                }}
                disabled={this.state.state !== 'edit'}
                title={'取消'}/>
            }
        </div>
    }
}