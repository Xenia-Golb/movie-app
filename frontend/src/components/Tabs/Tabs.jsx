/* eslint-disable react/prop-types */
import { Tabs } from 'antd';
import './Tabs.css';

function MyTabs({ activeTab, setActiveTab }) {
  const tabItems = [
    {
      key: '1',
      label: 'Search',
    },
    {
      key: '2',
      label: 'Rated',
    },
  ];

  const handleTabChange = (key) => {
    setActiveTab(key === '1' ? 'search' : 'rated');
  };

  return (
    <Tabs
      activeKey={activeTab === 'search' ? '1' : '2'}
      centered
      items={tabItems}
      onChange={handleTabChange}
    />
  );
}

export default MyTabs;
