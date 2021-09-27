import zlib from 'zlib'
import {Buffer} from 'buffer'
import { saveAs } from 'file-saver';

export function serializeOpeningTree(treeData, filename, callback) {
    let chunkedArray = chunk(treeData)
    let deflatedChunks = []
    //push version number 1 for later backward compatibility
    deflatedChunks.push(packControlWord(0x1))
    deflatedChunks.push(packControlWord(chunkedArray.length))
    let remainingChunks = chunkedArray.length
    let hasError = false;
    chunkedArray.forEach((chunk)=>{
        zlib.deflate(
            new Buffer(JSON.stringify(chunk)), 
            (error,data)=>{
                remainingChunks--
                if(error) {
                    hasError = true
                }
                deflatedChunks.push(packControlWord(data.byteLength))
                deflatedChunks.push(data)
                if(remainingChunks<=0) {
                    if(hasError) {
                        callback("Could not save file")
                        return
                    }
                    saveAs(new Blob(deflatedChunks, {type: "application/octet-stream"}), filename)
                    callback(null, `Saved opening tree to file ${filename}`)
                }
            });
        })
}

export function deserializeOpeningTree(file, callback) {
    let reader = new FileReader()
    reader.onload = function(evt) {
        let data = evt.target.result
        let index = 0
        let version = unpackControlWord(data.slice(index,index+8))
        index = index + 8
        if(version !== 0x1) {
            callback("File is not an openingtree save file.", null,"Are you loading the correct file?")
            return
        }
        let numChunks = unpackControlWord(data.slice(index,index+8))
        index = index + 8
        if(!numChunks) {
            callback("Input file not in correct format", null)
            return
        }
        getInflatedChunks(data, index, numChunks, callback)
    };
    reader.onerror = function(e) {
        callback("Failed to read openingtree file", null, `${e.target.error.name}:${e.target.error.message}`)
    }
    reader.readAsArrayBuffer(file)
}

function getInflatedChunks(data, startIndex, numChunks, callback) {
    let index = startIndex
    let deflatedChunks = []
    let remainingChunks = numChunks
    let hasError=false
    let handleInflate = (error, data)=> {
        remainingChunks--
        if(error) {
            console.log(error)
            hasError=true
        }
        try {
            deflatedChunks.push(JSON.parse(data))
        } catch (e) {
            console.log(e)
            hasError=true
        }
        if(remainingChunks===0) {
            if(hasError) {
                callback("Input file seems corrupted", null)
            }
            
            callback(null, reconstructObjectFromChunks(deflatedChunks))
        }
        
    }
    while(numChunks>0) {
        let chunkSize = unpackControlWord(data.slice(index,index+8))
        index = index + 8
        zlib.inflate(
            Buffer.from(data,index,chunkSize), handleInflate)
        index = index + chunkSize
        numChunks--
    }
}

function reconstructObjectFromChunks(deflatedChunks) {
    let sortedChunks = deflatedChunks.sort((a,b)=>a.index-b.index)
    let flattenedChunks = sortedChunks.slice(1).map(el=>el.chunk).flat()
    let header = sortedChunks[0]
    let arrays = []
    let index = 0
    let arraySizes = header.arraySizes || [flattenedChunks.length]
    arraySizes.forEach((size)=>{
        arrays.push(flattenedChunks.slice(index,index+size))
        index+=size
    })
    return {
        header:header.chunk,
        arrays:arrays
    }
}

function unpackControlWord(control) {
    let view = new DataView(control)
    if(view.getUint16(0)!==0x1337 || view.getUint16(6)!==0xC0D3) {
        return null
    }
    return view.getUint32(2)
}

function packControlWord(control) {
    var buffer = new ArrayBuffer(8); 
    var view = new DataView(buffer); 
    view.setUint16(0, 0x1337)
    view.setUint32(2, control>>>0)
    view.setUint16(6, 0xC0D3)
    return buffer
}

function chunk(treeData) {
    let chunk1 = {chunk:treeData.header, index:0, 
        arraySizes:treeData.arrays.map(arr=>arr.length)}
    let chunks = [chunk1]
    treeData.arrays.forEach((array)=>{
        Array.prototype.push.apply(chunks, chunkArray(array, 1000, chunks.length));
    })
    return chunks
}

function chunkArray(array, chunkSize, startIndex) {
    let chunkedArray=[]
    
    for (let i=0, chunkIndex=0; i<array.length; i+=chunkSize, chunkIndex++) {
        chunkedArray.push({chunk:array.slice(i,i+chunkSize), index:startIndex+chunkIndex});
    }
    return chunkedArray
}
