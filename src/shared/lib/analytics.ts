type SwipeAnalyticsEvent =
  | 'swipe_like'
  | 'swipe_dislike'
  | 'swipe_participate'
  | 'swipe_undo'
  | 'swipe_session_start'
  | 'swipe_session_end';

type BetaAnalyticsEvent =
  | 'beta_consent_viewed'
  | 'beta_consent_toggled'
  | 'beta_registration_submitted'
  | 'beta_registration_rejected_terms';

type AnalyticsEvent = SwipeAnalyticsEvent | BetaAnalyticsEvent;

interface AnalyticsEntry {
  event: AnalyticsEvent;
  payload?: Record<string, unknown>;
  timestamp: string;
}

const analyticsBuffer: AnalyticsEntry[] = [];

export const track = (event: AnalyticsEvent, payload?: Record<string, unknown>) => {
  analyticsBuffer.push({
    event,
    payload,
    timestamp: new Date().toISOString(),
  });
};

export const getAnalyticsBuffer = () => analyticsBuffer;
