import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { eventsApi } from '@shared/api/eventsApi';
import type { EventResponse, EventFilters } from '@shared/types';
import { useEventActionsStore } from '@app/store/useEventActionsStore';

export const useEvents = (filters?: EventFilters) => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [prevCursor, setPrevCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const actionsByEvent = useEventActionsStore((state) => state.actionsByEvent);
  const mergeServerActions = useEventActionsStore((state) => state.mergeServerActions);
  const requestSeqRef = useRef(0);
  const pagingSeqRef = useRef(0);
  const initialAbortRef = useRef<AbortController | null>(null);
  const pagingAbortRef = useRef<AbortController | null>(null);

  // Load initial page or reset when filters change
  useEffect(() => {
    const fetchEvents = async () => {
      initialAbortRef.current?.abort();
      const controller = new AbortController();
      initialAbortRef.current = controller;
      const requestSeq = ++requestSeqRef.current;

      try {
        setLoading(true);
        setError(null);
        const data = await eventsApi.getEvents(filters, undefined, { signal: controller.signal });

        if (requestSeq !== requestSeqRef.current) {
          return;
        }

        data.items.forEach((event) => {
          mergeServerActions(event.id, event.user_actions);
        });
        setEvents(data.items);
        setNextCursor(data.next_cursor);
        setPrevCursor(data.prev_cursor);
        setHasMore(data.next_cursor !== null);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        setError(err instanceof Error ? err : new Error('Ошибка загрузки мероприятий'));
      } finally {
        if (requestSeq === requestSeqRef.current) {
          setLoading(false);
        }
      }
    };

    fetchEvents();
    return () => {
      initialAbortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  // Load more events (next page)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !nextCursor) return;
    pagingAbortRef.current?.abort();
    const controller = new AbortController();
    pagingAbortRef.current = controller;
    const pagingSeq = ++pagingSeqRef.current;

    try {
      setIsLoadingMore(true);
      const data = await eventsApi.getEvents(filters, nextCursor, { signal: controller.signal });
      data.items.forEach((event) => {
        mergeServerActions(event.id, event.user_actions);
      });
      setEvents((prev) => [...prev, ...data.items]);
      setNextCursor(data.next_cursor);
      setPrevCursor(data.prev_cursor);
      setHasMore(data.next_cursor !== null);
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }
      setError(err instanceof Error ? err : new Error('Ошибка загрузки мероприятий'));
    } finally {
      if (pagingSeq === pagingSeqRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [hasMore, isLoadingMore, nextCursor, filters, mergeServerActions]);

  // Load previous page
  const loadPrevious = useCallback(async () => {
    if (isLoadingMore || !prevCursor) return;
    pagingAbortRef.current?.abort();
    const controller = new AbortController();
    pagingAbortRef.current = controller;
    const pagingSeq = ++pagingSeqRef.current;

    try {
      setIsLoadingMore(true);
      const data = await eventsApi.getEvents(filters, prevCursor, { signal: controller.signal });
      data.items.forEach((event) => {
        mergeServerActions(event.id, event.user_actions);
      });
      setEvents((prev) => [...data.items, ...prev]);
      setNextCursor(data.next_cursor);
      setPrevCursor(data.prev_cursor);
      setHasMore(data.next_cursor !== null);
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }
      setError(err instanceof Error ? err : new Error('Ошибка загрузки мероприятий'));
    } finally {
      if (pagingSeq === pagingSeqRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [isLoadingMore, prevCursor, filters, mergeServerActions]);

  const mergedEvents = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        user_actions: actionsByEvent[event.id] || event.user_actions,
      })),
    [actionsByEvent, events]
  );

  return { 
    events: mergedEvents, 
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

