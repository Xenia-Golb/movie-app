/* eslint-disable react/prop-types */
import { Pagination } from 'antd';
import './Pagination.css';
function MyPagination({ currentPage, totalPages, loading, setCurrentPage }) {
  return (
    <Pagination
      current={currentPage}
      total={totalPages * 20}
      onChange={setCurrentPage}
      pageSize={20}
      showSizeChanger={false}
      hideOnSinglePage
      disabled={loading}
      showLessItems
    />
  );
}
export default MyPagination;
