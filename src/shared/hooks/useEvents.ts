import { useState, useEffect, useCallback } from 'react';
import { eventsApi } from '@shared/api/eventsApi';
import type { EventResponse, EventFilters } from '@shared/types';

export const useEvents = (filters?: EventFilters) => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [prevCursor, setPrevCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load initial page or reset when filters change
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await eventsApi.getEvents(filters);
        setEvents(data.items);
        setNextCursor(data.next_cursor);
        setPrevCursor(data.prev_cursor);
        setHasMore(data.next_cursor !== null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Ошибка загрузки мероприятий'));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  // Load more events (next page)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !nextCursor) return;

    try {
      setIsLoadingMore(true);
      const data = await eventsApi.getEvents(filters, nextCursor);
      setEvents((prev) => [...prev, ...data.items]);
      setNextCursor(data.next_cursor);
      setPrevCursor(data.prev_cursor);
      setHasMore(data.next_cursor !== null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Ошибка загрузки мероприятий'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, nextCursor, filters]);

  // Load previous page
  const loadPrevious = useCallback(async () => {
    if (isLoadingMore || !prevCursor) return;

    try {
      setIsLoadingMore(true);
      const data = await eventsApi.getEvents(filters, prevCursor);
      setEvents((prev) => [...data.items, ...prev]);
      setNextCursor(data.next_cursor);
      setPrevCursor(data.prev_cursor);
      setHasMore(data.next_cursor !== null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Ошибка загрузки мероприятий'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, prevCursor, filters]);

  return { 
    events, 
    loading, 
    error, 
    nextCursor, 
    prevCursor, 
    hasMore, 
    isLoadingMore,
    loadMore,
    loadPrevious,
  };
};

