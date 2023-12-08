import Modal from "antd/es/modal/Modal";
import TransferFileModalForm from "./TransferFileModalForm";

/**
 * Renders a modal component for transferring a file.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Determines if the modal is open or not.
 * @param {function} props.onCancel - The function to be called when the modal is canceled.
 * @param {function} props.onSubmit - The function to be called when the form is submitted.
 * @returns {JSX.Element} The TransferFileModal component.
 */
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