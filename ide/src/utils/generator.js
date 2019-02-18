const generateFileName = (value, project) => {
    let sameFileNames = []
    let hasSame = false
    for (let pc of project.children) {
        if (pc.title.indexOf(value) != -1) {
            sameFileNames.push(pc.title) 
            if (!hasSame) {
                hasSame = (pc.title == value)
            }
        }
    }
    if (!hasSame || sameFileNames.length == 0) {
        return value
    }

    let splitItem = value.split(".")
    let tail = "."+splitItem[splitItem.length-1]
    let lastIndex = value.indexOf(tail)
    let pre = value
    if (lastIndex != -1) {
        pre = value.substr(0, lastIndex)
    } else {
        tail = ''
    }
    value = pre + (sameFileNames.length+1).toString() + tail
    if (sameFileNames.indexOf(value) != -1) {
        return ''
    }
    return value
}

export {
    generateFileName
}
