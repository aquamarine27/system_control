import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
import '../styles/defect.css';

const DEFECTS_PER_PAGE = 4;

// Animation settings for search bar
const SEARCH_BAR_ANIMATION = {
  initial: { scale: 1 },
  whileFocus: { scale: 1.05, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function Defect() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="defect-container">
      <title>systemControl - Defects</title>
      <Navbar />
      <div className="defect-content">
        <div className="defect-main">
          {/* Search Bar */}
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <motion.div
              className="defect-search-bar"
              {...SEARCH_BAR_ANIMATION}
            >
              <input
                type="text"
                placeholder="Search defects..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="defect-search-input"
              />
              <img
                src="/search-icon.svg"
                alt="Search Icon"
                className="defect-search-icon"
              />
            </motion.div>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={1}
            paginate={paginate}
          />
        </div>
      </div>
    </div>
  );
}