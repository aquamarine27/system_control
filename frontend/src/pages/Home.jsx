import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import "../styles/home.css";


export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');

  // placeholder card data
  const cardData = [
    { id: 1, title: "XX 'Hau'", image: "/image/example.jpg" },
    { id: 2, title: "123", image: "/image/example.jpg" },
    { id: 3, title: "ABC", image: "/image/example.jpg" },
    { id: 4, title: "DEF", image: "/image/example.jpg" },
    { id: 5, title: "GHI", image: "/image/example.jpg" },
  ];


  const filteredCards = cardData.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 4;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="home-container">
      <title>systemControl - Home</title>
      <Navbar />
      <div className="home-content">
        <div className="home-main">
          {/* Search bar section */}
          <div className="home-search-bar">
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
          </div>
          {/* Card grid */}
          <motion.div 
            className="home-card-grid" 
            key={currentPage}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            {currentCards.map((card) => (
              <div className="home-card" key={card.id}>
                <div className="home-card-content">
                  <img src={card.image} alt={card.title} className="home-card-image" />
                  <div className="home-card-text">
                    <div className="home-card-title-frame">
                      <input type="text" value={card.title} readOnly className="home-card-title" />
                    </div>
                  </div>
                </div>
                <button className="home-view-defects">View defects</button>
              </div>
            ))}
          </motion.div>
          {/* Pagination section */}
          <div className="home-pagination">
            <button onClick={() => paginate(1)} disabled={currentPage === 1}>
              &lt;&lt;
            </button>
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
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
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
              &gt;
            </button>
            <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages}>
              &gt;&gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}