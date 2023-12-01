import api from './api';
import createFileElement from './createFileElement';

/**
 * Checks if the provided file is an image.
 * @param {Object} file - The file to check.
 * @param {string} file.ext - The file extension.
 * @returns {boolean} - Indicates if the file is an image.
 */
const isImage = (file) => ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'].includes(file.ext);


/**
 * Fetches files from the specified path and updates the state with the fetched data.
 * @param {string} path - The path from which to fetch the files.
 * @param {function} setFolders - The state setter function for folders.
 * @param {function} setFiles - The state setter function for files.
 * @param {function} setPictures - The state setter function for pictures.
 * @returns {Promise<void>} - A promise that resolves when the files are fetched and the state is updated.
 */
const fetchSharedFiles = async (path, user, setSharedFolders, setSharedFiles, setSharedPictures, ) => {
    try {
        const sharedfolderChain = path.split('/').map((_, i, arr) => arr.slice(0, i + 1).join('/'));
        const tempFolderArray = sharedfolderChain.map((id, i) => ({
            id,
            name: id.split('/').pop(),
            isOpenable: true,
            isDir: true,
        }));
        // if more than one folder, insert the username folder at the beginning
        if (tempFolderArray.length > 1) {
            tempFolderArray.shift(1);
            tempFolderArray.unshift({
                id: user,
                name: user,
                isOpenable: true,
                isDir: true,
            });
        }
        
        console.log("tempFolderArray", tempFolderArray)
        setSharedFolders(tempFolderArray);
        const fileRequest = {
        };
        if(path!==""){
            fileRequest.path = path;
        }
        const res = await api.post('/list_shared_with', fileRequest);
        // only use those files for which the responses are not null
        const tempFileArray = (await Promise.all(res.data.map(createFileElement))).filter(file => file !== null); console.log("tempFileArray sharedfiles", tempFileArray)
        setSharedFiles(tempFileArray);

        const tempPictures = tempFileArray
            .filter(isImage)
            .map((element) => element.token);
        setSharedPictures(tempPictures);
    } catch (err) {
        console.error(err);
    }
};

export default fetchSharedFiles;