import { create } from 'zustand';
import type { EventAction } from '@shared/types';

type EventActionMap = Record<string, EventAction[]>;

interface EventActionsState {
  actionsByEvent: EventActionMap;
  setActions: (eventId: string, actions: EventAction[]) => void;
  mergeServerActions: (eventId: string, serverActions: EventAction[]) => void;
  applyAction: (eventId: string, action: EventAction, enabled: boolean) => void;
  reset: () => void;
}

const normalizeActions = (actions: EventAction[]): EventAction[] => {
  const uniqueActions = new Set<EventAction>(actions);

  if (uniqueActions.has('like') && uniqueActions.has('dislike')) {
    uniqueActions.delete('dislike');
  }

  return Array.from(uniqueActions);
};

const applyActionRules = (currentActions: EventAction[], action: EventAction, enabled: boolean): EventAction[] => {
  const next = new Set(currentActions);

  if (enabled) {
    if (action === 'like') {
      next.delete('dislike');
      next.add('like');
    }

    if (action === 'dislike') {
      next.delete('like');
      next.add('dislike');
    }

    if (action === 'participate') {
      next.add('participate');
    }

    return normalizeActions(Array.from(next));
  }

  next.delete(action);
  return normalizeActions(Array.from(next));
};

export const useEventActionsStore = create<EventActionsState>((set, get) => ({
  actionsByEvent: {},

  setActions: (eventId, actions) => {
    set((state) => ({
      actionsByEvent: {
        ...state.actionsByEvent,
        [eventId]: normalizeActions(actions),
      },
    }));
  },

  mergeServerActions: (eventId, serverActions) => {
    const currentActions = get().actionsByEvent[eventId];
    if (currentActions) {
      return;
    }

    set((state) => ({
      actionsByEvent: {
        ...state.actionsByEvent,
        [eventId]: normalizeActions(serverActions),
      },
    }));
  },

  applyAction: (eventId, action, enabled) => {
    const currentActions = get().actionsByEvent[eventId] || [];
    const nextActions = applyActionRules(currentActions, action, enabled);

    set((state) => ({
      actionsByEvent: {
        ...state.actionsByEvent,
        [eventId]: nextActions,
      },
    }));
  },

  reset: () => set({ actionsByEvent: {} }),
}));
