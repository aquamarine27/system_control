import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getProjects, createProject } from '../services/projectService';
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

// Animation settings for create button
const CREATE_BUTTON_ANIMATION = {
  initial: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2, ease: 'easeOut' } },
  tap: { scale: 0.98, transition: { duration: 0.1, ease: 'easeOut' } },
};

// Animation settings for modal form
const MODAL_FORM_ANIMATION = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const fetchProjects = async () => {
      setLoading(true);
      try {
        console.log(`Fetching projects: page=${currentPage}, limit=${CARDS_PER_PAGE}, search=${searchTerm}`);
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

  const handleCreateProject = async () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    try {
      await createProject(title, description);
      setTitle('');
      setDescription('');
      setIsModalOpen(false);
      const data = await getProjects(currentPage, CARDS_PER_PAGE, searchTerm);
      setProjects(data.projects || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error creating project:', error.message);
      alert('Failed to create project');
    }
  };

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
            <p className="home-card-description">{project.description || 'No description'}</p>
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
          {/* Search Bar and Create Button */}
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <motion.div
              className="home-search-bar"
              {...SEARCH_BAR_ANIMATION}
            >
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="home-search-input"
              />
              <img
                src="/search-icon.svg"
                alt="Search Icon"
                className="home-search-icon"
              />
            </motion.div>
            <motion.button
              className="home_create_project"
              onClick={() => setIsModalOpen(true)}
              variants={CREATE_BUTTON_ANIMATION}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              style={{ position: 'absolute', right: '40px', top: '0' }}
            >
              Create Project
            </motion.button>
          </div>

          {/* Cards*/}
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

          {/* Create Project Modal */}
          {isModalOpen && (
            <div className="create_project_modal_overlay">
              <motion.div
                className="create_project_modal"
                onClick={(e) => e.stopPropagation()}
                variants={MODAL_FORM_ANIMATION}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <img src="/public/back-arrow.png" alt="Back" style={{ width: '30px', height: '30px', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
                  <h2>Create New Project</h2>
                  <div style={{ width: '30px' }}></div>
                </div>
                <div className="create_project_modal_content">
                  <div className="create_project_form_group">
                    <label>Upload Image (todo)</label>
                    <input
                      type="file"
                      disabled
                      className="create_project_upload"
                    />
                  </div>
                  <div className="create_project_form_group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="create_project_input"
                      placeholder="Enter project title"
                      maxLength="8" 
                    />
                  </div>
                  <div className="create_project_form_group">
                    <label>Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="create_project_input"
                      placeholder="Enter project description"
                      maxLength="15" 
                      style={{ height: '100px', resize: 'none' }}
                    />
                  </div>
                </div>
                <div className="create_project_modal_buttons">
                  <motion.button
                    className="create_project_create"
                    onClick={handleCreateProject}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    Create
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}