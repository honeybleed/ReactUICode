import React from "react";

export type OCTATableColumn = {
    tag: string,
    label: string,
    valueFilter?: (value: any, item: any) => any
}


export type OCTATableProps = {
    columns: OCTATableColumn[],
    data: any[]
}

export class OCTATable extends React.Component<OCTATableProps, any> {
    constructor (props: OCTATableProps) {
        super(props);
    }
    render() {
        return <div className={'octa-table'}>
            {this.props.data.length <= 0 && <div className={'octa-table-empty'}> 当前无可显示数据！ </div> }
            {this.props.data.length > 0 && <div className={'octa-table-panel'}>
                <table>
                    <tbody>
                    <tr>
                        {this.props.columns.map((col: OCTATableColumn)=>{return <th key={"col-"+col.tag} className={col.tag}>{col.label}</th>})}
                    </tr>
                        {this.props.data.map((row, r_index)=>{
                            let is_odd = r_index%2 === 0;
                            return <tr key={"row-"+r_index} className={is_odd?'odd':''}>
                                {this.props.columns.map((col: OCTATableColumn)=>{
                                    return <td key={'row-'+r_index+"-"+col.tag}>{col.valueFilter ? col.valueFilter(row[col.tag], row) : row[col.tag]}</td>
                                })}
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>}
        </div>
    }
}