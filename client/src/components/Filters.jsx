// components/Filters.jsx
import { X } from 'lucide-react';
import Button from './ui/Button';
import Select from './ui/Select';

const serviceTypes = [
  { value: '', label: 'All Types' },
  { value: 'collab', label: 'Collaborations' },
  { value: 'loop_pack', label: 'Loop Packs' },
  { value: 'drum_kit', label: 'Drum Kits' },
  { value: 'preset_pack', label: 'Preset Packs' },
  { value: 'sample_pack', label: 'Sample Packs' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
];

const priceRanges = [
  { value: '', label: 'Any Price' },
  { value: '0-25', label: 'Under $25' },
  { value: '25-50', label: '$25 - $50' },
  { value: '50-100', label: '$50 - $100' },
  { value: '100-200', label: '$100 - $200' },
  { value: '200+', label: '$200+' },
];

export default function Filters({
  type,
  setType,
  sort,
  setSort,
  priceRange,
  setPriceRange,
  onClear,
}) {
  const hasFilters = type || priceRange || sort !== 'newest';

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-2xl p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Type Filter */}
        <div className="flex-1">
          <Select
            label="Type"
            options={serviceTypes}
            value={type}
            onChange={(e) => setType(e.target.value)}
          />
        </div>

        {/* Price Range */}
        <div className="flex-1">
          <Select
            label="Price"
            options={priceRanges}
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
          />
        </div>

        {/* Sort */}
        <div className="flex-1">
          <Select
            label="Sort By"
            options={sortOptions}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          />
        </div>

        {/* Clear Button */}
        {hasFilters && (
          <div className="flex items-end">
            <Button variant="ghost" onClick={onClear} icon={X}>
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Active Filters Tags */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-dark-700">
          <span className="text-sm text-dark-500">Active:</span>

          {type && (
            <button
              onClick={() => setType('')}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm hover:bg-primary-500/30 transition-colors"
            >
              {serviceTypes.find((t) => t.value === type)?.label}
              <X size={14} />
            </button>
          )}

          {priceRange && (
            <button
              onClick={() => setPriceRange('')}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm hover:bg-primary-500/30 transition-colors"
            >
              {priceRanges.find((p) => p.value === priceRange)?.label}
              <X size={14} />
            </button>
          )}

          {sort !== 'newest' && (
            <button
              onClick={() => setSort('newest')}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm hover:bg-primary-500/30 transition-colors"
            >
              {sortOptions.find((s) => s.value === sort)?.label}
              <X size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}