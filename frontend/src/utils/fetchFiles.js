import api from './api';
import createFileElement from './createFileElement';
import { notifyFailure } from './toaster';

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
const fetchFiles = async (path, setFolders, setFiles, setPictures, login) => {
    try {
        const folderChain = path.split('/').map((_, i, arr) => arr.slice(0, i + 1).join('/'));
        const tempFolderArray = folderChain.map((id, i) => ({
            id,
            name: id.split('/').pop(),
            isOpenable: true,
            isDir: true,
        }));
        console.log("tempFolderArray", tempFolderArray)
        setFolders(tempFolderArray);

        const fileRequest = { data: { path } };
        const res = await api.post('/list', fileRequest);
        const sizeofres = res.data.length;
        // only use those files for which the responses are not null
        const tempFileArray = (
            await Promise.all(
                res.data.map(file => createFileElement(file, sizeofres))
            )
        ).filter(file => file !== null);
        setFiles(tempFileArray);

        const tempPictures = tempFileArray
            .filter(isImage)
            .map((element) => element.id);
        setPictures(tempPictures);
    } catch (err) {
        if (login) {
            window.location.href = "/notfound"
        }
        else {
            notifyFailure("Please login to continue")
            setTimeout(() => {
                window.location.href = "/"
            }, 5000);
        }
        console.error(err);
    }
};

export default fetchFiles;