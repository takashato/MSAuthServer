const Crypto = require('./Crypto');
const PacketReader = require('./PacketReader');
const PacketWriter = require('./PacketWriter');


/**
 * @return {PacketReader}
 */
function readPacket(data){
    let offset = 2; // Skip first 2 bytes

    let header = data.readInt16BE(offset); // Header
    offset += 2;

    let unkConst = data.readInt8(offset);
    offset += 2;
    if(unkConst !== 0x18){ // Int16 const 0x0018
        console.log("ERROR: 5th bytes wasn't 0x18 " + unkConst);
        return null;
    }

    let length = data.readInt16BE(offset);
    offset += 2;

    let flag = data.readInt16BE(offset);
    offset += 2;

    let dataLength = data.readInt16BE(offset);
    offset += 2;

    if(length - dataLength !== 12){
        console.log("Encrypted Data size should be 12 lower than total size.");
        return null;
    }

    let encryptionSeed = data.readUInt32BE(offset);
    offset += 8; // skip 4 bytes

    let newBuffer = data.slice(offset, offset + dataLength);
    let decryptedBuffer = Crypto.Decrypt(newBuffer, encryptionSeed);

    return new PacketReader(header, Buffer.from(decryptedBuffer));
}

function writePacket(packet){
    let useXor = false;
    let useZlib = false;

    let flags = 0;

    if(useXor) flags += 0x02;
    if(useZlib) flags += 0x04;

    let size = 1 + 3 + 1 + 3 + 4;
    size += 4; // I think its a checksum
    size += packet.getLength();

    let buf = new Buffer(20);
    let offset = 0;

    // Header
    buf.writeUInt16BE(size, offset);
    offset += 2;
    buf.writeUInt16BE(packet.header, offset);
    offset += 2;

    // Body
    buf.writeUInt8(0x18, offset);
    offset++;
    writeUInt12(size, buf, offset);
    offset += 3;
    buf.writeUInt8(flags, offset);
    offset++;
    writeUInt12(size-12, buf, offset);
    offset += 3;

    let xorKey = 0xDEADB00B;
    buf.writeUInt32BE(xorKey, offset);
    offset += 4;
    buf.writeUInt32BE(0xAABBCCDD, offset);
    offset += 4;

    let dataBuffer = packet.getBuffer();

    if(useXor){
        dataBuffer = Crypto.Encrypt(dataBuffer, xorKey);
    }

    console.log("Send packet generated!");

    return Buffer.concat([buf, dataBuffer]);
}

function writeUInt12(val, buf, offset) {
    let p = offset;
    buf.writeUInt8((val >>> 16) & 0xFF, p++);
    buf.writeUInt8((val >>> 8) & 0xFF, p++);
    buf.writeUInt8((val >>> 0) & 0xFF, p++);
}

module.exports.readPacket = readPacket;
module.exports.writePacket = writePacket;