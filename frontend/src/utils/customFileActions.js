import { ChonkyIconName, defineFileAction } from "chonky";

const uploadFolderAction = defineFileAction({
  id: "upload_folder",
  fileFilter: (file) => file.isDir,
  button: {
    name: "Upload folder",
    tooltip: "Upload a folder",
    toolbar: true,
    contextMenu: true,
    icon: ChonkyIconName.upload,
  },
});

const uploadFileAction = defineFileAction({
  id: "upload_file",
  fileFilter: (file) => !file.isDir,
  button: {
      name: "Upload file",
      tooltip: "Upload a file",
      toolbar: true,
      contextMenu: true,
      icon: ChonkyIconName.upload,
  },
});

const createFolderAction = defineFileAction({
  id: "create_folder",
  button: {
    name: "Create folder",
    toolbar: true,
    tooltip: "Create a folder",
    contextMenu: true,
    icon: ChonkyIconName.folderCreate,
  },
});

const downloadFiles = defineFileAction({
  id: "download_files",
  requiresSelection: true,
  button: {
    name: "Download",
    toolbar: true,
    contextMenu: true,
    icon: ChonkyIconName.download,
  },
});


const deleteFiles = defineFileAction({
  id: "delete_files",
  requiresSelection: true,
  hotkeys: ["delete"],
  button: {
    name: "Delete files",
    toolbar: true,
    contextMenu: true,
    group: "Actions",
    icon: ChonkyIconName.trash,
  },
});

const shareFiles = defineFileAction({
  id: "share_files",
  requiresSelection: true,
  hotkeys: ["shift+s"],
  button: {
    name: "Share files",
    toolbar: true,
    contextMenu: true,
    group: "Actions",
    icon: ChonkyIconName.share,
  },
});

const copyFiles = defineFileAction({
  id: "copy_files",
  requiresSelection: true,
  hotkeys: ["ctrl+c"],
  button: {
    name: "Copy files",
    toolbar: true,
    contextMenu: true,
    group: "Actions",
    icon: ChonkyIconName.copy,
  },
});

const moveFiles = defineFileAction({
  id: "move_files",
  requiresSelection: true,
  hotkeys: ["ctrl+x"],
  button: {
    name: "Move files",
    toolbar: true,
    contextMenu: true,
    group: "Actions",
    icon: ChonkyIconName.copy,
  },
});

export const customActions = [
  uploadFileAction,
  uploadFolderAction,
  createFolderAction,
  downloadFiles,
  deleteFiles,
  shareFiles,
  copyFiles,
  moveFiles,
];
