import io from "socket.io-client";

class SocketConnection {
    constructor(address){
        this.socket = io.connect(address);
    }

    setConfigLoadCallback(callback){
        this.socket.on("config", callback);
    }

    updateConfig(id, update){
        this.socket.emit("update-item", {
            id,
            update
        }, data => {});
    }
}

export default SocketConnection;