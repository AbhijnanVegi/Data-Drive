import React  from "react";
import { Button, Input } from 'antd';
import { Modal, Form, Select, message } from 'antd';

/**
 * TransferFileModalForm component.
 * 
 * @param {Object} props - The component props.
 * @param {Function} props.onSubmit - The function to be called when the form is submitted.
 * @returns {JSX.Element} The TransferFileModalForm component.
 */
const TransferFileModalForm = ({ onSubmit }) => {
    const onFinish = (values) => {
        console.log('Success:', values);
        onSubmit(values);
    };
    
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };
    
    return (
        <Form
            name="basic"
            labelCol={{
                span: 8,
            }}
            wrapperCol={{
                span: 16,
            }}
            style={{
                maxWidth: 600,
            }}
            initialValues={{
                remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            <Form.Item
                label="Destination Path"
                name="destinationpath"
                rules={[
                    {
                        required: true,
                        message: 'Please input your destination path!',
                    },
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                wrapperCol={{
                    offset: 19,
                    span: 20,
                }}
            >
                <Button type="primary" htmlType="submit">
                    Transfer
                </Button>
            </Form.Item>

        </Form>
    )
}

export default TransferFileModalForm;