import { Spin } from "antd"
import { FullFileBrowser } from "chonky"
import { TransferFileModal } from "./TransferFileModal"
import { Modal } from "antd"
import ShareFolderModal from "./shareFolderModal"
import { VideoModal } from "./VideoModal"
import { PictureModal } from "./PictureModal"
import { CreateFolderModal } from "./CreateFolderModal"
import { handleCopyFileFormSubmit } from "../../utils/modalutils/copyandmoveutils"
import { handleMoveFileFormSubmit } from "../../utils/modalutils/copyandmoveutils"
import { handleShareFolderFormSubmit } from "../../utils/modalutils/shareutils"
import Markdown from "react-markdown"
/**
 * CustomFileBrowser component.
 *
 * @component
 * @param {boolean} loading - Indicates if the component is in a loading state.
 * @param {boolean} isCreateFolderModalOpen - Indicates if the create folder modal is open.
 * @param {function} handleCancel - Callback function for canceling an action.
 * @param {function} handleCreateFolderFormSubmit - Callback function for submitting the create folder form.
 * @param {string} path - The current path in the file browser.
 * @param {function} setIsCreateFolderModalOpen - Setter function for the isCreateFolderModalOpen state.
 * @param {function} setFiles - Setter function for the files state.
 * @param {boolean} isCopyFilesModalOpen - Indicates if the copy files modal is open.
 * @param {function} handleCopyFilesModalCancel - Callback function for canceling the copy files modal.
 * @param {function} setIsCopyFilesModalOpen - Setter function for the isCopyFilesModalOpen state.
 * @param {Array} selectedFiles - The selected files in the file browser.
 * @param {boolean} isMoveFilesModalOpen - Indicates if the move files modal is open.
 * @param {function} handleMoveFilesModalCancel - Callback function for canceling the move files modal.
 * @param {function} setIsMoveFilesModalOpen - Setter function for the isMoveFilesModalOpen state.
 * @param {boolean} rerender - Indicates if the component should rerender.
 * @param {function} setRerender - Setter function for the rerender state.
 * @param {boolean} isShareFolderModalOpen - Indicates if the share folder modal is open.
 * @param {function} handleShareFolderModalCancel - Callback function for canceling the share folder modal.
 * @param {function} setIsShareFolderModalOpen - Setter function for the isShareFolderModalOpen state.
 * @param {boolean} isMarkdownModalOpen - Indicates if the markdown modal is open.
 * @param {function} setIsMarkdownModalOpen - Setter function for the isMarkdownModalOpen state.
 * @param {string} markdown - The markdown content to be displayed in the markdown modal.
 * @param {boolean} isVideoModalOpen - Indicates if the video modal is open.
 * @param {function} handleVideoModalCancel - Callback function for canceling the video modal.
 * @param {string} activeVideo - The URL of the active video to be displayed in the video modal.
 * @param {boolean} isPictureModalOpen - Indicates if the picture modal is open.
 * @param {function} handlePictureModalCancel - Callback function for canceling the picture modal.
 * @param {Array} pictures - The pictures to be displayed in the picture modal.
 * @param {Array} files - The files to be displayed in the file browser.
 * @param {Array} folders - The folder chain to be displayed in the file browser.
 * @param {Array} fileActions - The available file actions in the file browser.
 * @param {function} handleAction - Callback function for handling file actions.
 * @returns {JSX.Element} The rendered CustomFileBrowser component.
 */
export const CustomFileBrowser = ({
    loading,
    isCreateFolderModalOpen,
    handleCancel,
    handleCreateFolderFormSubmit,
    path,
    setIsCreateFolderModalOpen,
    setFiles,
    isCopyFilesModalOpen,
    handleCopyFilesModalCancel,
    setIsCopyFilesModalOpen,
    selectedFiles,
    isMoveFilesModalOpen,
    handleMoveFilesModalCancel,
    setIsMoveFilesModalOpen,
    rerender,
    setRerender,
    isShareFolderModalOpen,
    handleShareFolderModalCancel,
    setIsShareFolderModalOpen,
    isMarkdownModalOpen,
    setIsMarkdownModalOpen,
    markdown,
    isVideoModalOpen,
    handleVideoModalCancel,
    activeVideo,
    isPictureModalOpen,
    handlePictureModalCancel,
    pictures,
    files,
    folders,
    fileActions,
    handleAction
}) => {
    return (
        <div className="chonky">
            <Spin size="large" spinning={loading} tip="Loading..." className="centered-opaque-spinner">
                <CreateFolderModal open={isCreateFolderModalOpen} onCancel={handleCancel}
                    onSubmit={(values) => handleCreateFolderFormSubmit(values, path, setIsCreateFolderModalOpen, setFiles)}
                />
                <TransferFileModal open={isCopyFilesModalOpen} onCancel={handleCopyFilesModalCancel}
                    onSubmit={(values) => handleCopyFileFormSubmit(values, setIsCopyFilesModalOpen, selectedFiles)}
                    selectedFiles={selectedFiles} />
                <TransferFileModal open={isMoveFilesModalOpen} onCancel={handleMoveFilesModalCancel}
                    onSubmit={(values) => handleMoveFileFormSubmit(values, setIsMoveFilesModalOpen, selectedFiles, rerender, setRerender)}
                    selectedFiles={selectedFiles} />
                <ShareFolderModal open={isShareFolderModalOpen}
                    onCancel={handleShareFolderModalCancel}
                    onSubmit={(values) => handleShareFolderFormSubmit(values, selectedFiles, setIsShareFolderModalOpen)} selectedFiles={selectedFiles} />
                
                <Modal
                    width={1000}
                    open={isMarkdownModalOpen}
                    onCancel={() => setIsMarkdownModalOpen(false)}
                    footer={null}
                >
                    <Markdown>{markdown}</Markdown>
                </Modal>
                <VideoModal open={isVideoModalOpen} onCancel={handleVideoModalCancel} activeVideo={activeVideo} />
                <PictureModal open={isPictureModalOpen} onCancel={handlePictureModalCancel} pictures={pictures} />
                <FullFileBrowser
                    files={files}
                    folderChain={folders}
                    fileActions={fileActions}
                    onFileAction={handleAction}
                    disableDragAndDrop={true}
                /></Spin>
        </div>
    )
}