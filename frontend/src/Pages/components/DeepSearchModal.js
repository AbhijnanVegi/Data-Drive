import React, { useState, useEffect } from 'react';
import { Modal, List } from 'antd';
import { notifyFailure } from '../../utils/toaster';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import api from '../../utils/api';
import { FileOutlined } from '@ant-design/icons';
import { Input } from 'antd';


const DeepSearchModal = ({ path, setPath, open, onClose, setIsDeepSearchModalOpen }) => {
    const [results, setResults] = useState([]);
    const [search, setSearch] = useState('');
    console.log("path for deepsearch modal", path);
    useEffect(() => {
        if (open) {
            api.get(`/get_all_files/${path}`)
                .then((res) => {
                    const filteredResults = res.data.filter(result => !result.path.endsWith('/_'));
                    setResults(filteredResults);
                })
                .catch((err) => {
                    console.log(err);
                    notifyFailure(err.response.data.detail);
                })
        }
    }, [open, path]);
    useEffect(() => {
        console.log("results of deep search modal are", results)
    }, [results])
    const handleItemClick = (item) => {
        console.log('Item clicked:', item);
        //remove the last part of the path
        const newPath = item.path.split('/').slice(0, -1).join('/');
        console.log("new path is", newPath);
        setPath(newPath);
        setIsDeepSearchModalOpen(false);
        // Add your logic here
    };
    const isImage = (item) => ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg'].includes(item);
    const isVideo = (item) => ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(item);
    const isAudio = (item) => ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(item);
    const isDoc = (item) => ['doc', 'docx', 'odt', 'pdf', 'rtf', 'tex', 'txt', 'wpd'].includes(item);
    const getExtension = (item) => {
        const extensionArray = item.split('.');
        const fileExtension = extensionArray[extensionArray.length - 1];
        return fileExtension;
    }
    const createAvatar = (item) => {
        if (isImage(getExtension(item))) {
            return (
                <ChonkyIconFA 
                icon="image" 
                style = {{
                    color: '#a78bbc'
                }}
                />
            );
        }
        else if (isVideo(getExtension(item))) {
            return (
                <ChonkyIconFA icon="video" />
            );
        }
        else if (isAudio(getExtension(item))) {
            return (
                <ChonkyIconFA icon="audio" />
            );
        }
        else if (isDoc(getExtension(item))) {
            return (
                <ChonkyIconFA
                    icon="pdf"
                    // make red color
                    style={{ color: '#d1382a' }}
                />
            );
        }
        else {
            return (
                <ChonkyIconFA
                    icon="file"
                    style={{ color: '#d1b817' }}
                />
            );
        }
    }
    return (
        <Modal
            title="Deep Search Results"
            open={open}
            onCancel={onClose}
            footer={null}
        >
            <Input.Search
                placeholder="Search files"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                    marginBottom: '20px',
                    marginTop: '10px'
                }}
            />
            <List
                pagination={{
                    pageSize: 10,
                }}
                itemLayout="horizontal"
                dataSource={results.filter(item => item.path.toLowerCase().includes(search.toLowerCase()))}
                renderItem={item => (
                    <List.Item onClick={() => handleItemClick(item)}>
                        <List.Item.Meta
                            avatar={createAvatar(item.path)}
                            title={
                                <span
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'color 0.3s',
                                        color: 'black'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'blue'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'black'}
                                >
                                    {item.path}
                                </span>
                            }
                        />
                    </List.Item>
                )}
            />
        </Modal>
    );
}

export default DeepSearchModal;