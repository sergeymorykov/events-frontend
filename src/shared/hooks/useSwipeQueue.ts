import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { eventsApi } from '@shared/api/eventsApi';
import { toApiError } from '@shared/api';
import { useEventActionsStore } from '@app/store/useEventActionsStore';
import { track } from '@shared/lib/analytics';
import type { EventAction, EventResponse } from '@shared/types';

interface UndoState {
  eventId: string;
  action: EventAction;
  expiresAt: number;
  timeoutId: number;
}

const SWIPE_BATCH_LIMIT = 20;
const SWIPE_PREFETCH_THRESHOLD = 3;
const UNDO_TIMEOUT_MS = 5000;

const actionLabels: Record<EventAction, string> = {
  like: 'Лайк поставлен',
  dislike: 'Дизлайк поставлен',
  participate: 'Вы будете участвовать',
};

const callCreateAction = async (eventId: string, action: EventAction) => {
  if (action === 'like') return eventsApi.likeEvent(eventId);
  if (action === 'dislike') return eventsApi.dislikeEvent(eventId);
  return eventsApi.participateEvent(eventId);
};

const callDeleteAction = async (eventId: string, action: EventAction) => {
  if (action === 'like') return eventsApi.unlikeEvent(eventId);
  if (action === 'dislike') return eventsApi.undislikeEvent(eventId);
  return eventsApi.cancelParticipation(eventId);
};

export const useSwipeQueue = () => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isActionInFlight, setIsActionInFlight] = useState(false);
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [undoTick, setUndoTick] = useState(Date.now());

  const mergeServerActions = useEventActionsStore((state) => state.mergeServerActions);
  const applyAction = useEventActionsStore((state) => state.applyAction);
  const setActions = useEventActionsStore((state) => state.setActions);

  const sessionActionsRef = useRef(0);
  const fetchAbortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const clearUndo = useCallback(() => {
    setUndoState((current) => {
      if (!current) {
        return current;
      }

      window.clearTimeout(current.timeoutId);
      return null;
    });
  }, []);

  const appendBatch = useCallback(
    (batch: EventResponse[]) => {
      batch.forEach((event) => mergeServerActions(event.id, event.user_actions));
      setEvents((prev) => [...prev, ...batch]);
    },
    [mergeServerActions]
  );

  const fetchInitial = useCallback(async () => {
    fetchAbortRef.current?.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    try {
      setLoading(true);
      const data = await eventsApi.getEvents(
        { for_my_interests: true, limit: SWIPE_BATCH_LIMIT },
        undefined,
        { signal: controller.signal }
      );
      if (!mountedRef.current) return;

      data.items.forEach((event) => mergeServerActions(event.id, event.user_actions));
      setEvents(data.items);
      setNextCursor(data.next_cursor);
      setCurrentIndex(0);
    } catch (error) {
      if (controller.signal.aborted) return;
      toast.error(toApiError(error).message || 'Ошибка загрузки карточек');
    } finally {
      if (!controller.signal.aborted && mountedRef.current) {
        setLoading(false);
      }
    }
  }, [mergeServerActions]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const data = await eventsApi.getEvents({ for_my_interests: true, limit: SWIPE_BATCH_LIMIT }, nextCursor);
      appendBatch(data.items);
      setNextCursor(data.next_cursor);
    } catch (error) {
      toast.error(toApiError(error).message || 'Ошибка подгрузки карточек');
    } finally {
      setIsLoadingMore(false);
    }
  }, [appendBatch, isLoadingMore, nextCursor]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  useEffect(() => {
    track('swipe_session_start');
    return () => {
      track('swipe_session_end', { actions: sessionActionsRef.current });
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      fetchAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!undoState) {
      return;
    }

    const interval = window.setInterval(() => {
      setUndoTick(Date.now());
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [undoState]);

  useEffect(() => {
    const remaining = events.length - currentIndex;
    if (remaining <= SWIPE_PREFETCH_THRESHOLD && nextCursor && !isLoadingMore) {
      loadMore();
    }
  }, [currentIndex, events.length, isLoadingMore, loadMore, nextCursor]);

  const currentEvent = useMemo(() => events[currentIndex] || null, [currentIndex, events]);

  const moveToNext = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const rememberUndo = useCallback((eventId: string, action: EventAction) => {
    clearUndo();
    const timeoutId = window.setTimeout(() => {
      setUndoState(null);
    }, UNDO_TIMEOUT_MS);

    setUndoState({
      eventId,
      action,
      expiresAt: Date.now() + UNDO_TIMEOUT_MS,
      timeoutId,
    });
  }, [clearUndo]);

  const performAction = useCallback(
    async (action: EventAction) => {
      if (!currentEvent || isActionInFlight) {
        return;
      }

      setIsActionInFlight(true);
      clearUndo();

      const eventId = currentEvent.id;
      const previousActions = [...(useEventActionsStore.getState().actionsByEvent[eventId] || currentEvent.user_actions)];
      applyAction(eventId, action, true);

      try {
        await callCreateAction(eventId, action);
        toast.success(actionLabels[action]);
      } catch (error) {
        const apiError = toApiError(error);
        if (apiError.status === 409) {
          toast('Действие уже выполнено');
        } else {
          setActions(eventId, previousActions);
          toast.error(apiError.message || 'Не удалось выполнить действие');
          setIsActionInFlight(false);
          return;
        }
      }

      sessionActionsRef.current += 1;
      if (action === 'like') track('swipe_like', { eventId });
      if (action === 'dislike') track('swipe_dislike', { eventId });
      if (action === 'participate') track('swipe_participate', { eventId });

      rememberUndo(eventId, action);
      moveToNext();
      setIsActionInFlight(false);
    },
    [applyAction, clearUndo, currentEvent, isActionInFlight, moveToNext, rememberUndo, setActions]
  );

  const undoLastAction = useCallback(async () => {
    if (!undoState) return;
    if (Date.now() > undoState.expiresAt) {
      clearUndo();
      return;
    }

    try {
      await callDeleteAction(undoState.eventId, undoState.action);
      applyAction(undoState.eventId, undoState.action, false);
      track('swipe_undo', { eventId: undoState.eventId, action: undoState.action });
      toast.success('Последнее действие отменено');
    } catch (error) {
      toast.error(toApiError(error).message || 'Не удалось отменить действие');
    } finally {
      clearUndo();
    }
  }, [applyAction, clearUndo, undoState]);

  const undoSecondsLeft = undoState ? Math.max(0, Math.ceil((undoState.expiresAt - undoTick) / 1000)) : 0;

  return {
    currentEvent,
    loading,
    isLoadingMore,
    isActionInFlight,
    hasCards: currentIndex < events.length,
    undoSecondsLeft,
    canUndo: Boolean(undoState) && undoSecondsLeft > 0,
    performAction,
    undoLastAction,
  };
};
