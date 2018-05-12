class PacketReader{
    constructor(header, buf){
        this.header = header;
        this.offset = 0;
        this.buffer = buf;
    }

    read(){
        let res = this.buffer.readUInt8(this.offset);
        this.offset++;
        return res;
    }

    readShort(){
        let res = this.buffer.readUInt16LE(this.offset);
        this.offset += 2;
        return res;
    }

    readInt(){
        let res = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;
        return res;
    }

    readString(len){
        let res = ""

        for(let i = 0; i<len; i++){
            let cur = this.readShort();
            res = res + String.fromCharCode(cur);
        }

        return res;
    }
}

module.exports = PacketReader;