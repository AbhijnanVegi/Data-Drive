import { Menu, Progress } from 'antd';
import { LogoutOutlined, IdcardTwoTone } from '@ant-design/icons';

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    else return (bytes / 1073741824).toFixed(2) + ' GB';
}

/**
 * Renders the bottom menu component.
 *
 * @param {Object} props - The component props.
 * @param {Function} props.handleMenuClick - The function to handle menu click events.
 * @param {string} props.activeTab - The active tab key.
 * @param {Object} props.user - The user object.
 * @param {Function} props.handleLogout - The function to handle logout event.
 * @param {boolean} props.isAdmin - Indicates whether the user is an admin or not.
 * @returns {JSX.Element} The rendered bottom menu component.
 */
const BottomMenu = ({ handleMenuClick, activeTab, user, handleLogout, isAdmin }) => (
    <Menu
        style={{ marginBottom: 'auto' }}
        onClick={handleMenuClick}
        selectedKeys={[activeTab]}
        mode="inline"
        className="custom-menu"
        items={[
            {
                key: '4',
                icon: (
                    <div style={{ display: 'flex', fontSize: '12px' }}>
                        <span style={{ marginRight: '20px', color: 'black' }}>
                            {`${formatBytes(user.storage_used)} / ${formatBytes(user.storage_quota)}`}
                        </span>
                        <Progress
                            size={[100, 10]}
                            status="active"
                            strokeColor={{ from: '#108ee9', to: '#87d068' }}
                            style={{ fontSize: '12px' }}
                        />
                    </div>
                ),
                title: 'User',
                children: [
                    {
                        label: <span style={{ color: 'red' }}>Logout</span>,
                        key: '5',
                        icon: <LogoutOutlined style={{ color: 'red' }} />,
                        title: 'Logout',
                        onClick: handleLogout,
                    },
                    {
                        label: <span style={{ color: isAdmin ? '#1677ff' : 'grey' }}>Admin Panel</span>,
                        key: '6',
                        icon: <IdcardTwoTone style={{ color: '#1677ff' }} />,
                        title: 'Admin Panel',
                        disabled: !isAdmin,
                    },
                ],
            },
        ]}
    />
);

export default BottomMenu;