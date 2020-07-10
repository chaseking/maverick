import React from 'react';
import './App.css';
import SocketConnection from "./socket-connection.js";
import StatusBox from "./components/StatusBox.js";
import LEDStripStatusBox from "./components/LEDStripStatusBox.js";

class App extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            // items: false,
            // socketConnection: new SocketConnection("http://" + window.location.hostname + ":8000")
        };

        // let self = this;
        // this.state.socketConnection.setConfigLoadCallback(config => {
        //     console.debug(config);
        //     self.setState({ config });
        // });
    }

    setOutletState = (outlet, state) => {
        fetch("10.0.1.22:4000/outlet/" + outlet + "/" + state)
            .then(res => res.json())
            .then(result => {
                console.log(result);
            }, err => {
                console.error(err);
            });
    }

    render(){
        // if(!this.state.config){
        //     return "Loading..."
        // }

        // let self = this;
        // let statusBoxes = this.state.config.items.map(item => {
        //     let status = item.connected ? "online" : "offline";
        //     if(item.connected && Date.now() - item.lastHeartbeat > 5000){
        //         status = "loading";
        //     }

        //     let updateData = data => {
        //         console.log("Updating data", item.id, data);
                
        //         this.state.socketConnection.updateConfig(item.id, data);
        //     }

        //     switch(item.type){
        //         case "led_strip":
        //             return <LEDStripStatusBox key={item.id} title={item.name} subtitle={item.type} status={status} updateData={updateData} {...item} />;

        //         default:
        //             return null;
        //     }
        // });

        let outlets = [];

        for(let outlet = 0; outlet < 8; outlet++){
            outlets.push(
                <li key={outlet} style="margin-top: 1em;">Outlet {outlet+1}: <a className="button button-green" onClick={() => this.setOutletState(outlet, true)}>ON</a> <a className="button button-red" onClick={() => this.setOutletState(outlet, false)}>OFF</a> <a className="button button-idk" onClick={() => this.setOutletState(outlet, "toggle")}>Toggle</a></li>
            )
        }

        return (
            <div className="mav">
                <header className="mav-header">
                    <h1>Maverick</h1>
                    {/* <h2>{this.state.config.homeName}</h2> */}
                </header>  

                <main className="mav-main">
                    <h3 className="mav-section-title">Home {">"} <strong>Chase's Room</strong></h3>

                    <ol>
                        {outlets}
                        <li>Outlet 1: Currently OFF <a className="button button-green">TURN ON</a></li>
                        <li>Outlet 1: Currently On <a className="button button-red">TURN OFF</a></li>
                    </ol>
                </main>

                <footer className="mav-footer">
                    &copy; 2020 Chase King.
                </footer>
            </div>
        );
    }
}

export default App;