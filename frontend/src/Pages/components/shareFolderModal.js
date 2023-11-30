import { Modal, Form, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Checkbox } from 'antd';
import { Radio } from 'antd';

const { Option } = Select;

function ShareFolderModal({ open, onCancel, onSubmit, selectedFiles }) {
    const [form] = Form.useForm();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        api.get('/auth/users')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                message.error('Failed to fetch users');
            });
    }, []);

    const handleOk = () => {
        form
            .validateFields()
            .then(values => {
                form.resetFields();
                onSubmit(values, selectedFiles);
            })
            .catch(info => {
                console.log('Validation failed:', info);
            });
    };

    return (
        <Modal title="Share Folder" open={open} onOk={handleOk} onCancel={onCancel}>
            <Form form={form} layout="vertical" name="form_in_modal">
                <Form.Item
                    name="user"
                    label="User"
                    rules={[{ required: true, message: 'Please select the user!' }]}
                >
                    <Select
                        showSearch
                        placeholder="Select a user"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {users.slice(0, 5).map(user => (
                            <Option key={user.username}>{user.username}</Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="permissions" label="Permissions">
                    <Radio.Group>
                        <Radio value="read">Read</Radio>
                        <Radio value="write">Write</Radio>
                    </Radio.Group>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ShareFolderModal;