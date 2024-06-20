

const path = require('path');


function renameFileWithExtension(oldFileName, newFileName) {
    const extension = path.extname(oldFileName);
    return `${newFileName}${extension}`;
}

module.exports = { renameFileWithExtension };
