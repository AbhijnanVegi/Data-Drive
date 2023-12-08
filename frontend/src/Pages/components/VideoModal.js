import Modal from "antd/es/modal/Modal";
/**
 * Renders a video modal component.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Determines if the modal is open or not.
 * @param {Function} props.onCancel - The function to be called when the modal is canceled.
 * @param {string} props.activeVideo - The URL of the active video.
 * @returns {JSX.Element} The video modal component.
 */
export const VideoModal = ({ open, onCancel, activeVideo }) => (
  <Modal
    open={open}
    closable={false}
    width={750}
    footer={null}
    onCancel={onCancel}
    centered
  >
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <video style={{ maxWidth: '100%', borderRadius: '4px', boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)' }} controls>
        <source
          src={activeVideo}
          type="video/mp4"
        />
      </video>
    </div>
  </Modal>
);