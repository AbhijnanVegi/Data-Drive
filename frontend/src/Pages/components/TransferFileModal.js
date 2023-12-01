import Modal from "antd/es/modal/Modal";
import TransferFileModalForm from "./TransferFileModalForm";

export const TransferFileModal = ({ open, onCancel, onSubmit }) => (
  <Modal
    title="Transfer a File"
    open={open}
    footer={null}
    onCancel={onCancel}
  >
    <TransferFileModalForm onSubmit={onSubmit} />
  </Modal>
);