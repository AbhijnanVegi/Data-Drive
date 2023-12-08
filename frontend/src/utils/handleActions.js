import { downloadFile, deleteFiles, openDirectory, openImage, openMarkdown, openOtherFile, openVideo } from "./fileActions";

/**
 * Downloads the selected files.
 * 
 * @param {Object} data - The data object containing the state and selected files.
 * @param {Function} notifyFailure - The function to notify in case of failure.
 */
export const downloadSelectedFiles = (data, notifyFailure) => {
  console.log("download_files", data.state);
  const numFiles = data.state.selectedFiles.length;
  if (numFiles === 1) {
    console.log("downloading file", data.state.selectedFiles[0].id)
    var downloadpath = data.state.selectedFiles[0].id;
    downloadFile(downloadpath, notifyFailure);
  }
};

/**
 * Deletes the selected files from the data state and updates the files list.
 *
 * @param {object} data - The data state object.
 * @param {function} notifySuccess - The function to notify success.
 * @param {function} notifyFailure - The function to notify failure.
 * @param {array} files - The array of files.
 * @param {function} setFiles - The function to update the files list.
 * @returns {void}
 */
export const deleteSelectedFiles = (data, notifySuccess, notifyFailure, files, setFiles) => {
  deleteFiles(data.state.selectedFiles, notifySuccess, notifyFailure)
    .then((successfulDeletes) => {
      const newFiles = files.filter((element) => {
        return !successfulDeletes.includes(element.id); // Only remove successfully deleted files
      });
      setFiles(newFiles);
    })
    .catch((err) => {
      console.log(err);
    });
};


/**
 * Handles the action of opening a file or directory.
 * 
 * @param {object} targetFile - The file or directory to be opened.
 * @param {string} activeTab - The active tab identifier.
 * @param {function} setPath - The function to set the path of the current directory.
 * @param {function} setSharedPath - The function to set the path of the shared directory.
 * @param {string} path - The current directory path.
 * @param {string} sharedpath - The shared directory path.
 * @param {array} pictures - The array of pictures.
 * @param {function} setPictures - The function to set the array of pictures.
 * @param {function} setIsPictureModalOpen - The function to set the state of the picture modal.
 * @param {function} setActiveVideo - The function to set the active video.
 * @param {function} setIsVideoModalOpen - The function to set the state of the video modal.
 * @param {function} setMarkdown - The function to set the markdown content.
 * @param {function} setIsMarkdownModalOpen - The function to set the state of the markdown modal.
 */
export const handleFileOpen = (targetFile, activeTab, setPath, setSharedPath, path, sharedpath, pictures, setPictures, setIsPictureModalOpen, setActiveVideo, setIsVideoModalOpen, setMarkdown, setIsMarkdownModalOpen) => {
  console.log("active tab", activeTab);
  if (targetFile.isDir) {
    console.log("opening directory", activeTab);
    if (activeTab === "1") {
      openDirectory(targetFile, setPath);
    } else {
      console.log("opening shared folder");
      console.log("targetFile", targetFile);
      openDirectory(targetFile, setSharedPath);
      console.log("path is now", path);
      console.log("shared path is now", sharedpath);
    }
  } else {
    const extensionArray = targetFile.id.split(".");
    const fileExtension = extensionArray[extensionArray.length - 1];
    if (
      fileExtension === "png" || fileExtension === "jpg" ||
      fileExtension === "jpeg" || fileExtension === "gif" ||
      fileExtension === "bmp" || fileExtension === "svg"
    ) {
      openImage(targetFile, pictures, setPictures, setIsPictureModalOpen);
    } else if (fileExtension === "mp4") {
      console.log("opening video modal");
      openVideo(targetFile, setActiveVideo, setIsVideoModalOpen);
    } else if (fileExtension === "md") {
      console.log("opening markdown file");
      openMarkdown(targetFile, setMarkdown, setIsMarkdownModalOpen);
    } else {
      openOtherFile(targetFile);
    }
  }
};