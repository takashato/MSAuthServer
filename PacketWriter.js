class PacketWriter {
    constructor(header){
        this.header = header;
        this.bufferArray = [];
        this.length = 0;
    }

    write(val){
        let buf = new Buffer(1);
        buf.writeUInt8(val, 0);
        this.bufferArray.push(buf);
        this.length += 1;
    }

    writeShort(val){
        let buf = new Buffer(2);
        buf.writeUInt16LE(val, 0);
        this.bufferArray.push(buf);
        this.length += 2;
    }

    writeInt(val){
        let buf = new Buffer(4);
        buf.writeUInt32LE(val, 0);
        this.bufferArray.push(buf);
        this.length += 4;
    }

    writeString(val){
        this.writeShort(val.length);

        let buf = new Buffer(val.length * 2); // 2 bytes for 1 character
        let offset = 0;
        for(let i = 0; i<val.length; i++){
            buf.writeUInt16LE(val.charCodeAt(i), offset);
            offset += 2;
        }
        this.bufferArray.push(buf);
        this.length += val.length * 2;
    }

    getBuffer(){
        return Buffer.concat(this.bufferArray);
    }

    getLength(){
        return this.length;
    }
}

module.exports = PacketWriter;