import Modal from "antd/es/modal/Modal";
import { PictureCarousel } from "./PictureCarousel";
export const PictureModal = ({ open, onCancel, pictures }) => (
  <Modal
    open={open}
    closable={false}
    width={750}
    footer={null}
    onCancel={onCancel}
  >
    <PictureCarousel pictures={pictures} />
  </Modal>
);