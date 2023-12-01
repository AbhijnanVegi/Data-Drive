import React, { useState, useEffect } from 'react';
import "../components/css/components.css"
import api from '../../utils/api';
import { Button, Modal, Form, Slider, Select, Tag, Input } from 'antd';
import toast, { Toaster } from "react-hot-toast";
const { Option } = Select;

export const AdminSidebar = (config) => {
    const [numUsers, setNumUsers] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [rerender, setRerender] = useState(false);
    const notifySuccess = (message) => {
        toast.success(message, {
            position: "bottom-center",
        });
    };
    const notifyFailure = (message) => {
        toast.error(message, {
            position: "bottom-center",
        });
    };
    useEffect(() => {
        api.get("/admin/users").then((res) => {
            setNumUsers(res.data.length);
            let totalSize = 0;
            res.data.forEach(user => {
                totalSize += user.storage_used;
            });
            setTotalSize(totalSize);
        }
        ).catch((err) => {
            console.error(err);
        })
    }, [rerender]);
    const showModal = () => {
        setIsModalVisible(true);
    };
    const handleOk = (values) => {
        // Handle form submission here
        form.validateFields().then(values => {
            console.log("values", values);
            const updateConfigRequest = {
                "data": {
                    "max_preview_size": values.max_preview_size ? values.max_preview_size : config.config.max_preview_size,
                    "min_bandwidth": values.min_bandwidth ? values.min_bandwidth : config.config.min_bandwidth,
                    "default_user_quota": values.default_user_quota ? values.default_user_quota : config.config.default_user_quota,
                    "default_user_permission": values.default_user_permission ? values.default_user_permission : config.config.default_user_permission,
                    "allowed_file_extensions": allowedExtensions
                }
            }
            api.post("/admin/update_config", updateConfigRequest).then((res) => {
                console.log("update config response", res);
                notifySuccess(res.data.message)
                setRerender(!rerender);
            }).catch((err) => {
                console.error(err);
                notifyFailure(err.response.data.detail)
            })
            console.log("update config request", updateConfigRequest);
        })
            .catch(info => {
                console.log('Validation failed:', info);
            })

        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };
    console.log("config", config.config)
    useEffect(() => {
        if (config.config) {
            setAllowedExtensions(config.config.allowed_file_extensions);
        }
    }, [config]);
    const [allowedExtensions, setAllowedExtensions] = useState(config.config.allowed_file_extensions);
    useEffect(() => {
        console.log("allowed extensions", allowedExtensions)
    }, [allowedExtensions])

    const addExtension = (event) => {
        setAllowedExtensions([...allowedExtensions, event.target.value]);
    };
    function formatBytes(key, bytes) {
        if (key !== "min_bandwidth") {
            if (bytes < 1024) return bytes + ' B';
            else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
            else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
            else return (bytes / 1073741824).toFixed(2) + ' GB';
        }
        else {
            if (bytes < 1024) return bytes + ' bps';
            else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' Kbps';
            else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' Mbps';
            else return (bytes / 1073741824).toFixed(2) + ' Gbps';
        }
    }
    const configDict = {
        "max_preview_size": "Max Preview Size",
        "min_bandwidth": "Min Bandwidth",
        "default_user_quota": "Default User Quota",
        "default_user_permission": "Default User Permission",
        "allowed_file_extensions": "Allowed Extensions",
    }
    const formatter = (value) => {
        return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    const formatterbandwidth = (value) => {
        return `${(value / (1024 * 1024)).toFixed(2)} Mbps`;
    }
    const formatterpreview = (value) => {
        return `${(value / (1024 * 1024)).toFixed(2)} MB`;
    }

    const marksquota = {
        [5 * 1024 * 1024 * 1024]: '5 GB',
        [50 * 1024 * 1024 * 1024]: '50 GB',
        [75 * 1024 * 1024 * 1024]: '75 GB',
        [100 * 1024 * 1024 * 1024]: {
            style: {
                color: '#f50',
            },
            label: <strong>100 GB</strong>,
        },
    };
    const marksbandwidth = {
        [1 * 1024 * 1024]: '1 Mbps',
        [5 * 1024 * 1024]: '5 Mbps',
        [10 * 1024 * 1024]: {
            style: {
                color: '#f50',
            },
            label: <strong>10 Mbps</strong>,
        },
    };
    const markspreview = {
        [5 * 1024 * 1024]: '5 MB',
        [15 * 1024 * 1024]: {
            style: {
                color: '#f50',
            },
            label: <strong>15 MB</strong>,
        },
    };
    return (
        <div className="admin-sidebar">
            <h1 style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '1%'
            }}>{numUsers}</h1>
            <p className="empty-subtitle">Users Registered</p>
            <h1 style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '1%'
            }}>{formatBytes("default_user_quota",totalSize)}</h1>
            <p className="empty-subtitle">Used Storage</p>
            <div className="config-info"
                style={{
                    display: 'flex',
                    fontSize: '14px',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '10px',
                    borderRadius: '5px',
                    marginTop: '20px',
                }}>
                {Object.entries(config.config).map(([key, value]) => {
                    const formattedValue = ['max_preview_size', 'min_bandwidth', 'default_user_quota'].includes(key)
                        ? formatBytes(key, value)
                        : key === 'allowed_file_extensions' ? value.length
                            : key === 'default_user_permission' ? ['None', 'Read', 'Write'][value]
                                : value;

                    return (
                        <div key={key}>
                            <strong>{configDict[key]}:</strong> {formattedValue}
                        </div>
                    );
                })}
            </div>

            <Button type="primary" onClick={showModal}>
                Update
            </Button>
            <Modal title="Update Config" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form} onFinish={handleOk}>
                    <Form.Item>
                        <div>
                            <p>Default Max Preview Size : Originally {formatBytes("max_preview_size", config.config.max_preview_size)}</p>
                            <Form.Item name="max_preview_size">
                                <Slider
                                    marks={markspreview}
                                    min={1 * 1024 * 1024} // 1GB in bytes
                                    max={15 * 1024 * 1024} // 100GB in bytes
                                    tipFormatter={formatterpreview}
                                    defaultValue={config.config.max_preview_size} />
                            </Form.Item>
                        </div>
                    </Form.Item>
                    <Form.Item>
                        <div>
                            <p>Default Minimum Bandwidth : Originally {formatBytes("min_bandwidth", config.config.min_bandwidth)}</p>
                            <Form.Item name="min_bandwidth">
                                <Slider
                                    marks={marksbandwidth}
                                    min={0.5 * 1024 * 1024} // 1GB in bytes
                                    max={10 * 1024 * 1024} // 100GB in bytes
                                    tipFormatter={formatterbandwidth}
                                    defaultValue={config.config.min_bandwidth} />
                            </Form.Item>
                        </div>
                    </Form.Item>
                    <Form.Item >
                        <div>
                            <p>Default User Quota : Originally {formatBytes("default_user_quota", config.config.default_user_quota)}</p>
                            <Form.Item name="default_user_quota">
                                <Slider
                                    marks={marksquota}
                                    min={1 * 1024 * 1024 * 1024} // 1GB in bytes
                                    max={100 * 1024 * 1024 * 1024} // 100GB in bytes
                                    tooltip={{
                                        formatter
                                    }}
                                    defaultValue={config.config.default_user_quota} />
                            </Form.Item>
                        </div>
                    </Form.Item>
                    <Form.Item>
                        <div>
                            <p>Default User Permissions</p>
                            <Form.Item name="default_user_permission">
                                <Select defaultValue={config.config.default_user_permission}>
                                    <Option value={0}>None</Option>
                                    <Option value={1}>Read</Option>
                                    <Option value={2}>Write</Option>
                                </Select>
                            </Form.Item>
                        </div>
                    </Form.Item>
                    <Form.Item>
                        <div>
                            <p>Allowed Extensions</p>
                            {allowedExtensions?.map((ext, index) => (
                                <Tag key={index} closable>
                                    {ext}
                                </Tag>
                            ))}
                            <Form.Item name="allowed_file_extensions">
                                <Input placeholder="Add a new extension" style={{ marginTop: '10px' }} onPressEnter={addExtension} />
                            </Form.Item>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}