import zlib from 'zlib'
import {Buffer} from 'buffer'
import { saveAs } from 'file-saver';

export function serializeOpeningTree(treeData, filename, callback) {
    let chunkedArray = chunk(treeData)
    let deflatedChunks = []
    chunkedArray.forEach((chunk)=>{
        zlib.deflate(
            new Buffer(JSON.stringify(chunk)), 
            (error,data)=>{
                deflatedChunks.push(data)
                if(deflatedChunks.length===chunkedArray.length) {
                    saveAs(new Blob(deflatedChunks, {type: "application/octet-stream"}), filename)
                    callback('done')
                }
            });
        })
}

export function deserializeOpeningTree(file, callback) {
    let reader = new FileReader()
    reader.onload = function(evt) {
        callback(null, evt.target.result)
    };
    reader.onerror = function() {
        callback("Failed to opening tree file", null)
    }
    reader.readAsArrayBuffer(file)
}

function chunk(treeData) {
    let chunk1 = treeData.object
    return [chunk1,...chunkArray(treeData.array, 500)]
}

function chunkArray(array, chunkSize) {
    let chunkedArray=[]
    
    for (let i=0, chunkIndex=1; i<array.length; i+=chunkSize, chunkIndex++) {
        chunkedArray.push({chunk:array.slice(i,i+chunkSize), index:chunkIndex});
    }
    return chunkedArray
}
