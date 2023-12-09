import Modal from "antd/es/modal/Modal";
import { PictureCarousel } from "./PictureCarousel";
import { useEffect, useState } from "react";
import api from "../../utils/api";
/**
 * Renders a modal component for displaying pictures.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Determines whether the modal is open or not.
 * @param {function} props.onCancel - The function to be called when the modal is canceled.
 * @param {Array} props.pictures - The array of pictures to be displayed in the modal.
 * @returns {JSX.Element} The rendered PictureModal component.
 */
export const PictureModal = ({ open, onCancel, selectedPicture }) => {
  // create image blob
  const [imageblob, setImageBlob] = useState(null);
  useEffect(() => {
    if (selectedPicture === null){
      setImageBlob(null);
      return;
    }
    api.get(`/get/${selectedPicture}`, {
      responseType: "blob"
    }).then(res => {
      console.log(res);
      setImageBlob(URL.createObjectURL(res.data));
    }
    ).catch(err => console.error(err));
  }, [selectedPicture]);
  useEffect(() => {
    console.log("trying to fetch pictures");
    console.log("selectedpicture", selectedPicture);
  }, [selectedPicture]);

  return (
    <Modal
      open={open}
      closable={false}
      width={750}
      footer={null}
      onCancel={onCancel}
    >
      <img src={imageblob} alt="" style={{ width: "100%" }} />
    </Modal>
  )
};