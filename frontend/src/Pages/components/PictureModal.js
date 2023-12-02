import Modal from "antd/es/modal/Modal";
import { PictureCarousel } from "./PictureCarousel";
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