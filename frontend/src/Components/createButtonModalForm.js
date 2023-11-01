import React from 'react';
import { Button, Form, Input } from 'antd';

const CreateButtonModalForm = ({ onSubmit }) => {
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
                label="Folder Name"
                name="foldername"
                rules={[
                    {
                        required: true,
                        message: 'Please input your foldername!',
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
                    Create
                </Button>
            </Form.Item>

        </Form>
    )
};
export default CreateButtonModalForm;