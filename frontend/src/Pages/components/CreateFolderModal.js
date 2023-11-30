// CreateFolderModal.js
import Modal from "antd/es/modal/Modal";
import CreateFolderModalForm from "./CreateFolderModalForm";

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