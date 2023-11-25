import handleFileUpload from "../helpers/fileUpload";
import handleFolderCreation from "../helpers/createFolder";
import React, { useEffect, useReducer } from "react";
import { useCallback, useState } from "react";
import { setChonkyDefaults } from "chonky";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import { FullFileBrowser } from "chonky";
import "../css/HomePage.css";
import axios from "axios";
import { customActions } from "../Components/customFileActions";
import { Modal } from "antd";
import CreateButtonModalForm from "../Components/createButtonModalForm";
import toast, { Toaster } from "react-hot-toast";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader

setChonkyDefaults({ iconComponent: ChonkyIconFA });
const HomePage = () => {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [path, setPath] = useState(null);
  const [folders, setFolders] = useState([]); // array of folder names [folder1, folder2, folder3
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [pictures, setPictures] = useState([]);
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  const notifySuccess = (message) => {
    toast.success(message, {
      position: "bottom-center",
    });
  };
  const notifyFailure = (message) => {
    toast.error(message, {
      position: "bottom-center",
    });
  };
  const showModal = () => {
    setIsCreateFolderModalOpen(true);
  };

  const handleOk = () => {
    setIsCreateFolderModalOpen(false);
  };

  const handleCancel = () => {
    setIsCreateFolderModalOpen(false);
  };
  const handlePictureModalCancel = () => {
    setIsPictureModalOpen(false);
  };

  const handleVideoModalCancel = () => {
    setIsVideoModalOpen(false);
  };
  const [createFolderModalFormData, setCreateFolderModalFormData] = useState(
    null,
  );
  const [imageData, setImageData] = useState(null);
  const pdfUrl = "http://localhost:5000/get/rudranshsingh2/Assignment2.pdf"; // Replace with your PDF URL

  const handleCreateFolderFormSubmit = async (values) => {
    console.log("Success:", values);
    setCreateFolderModalFormData(values);
    handleOk();
    const folderRequest = {
      path: path + "/" + values.foldername,
    };
    console.log(folderRequest);
    const response = await handleFolderCreation(folderRequest);
    console.log(response);
    if (response.status === 200) {
      const tempElement = {};
      tempElement.id = path + "/" + values.foldername;
      tempElement.isDir = true;
      tempElement.name = values.foldername;
      setFiles((files) => [...files, tempElement]);
      notifySuccess(response.data.message);
    } else {
      notifyFailure(response.data.message);
    }
  };
  const fileActions = customActions;
  const uploadFile = async (file, filename) => {
    console.log(path + "/" + filename);
    const response = await handleFileUpload(file, path + "/" + filename);
    if (response.status === 200) {
      const tempElement = {};
      tempElement.id = path + "/" + filename;
      tempElement.isDir = false;
      tempElement.name = filename;
      setFiles((files) => [...files, tempElement]);
      notifySuccess(response.data.message);
    } else {
      console.log("lmao");
      notifyFailure(response.data.message);
    }
  };

  useEffect(() => {
    // get user info by pinging /locahost:5000/auth/user
    axios.get("http://localhost:5000/auth/user", { withCredentials: true })
      .then((res) => {
        if (res.data.username === null) {
          window.location.href = "/";
        } else {
          setUser(res.data.username);
          setPath(res.data.username);
          var folderArray = [];
          const first_folder = {
            id: res.data.username,
            name: res.data.username,
            isDir: true,
            isOpenable: true,
          };
          folderArray.push(first_folder);
          setFolders(folderArray);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  useEffect(() => {
    if (path !== null) {
      console.log("path", path);
      // iterate through path.split say path.split was ['user', 'username', 'folder1'], set ids to user, user/username, user/username/folder1 and names to user, username, folder1
      const folderChain = path.split("/");
      console.log("folderChain", folderChain);
      for (var i = 1; i < folderChain.length; i++) {
        folderChain[i] = folderChain[i - 1] + "/" + folderChain[i];
      }
      console.log("folderChain new", folderChain);
      const tempFolderArray = [];
      const folderNames = path.split("/");
      for (i = 0; i < folderChain.length; i++) {
        const tempElement = {};
        tempElement.id = folderChain[i];
        tempElement.name = folderNames[i];
        tempElement.isOpenable = true;
        tempElement.isDir = true;
        tempFolderArray.push(tempElement);
      }
      console.log("tempFolderArray", tempFolderArray);
      setFolders(tempFolderArray);
      const fileRequest = {
        path: path,
      };
      console.log("is useeffect even working?");
      console.log(fileRequest);
      axios.defaults.validateStatus = () => true;
      axios("http://localhost:5000/list", {
        method: "post",
        withCredentials: true,
        data: fileRequest,
      })
        .then((res) => {
          console.log(res.data);
          // push every element of res.data.object into fileArray immutable
          var tempFileArray = [];
          var tempPictures = [];
          res.data.objects.forEach((element) => {
            const tempElement = {};
            tempElement.id = element.path;
            tempElement.isDir = element.is_dir;
            tempElement.size = element.size === null ? 0 : element.size;
            tempElement.modDate = element.last_modified;
            // split the path to get the name of the file, take the last element
            const pathArray = element.path.split("/");
            tempElement.name = pathArray[pathArray.length - 1];
            if (tempElement.name === "") {
              tempElement.name = pathArray[pathArray.length - 2];
            }
            if (tempElement.name !== "_") {
              // find the extension of the file
              const extensionArray = tempElement.name.split(".");
              tempElement.ext = extensionArray[extensionArray.length - 1];
              if (
                tempElement.ext === "png" || tempElement.ext === "jpg" ||
                tempElement.ext === "jpeg" || tempElement.ext === "gif" ||
                tempElement.ext === "bmp" || tempElement.ext === "svg"
              ) {
                tempElement.thumbnailUrl = "http://localhost:5000/get/" +
                  tempElement.id;
              }
              if (
                tempElement.ext === "png" || tempElement.ext === "jpg" ||
                tempElement.ext === "jpeg" || tempElement.ext === "gif" ||
                tempElement.ext === "bmp" || tempElement.ext === "svg"
              ) {
                tempPictures.push(tempElement.id);
              }
              tempFileArray.push(tempElement);
            }
          });
          console.log("file array", tempFileArray);
          console.log("set pictures", tempPictures);
          setPictures(tempPictures);
          console.log("state variable pictures", pictures);
          setFiles(tempFileArray);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [path]);
  const handleAction = useCallback((data) => {
    console.log("File action data:", data);
    if (data.id === "upload") {
      let input = document.createElement("input");
      input.type = "file";
      input.onchange = (_) => {
        let file = Array.from(input.files);
        console.log(files);
        console.log("file selected");
        let filename = file[0].name;
        uploadFile(file, filename);
      };
      input.click();
    }
    if (data.id === "create_folder") {
      console.log("create_folder");
      showModal();
    }
    if (data.id === "download_files") {
      const numFiles = data.state.selectedFiles.length;
      if (numFiles === 1) {
        window.open(
          "http://localhost:5000/download/" + data.state.selectedFiles[0].id,
        );
      }
    }
   
    if (data.id === "open_files") {
      // remove the last / from the path
      if (data.payload.targetFile.isDir === true) {
        var newPath = "";
        if (
          data.payload.targetFile.id[data.payload.targetFile.id.length - 1] ==
          "/"
        ) {
          newPath = data.payload.targetFile.id.slice(0, -1);
        } else {
          newPath = data.payload.targetFile.id;
        }
        console.log("new path", newPath);
        setPath(newPath);
      } else {
        // rotate the pictures array to the right until the first element is the target files
        const extensionArray = data.payload.targetFile.id.split(".");
        const fileExtension = extensionArray[extensionArray.length - 1];
        if (
          fileExtension === "png" || fileExtension === "jpg" ||
          fileExtension === "jpeg" || fileExtension === "gif" ||
          fileExtension === "bmp" || fileExtension === "svg"
        ) {
          const json = JSON.stringify(pictures);
          const loadjson = JSON.parse(json);
          const index = loadjson.indexOf(data.payload.targetFile.id);
          const newPictures = loadjson.slice(index).concat(
            loadjson.slice(0, index),
          );
          setPictures(newPictures);
          setIsPictureModalOpen(true);
        } else if (fileExtension === "mp4") {
          setActiveVideo(data.payload.targetFile.id);
          setIsVideoModalOpen(true);
        } else {
          window.open(
            "http://localhost:5000/get/" + data.payload.targetFile.id,
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, files, pictures]);
  const indicatorStyles = {
    background: "#222222",
    width: 8,
    height: 8,
    display: "inline-block",
    margin: "0 8px",
  };

  // split path into array of folders
  return (
    <div className="full-page">
      {imageData}
      <div className="chonky">
        <Modal
          title="Create a Folder"
          open={isCreateFolderModalOpen}
          footer={null}
          onCancel={handleCancel}
        >
          <CreateButtonModalForm onSubmit={handleCreateFolderFormSubmit} />
        </Modal>
        <Modal
          open={isVideoModalOpen}
          closable={false}
          width={750}
          footer={null}
          onCancel={handleVideoModalCancel}
        >
          <p className="videoName">{activeVideo}</p>
          <video width="700" height="500" controls>
            <source
              src={"http://localhost:5000/get/" + activeVideo}
              type="video/mp4"
            />
          </video>
        </Modal>
        <Modal
          open={isPictureModalOpen}
          closable={false}
          width={750}
          footer={null}
          onCancel={handlePictureModalCancel}
        >
          <div id="carousel-div">
            <Carousel
              width="700px"
              height="500px"
              infiniteLoop={true}
              renderIndicator={(onClickHandler, isSelected, index, label) => {
                if (isSelected) {
                  return (
                    <li
                      style={{ ...indicatorStyles, background: "#5f676a" }}
                      aria-label={`Selected: ${label} ${index + 1}`}
                      title={`Selected: ${label} ${index + 1}`}
                    />
                  );
                }
                return (
                  <li
                    style={indicatorStyles}
                    onClick={onClickHandler}
                    onKeyDown={onClickHandler}
                    value={index}
                    key={index}
                    role="button"
                    tabIndex={0}
                    title={`${label} ${index + 1}`}
                    aria-label={`${label} ${index + 1}`}
                  />
                );
              }}
            >
              {pictures.map((picture) => {
                return (
                  <div key={picture}>
                    <img src={"http://localhost:5000/get/" + picture} />
                    <p className="legend">{picture}</p>
                  </div>
                );
              })}
            </Carousel>
          </div>
        </Modal>
        <FullFileBrowser
          files={files}
          folderChain={folders}
          fileActions={fileActions}
          onFileAction={handleAction}
        />
      </div>
      <Toaster />
    </div>
  );
};

export default HomePage;
