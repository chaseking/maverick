require('dotenv').config()
const fs = require("fs");
const ReadWriteLock = require("rwlock");
let lock = new ReadWriteLock();
let config = {};

// Load config file
try {
    config = fs.readFileSync("config.json");

    try {
        config = JSON.parse(config);
    } catch(err){
        console.error("Could not load config: Invalid JSON!");
        console.error("Please fix and restart.")
        return;
    }
    
    console.log("Loaded config.json file.");
} catch (err){
    console.log("config.json file not found. Loading default configuration...");
    fs.copyFileSync("default_config.json", "config.json");
    config = JSON.parse(fs.readFileSync("config.json"));
    console.log("Default configuration loaded!");
}

// Setup MQTT server
// const mosca = require("mosca");

// var moscaServer = new mosca.Server({
//     host: process.env.MQTT_HOST,
//     port: process.env.MQTT_PORT,
//     // logger: {
//     //     level: "info"
//     // }
// });

// moscaServer.on("ready", () => {
//     console.log("[Mosca] MQTT server started on " + process.env.MQTT_HOST + ":" + process.env.MQTT_PORT);

//     moscaServer.authenticate = (client, username, password, callback) => {
//         let authorized = username === process.env.MQTT_USERNAME && password.toString() === process.env.MQTT_PASSWORD;

//         if(authorized){
//             client.user = username;
//         }

//         callback(null, authorized);
//     }
// });

// moscaServer.on("clientConnected", client => {
//     console.log("[Mosca] Client connected: " + client.id);
// });

// moscaServer.on("published", (packet, client) => {
//     // console.log("[Mosca] Published", packet.topic, packet.payload);
// });

const io = require("socket.io")();

io.on("connection", socket => {
    console.log("[SocketIO] [" + socket.id + "] Connected.");

    socket.emit("config", config);

    socket.on("disconnect", () => {
        console.log("[SocketIO] [" + socket.id + "] Disconnected.")
    });

    socket.on("update-item", (data, callback) => {
        console.log("update-item", data);
        // Find match
        let item = config.items.find(i => i.id === data.id);

        if(!item){
            return callback({
                success: false,
                message: "No item with that name found."
            });
        }

        // Obtain the write lock since we are going to be modifying data
        lock.writeLock(release => {
            if(item.data === undefined){
                item.data = data.update;
            } else {
                let updated = false;

                Object.keys(data.update).forEach(key => {
                    // Only change data if it is different
                    if(item.data[key] === data.update[key]){
                        delete data.update[key];
                        // console.debug("not updating " + key);
                    } else {
                        item.data[key] = data.update[key];
                        updated = true;
                    }
                });

                if(!updated){
                    release();
                    return callback({
                        success: true
                    });
                }
            }

            console.log("updated", config.items);

            // Save to file
            fs.writeFileSync("config.json", JSON.stringify(config, null, 4));

            // Release the write lock
            release();

            // Emit the updated items to all web clients
            socketUpdateStatuses(true);

            // Send the update to the client
            Object.keys(data.update).forEach(key => mqttItemDataUpdate(item, key, data.update[key]));

            return callback({
                success: true,
            });
        });
    });
});

let lastSocketStatusUpdate = -1;
function socketUpdateStatuses(force){
    if(force || lastSocketStatusUpdate == -1 || Date.now() - lastSocketStatusUpdate > 10000){
        lastSocketStatusUpdate = Date.now();
        // TODO: Different socket update format?
        io.emit("config", config.items);
    }
}

io.listen(8000);
console.log("[SocketIO] Socket server listening on port 8000.");

// ========================================================
// Add packet handler to MQTT server.
// ========================================================
const mqtt = require("mqtt");
var mqttClient = mqtt.connect("mqtt://" + process.env.MQTT_HOST, {
    port: process.env.MQTT_PORT,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: "server"
});

mqttClient.on("connect", () => {
    console.log("MQTT server client connected and subscribed");
    mqttClient.subscribe("20oak/+");

    let i = 0;

    // setInterval(() => {
        // mqttClient.publish(config.homeId + "/" + config.items[0], "Hello! #" + ++i);
    // }, 5000);

    mqttClient.on("message", (topic, message) => {
        let topicSplit = topic.split("/");
        if(topicSplit[0] !== config.homeId) return;

        // Find the matching item
        let item = config.items.find(item => config.items[i].id === topicSplit[1]);
        if(!item) return;

        // Parse the arguments
        let args = message.toString().split(" ");

        switch(args[0]){
            case "heartbeat":
                item.lastHeartbeat = Date.now();
                socketUpdateStatuses(false); // Update status panel (don't force if already updated within 10s)
                break;

            case "startup":
                item.lastHeartbeat = Date.now();
                socketUpdateStatuses(true);
                MQTT_ITEM_TYPE_HANDLERS[item.type].reload(item);
                console.log("[MQTT] [S] " + item.id + " has come online.");
                break;
        }
    });
});

function mqttPublishItem(item, message){
    mqttClient.publish(config.homeId + "/" + item.id, message);
}