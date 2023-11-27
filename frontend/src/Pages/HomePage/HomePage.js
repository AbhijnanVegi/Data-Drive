import handleFileUpload from "../../utils/fileUpload";
import React, { useEffect, useCallback, useState } from "react";
import { setChonkyDefaults, FullFileBrowser } from "chonky";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import "./css/HomePage.css";
import { customActions } from "../../utils/customFileActions";
import toast, { Toaster } from "react-hot-toast";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import fetchFiles from "../../utils/fetchFiles";
import fetchUserInfo from "../../utils/fetchUserInfo";
import handleFolderCreation from "../../utils/createFolder";
import { CreateFolderModal } from "../components/CreateFolderModal";
import { Footer } from "../components/Footer";
import { VideoModal } from "../components/VideoModal";
import { PictureModal } from "../components/PictureModal";
import { downloadFile, deleteFiles, openDirectory, openImage, openVideo, openOtherFile } from "../../utils/fileActions";

setChonkyDefaults({ iconComponent: ChonkyIconFA });

/**
 * HomePage Component, shown after Login
 * @component
 */
const HomePage = () => {
  const [theme, setTheme] = React.useState('light');
  const [files, setFiles] = useState([]);
  const [path, setPath] = useState(null);
  const [folders, setFolders] = useState([]); // array of folder names [folder1, folder2, folder3
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [pictures, setPictures] = useState([]);
  const [isPictureModalOpen, setIsPictureModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

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

  const handleCreateFolderFormSubmit = async (values) => {
    handleOk();
    const folderRequest = {
      path: path + "/" + values.foldername,
    };
    const response = await handleFolderCreation(folderRequest);
    console.log(response);
    if (response.status === 200) {
      const tempElement = { id: path + "/" + values.foldername, isDir: true, name: values.foldername };
      setFiles((files) => [...files, tempElement]);
      notifySuccess(response.data.message);
    } else {
      notifyFailure(response.data.message);
    }
  };
  const fileActions = customActions;
  const uploadFile = async (file, filename) => {
    const response = await handleFileUpload(file, path + "/" + filename);
    if (response.status === 200) {
      const tempElement = { id: path + "/" + filename, isDir: false, name: filename };
      setFiles((files) => [...files, tempElement]);
      notifySuccess(response.data.message);
    } else {
      notifyFailure(response.data.message);
    }
  };

  useEffect(() => {
    fetchUserInfo(setPath, setFolders);
  }, []);
  useEffect(() => {
    fetchFiles(path, setFolders, setFiles, setPictures);
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
        downloadFile(downloadpath);
      }
    }
    if (data.id === "delete_files") {
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
    }

    if (data.id === "open_files") {
      const targetFile = data.payload.targetFile;
      if (targetFile.isDir) {
        openDirectory(targetFile, setPath);
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
          openVideo(targetFile, setActiveVideo, setIsVideoModalOpen);
        } else {
          openOtherFile(targetFile);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, files, pictures]);

  return (
    <div className="full-page" data-theme={theme} >
      <div className="chonky">
        <CreateFolderModal open={isCreateFolderModalOpen} onCancel={handleCancel} onSubmit={handleCreateFolderFormSubmit} />
        <VideoModal open={isVideoModalOpen} onCancel={handleVideoModalCancel} activeVideo={activeVideo} />
        <PictureModal open={isPictureModalOpen} onCancel={handlePictureModalCancel} pictures={pictures} />
        <FullFileBrowser
          files={files}
          folderChain={folders}
          fileActions={fileActions}
          onFileAction={handleAction}
          darkMode={theme === 'dark'}
        />
      </div>
      <Footer theme={theme} toggleTheme={toggleTheme} />
      <Toaster />
    </div>
  );
};

export default HomePage;
