import zlib from 'zlib'
import {Buffer} from 'buffer'
import { saveAs } from 'file-saver';

export function serializeOpeningTree(treeData, filename, callback) {
    let chunkedArray = chunk(treeData)
    let deflatedChunks = []
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
