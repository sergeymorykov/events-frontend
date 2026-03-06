type SwipeAnalyticsEvent =
  | 'swipe_like'
  | 'swipe_dislike'
  | 'swipe_participate'
  | 'swipe_undo'
  | 'swipe_session_start'
  | 'swipe_session_end';

interface AnalyticsEntry {
  event: SwipeAnalyticsEvent;
  payload?: Record<string, unknown>;
  timestamp: string;
}

const analyticsBuffer: AnalyticsEntry[] = [];

export const track = (event: SwipeAnalyticsEvent, payload?: Record<string, unknown>) => {
  analyticsBuffer.push({
    event,
    payload,
    timestamp: new Date().toISOString(),
  });
};

export const getAnalyticsBuffer = () => analyticsBuffer;
