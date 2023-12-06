import { Button, Input, Space, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useState, useRef } from 'react';

/**
 * Renders a table component for displaying shared files.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.data - The data to be displayed in the table.
 * @param {Function} props.onUnshare - The callback function to be called when unshare button is clicked.
 * @returns {JSX.Element} The rendered table component.
 */
const SharedByTable = ({ data, onUnshare }) => {
    const [searchText, setSearchText] = useState('');

    // convert data to antd table format
    data = data.map((item, index) => {
        return {
            key: index,
            // filename: item.path
            // filename should be item.path but remove the username from the path
            path : item.path,
            filename: item.path.split("/").slice(1).join("/"),
            isdir: item.is_dir ? "Yes" : "No",
            sharedwith: item.shared_with,
        };
    });
    console.log("data",data)
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 100,
                            height: 40,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 100,
                            height: 40,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });
    const columns = [
        {
            title: 'Name of the File',
            dataIndex: 'filename',
            key: 'filename',
            ...getColumnSearchProps('filename'),
            sorter: (a, b) => a.filename.localeCompare(b.filename),
            sortDirections: ['descend', 'ascend'],
            width: '40%',
        },
        {
            title: 'Shared With',
            dataIndex: 'sharedwith',
            key: 'sharedwith',
            ...getColumnSearchProps('sharedwith'),
            sorter: (a, b) => a.sharedwith.localeCompare(b.sharedwith),
            sortDirections: ['descend', 'ascend'],
            width: '30%',
        },
        {
            title: 'Is Directory',
            dataIndex: 'isdir',
            key: 'isdir',
            ...getColumnSearchProps('isdir'),
            sorter: (a, b) => a.isdir.localeCompare(b.isdir),
            sortDirections: ['descend', 'ascend'],
            width: '10%',
        },
        {
            title: 'Unshare',
            key: 'unshare',
            render : (text, record) => (
                <Button 
                style={{
                    backgroundColor: '#ff4d4f',
                }}
                type="primary" onClick={() => onUnshare(record.path, record.sharedwith)}>
                    Unshare
                </Button>
            ),
            width: '10%',
        },
    ];

    return (
        <div>
            <Table  scroll={{y:'85vh'}}  columns={columns} dataSource={data} pagination={{ pageSize:30 }}  />
        </div>
    );
};

export default SharedByTable;