import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProjects } from '../services/projectService';
import { isAuthenticated } from '../services/authService';
import '../styles/home.css';

const CARDS_PER_PAGE = 4;

// Animation settings for card grid
const CARD_GRID_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// Animation settings for search bar
const SEARCH_BAR_ANIMATION = {
  initial: { scale: 1 },
  whileFocus: { scale: 1.05, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const data = await getProjects(currentPage, CARDS_PER_PAGE, searchTerm);
        setProjects(data.projects || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (error) {
        console.error('Error fetching projects:', error.message);
        if (error.message.includes('Unauthorized')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentPage, searchTerm, navigate]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Render Card
  const renderCard = (project) => (
    <motion.div
      key={project.id}
      variants={CARD_VARIANTS}
    >
      <div className="home-card">
        <div className="home-card-content">
          <img
            src="/image/example.jpg"
            alt={project.title}
            className="home-card-image"
          />
          <div className="home-card-text">
            <div className="home-card-title-frame">
              <input
                type="text"
                value={project.title}
                readOnly
                className="home-card-title"
              />
            </div>
          </div>
        </div>
        <button className="home-view-defects">View defects</button>
      </div>
    </motion.div>
  );

  // Render Pagination
  const renderPagination = () => (
    <div className="home-pagination">
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

  return (
    <div className="home-container">
      <title>systemControl - Home</title>
      <Navbar />
      <div className="home-content">
        <div className="home-main">
          {/* Search Bar */}
          <motion.div
            className="home-search-bar"
            {...SEARCH_BAR_ANIMATION}
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="home-search-input"
            />
            <img
              src="/search-icon.svg"
              alt="Search Icon"
              className="home-search-icon"
            />
          </motion.div>

          {/* Card Grid */}
          {loading ? (
            <p>Loading projects...</p>
          ) : (
            <motion.div
              className="home-card-grid"
              key={currentPage}
              variants={CARD_GRID_VARIANTS}
              initial="hidden"
              animate="visible"
            >
              {projects.map(renderCard)}
            </motion.div>
          )}

          {/* Pagination */}
          {!loading && renderPagination()}
        </div>
      </div>
    </div>
  );
}