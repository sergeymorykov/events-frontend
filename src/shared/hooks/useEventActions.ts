import { useState, useEffect } from 'react';
import { eventsApi } from '@shared/api/eventsApi';
import toast from 'react-hot-toast';

interface EventActionsState {
  isLiked: boolean;
  isDisliked: boolean;
  isParticipating: boolean;
}

export const useEventActions = (
  eventId: string,
  initialLiked: boolean = false,
  initialDisliked: boolean = false,
  initialParticipating: boolean = false
) => {
  const [state, setState] = useState<EventActionsState>({
    isLiked: initialLiked,
    isDisliked: initialDisliked,
    isParticipating: initialParticipating,
  });

  useEffect(() => {
    setState({
      isLiked: initialLiked,
      isDisliked: initialDisliked,
      isParticipating: initialParticipating,
    });
  }, [initialLiked, initialDisliked, initialParticipating]);

  const toggleLike = async () => {
    const previousState = state.isLiked;
    setState((prev) => ({ ...prev, isLiked: !prev.isLiked, isDisliked: false }));

    try {
      if (previousState) {
        await eventsApi.unlikeEvent(eventId);
        toast.success('Лайк удален');
      } else {
        await eventsApi.likeEvent(eventId);
        toast.success('Мероприятие добавлено в избранное');
      }
    } catch (error) {
      setState((prev) => ({ ...prev, isLiked: previousState }));
      toast.error('Ошибка при обновлении лайка');
    }
  };

  const toggleDislike = async () => {
    const previousState = state.isDisliked;
    setState((prev) => ({ ...prev, isDisliked: !prev.isDisliked, isLiked: false }));

    try {
      if (previousState) {
        await eventsApi.undislikeEvent(eventId);
        toast.success('Дизлайк удален');
      } else {
        await eventsApi.dislikeEvent(eventId);
        toast.success('Мероприятие скрыто');
      }
    } catch (error) {
      setState((prev) => ({ ...prev, isDisliked: previousState }));
      toast.error('Ошибка при обновлении дизлайка');
    }
  };

  const toggleParticipation = async () => {
    const previousState = state.isParticipating;
    setState((prev) => ({ ...prev, isParticipating: !prev.isParticipating }));

    try {
      if (previousState) {
        await eventsApi.cancelParticipation(eventId);
        toast.success('Участие отменено');
      } else {
        await eventsApi.participateEvent(eventId);
        toast.success('Вы будете участвовать в мероприятии');
      }
    } catch (error) {
      setState((prev) => ({ ...prev, isParticipating: previousState }));
      toast.error('Ошибка при обновлении участия');
    }
  };

  return {
    ...state,
    toggleLike,
    toggleDislike,
    toggleParticipation,
  };
};

