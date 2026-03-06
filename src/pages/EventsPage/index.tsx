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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { 
    events,
    loading, 
    error, 
    hasMore, 
    isLoadingMore, 
    loadMore
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
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-4 lg:hidden">
          <button
            type="button"
            onClick={() => setIsFiltersOpen((prev) => !prev)}
            className="w-full rounded-md bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
            aria-label={isFiltersOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
          >
            {isFiltersOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className={`${isFiltersOpen ? 'block' : 'hidden'} lg:col-span-1 lg:block`}>
            <div className="sticky top-20">
              <EventFilters categories={categories} onFiltersChange={setFilters} />
            </div>
          </div>
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-lg bg-white shadow-sm">
                    <div className="aspect-video w-full animate-pulse bg-gray-200" />
                    <div className="space-y-3 p-4">
                      <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                      <div className="h-8 w-full animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
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

