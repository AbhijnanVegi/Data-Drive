import { Modal, Form, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Checkbox } from 'antd';
import { Radio } from 'antd';
import { Button } from 'antd';


const { Option } = Select;

/**
 * ShareFolderModal component.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Indicates whether the modal is open or not.
 * @param {Function} props.onCancel - The function to be called when the modal is canceled.
 * @param {Function} props.onSubmit - The function to be called when the form is submitted.
 * @param {Array} props.selectedFiles - The selected files to be shared.
 * @returns {JSX.Element} The ShareFolderModal component.
 */
function ShareFolderModal({ open, onCancel, onSubmit, selectedFiles }) {
    const [form] = Form.useForm();
    const [users, setUsers] = useState([]);
    const [isSharedWithEveryone, setIsSharedWithEveryone] = useState(false);

    const handleCheckboxChange = (e) => {
        setIsSharedWithEveryone(e.target.checked);
        form.setFieldsValue({ sharewitheveryone: e.target.checked });
    };


    useEffect(() => {
        api.get('/auth/users')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                message.error('Failed to fetch users');
            });
    }, []);

    const handleSharewithEveryone = () => {
        console.log("sharing with everyone")
    }
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
                    rules={[
                        {
                            message: 'Please select the user or check the Share with Everyone checkbox!',
                            validator: (_, value) => {
                                if (value || form.getFieldValue("sharewitheveryone")) {
                                    return Promise.resolve();
                                }
                                return Promise.reject();
                            }
                        }
                    ]}
                >
                    <Select
                        showSearch
                        placeholder="Select a user"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        disabled={form.getFieldValue("sharewitheveryone")} // Disable the Select component when isSharedWithEveryone is true
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
                <Form.Item name="sharewitheveryone" label="Share with Everyone" valuePropName="checked">
                    <Checkbox onChange={handleCheckboxChange}>Yes</Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default ShareFolderModal;