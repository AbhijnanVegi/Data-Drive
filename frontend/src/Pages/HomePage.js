import handleFileUpload from "../helpers/fileUpload";
import handleFolderCreation from "../helpers/createFolder";
import React, { useEffect, useReducer, useMemo } from "react";
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

setChonkyDefaults({ iconComponent: ChonkyIconFA });
const HomePage = () => {
  const [theme, setTheme] = React.useState('light');
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [path, setPath] = useState(null);
  const [folders, setFolders] = useState([]); // array of folder names [folder1, folder2, folder3
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [pictures, setPictures] = useState([]);
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  const token = localStorage.getItem('token');
  // const toggleTheme = () => {
  //   console.log("toggle theme", theme);
  //   console.log("is theme light", theme === "light")
  //   setTheme(theme === "light" ? "dark" : "light");
  // };
  // Create an axios instance
  const api = axios.create({
    baseURL: 'http://localhost:8000', // Changed API endpoint
    headers: {
      Authorization: `Bearer ${token}`, // Use Bearer token for authentication
    },
  });
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
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

  const handleCreateFolderFormSubmit = async (values) => {
    console.log("Success:", values);
    setCreateFolderModalFormData(values);
    handleOk();
    const folderRequest = {
      path: path + "/" + values.foldername,
    };
    console.log("folder Request", folderRequest);
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
    api.get("/auth/user", { withCredentials: true })
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
        "data": {
          path: path,
        }
      };
      console.log("is useeffect even working?");
      console.log(fileRequest);
      axios.defaults.validateStatus = () => true;
      api.post("/list", fileRequest, { withCredentials: true })
        .then(async (res) => {
          const thumbnailPromises = res.data?.map((element) => {
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
            }
            if (
              tempElement.ext === "png" || tempElement.ext === "jpg" ||
              tempElement.ext === "jpeg" || tempElement.ext === "gif" ||
              tempElement.ext === "bmp" || tempElement.ext === "svg"
            ) {
              return api.get("/token/" + tempElement.id, {
                withCredentials: true,
              })
                .then((res) => {
                  tempElement.thumbnailUrl = "http://localhost:8000/download/" +
                    res.data.token;
                  tempElement.token = res.data.token;
                  return tempElement;
                });
            } else {
              return Promise.resolve(tempElement);
            }
          });
          const tempFileArray = await Promise.all(thumbnailPromises);
          console.log("file array", tempFileArray);
          const tempPictures = tempFileArray.filter((element) => {
            return (
              element.ext === "png" || element.ext === "jpg" ||
              element.ext === "jpeg" || element.ext === "gif" ||
              element.ext === "bmp" || element.ext === "svg"
            );
          }).map((element) => {
            return element.token;
          });
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
      console.log("download_files", data.state);
      const numFiles = data.state.selectedFiles.length;
      if (numFiles === 1) {
        console.log("downloading file", data.state.selectedFiles[0].id)
        var downloadpath = data.state.selectedFiles[0].id;
        if (downloadpath[downloadpath.length - 1] === "/") {
          downloadpath = downloadpath.slice(0, -1);
        }
        api.get("/token/" + downloadpath, {
          withCredentials: true,
        })
          .then((res) => {
            console.log(res);
            fetch(`http://localhost:8000/download/${res.data.token}`)
              .then(response => response.blob())
              .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const fileName = downloadpath.split('/').pop(); // Extract file name from download path
                link.setAttribute('download', fileName); // Use the actual file name here
                link.style.display = 'none'; // Ensure the link element is not visible
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
    if (data.id === "delete_files") {
      console.log("deleting files");
      const deletePromises = data.state.selectedFiles.map((file) => {
        var filepath = file.id;
        if (filepath[filepath.length - 1] === "/") {
          filepath = filepath.slice(0, -1);
        }
        const req = {
          data: {
            path: filepath
          },
        };
        console.log("delete request", req);
        return api.post("/delete", req, {
          withCredentials: true,
        });
      });

      Promise.all(deletePromises)
        .then((responses) => {
          const successfulDeletes = responses.reduce((acc, res, index) => {
            console.log(res);
            if (res.status === 200) {
              notifySuccess(res.data.message);
              acc.push(data.state.selectedFiles[index].id); // Add the ID of the successfully deleted file
            } else {
              notifyFailure(res.data.message);
            }
            return acc;
          }, []);

          const newFiles = files.filter((element) => {
            return !successfulDeletes.includes(element.id); // Only remove successfully deleted files
          });
          console.log("newFiles", newFiles);
          setFiles(newFiles);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    if (data.id === "open_files") {
      // remove the last / from the path
      if (data.payload.targetFile.isDir === true) {
        var newPath = "";
        if (
          data.payload.targetFile.id[data.payload.targetFile.id.length - 1] ===
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
          var downloadpath = data.payload.targetFile.id;
          if (downloadpath[downloadpath.length - 1] === "/") {
            downloadpath = downloadpath.slice(0, -1);
          }
          api.get("/token/" + downloadpath, {
            withCredentials: true,
          })
            .then((res) => {
              console.log("video token", res.data.token);
              setActiveVideo(res.data.token);
              setIsVideoModalOpen(true);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          var downloadpath = data.payload.targetFile.id;
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
    <div className="full-page" data-theme={theme} >
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
          centered
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <video style={{ maxWidth: '100%', borderRadius: '4px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)' }} controls>
              <source
                src={"http://localhost:8000/download/" + activeVideo}
                type="video/mp4"
              />
            </video>
          </div>
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
                    <img src={"http://localhost:8000/download/" + picture} />
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
          darkMode={theme === 'dark'}
        />
      </div>
      <div className="footer">
        <div style={{ position: 'fixed', right: 0, padding: '1em' }}>
          <button className="theme-toggle-button" onClick={toggleTheme} style={{ fontFamily: 'Quicksand, sans-serif' }}>
            <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
            {theme === 'light' ? ' Dark Mode' : ' Light Mode'}
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default HomePage;
