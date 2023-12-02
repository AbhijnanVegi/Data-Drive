// fileDownloader.js
import api from "./api";

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
            // window.open("http://localhost:8000/download/" + token);
            fetch(`http://localhost:8000/download/${token}`)
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



export const openDirectory = (targetFile, setPath) => {
  let newPath = targetFile.id;
  if (newPath[newPath.length - 1] === "/") {
    newPath = newPath.slice(0, -1);
  }
  console.log("newPath: ", newPath)
  setPath(newPath);
};

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

export const openOtherFile = (targetFile) => {
  let downloadpath = targetFile.id;
  if (downloadpath[downloadpath.length - 1] === "/") {
    downloadpath = downloadpath.slice(0, -1);
  }
  api.get("/token/" + downloadpath, {
    withCredentials: true,
  })
    .then((res) => {
      window.open("http://localhost:8000/download/" + res.data.token);
    })
    .catch((err) => {
      console.log(err);
    });
};

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