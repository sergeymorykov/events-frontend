import { useState, useEffect, useRef } from 'react';
import { Header } from '@widgets/Header';
import { EventFilters } from '@features/EventFilters';
import { EventCard } from '@entities/Event';
import { useEvents } from '@shared/hooks/useEvents';
import { eventsApi } from '@shared/api/eventsApi';
import type { EventFilters as EventFiltersType } from '@shared/types';

export const EventsPage = () => {
  const [filters, setFilters] = useState<EventFiltersType>({});
  const [categories, setCategories] = useState<string[]>([]);
  const { 
    events,
    loading, 
    error, 
    hasMore, 
    isLoadingMore, 
    loadMore, 
    loadPrevious, 
    prevCursor 
  } = useEvents(filters);
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Load categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await eventsApi.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (!loadMoreRef.current || loading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading, isLoadingMore, loadMore]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <EventFilters categories={categories} onFiltersChange={setFilters} />
            </div>
          </div>
          <div className="lg:col-span-3">
            {/* Previous Page Button */}
            {prevCursor && (
              <div className="mb-4">
                <button
                  onClick={loadPrevious}
                  disabled={isLoadingMore}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoadingMore ? 'Загрузка...' : 'Загрузить предыдущие'}
                </button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Загрузка мероприятий...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Ошибка: {error.message}</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Мероприятия не найдены</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>

                {/* Load More Section */}
                {hasMore && (
                  <div className="mt-8">
                    <div ref={loadMoreRef} className="text-center py-4">
                      {isLoadingMore ? (
                        <div className="flex flex-col items-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          <p className="mt-4 text-gray-600">Загрузка...</p>
                        </div>
                      ) : (
                        <button
                          onClick={loadMore}
                          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Загрузить ещё
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

