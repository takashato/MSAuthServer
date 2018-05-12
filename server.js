const net = require('net');
const PacketReader = require('./PacketReader');
const PacketWriter = require('./PacketWriter');
const PacketWrapper = require('./PacketWrapper');

const PORT = 47611;

const server = net.createServer(function (socket) {
    // Prepare information
    socket.name = socket.remoteAddress + ":" + socket.remotePort;

    let test = 0;
    console.log(socket.name + " connected to server!");

    // OnPacket
    socket.on('data', async function(data){
        let iPacket = PacketWrapper.readPacket(data);

        switch(iPacket.header){
            case 51:
                handleLogin(socket, iPacket);
                break;
            case 45:
                handleLogin2(socket, iPacket);
                break;
            case 53:
                handleLogin3(socket, iPacket);
                break;
        }
    });

    // End connection
    socket.on('end', function () {
        console.log(socket.name + " disconnected from server!");
    });
});

server.listen(PORT, function(){
    console.log("Server is listening on port " + PORT);
});

function handleLogin(socket, iPacket){
    // Start handler
    iPacket.readInt();

    let username = iPacket.readString(iPacket.readShort());
    let password = iPacket.readString(iPacket.readShort());

    console.log("Username: " + username);
    console.log("Password: " + password);

    let token = username;

    let oPacket = new PacketWriter(52);

    oPacket.writeInt(8);
    oPacket.writeInt(0);
    oPacket.writeShort(0);

    oPacket.writeString(token);

    oPacket.writeInt(0);
    oPacket.writeInt(0);
    oPacket.writeInt(87);
    oPacket.writeShort(0);
    // End handler

    // Send packet
    let toSend = PacketWrapper.writePacket(oPacket);

    console.log("Raw: " + buf2hex(oPacket.getBuffer()));

    socket.write(toSend);

    console.log("Packet 1 ended" + buf2hex(toSend));
}

function handleLogin2(socket, iPacket) {
    // Start handler
    console.log(iPacket.readString(iPacket.readShort()));

    let oPacket = new PacketWriter(46);

    oPacket.writeInt(0);
    oPacket.writeInt(0);

    oPacket.writeString("RANDOM STUFF");
    oPacket.writeString("RANDOM STUFF");

    oPacket.writeInt(1234); // Account ID
    oPacket.writeInt(0x16);
    oPacket.writeInt(1);
    oPacket.write(0);

    oPacket.writeInt(0); // Token part 1
    oPacket.writeInt(0); // Token part 2
    oPacket.writeInt(0); // Token part 3
    oPacket.writeInt(0); // Token part 4
    // End handler

    // Send packet
    let tmp = PacketWrapper.writePacket(oPacket);
    socket.write(tmp);

    console.log("Packet 2 ended: " + tmp);
}

function handleLogin3(socket, iPacket) {
    // Start handler
    console.log(iPacket.readString(iPacket.readShort()));
    iPacket.readInt();

    let oPacket = new PacketWriter(54);

    oPacket.writeInt(2);
    oPacket.writeInt(0);
    oPacket.writeShort(0);

    // End handler

    // Send packet
    socket.write(PacketWrapper.writePacket(oPacket));

    console.log("Packet 3 ended");
}

function buf2hex(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join(' ');
}