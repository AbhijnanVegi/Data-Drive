import { ChonkyIconName, defineFileAction } from "chonky";

const uploadFileAction = defineFileAction({
  id: "upload",
  fileFilter: (file) => file.isDir,
  button: {
    name: "Upload",
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

export const customActions = [
  uploadFileAction,
  createFolderAction,
  downloadFiles,
  deleteFiles,
];
