// fileDownloader.js
import api from "./api";

/**
 * Downloads a file from the specified file path.
 * 
 * @param {string} filePath - The path of the file to be downloaded.
 * @param {function} notifyFailure - A callback function to notify if the download fails.
 */
export const downloadFile = (filePath, notifyFailure) => {
  if (filePath[filePath.length - 1] === "/") {
    filePath = filePath.slice(0, -1);
  }
  api.get("/token/" + filePath, {
    withCredentials: true,
  })
    .then((res) => {
      const token = res.data.token;
      const interval = setInterval(() => {
        api.get("/status/" + res.data.token, {
          withCredentials: true,
        }).then((res) => {
          if (res.data.status === "done") {
            clearInterval(interval);
            // window.open("/download/" + token);
            fetch(`/api/download/${token}`)
              .then(response => response.blob())
              .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const fileName = filePath.split('/').pop(); // Extract file name from download path
                link.setAttribute('download', fileName); // Use the actual file name here
                link.style.display = 'none'; // Ensure the link element is not visible
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              })
              .catch((error) => {
                console.log(error);
              });
          } else if (res.data.status === "failed") {
            notifyFailure("Download failed");
            clearInterval(interval);
          }
        }).catch((err) => {
          console.log(err);
        });
      }, 1000);
    })
    .catch((err) => {
      console.log(err);
    });
};


/**
 * Deletes the selected files.
 * 
 * @param {Array} selectedFiles - The array of selected files to be deleted.
 * @param {Function} notifySuccess - The function to notify success after deleting a file.
 * @param {Function} notifyFailure - The function to notify failure after deleting a file.
 * @returns {Array} - The array of IDs of the successfully deleted files.
 */
export const deleteFiles = async (selectedFiles, notifySuccess, notifyFailure) => {
  const deletePromises = selectedFiles.map((file) => {
    var filepath = file.id;
    if (filepath[filepath.length - 1] === "/") {
      filepath = filepath.slice(0, -1);
    }
    const req = {
      data: {
        path: filepath
      },
    };
    return api.post("/delete", req, {
      withCredentials: true,
    });
  });

  const responses = await Promise.all(deletePromises);
  const successfulDeletes = responses.reduce((acc, res, index) => {
    if (res.status === 200) {
      notifySuccess(res.data.message);
      acc.push(selectedFiles[index].id); // Add the ID of the successfully deleted file
    } else {
      notifyFailure(res.data.message);
    }
    return acc;
  }, []);
  return successfulDeletes;
};



/**
 * Opens a directory and sets the path.
 * @param {Object} targetFile - The target file object.
 * @param {Function} setPath - The function to set the path.
 * @returns {void}
 */
export const openDirectory = (targetFile, setPath) => {
  let newPath = targetFile.id;
  if (newPath[newPath.length - 1] === "/") {
    newPath = newPath.slice(0, -1);
  }
  console.log("newPath: ", newPath)
  setPath(newPath);
};

/**
 * Opens an image and updates the pictures state.
 * @param {Object} targetFile - The target file to open.
 * @param {Array} pictures - The array of pictures.
 * @param {Function} setPictures - The function to update the pictures state.
 * @param {Function} setIsPictureModalOpen - The function to update the state of the picture modal.
 */
export const openImage = (targetFile, pictures, setPictures, setIsPictureModalOpen) => {
  console.log("pictures", pictures)
  const json = JSON.stringify(pictures);
  const loadjson = JSON.parse(json);
  const index = loadjson.indexOf(targetFile.id);
  const newPictures = loadjson.slice(index).concat(loadjson.slice(0, index));
  console.log("newPictures", newPictures)
  setPictures(newPictures);
  setIsPictureModalOpen(true);
};

/**
 * Opens a video file.
 * 
 * @param {Object} targetFile - The target video file.
 * @param {Function} setActiveVideo - The function to set the active video.
 * @param {Function} setIsVideoModalOpen - The function to set the video modal open state.
 */
export const openVideo = (targetFile, setActiveVideo, setIsVideoModalOpen) => {
  let downloadpath = targetFile.id;
  if (downloadpath[downloadpath.length - 1] === "/") {
    downloadpath = downloadpath.slice(0, -1);
  }
  console.log("video downloadpath", downloadpath)
  api.get("/get/" + downloadpath, {
    responseType: "blob",
  })
    .then((res) => {
      setActiveVideo(URL.createObjectURL(res.data));
      setIsVideoModalOpen(true);
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * Opens the specified file for download.
 * 
 * @param {Object} targetFile - The file to be downloaded.
 */
export const openOtherFile = (targetFile) => {
  let downloadpath = targetFile.id;
  if (downloadpath[downloadpath.length - 1] === "/") {
    downloadpath = downloadpath.slice(0, -1);
  }
  api.get("/get/" + downloadpath, {
    responseType: "blob",
  })
    .then((res) => {
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      const fileName = downloadpath.split('/').pop(); // Extract file name from download path
      link.setAttribute('download', fileName); // Use the actual file name here
      link.style.display = 'none'; // Ensure the link element is not visible
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * Opens a markdown file and sets the markdown content and modal state.
 * @param {Object} targetFile - The target file object.
 * @param {Function} setMarkdown - The function to set the markdown content.
 * @param {Function} setIsMarkdownModalOpen - The function to set the modal state.
 */
export const openMarkdown = (targetFile, setMarkdown, setIsMarkdownModalOpen) => {
  let downloadpath = targetFile.id;
  if (downloadpath[downloadpath.length - 1] === "/") {
    downloadpath = downloadpath.slice(0, -1);
  }
  api.get("/get/" + downloadpath, {
    withCredentials: true,
  })
    .then((res) => {
      setMarkdown(res.data);
      setIsMarkdownModalOpen(true);
    })
    .catch((err) => {
      console.log(err);
    });
}