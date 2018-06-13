import React from "react";
import {Button, Icon} from "../../../ui";

export type PagerProps = {
    total: number,
    limit: number,
    index_pro: number,
    onIndex: (index:number)=>void,
    disabled?: boolean
};
export type PagerStates = {
    pre_disable: boolean,
    nex_disable: boolean
}

export class OCTAPager extends React.Component<PagerProps, PagerStates> {
    constructor(props: PagerProps) {
        super(props);
    }
    getPageSize(){
        return Math.ceil(this.props.total / this.props.limit);
    }
    render() {
        return <div className={'octa-pager'}>
            <Button
                disabled={(this.props.index_pro <=1) || this.props.disabled}
                graph={<Icon iconName={'angle-left'}/>}
                onClick={()=>{
                    this.props.onIndex(this.props.index_pro - 1);
                }}/>
            <span className={'octa-pager-index'}>
                <span className={'index'}>{this.props.index_pro}</span>
                <span className={'splitter'}>/</span>
                <span className={'total'}>{this.getPageSize()}</span>
            </span>
            <Button
                onClick={()=>{
                    this.props.onIndex(this.props.index_pro + 1);
                }}
                disabled={(this.props.index_pro >= this.getPageSize()) || this.props.disabled}
                graph={<Icon iconName={'angle-right'}/>}/>
        </div>
    }
}