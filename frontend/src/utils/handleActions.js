import { downloadFile, deleteFiles, openDirectory, openImage, openMarkdown, openOtherFile, openVideo } from "./fileActions";

export const downloadSelectedFiles = (data, notifyFailure) => {
  console.log("download_files", data.state);
  const numFiles = data.state.selectedFiles.length;
  if (numFiles === 1) {
    console.log("downloading file", data.state.selectedFiles[0].id)
    var downloadpath = data.state.selectedFiles[0].id;
    downloadFile(downloadpath, notifyFailure);
  }
};

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