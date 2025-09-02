import React, { useState, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Calendar.css';

const CATEGORIES = [
  'CONFERENCE', 'WORKSHOP', 'SEMINAR', 'NETWORKING', 'SOCIAL'
];

const FilterBar = ({ filters, onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = useCallback((e) => {
    onFilterChange(prev => ({ ...prev, search: e.target.value }));
  }, [onFilterChange]);

  const handleCategoryChange = useCallback((category) => {
    onFilterChange(prev => ({ 
      ...prev, 
      category: prev.category === category ? '' : category 
    }));
  }, [onFilterChange]);

  const handleDateChange = useCallback((field, value) => {
    onFilterChange(prev => ({ ...prev, [field]: value }));
  }, [onFilterChange]);

  const clearFilters = useCallback(() => {
    onFilterChange({
      category: '',
      location: '',
      startDate: '',
      endDate: '',
      search: ''
    });
  }, [onFilterChange]);

  return (
    <div className="filter-bar">
      <div className="search-container">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search events..."
          value={filters.search}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      <button
        onClick={() => setShowFilters(!showFilters)}
        className="filter-toggle"
      >
        <Filter size={20} />
        Filters
      </button>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="filters-panel"
          >
            <div className="filters-grid">
              <div className="filter-group">
                <label>Category</label>
                <div className="category-buttons">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`category-btn ${filters.category === category ? 'active' : ''}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={filters.location}
                  onChange={(e) => onFilterChange(prev => ({ ...prev, location: e.target.value }))}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>Date Range</label>
                <div className="date-inputs">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                    className="filter-input"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                    className="filter-input"
                  />
                </div>
              </div>
            </div>

            <div className="filter-actions">
              <button onClick={clearFilters} className="clear-filters">
                <X size={16} />
                Clear All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(FilterBar);