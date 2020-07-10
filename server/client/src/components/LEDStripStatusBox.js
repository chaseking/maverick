import React from "react";
import StatusBox from "./StatusBox.js";
import SketchPicker from "react-color";

let ADD_KEY_TO_OBJ = obj => {
    if(!obj.key) obj.key = obj.name.toLowerCase().replace(" ", "_");
    return obj;
};

const PRESETS = {
    COLOR: [
        {
            name: "Red",
            statusColor: [192, 57, 43],
            ledColor: [255, 0, 0]
        },
        {
            name: "Orange",
            statusColor: [255, 140, 0],
            ledColor: [ 255, 35, 0 ]
        },
        {
            name: "Yellow",
            statusColor: [241, 196, 15],
            ledColor: [ 255, 120, 0 ]
        },
        {
            name: "Gold",
            statusColor: [255, 177, 66],
            ledColor: [ 255, 85, 0 ]
        },
        {
            name: "Green",
            statusColor: [46, 184, 46],
            ledColor: [ 0, 255, 0 ]
        },
        {
            name: "Light Blue",
            statusColor: [52, 172, 224],
            ledColor: [ 0, 217, 250 ]
        },
        {
            name: "Dark Blue",
            statusColor: [0, 0, 204],
            ledColor: [ 0, 0, 255 ]
        },
        {
            name: "Purple",
            statusColor: [135, 64, 165],
            ledColor: [ 90, 0, 125 ]
        },
        {
            name: "Rainbow",
        },
        // {
        //     name: "Custom",
        // }
    ].map(ADD_KEY_TO_OBJ).map(preset => {
        if(Array.isArray(preset.ledColor) && !preset.statusColor){
            preset.statusColor = rgbArrayToCSSColor(preset.ledColor);
        }

        return preset;
    }),

    ANIMATION: [
        {
            name: "None"
        },
        {
            name: "Wave" // Only works for rainbow
        },
        {
            name: "Chase"
        },
        {
            name: "Chase Fast"
        },
        {
            name: "Back & Forth",
            key: "backandforth"
        }
    ].map(ADD_KEY_TO_OBJ),

    TRANSITION: [
        {
            name: "None"
        },
        {
            name: "Fade"
        },
        {
            name: "Wipe"
        },
        {
            name: "Wipe Black",
        }
    ].map(ADD_KEY_TO_OBJ),
}

let findPresetByLEDColor = color => {
    return PRESETS.COLOR.find(preset => {
        if(Array.isArray(color)){
            if(!Array.isArray(preset.ledColor)) return false;

            for(let i = 0; i < color.length; i++){
                if(preset.ledColor[i] !== color[i]){
                    return false;
                }
            }

            return true;
        } else if(typeof color === "string"){
            return preset.key === color;
        }

        return false;
    });
}

function rgbArrayToHexString(rgb){
    return "#" + rgb.map(color => {
        let hex = Number(color).toString(16);
        return hex.length < 2 ? "0" + hex : hex;
    }).join("");
}

function rgbArrayToCSSColor(rgb){
    if(!Array.isArray(rgb)) return "array";
    return "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")";
}

function LightStatus(props){
    let className = "light-status-icon " + (props.on ? "fas" : "far");
    let style = {};

    if(props.color === "rainbow"){
        className += " text-rainbow";
    } else {
        style.color = props.color || "white"
    }

    return (
        <i className={className + " fa-lightbulb"} style={style}/>
    );
}

export default class LEDStripStatusBox extends React.Component {
    constructor(props){
        super(props);

        // this.state = {
        //     isCustomColor: findPresetByLEDColor(props.data.color) === undefined,
        // };

        // if(this.state.isCustomColor){
        //     this.state.colorCustomValue = props.data.color;
        // }
    }

    componentDidUpdate(prevProps, prevState){

    }

    onChangeColor = (event) => {
        let preset = PRESETS.COLOR.find(preset => preset.key === event.target.value);

        if(!preset){
            console.error("Invalid color preset: " + event.target.value);
            return;
        }

        if(preset.key === "custom"){
            this.setState({ isCustomColor: true });
        } else {
            // this.setState({ isCustomColor: false });
            this.props.updateData({
                on: true,
                color: Array.isArray(preset.ledColor) ? preset.ledColor : preset.key
            });
        }
    }

    onChangeAnimation = (event) => {
        let preset = PRESETS.ANIMATION.find(preset => preset.key === event.target.value);

        if(!preset){
            console.error("Invalid animation preset: " + event.target.value);
            return;
        }

        this.props.updateData({
            animation: preset.key
        });
    }

    // onChangeTransition = (event) => {
    //     let transitionPreset = PRESETS.TRANSITION.find(preset => preset.key === event.target.value);

    //     if(!transitionPreset){
    //         console.error("Invalid transition preset: " + event.target.value);
    //         return;
    //     }

    //     this.props.updateData({
    //         transition: transitionPreset.key
    //     });
    // }

    render(){
        let currentColorPreset = findPresetByLEDColor(this.props.data.color);

        let toggleButton = (this.props.data.on ? <a className="button button-red">Turn Off</a> : <a className="button button-green">Turn On</a>);

        return (
            <StatusBox status={this.props.status} title={this.props.title} subtitle={this.props.subtitle}>
                <ul className="hc-status-box__box-properties">
                    <li>Status: <LightStatus on={this.props.data.on} color={this.props.data.color} /> {toggleButton}</li>
                    <li>Color: <select key="colorSelect" value={this.props.data.color} onChange={this.onChangeColor}>
                            {
                                PRESETS.COLOR.map(preset => (
                                    <option key={preset.key} value={preset.key}>{preset.name}</option>
                                ))
                            }
                        </select></li>
                    <li>Animation: <select className="form-control" value={this.props.data.animation || "none"} onChange={this.onChangeAnimation}>
                            {
                                PRESETS.ANIMATION.map(preset => (
                                    <option key={preset.key} value={preset.key}>{preset.name}</option>
                                ))
                            }
                        </select></li>


                </ul>

                {/* <SketchPicker
                    color={this.props.color}
                    onChangeComplete={this.handleChangeComplete}
                    disableAlpha
                    presetColors={PRESETS.COLOR.filter(color => Array.isArray(color.ledColor)).map(color => {
                        return {
                            color: rgbArrayToHexString(color.ledColor), // or statusColor?
                            title: color.name
                        };
                    })}
                /> */}
            </StatusBox>
        );
    }
}
