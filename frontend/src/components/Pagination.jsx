import React from 'react';
import '../styles/pagination.css';

const Pagination = ({ currentPage, totalPages, paginate }) => {
  return (
    <div className="pagination">
      <button
        onClick={() => paginate(1)}
        disabled={currentPage === 1}
      >
        &lt;&lt;
      </button>
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
        <button
          key={number}
          onClick={() => paginate(number)}
          className={currentPage === number ? 'active' : ''}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
      <button
        onClick={() => paginate(totalPages)}
        disabled={currentPage === totalPages}
      >
        &gt;&gt;
      </button>
    </div>
  );
};

export default Pagination;