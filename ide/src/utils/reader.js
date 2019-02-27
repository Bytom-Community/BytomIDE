function readUploadFile(file) {
    return new Promise(function(resolve, reject) {
        if (!file || !file.raw) {
            reject("file not exists")
        }
        let reader = new FileReader()  
        reader.onload = function (e) {
            resolve(e.target.result)
        };
        reader.readAsText(file.raw)
    })
}

export {
    readUploadFile
}