import api from './api';
const isImage = (file) => ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'].includes(file.ext);
/**
 * Creates a file element object based on the provided element data.
 * @param {Object} element - The element data.
 * @param {string} element.path - The path of the element.
 * @param {boolean} element.is_dir - Indicates if the element is a directory.
 * @param {number} [element.size=0] - The size of the element.
 * @param {string} element.last_modified - The last modified date of the element.
 * @returns {Object} - The created file element object.
 */
const createFileElement = async (element) => {
    const tempElement = {
        id: element.path,
        isDir: element.is_dir,
        size: element.size || 0,
        modDate: element.last_modified,
        name: element.path.split('/').pop() || element.path.split('/').slice(-2, -1)[0],
    };
    if (tempElement.name !== '_') {
        tempElement.ext = tempElement.name.split('.').pop();
    }
    if (isImage(tempElement)) {
        const res = await api.get(`/get/${tempElement.id}`, {
            responseType: 'blob',
        });
        tempElement.thumbnailUrl = URL.createObjectURL(res.data);
        
    }
    // return only if filename is not _
    if (tempElement.name !== '_') {
        return tempElement;
    }
    else {
        return null;
    }
};

export default createFileElement;