import zlib from 'zlib'
import {Buffer} from 'buffer'
import { saveAs } from 'file-saver';

export function serializeOpeningTree(treeData, filename, callback) {
    console.log(treeData)
    let chunkedArray = chunk(treeData)
    let deflatedChunks = []
    console.log(chunkedArray.length)
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
                        callback("could not save file")
                        return
                    }
                    saveAs(new Blob(deflatedChunks, {type: "application/octet-stream"}), filename)
                    callback(null, `saved opening tree to file ${filename}`)
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
            callback("File is not an openingtree save file. Are you loading the correct file?", null)
            return
        }
        let numChunks = unpackControlWord(data.slice(index,index+8))
        index = index + 8
        if(!numChunks) {
            callback("Input file not in correct format", null)
            return
        }
        let deflatedData = getDeflatedChunks(data, index, numChunks, callback)
        if(!deflatedData) {
            callback("Input file seems corrupted", null)
            return
        }
        
        callback(null, deflatedData)
    };
    reader.onerror = function() {
        callback("Failed to opening tree file", null)
    }
    reader.readAsArrayBuffer(file)
}

function getDeflatedChunks(data, startIndex, numChunks, callback) {
    let index = startIndex
    let deflatedChunks = []
    let remainingChunks = numChunks
    let hasError=false
    while(numChunks>0) {
        let chunkSize = unpackControlWord(data.slice(index,index+8))
        index = index + 8
        zlib.inflate(
            Buffer.from(data,index,chunkSize), (error, data)=> {
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
                        callback("Something went wrong while reading file", null)
                    }
                    
                    callback(null, reconstructObjectFromChunks(deflatedChunks))
                }
                
            })
        index = index + chunkSize
        numChunks--
    }
}

function reconstructObjectFromChunks(deflatedChunks) {
    let sortedChunks = deflatedChunks.sort((a,b)=>a.index-b.index)
    return {
        object:sortedChunks[0].chunk,
        array:sortedChunks.slice(1).map((el)=>el.chunk).flat()
    }
}

function unpackControlWord(control) {
    let view = new DataView(control)
    if(view.getUint16(0)!=0x1337 || view.getUint16(6)!=0xC0D3) {
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
    let chunk1 = {chunk:treeData.object, index:0}
    return [chunk1,...chunkArray(treeData.array, 500)]
}

function chunkArray(array, chunkSize) {
    let chunkedArray=[]
    
    for (let i=0, chunkIndex=1; i<array.length; i+=chunkSize, chunkIndex++) {
        chunkedArray.push({chunk:array.slice(i,i+chunkSize), index:chunkIndex});
    }
    return chunkedArray
}
