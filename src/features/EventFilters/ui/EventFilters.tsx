import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@shared/hooks/useAuth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { EventFilters as EventFiltersType } from '@shared/types';

interface EventFiltersProps {
  categories: string[];
  onFiltersChange: (filters: EventFiltersType) => void;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  categories,
  onFiltersChange,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categories')?.split(',').filter(Boolean) || []
  );
  const [minPrice, setMinPrice] = useState<number | undefined>(
    searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  );
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  );
  const [startDate, setStartDate] = useState<Date | null>(
    searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : null
  );
  const [forMyInterests, setForMyInterests] = useState<boolean>(
    searchParams.get('for_my_interests') === 'true'
  );
  const [limit, setLimit] = useState<number | undefined>(
    searchParams.get('limit') ? Number(searchParams.get('limit')) : 20
  );

  useEffect(() => {
    const filters: EventFiltersType = {
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      min_price: minPrice,
      max_price: maxPrice,
      date_from: startDate ? startDate.toISOString() : undefined,
      date_to: endDate ? endDate.toISOString() : undefined,
      for_my_interests: forMyInterests || undefined,
      limit: limit,
    };

    const params = new URLSearchParams();
    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
    }
    if (minPrice !== undefined) {
      params.set('min_price', minPrice.toString());
    }
    if (maxPrice !== undefined) {
      params.set('max_price', maxPrice.toString());
    }
    if (startDate) {
      params.set('date_from', startDate.toISOString());
    }
    if (endDate) {
      params.set('date_to', endDate.toISOString());
    }
    if (forMyInterests) {
      params.set('for_my_interests', 'true');
    }
    if (limit !== undefined) {
      params.set('limit', limit.toString());
    }

    setSearchParams(params, { replace: true });
    onFiltersChange(filters);
  }, [selectedCategories, minPrice, maxPrice, startDate, endDate, forMyInterests, limit, setSearchParams, onFiltersChange]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <h3 className="text-lg font-semibold">Фильтры</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Категории
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryToggle(category)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategories.includes(category)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Цена
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="От"
            value={minPrice || ''}
            onChange={(e) =>
              setMinPrice(e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <input
            type="number"
            placeholder="До"
            value={maxPrice || ''}
            onChange={(e) =>
              setMaxPrice(e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Дата начала
        </label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          dateFormat="dd.MM.yyyy"
          placeholderText="Выберите дату"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Дата окончания
        </label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          dateFormat="dd.MM.yyyy"
          placeholderText="Выберите дату"
        />
      </div>

      {isAuthenticated && (
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={forMyInterests}
              onChange={(e) => setForMyInterests(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              Только для моих интересов
            </span>
          </label>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Количество результатов
        </label>
        <select
          value={limit || 20}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
};

