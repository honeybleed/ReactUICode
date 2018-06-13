import {IconMap} from "../../../ui/index";
import React from "react";
import {IconItem} from "../../components/icon-components/icon-item";
import * as styles from "./icon-map-view.scss";

type IconMapStates = {
    keyword: string,
    fileInfo: any
}

const file_chunk_size = 1024 * 10;

export class IconMapView extends React.Component<any, IconMapStates>{

    constructor(props: any) {
        super(props);
        this.state = {
            keyword: ""
        };
        this.onSearchChange = this.onSearchChange.bind(this);
        this.onFileChange = this.onFileChange.bind(this);
    }
    onSearchChange(e: SyntheticEvent<HTMLInputElement>) {
        this.setState({
            keyword: e.target.value
        });
    }
    onFileChange(e: SyntheticEvent<HTMLInputElement>) {
        let file = e.target.files[0];
        let fileSliceNum = Math.ceil(file.size / file_chunk_size);
        this.setState({
            fileInfo: e.target.files[0]
        })
    }
    render() {
        return <div>
            <h1>here is all icons</h1>
            <div >
                <input type={"text"} onInput={this.onSearchChange}/>
            </div>
            <div>
                <input type={"file"} onChange={this.onFileChange}/>
            </div>
            <div className={styles["icon-map-container"]}>
                {Object.getOwnPropertyNames(IconMap).map((name)=>{
                    if (name.indexOf(this.state.keyword) >= 0) {
                        return <IconItem key={name} keyword={this.state.keyword} icon={{iconName:IconMap[name]}}/>
                    }
                })}
            </div>
        </div>;
    }
}