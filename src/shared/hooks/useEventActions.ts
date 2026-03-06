import { useEffect, useMemo } from 'react';
import { eventsApi } from '@shared/api/eventsApi';
import toast from 'react-hot-toast';
import { toApiError } from '@shared/api';
import { useEventActionsStore } from '@app/store/useEventActionsStore';
import type { EventAction } from '@shared/types';

interface UseEventActionsOptions {
  showToasts?: boolean;
}

export const useEventActions = (
  eventId: string,
  initialLiked: boolean = false,
  initialDisliked: boolean = false,
  initialParticipating: boolean = false,
  options?: UseEventActionsOptions
) => {
  const showToasts = options?.showToasts ?? true;
  const setActions = useEventActionsStore((state) => state.setActions);
  const applyAction = useEventActionsStore((state) => state.applyAction);
  const eventActionsFromStore = useEventActionsStore((state) => state.actionsByEvent[eventId]);

  const initialActions = useMemo(() => {
    const actions: EventAction[] = [];

    if (initialLiked) {
      actions.push('like');
    }

    if (initialDisliked) {
      actions.push('dislike');
    }

    if (initialParticipating) {
      actions.push('participate');
    }

    return actions;
  }, [initialDisliked, initialLiked, initialParticipating]);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    if (eventActionsFromStore !== undefined) {
      return;
    }

    setActions(eventId, initialActions);
  }, [eventActionsFromStore, eventId, initialActions, setActions]);

  const storeActions = eventActionsFromStore || initialActions;

  const isLiked = storeActions.includes('like');
  const isDisliked = storeActions.includes('dislike');
  const isParticipating = storeActions.includes('participate');

  const rollbackTo = (actions: EventAction[]) => {
    setActions(eventId, actions);
  };

  const toggleLike = async () => {
    if (!eventId) return;
    const previousActions = [...storeActions];
    const nextEnabled = !isLiked;
    applyAction(eventId, 'like', nextEnabled);

    try {
      if (nextEnabled) {
        await eventsApi.likeEvent(eventId);
        if (showToasts) {
          toast.success('Мероприятие добавлено в избранное');
        }
      } else {
        await eventsApi.unlikeEvent(eventId);
        if (showToasts) {
          toast.success('Лайк удален');
        }
      }
    } catch (error) {
      rollbackTo(previousActions);
      if (showToasts) {
        toast.error(toApiError(error).message || 'Ошибка при обновлении лайка');
      }
    }
  };

  const toggleDislike = async () => {
    if (!eventId) return;
    const previousActions = [...storeActions];
    const nextEnabled = !isDisliked;
    applyAction(eventId, 'dislike', nextEnabled);

    try {
      if (nextEnabled) {
        await eventsApi.dislikeEvent(eventId);
        if (showToasts) {
          toast.success('Мероприятие скрыто');
        }
      } else {
        await eventsApi.undislikeEvent(eventId);
        if (showToasts) {
          toast.success('Дизлайк удален');
        }
      }
    } catch (error) {
      rollbackTo(previousActions);
      if (showToasts) {
        toast.error(toApiError(error).message || 'Ошибка при обновлении дизлайка');
      }
    }
  };

  const toggleParticipation = async () => {
    if (!eventId) return;
    const previousActions = [...storeActions];
    const nextEnabled = !isParticipating;
    applyAction(eventId, 'participate', nextEnabled);

    try {
      if (nextEnabled) {
        await eventsApi.participateEvent(eventId);
        if (showToasts) {
          toast.success('Вы будете участвовать в мероприятии');
        }
      } else {
        await eventsApi.cancelParticipation(eventId);
        if (showToasts) {
          toast.success('Участие отменено');
        }
      }
    } catch (error) {
      rollbackTo(previousActions);
      if (showToasts) {
        toast.error(toApiError(error).message || 'Ошибка при обновлении участия');
      }
    }
  };

  return {
    isLiked,
    isDisliked,
    isParticipating,
    toggleLike,
    toggleDislike,
    toggleParticipation,
  };
};

