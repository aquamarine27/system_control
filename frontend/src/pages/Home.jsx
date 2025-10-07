import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
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
const MODAL_VARIANTS = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  withoutImage: { opacity: 1, y: 0, scale: 1, height: '500px', transition: { duration: 0.3, ease: 'easeOut' } },
  withImage: { opacity: 1, y: 0, scale: 1, height: '600px', transition: { duration: 0.3, ease: 'easeOut' } },
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
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();

  // api_url for image
  const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'http://backend:3000';

  // Ref to control animation
  const cardGridRef = useRef(null);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateProject = async () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    try {
      await createProject(title, description, imageFile);
      setTitle('');
      setDescription('');
      setImageFile(null);
      setPreviewUrl(null);
      setIsModalOpen(false);
      const data = await getProjects(currentPage, CARDS_PER_PAGE, searchTerm);
      setProjects(data.projects || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      alert('Failed to create project');
    }
  };

  const handleCloseModal = () => {
    setTitle('');
    setDescription('');
    setImageFile(null);
    setPreviewUrl(null);
    setIsModalOpen(false);
  };

  // Render Card
  const renderCard = (project) => (
    <motion.div
      key={project.id} 
      variants={CARD_VARIANTS}
      initial="hidden"
      animate="visible"
      whileInView={{ opacity: 1 }} 
    >
      <div className="home-card">
        <div className="home-card-content">
          <img
            src={project.image_url ? `${API_BASE}${project.image_url}` : '/image/example.jpg'}
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
        <button
          className="home-view-defects"
          onClick={() => navigate('/defects')}
        >
          View defects
        </button>
      </div>
    </motion.div>
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

          {/* Cards or No Projects Message */}
          {!isModalOpen && loading ? (
            <p className="home-loading">Loading projects...</p>
          ) : !isModalOpen && projects.length === 0 ? (
            <div className="home-no-projects">
              <p>No projects</p>
            </div>
          ) : (
            <motion.div
              className="home-card-grid"
              ref={cardGridRef}
              variants={CARD_GRID_VARIANTS}
              initial="hidden"
              animate={isModalOpen ? 'visible' : 'hidden'} 
              whileInView={isModalOpen ? undefined : { opacity: 1 }}
            >
              {projects.map(renderCard)}
            </motion.div>
          )}

          {/* Pagination */}
          {!isModalOpen && !loading && projects.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
            />
          )}

          {/* Create Project Modal */}
          {isModalOpen && (
            <div className="create_project_modal_overlay" onClick={handleCloseModal}>
              <motion.div
                className="create_project_modal"
                onClick={(e) => e.stopPropagation()}
                variants={MODAL_VARIANTS}
                initial="hidden"
                animate={previewUrl ? 'withImage' : 'withoutImage'}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <img
                    src="/back-arrow.png"
                    alt="Back"
                    style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                    onClick={handleCloseModal}
                  />
                  <h2>Create New Project</h2>
                  <div style={{ width: '30px' }}></div>
                </div>
                <div className={`create_project_modal_content ${previewUrl ? 'has-preview' : ''}`}>
                  <div className="create_project_form_group">
                    <label>Upload Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="create_project_upload"
                    />
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="create_project_preview"
                      />
                    )}
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
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}