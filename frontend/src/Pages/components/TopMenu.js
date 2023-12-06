import { Menu } from 'antd';
import { DesktopOutlined, ShareAltOutlined } from '@ant-design/icons';

const TopMenu = ({ handleMenuClick, activeTab }) => (
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