import React from "react";
import {ipcRenderer} from 'electron';
import {TitleBar} from "../../elecron-ui";
import {Button, Icon} from "../../ui";
import './real-view.scss';
import {PrepareView} from "./prepare-view";
import {ConfigView} from "./config-view";
import {ListView} from "./list-view";
import logo from '../logoBlack.png'

export type RealViewStates = {
    viewPosition: 'prepare'|'config'|'list',
    prePosition: 'prepare'|'config'|'list',
    configViewRef: ConfigView,
    prepareViewRef: PrepareView,
    listViewRef: ListView
}

export class RealView extends React.Component<any, RealViewStates>{
    constructor(props) {
        super(props);
        this.state = {
            viewPosition: 'prepare',
            prePosition: 'prepare',
            configViewRef: null,
            prepareViewRef: null,
            listViewRef: null
        };
    }
    isConfigDisabled(){
        return this.state.viewPosition !== 'list';
    }
    makeStateClassName() {
        let names = ['view-stage', this.state.viewPosition];
        return names.join(' ');
    }
    onRequestConfig(){
        console.log('request to config page');
        this.setState({
            viewPosition:"config"
        }, ()=>{
            this.state.configViewRef.flushDefaultInfo();
        })
    }
    onRequestList(){
        console.log('request to config page');
        this.setState({
            viewPosition:"list"
        }, ()=>{
            this.state.listViewRef.startNewDownloadLoop().then();
        })
    }
    onRequestBack(){
        console.log('request to page go back [' + this.state.prePosition + "]");
        switch (this.state.prePosition){
            case 'prepare':
                this.setState({
                    viewPosition: this.state.prePosition
                }, ()=>{
                    this.state.prepareViewRef.processCheckAction()
                });
                break;
            case 'list':
                this.setState({
                    viewPosition: this.state.prePosition
                });
                break;
        }
    }
    render(){
        return <div className={'real-view'}>
            <TitleBar icon={<img src={logo}/>} title={"OCTAgent"} buttons={
                [
                    <Button
                        key={'cog'}
                        graph={<Icon iconName={"cog"}/>}
                        disabled={this.isConfigDisabled()}
                        onClick={()=>{
                            this.setState({
                                prePosition: 'list'
                            },()=>{
                                this.onRequestConfig();
                            });
                    }}/>,
                    <Button key={'minus'} graph={<Icon iconName={"minus"}/>} onClick={()=>{
                        ipcRenderer.send('request-min');
                    }}/>,
                    <Button key={'close'} graph={<Icon iconName={"close"}/>} onClick={()=>{
                        ipcRenderer.send('request-hide');
                    }}/>
                ]
            }/>
            <div className={this.makeStateClassName()}>
                <PrepareView
                    onRef={(ref)=>{this.setState({prepareViewRef:ref})}}
                    onConfigOK={()=>{
                        this.onRequestList();
                    }}
                    onRequestConfig={()=>{
                        this.setState({
                            prePosition: 'prepare'
                        },()=>{
                            this.onRequestConfig();
                        });
                    }}/>
                <ConfigView
                    onRef={(ref)=>{this.setState({configViewRef:ref})}}
                    onSubmitFinish={()=>{
                        this.onRequestBack();
                    }}
                    onCancelClick={()=>{
                    this.onRequestBack();
                }}/>
                <ListView onRef={(ref)=>{
                    this.setState({
                        listViewRef: ref
                    })
                }}/>
            </div>
        </div>
    }
}