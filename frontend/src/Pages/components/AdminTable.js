import { Button, Table, Select, Slider } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { InputNumber } from 'antd';


const { Option } = Select;

/**
 * Renders an admin table component.
 *
 * @param {Object[]} data - The data to be displayed in the table.
 * @param {Function} onUpdate - The function to be called when an update button is clicked.
 * @returns {JSX.Element} The rendered admin table component.
 */
const AdminTable = ({ data, onUpdate }) => {
    data = data.map((item, index) => {
        return {
            key: index,
            admin: item.admin,
            username: item.username,
            email: item.email,
            permission: item.permission,
            storage_quota: item.storage_quota,
            storage_used: item.storage_used,
        };
    });
    const [dataSource, setDataSource] = useState([]);
    const [changedEntries, setChangedEntries] = useState({});
    const denominatioChange = {
        "MB": {
            "GB": 1024,
            "TB": 1024 * 1024
        },
        "GB": {
            "MB": 1 / 1024,
            "TB": 1024
        },
        "TB": {
            "MB": 1 / (1024 * 1024),
            "GB": 1 / 1024
        }
    }
    // const denomination = (value) => {
    //     if (value < 1024 * 1024 * 1024) return 'MB';
    //     else if (value < 1024 * 1024 * 1024 * 1024) return 'GB';
    //     else if (value < 1024 * 1024 * 1024 * 1024 * 1024) return 'TB';
    // }
    const prevDataRef = useRef();

    useEffect(() => {
        const prevData = prevDataRef.current;

        // Only update dataSource if data has changed
        if (JSON.stringify(prevData) !== JSON.stringify(data)) {
            setDataSource(data);
        }

        // Store current data in ref
        prevDataRef.current = data;
    }, [data]);

    const handleUpdate = (record) => {
        onUpdate(record);
    };

    const handlePermissionChange = (value, record) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => record.key === item.key);
        newData[index].permission = value;
        setDataSource(newData);
    };

    const handleQuotaChange = (value, record) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => record.key === item.key);
        newData[index].storage_quota = value;
        setDataSource(newData);
    };
    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
        else if (bytes < 1099511627776) return (bytes / 1073741824).toFixed(2) + ' GB';
        else return (bytes / 1099511627776).toFixed(2) + ' TB';
    }
    function denomination(bytes) {
        if (bytes < 1024) return 'B';
        else if (bytes < 1048576) return 'KB';
        else if (bytes < 1073741824) return 'MB';
        else if (bytes < 1099511627776) return 'GB';
        else return 'TB';
    }
    const mapPermissionValue = (value) => {
        switch (value) {
            case 0:
                return 'None';
            case 1:
                return 'Read';
            case 2:
                return 'Write';
            default:
                return 'None';
        }
    };
    const columns = [
        {
            title: 'Admin',
            dataIndex: 'admin',
            key: 'admin',
            align: 'center',
            render: (text) => (text ? 'Yes' : 'No'),
            width: '5%',
        },
        {
            title: 'Username',
            dataIndex: 'username',
            align: 'center',
            key: 'username',
            width: '10%',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            align: 'center',
            key: 'email',
            width: '20%',
        },
        {
            title: 'Permission',
            dataIndex: 'permission',
            key: 'permission',
            align: 'center',
            render: (text, record) => (
                <Select defaultValue={mapPermissionValue(text)} style={{ width: 120 }} onChange={(value) => handlePermissionChange(value, record)}>
                    <Option value={0}>None</Option>
                    <Option value={1}>Read</Option>
                    <Option value={2}>Write</Option>
                </Select>
            ),
            width: '5%',
        },
        {
            title: 'Storage Quota',
            dataIndex: 'storage_quota',
            key: 'storage_quota',
            align: 'center',
            render: (text, record) => (
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '10px' }}>
                    <p
                        style={{
                            color: changedEntries[record.key] ? '#f50' : '#1677ff',
                            width: '100px'
                        }}
                    >{formatBytes(text)}</p>
                    <InputNumber min={1} defaultValue={text / (1024 * 1024 * 1024)} style={{ width: '100px' }} onChange={(value) => { handleQuotaChange(value * (1024 * 1024 * 1024), record); setChangedEntries({ ...changedEntries, [record.key]: true }); }} />
                    <Select defaultValue="GB" style={{ width: '100px' }} onChange={(value) => {
                        console.log("current size", text)
                        console.log("current denomiation", denomination(text))
                        let newSizeInBytes;
                        newSizeInBytes = text * denominatioChange[denomination(text)][value];
                        handleQuotaChange(newSizeInBytes, record);
                        setChangedEntries({ ...changedEntries, [record.key]: true });
                    }}>
                        <Select.Option value="MB">MB</Select.Option>
                        <Select.Option value="GB">GB</Select.Option>
                        <Select.Option value="TB">TB</Select.Option>
                    </Select>
                </div>
            ),
            width: '15%',
        },
        {
            title: 'Storage Used',
            dataIndex: 'storage_used',
            key: 'storage_used',
            align: 'center',
            render: (text) => formatBytes(text),
            width: '20%',
        },
        {
            title: 'Update',
            key: 'update',
            align: 'center',
            render: (text, record) => (
                <Button type="primary" onClick={() => handleUpdate(record)}>
                    Update
                </Button>
            ),
            width: '10%',
        },
    ];

    return <Table columns={columns} dataSource={dataSource} />;
};

export default AdminTable;