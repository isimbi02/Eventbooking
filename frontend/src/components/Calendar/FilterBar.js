import React, { useState, useCallback } from 'react';
import { Search, Filter, X, Calendar, MapPin, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  'CONFERENCE', 'WORKSHOP', 'SEMINAR', 'NETWORKING', 'SOCIAL'
];

const FilterBar = ({ 
  filters, 
  onFilterChange, 
  onSearchChange, 
  onClearFilters, 
  showFilters, 
  setShowFilters,
  searchInputRef,
  onSearchFocus
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    onSearchChange(localSearch);
  }, [localSearch, onSearchChange]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setLocalSearch(value);
    // Real-time search as user types
    onSearchChange(value);
  }, [onSearchChange]);

  const handleCategoryChange = useCallback((category) => {
    onFilterChange({
      ...filters,
      category: filters.category === category ? '' : category
    });
  }, [filters, onFilterChange]);

  const handleDateChange = useCallback((field, value) => {
    onFilterChange({ ...filters, [field]: value });
  }, [filters, onFilterChange]);

  const handleLocationChange = useCallback((e) => {
    onFilterChange({ ...filters, location: e.target.value });
  }, [filters, onFilterChange]);

  const hasActiveFilters = filters.category || filters.location || filters.startDate || filters.endDate || filters.search;

  return (
    <div className="filter-bar">
      <form onSubmit={handleSearchSubmit} className="search-container">
        <div className="search-input-wrapper" onClick={onSearchFocus}>
          <Search size={20} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search events by title, description, or location..."
            value={localSearch}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        
        <div className="filter-actions">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-toggle ${hasActiveFilters ? 'active' : ''}`}
          >
            <Filter size={20} />
            Filters
            {hasActiveFilters && <span className="filter-badge"></span>}
          </button>
          
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="clear-filters-btn"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </form>

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
                <label className="filter-label">
                  <Tag size={16} />
                  Category
                </label>
                <div className="category-buttons">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryChange(category)}
                      className={`category-btn ${filters.category === category ? 'active' : ''}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  <MapPin size={16} />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={filters.location}
                  onChange={handleLocationChange}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">
                  <Calendar size={16} />
                  Date Range
                </label>
                <div className="date-inputs">
                  <div className="date-input-group">
                    <label>From</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      className="filter-input"
                    />
                  </div>
                  <div className="date-input-group">
                    <label>To</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      className="filter-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(FilterBar);