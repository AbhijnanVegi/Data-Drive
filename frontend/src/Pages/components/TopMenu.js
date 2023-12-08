import { Menu } from 'antd';
import { DesktopOutlined, ShareAltOutlined } from '@ant-design/icons';

/**
 * Renders the top menu component.
 *
 * @param {Object} props - The component props.
 * @param {Function} props.handleMenuClick - The function to handle menu click events.
 * @param {string} props.activeTab - The currently active tab.
 * @returns {JSX.Element} The rendered top menu component.
 */
const TopMenu = ({ handleMenuClick, activeTab, setPath, user }) => (
    <Menu
        style={{ marginBottom: 'auto' }}
        onClick={handleMenuClick}
        selectedKeys={[activeTab]}
        mode="inline"
        className="custom-menu"
        items={[
            {
                label: 'Home',
                key: '1',
                icon: <DesktopOutlined />,
                title: 'Home',
                onClick: () => {
                    setPath(user.username);
                }
            },
            {
                label: 'Shared',
                key: 'Shared',
                icon: <ShareAltOutlined />,
                title: 'Shared',
                children: [
                    {
                        label: 'Shared with me',
                        key: '2',
                        icon: <i className="icon icon-share"></i>,
                        title: 'Shared with me',
                    },
                    {
                        label: 'Shared by me',
                        key: '3',
                        icon: <i className="icon icon-share"></i>,
                        title: 'Shared by me',
                    },
                ],
            },
        ]}
    />
);

export default TopMenu;