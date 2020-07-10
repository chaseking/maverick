import React, { Component } from "react";

function BoxConnectionStatus(props){
    let content = "?";

    switch(props.status){
        case "online":
            content = "Connected";
            break;
        case "loading":
            content = "Reconnecting...";
            break;
        case "offline":
            content = "Offline";
            break;
        default:
            content = "UNKNOWN STATUS";
            break;
    }

    return (
        <div className={"hc-status-box__connection-status hc-status-box__connection-status--" + props.status}>{content}</div>
    )
}

export default class StatusBox extends Component {
    render(){
        return (
            <div className="hc-status-box">
                <BoxConnectionStatus status={this.props.status} />
                <h2 className="hc-status-box__box-title">{this.props.title}</h2>
                <h3 className="hc-status-box__box-subtitle">{this.props.subtitle}</h3>

                {this.props.children}
            </div>
        );
    }
}