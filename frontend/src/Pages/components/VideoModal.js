import Modal from "antd/es/modal/Modal";
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
          src={"http://localhost:8000/download/" + activeVideo}
          type="video/mp4"
        />
      </video>
    </div>
  </Modal>
);