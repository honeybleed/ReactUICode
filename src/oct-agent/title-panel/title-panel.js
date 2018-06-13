import React from "react";

export type TitlePanelProps = {
    graph?: any,
    title?: string,
    tag?: string,
    onOpen?:() => void,
    content?: any,
    className: string[],
    viewHeight: number
}

export type TitlePanelState = {
    isOpen: boolean,
}

export class TitlePanel extends React.Component<TitlePanelProps, TitlePanelState>{
    title:HTMLElement;
    constructor(props: TitlePanelProps) {
        super(props);
        this.state = {
            isOpen: false
        }

    }
    componentDidMount() {
        if (this.props.onRef) {
            this.props.onRef(this);
        }
    }
    concatClassName() {
        let names = ['title-panel'];
        if (this.state.isOpen) {
            names.push('open');
        } else {
            names.push('close');
        }
        if (this.props.className) {
            let uniqueNames = Array.from(new Set(this.props.className));
            names.push(...uniqueNames);
        }
        return names.join(" ");
    }
    triggerOpen(silent) {
        let isOpening = false;
        this.setState((pre) => {
            isOpening = !pre.isOpen;
            return {
                isOpen: !pre.isOpen
            }
        }, () => {
            if (isOpening) {
                this.props.onOpen && !silent && this.props.onOpen();
            }
        })
    }

    render() {
        return <div className={this.concatClassName()} style={{
            height: this.state.isOpen ? this.props.viewHeight : 42 + "px"
        }}>
            <div className={'title-part'}
                 ref={(ref)=>{
                     this.title = ref;
                 }}
                 onClick={() => {
                console.log('on click!');
                if(!this.state.isOpen) {
                    this.triggerOpen();
                }
            }}>
                <div className={'graph'}>
                    {this.props.graph && this.props.graph}
                </div>
                <div className={'title'}>
                    {this.props.title && this.props.title}
                </div>
                <div className={'tag'}>
                    {this.props.tag && this.props.tag}
                </div>
            </div>
            <div className={'content-part'} >
                <div className={'content-gap'}>{this.props.content && this.props.content}</div>
            </div>
        </div>
    }
}