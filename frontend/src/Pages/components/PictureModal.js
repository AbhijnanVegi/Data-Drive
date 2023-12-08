import Modal from "antd/es/modal/Modal";
import { PictureCarousel } from "./PictureCarousel";
/**
 * Renders a modal component for displaying pictures.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Determines whether the modal is open or not.
 * @param {function} props.onCancel - The function to be called when the modal is canceled.
 * @param {Array} props.pictures - The array of pictures to be displayed in the modal.
 * @returns {JSX.Element} The rendered PictureModal component.
 */
export const PictureModal = ({ open, onCancel, pictures }) => {
  console.log("pictures", pictures)
  return (
    <Modal
      open={open}
      closable={false}
      width={750}
      footer={null}
      onCancel={onCancel}
    >
      <PictureCarousel pictures={pictures} />
    </Modal>
  )
};