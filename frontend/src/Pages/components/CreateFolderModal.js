// CreateFolderModal.js
import Modal from "antd/es/modal/Modal";
import CreateFolderModalForm from "./CreateFolderModalForm";

/**
 * Renders a modal component for creating a folder.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Determines if the modal is open or not.
 * @param {function} props.onCancel - The function to be called when the modal is canceled.
 * @param {function} props.onSubmit - The function to be called when the form is submitted.
 * @returns {JSX.Element} The rendered CreateFolderModal component.
 */
export const CreateFolderModal = ({ open, onCancel, onSubmit }) => (
  <Modal
    title="Create a Folder"
    open={open}
    footer={null}
    onCancel={onCancel}
  >
    <CreateFolderModalForm onSubmit={onSubmit} />
  </Modal>
);