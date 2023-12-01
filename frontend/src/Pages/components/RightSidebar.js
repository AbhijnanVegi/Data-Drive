import IIITH from "../../public/IIITH.png";
import Folder from "../../public/Folder.png";
import "../components/css/components.css"
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import { extensions } from "../../utils/extensions";
import { useState,useEffect } from "react";
import api from "../../utils/api";
const isImage = (file) => ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'].includes(file.ext);
const isVideo = (file) => ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(file.ext);
const isAudio = (file) => ['mp3', 'wav', 'ogg', 'm4a', 'wma', 'flac', 'aac'].includes(file.ext);
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const RightSidebar = ({ files, darkMode }) => {
  const sidebarStyle = darkMode === 'dark' ? {
    backgroundColor: '#424242',
    color: '#fff',
  } : {};

  useEffect(() => {
    console.log(darkMode);
  }, [darkMode]);
  const [folderSize, setFolderSize] = useState(0);
  const [folderModDate, setFolderModDate] = useState(0);

  if (files.length === 0) {
    return (
      <div className="right-sidebar" style={sidebarStyle}>
        <div className="empty" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}>
          <div className="empty-icon">
            <i className="icon icon-3x icon-file-empty"></i>
          </div>
          <img src={IIITH} alt="IIITH" style={{ width: '250px', height: 'auto' }} />
          <p className="no-selection-subtitle">No files selected</p>
        </div>
      </div>
    );
  }
  else if (files.length >= 2) {
    return (
      <div className="right-sidebar" o style={sidebarStyle}>
        <div className="empty">
          <h1 style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '10%'
          }}>{files.length}</h1>
          <p className="empty-subtitle">files selected</p>
        </div>
      </div>
    );
  }
  else if (files.length === 1) {
    const targetFile = files[0];
    if (targetFile.isDir) {
      const owner = targetFile.id.split('/')[0];
      // strip the trailing slash
      var size, modDate;
      const path = targetFile.id.slice(0, -1);
      api.get('/du/' + path).then((res) => {
        console.log("res",res.data)
        setFolderSize(res.data.size);
        const date = new Date(res.data.last_modified);
        setFolderModDate(date.toLocaleString());
      }).catch((err) => {
        console.log(err);
      })
      return (
        <div className="right-sidebar" style={sidebarStyle}>
          <div className="empty" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}>
            <div className="empty-icon">
              <i className="icon icon-3x icon-file-empty"></i>
            </div>
            <img src={Folder} alt="IIITH" style={{ width: '250px', height: 'auto' }} />
            <p className="empty-subtitle">{targetFile.name}</p>
            <hr />
            <p className="empty-subtitle">Type : Folder</p>
            <p className="empty-subtitle">Owner : {owner}</p>
            <p className="empty-subtitle">Size : {formatBytes(folderSize)}</p>
            <p className="empty-subtitle">Modified : {folderModDate}</p>
          </div>
        </div>
      );
    }
    else {
      const ext = targetFile.ext.toUpperCase();
      const owner = targetFile.id.split('/')[0];
      let fileContent;
      if (['JPG', 'JPEG', 'PNG', 'GIF'].includes(ext)) {
        fileContent = <img src={targetFile.thumbnailUrl} alt={targetFile.name} style={{ width: '250px', height: 'auto' }} />;
      } else if (['MP4', 'AVI', 'MOV'].includes(ext)) {
        fileContent = <ChonkyIconFA icon="video" />;
      } else if (['MP3', 'WAV', 'OGG'].includes(ext)) {
        fileContent = <ChonkyIconFA icon="audio" />;
      }
      else if (['PDF'].includes(ext)) {
        fileContent = <ChonkyIconFA icon="pdf" />;
      } else {
        fileContent = <ChonkyIconFA icon="file" />;
      }
      const date = new Date(targetFile.modDate);
      const modDate = date.toLocaleString();

      return (
        <div className="right-sidebar" style={sidebarStyle}>
          <div className="empty" style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}>
            <div className="empty-icon">
              {fileContent}
            </div>
            <p className="empty-subtitle">{targetFile.name}</p>
            <hr />
            <p className="empty-subtitle">Type : {extensions[ext]["descriptions"][0]}</p>
            <p className="empty-subtitle">Owner : {owner}</p>
            <p className="empty-subtitle">Size : {formatBytes(targetFile.size)}</p>
            <p className="empty-subtitle">Modified : {modDate}</p>
          </div>
        </div>
      );
    }

  }
  return (
    <div className="right-sidebar" style={sidebarStyle}>
      hello
    </div>
  );
}; 