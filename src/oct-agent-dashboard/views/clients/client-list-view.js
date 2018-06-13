import React from "react";
import {OCTAPager} from "../../comp/pager/pager";
import type {ClientItem, ClientListResponse} from "../../APITools";
import type {OCTATableColumn} from "../../comp/table/table";
import {OCTATable} from "../../comp/table/table";
import {APIRequest} from "../../APITools";
import {Button, Icon} from "../../../ui";
import {OCTANameEditor} from "../../comp/name-editor/name-editor";
const PAGE_LIMIT = 3;

export type ClientListViewStates = {
    total: number,
    index_pro: number,
    data: ClientItem[],
    pageDisabled: boolean,
    refreshDisabled: boolean
}

export class ClientListView extends React.Component<any, ClientListViewStates>{
    constructor(props: any){
        super(props);
        this.state = {
            total: 1,
            index_pro: 1,
            data: [],
            pageDisabled: true,
            refreshDisabled: true
        };

    }
    componentDidMount(){
        this.doGetList(this.state.index_pro).then();
    }
    async beforeGetList(updateIndex: number) {
        return new Promise(resolve => {
            this.setState({
                index_pro: updateIndex,
                pageDisabled: true,
                refreshDisabled: true
            }, ()=>{resolve()})
        })
    }
    async afterGetList(data: ClientListResponse) {
        return new Promise(resolve => {
            this.setState({
                total: data.total,
                data: data.clients,
                pageDisabled: false,
                refreshDisabled: false
            }, ()=>{
                resolve();
            })
        })
    }
    async doGetList(updateIndex: number){
        await this.beforeGetList(updateIndex);
        let start = (this.state.index_pro - 1) * PAGE_LIMIT;
        let resp: ClientListResponse = null;
        let hasError: Error = null;
        try {
            resp = await APIRequest.doGetClients(start, PAGE_LIMIT);
        } catch (e) {
            hasError = e;
        }
        if (hasError) {
            console.error(hasError);
        }
        if (resp != null) {
            await this.afterGetList(resp);
        }

    }
    render(){
        let tableColumns: OCTATableColumn[] = [
            {tag:'id', label:'ID'},
            {tag: 'name', label: '名称', valueFilter:(value, item)=>{
                return <OCTANameEditor client={item}/>
                }},
            {tag: 'ip', label: "IP地址"},
            {tag: 'mac', label: "MAC地址"},
            {tag: 'createTime', label: "创建时间", valueFilter:(value)=>{return (new Date(value)).toLocaleString()}}
        ];
        return <div className={'client-list-view'}>
            <div className={'title-info'}>
                <span className={'label'}>终端列表</span>
                <Button graph={<Icon iconName={'refresh'}/>} disabled={this.state.refreshDisabled}/>
            </div>
            <OCTATable columns={tableColumns} data={this.state.data}/>
            <OCTAPager
                onIndex={(index:number)=>{
                    this.doGetList(index).then();
                }}
                total={this.state.total}
                limit={PAGE_LIMIT}
                index_pro={this.state.index_pro}
                disabled={this.state.pageDisabled}/>
        </div>
    }
}