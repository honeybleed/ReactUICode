import React from "react";
import {Button, Icon} from "..";
import axios from "axios";
import uuid from "uuid/v4";
import type {IconProps} from "..";

export type FileUpLoadProps = {
    action: string,
    cache?: number,
    className?: [string],
    disabled?: boolean,
    onFailed?: (e) => void,
    cancelAction: string,
    onDone?: (e) => void
}

export type FileUploadStates = {
    file: File,
    size: string,
    percent: string,
    stateTag: "normal" | "empty" | "uploading" | "done" | "failed" | "pause",
    hover: boolean,
    down: boolean,
    start: number,
    end: number,
    tag: string,
    forceCancel: boolean
}

export function unitModify(value: number): string {
    if (value/(1024*1024*1204) >= 1) {
        return (value/(1024*1024*1024)).toFixed(2) + "GB"
    } else if (value/(1024*1024) >= 1) {
        return (value/(1024*1024)).toFixed(2) + "MB"
    } else {
        return Math.ceil(value/(1024)) + "KB"
    }
}

export class FileUpLoad extends React.Component<FileUpLoadProps, FileUploadStates> {
    constructor (props: FileUpLoadProps) {
        super(props);
        this.updateFile = this.updateFile.bind(this);
        this.state = {
            file: null,
            size: null,
            percent: null,
            stateTag: "empty",
            start:0,
            end:0,
            tag:null,
            forceCancel: false
        };
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.doUpload = this.doUpload.bind(this);
        this.doCancel = this.doCancel.bind(this);
        this.keyPress = this.keyPress.bind(this);
    }
    onMouseEnter(){
        if (!this.props.disabled && !this.state.hover && this.state.stateTag !== "uploading") {
            this.setState({
                hover:true,
                down: false
            })
        }
    }
    onMouseLeave(){
        if(!this.props.disabled && this.state.stateTag !== "uploading") {
            this.setState({
                hover:false,
                down: false
            })
        }
    }
    onMouseDown(){
        if(!this.props.disabled && this.state.stateTag !== "uploading") {
            this.setState({
                hover:false,
                down: true
            })
        }
    }
    onMouseUp(){
        if(!this.props.disabled && !this.state.down && this.state.stateTag !== "uploading") {
            this.setState({
                hover:false,
                down: false
            })
        }
        if(!this.props.disabled && this.state.down && this.state.stateTag !== "uploading") {
            this.setState({
                hover:true,
                down: false
            })
        }
    }
    async updateStateTag(tag: string) {
        return new Promise((resolve) => {
            this.setState({
                stateTag:tag
            });
            resolve();
        });

    }
    async updateForceCancel(value: boolean) {
        return new Promise(resolve => {
            this.setState({
                forceCancel: value
            }, ()=>{
                resolve();
            })
        })
    }
    async doUpload() {
        let isReLoading = false;
        if (this.state.stateTag === "uploading") {
            await this.updateStateTag("pause");
            return;
        } else if(this.state.stateTag === "pause"){
            await this.updateStateTag("uploading");
            isReLoading = true;
        } else {
            await this.updateStateTag("uploading");
            isReLoading = false;
        }
        let chunk = this.props.cache ? this.props.cache * 1024 : 10 * 1024;
        if (!isReLoading) {
            this.setState({
                start:0,
                end: chunk,
                tag: uuid()
            })
        }
        let name = this.state.file.name;
        await this.updateForceCancel(false);
        while (!this.state.forceCancel) {
            if (this.state.stateTag === "pause") {
                break;
            }
            if (this.state.stateTag === "empty") {
                break;
            }
            let end = this.state.end;
            let start = this.state.start;
            let isFailed = false;

            if (end > this.state.file.size) {
                end = this.state.file.size;
            }
            let isFirs = start === 0;
            let isLast = end === this.state.file.size;
            let url = this.makePostUrl(isFirs, isLast, this.state.tag, name);
            let updateResponse = await this.postData(url,start,end).catch((e)=>{
                if (this.props.onFailed) {
                    this.props.onFailed(e);
                }
                isFailed = true;
            });
            start = end;
            if (start >= this.state.file.size) {
                await this.updateStateTag("done");
                if (this.props.onDone) {
                    this.props.onDone({
                        response:updateResponse,
                        filename: this.state.file.name
                    });
                }
                break;
            }
            if (isFailed) {
                await this.updateStateTag("failed");
                this.setState({
                    start: start,
                    end: end
                });
                break;
            }
            end = start + chunk;
            this.setState({
                start: start,
                end: end
            })
        }
    }
    makePostUrl (isFirst, isLast, tag, name) {
        let ret = this.props.action + "?";
        ret += "tag="+tag + "&";
        ret += "name="+name;
        if (isFirst) {
            ret += "&first=true";
        }
        if (isLast) {
            ret += "&last=true";
        }
        return ret;
    }
    async cancelData() {
        return new Promise((resolve, reject) => {
            axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            axios.post(this.props.cancelAction + "?tag=" + this.state.tag)
                .then((msg)=>{
                    console.log(msg);
                    resolve();
                })
                .catch((e)=>{
                    reject(e);
                });
        })
    }
    async postData(url, start, end) {
        return new Promise((resolve, reject)=>{
            axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
            let bolb = this.state.file.slice(start, end);
            axios.post(url, bolb)
                .then((msg)=>{
                    this.setState({
                        percent: (((end/this.state.file.size)*100).toFixed(2)),
                    });
                    resolve(msg);
                })
                .catch((e)=>{
                    reject(e);
                });
        })
        // return new Promise((resolve => {
        //     setTimeout(()=>{
        //         this.setState({
        //             percent: (((end/this.state.file.size)*100).toFixed(2)),
        //         });
        //         resolve();
        //         }, 10)
        // }))
    }
    async doCancel(){
        await this.updateForceCancel(true);
        await this.cancelData().then(()=> {
            this.setState({
                file: null,
                size: null,
                percent: null,
                stateTag: "empty",
                start:0,
                end:0,
                tag:null
            });
            console.log("finished-cancel");
        }).catch((e) => {
            this.props.onFailed(e);
        })
    }
    updateButtonIcon(): IconProps {
        switch (this.state.stateTag) {
            case "empty":
                return {
                    iconName: "upload",
                    disabled: true
                };
            case "uploading":
                return {
                    iconName: "pause",
                };
            case "done":
                return {
                    iconName: "check",
                    disabled: true
                };
            default:
                return {
                    iconName:'upload'
                }
        }
    }
    concatClassName(): string {
        let names: [string] = ['u-file-upload'];
        if (this.props.disabled) {
            names.push('disabled');
        } else {
            if (this.state.stateTag === "normal") {
                names.push("normal");
            }
            if (this.state.stateTag === "empty") {
                names.push("empty");
            }
            if (this.state.stateTag === "uploading") {
                names.push("uploading");
            }
            if (this.state.stateTag === "done") {
                names.push("done");
            }
            if (this.state.stateTag === "failed") {
                names.push("failed");
            }
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
    updateFile (e) {
        let file: File = e.target.files[0];
        if(file) {
            let size: string = unitModify(file.size);
            this.setState({
                file: e.target.files[0],
                size: size,
                stateTag: "normal",
                percent: null,
                start:0,
                end:0,
                tag:null
            });
        }
    }
    isShowInput() {
        return this.state.stateTag === "empty" || this.state.stateTag === "done";
    }
    keyPress(e) {
        if (e.key === "Enter" && (this.state.stateTag === "empty" || this.state.stateTag === "done")) {
            this.inputElement.click();
        }
    }
    render() {
        return (
            <div className={this.concatClassName()} tabIndex={0} onKeyPress={this.keyPress}>
                <div className={'file-selector'} >
                    {this.isShowInput() &&
                    <input className={'file-input'}
                           ref={(input) => {this.inputElement = input}}
                           type={'file'}
                           onChange={this.updateFile}
                           onMouseEnter={this.onMouseEnter}
                           onMouseLeave={this.onMouseLeave}
                           onMouseDown={this.onMouseDown}
                           onMouseUp={this.onMouseUp} />}

                    <div className={'process-bar'}>
                        <div className={'bar'} style={{
                            width:this.state.percent? this.state.percent+"%" : "0"
                        }}/>
                        <div className={'file-name'}>
                            {this.state.file ? this.state.file.name : "选择上传文件"}
                        </div>
                        {this.state.size && <div className={'file-size'}>
                            {this.state.size}
                        </div>}
                        {this.state.percent && <div className={'process-percent'}>
                            {this.state.percent + "%"}
                        </div>}
                    </div>
                </div>
                <Button className={['action-button']} graph={<Icon  {...this.updateButtonIcon()}/>} disabled={this.updateButtonIcon().disabled} onClick={this.doUpload}/>
                <Button className={['cancel-button']} graph={<Icon iconName={'close'}/>} onClick={this.doCancel}/>

            </div>
        )
    }
}