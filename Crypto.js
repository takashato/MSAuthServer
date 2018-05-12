let xorTable = [
    0x040FC1578, 0x0113B6C1F, 0x08389CA19, 0x0E2196CD8,
    0x074901489, 0x04AAB1566, 0x07B8C12A0, 0x00018FFCD,
    0x0CCAB704B, 0x07B5A8C0F, 0x0AA13B891, 0x0DE419807,
    0x012FFBCAE, 0x05F5FBA34, 0x010F5AC99, 0x0B1C1DD01];

/**
 * @return {number}
 */
function GetUInt32(buffer, offset) {
    let a = buffer[offset+0] << 0;
    let b = buffer[offset+1] << 8;
    let c = buffer[offset+2] << 16;
    let d = buffer[offset+3] << 24;
    return a | b | c | d;
}

function GetBytes(input){
    return [
        (input >>> 0) & 0xFF,
        (input >>> 8) & 0xFF,
        (input >>> 16) & 0xFF,
        (input >>> 24) & 0xFF
        ];
}

function SetBytes(input, buffer, offset) {
    let byteArr = GetBytes(input);
    buffer[offset+0] = byteArr[0];
    buffer[offset+1] = byteArr[1];
    buffer[offset+2] = byteArr[2];
    buffer[offset+3] = byteArr[3];
}

/**
 * Encrypt buffer with seed
 * @param buffer
 * @param seed
 * @returns byte[]
 */
function Encrypt(buffer, seed){
    let temp = 0;
    let temp2 = 0;

    let output = new Array(buffer.length);

    for(let i = 0; i < (buffer.length) >> 2; i++) {
        temp = temp2 ^ xorTable[i&15] ^ seed;
        temp2 = GetUInt32(buffer, i*4);
        SetBytes(temp^temp2, output, i*4);
    }

    return output;
}

/**
 * Decrypt buffer with seed
 * @param buffer
 * @param seed
 * @returns byte[]
 */
function Decrypt(buffer, seed){
    let temp = 0, temp2 = 0;

    let output = new Array(buffer.length);

    for(let i = 0; i < Math.floor(buffer.length / 4); i++){
        temp2 = GetUInt32(buffer, i*4) & 0xFFFFFFFF;
        temp2 ^= (temp ^ xorTable[i&15] ^ seed);
        SetBytes(temp2, output, i*4);
        temp = temp2;
    }

    return output;
}

module.exports.Encrypt = Encrypt;
module.exports.Decrypt = Decrypt;