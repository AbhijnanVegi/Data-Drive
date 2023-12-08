import { Spin, Modal } from "antd"
import { CreateFolderModal } from "./CreateFolderModal"
import { VideoModal } from "./VideoModal"
import { PictureModal } from "./PictureModal"
import Markdown from "react-markdown"
import { FullFileBrowser } from "chonky"
/**
 * Renders a shared file browser component.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.loading - Indicates if the component is in a loading state.
 * @param {boolean} props.isCreateFolderModalOpen - Indicates if the create folder modal is open.
 * @param {function} props.handleCancel - The function to handle cancel action.
 * @param {function} props.handleCreateFolderFormSubmit - The function to handle create folder form submission.
 * @param {Array} props.sharedfiles - The shared files data.
 * @param {Array} props.sharedfolders - The shared folders data.
 * @param {function} props.handleAction - The function to handle file actions.
 * @param {boolean} props.isVideoModalOpen - Indicates if the video modal is open.
 * @param {function} props.handleVideoModalCancel - The function to handle video modal cancel action.
 * @param {Object} props.activeVideo - The active video data.
 * @param {boolean} props.isPictureModalOpen - Indicates if the picture modal is open.
 * @param {function} props.handlePictureModalCancel - The function to handle picture modal cancel action.
 * @param {Array} props.sharedpictures - The shared pictures data.
 * @param {boolean} props.isMarkdownModalOpen - Indicates if the markdown modal is open.
 * @param {function} props.setIsMarkdownModalOpen - The function to set the markdown modal open state.
 * @param {string} props.markdown - The markdown content.
 * @returns {JSX.Element} The shared file browser component.
 */
export const SharedFileBrowser = ({
    loading,
    isCreateFolderModalOpen,
    handleCancel,
    handleCreateFolderFormSubmit,
    sharedfiles,
    sharedfolders,
    handleAction,
    isVideoModalOpen,
    handleVideoModalCancel,
    activeVideo,
    isPictureModalOpen,
    handlePictureModalCancel,
    sharedpictures,
    isMarkdownModalOpen,
    setIsMarkdownModalOpen,
    markdown
 }) => {
    return (
        <div className="chonky">
            <Spin size="large" spinning={loading} tip="Loading..." className="centered-opaque-spinner">
                <CreateFolderModal open={isCreateFolderModalOpen} onCancel={handleCancel} onSubmit={handleCreateFolderFormSubmit} />
                <VideoModal open={isVideoModalOpen} onCancel={handleVideoModalCancel} activeVideo={activeVideo} />
                <PictureModal open={isPictureModalOpen} onCancel={handlePictureModalCancel} pictures={sharedpictures} />
                <Modal
                    width={1000}
                    open={isMarkdownModalOpen}
                    onCancel={() => setIsMarkdownModalOpen(false)}
                    footer={null}
                >
                    <Markdown>{markdown}</Markdown>
                </Modal>
                <FullFileBrowser
                    files={sharedfiles}
                    folderChain={sharedfolders}
                    onFileAction={handleAction}
                    disableDragAndDrop={true}
                /></Spin>
        </div>
    )

}