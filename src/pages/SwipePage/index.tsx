import { Header } from '@widgets/Header';
import { useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { useSwipeQueue } from '@shared/hooks';
import { buildEventImageUrl, formatDate, formatPrice } from '@shared/lib/utils';
import type { EventAction, EventResponse } from '@shared/types';

const SWIPE_DISTANCE_THRESHOLD = 120;
const SWIPE_VELOCITY_THRESHOLD = 0.55;
const EXIT_X = 520;
const EXIT_Y = 70;
const PARTICIPATE_EXIT_Y = -460;
const RESET_TRANSITION = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';
const EXIT_TRANSITION = 'transform 260ms cubic-bezier(0.2, 0.7, 0.2, 1)';
const BASE_BACKGROUND_RGB: [number, number, number] = [249, 250, 251];
const LIKE_BACKGROUND_RGB: [number, number, number] = [220, 252, 231];
const DISLIKE_BACKGROUND_RGB: [number, number, number] = [254, 226, 226];

type DragPoint = {
  x: number;
  y: number;
  time: number;
};

const mixColorChannel = (from: number, to: number, progress: number): number =>
  Math.round(from + (to - from) * progress);

interface RenderEventCardOptions {
  showParticipateButton?: boolean;
  isControlsLocked?: boolean;
  onParticipateClick?: () => void;
}

const renderEventCard = (event: EventResponse, options?: RenderEventCardOptions) => {
  const imagePath = event.image_urls?.[0] || event.image_url;
  const imageUrl = buildEventImageUrl(imagePath);
  const visibleCategories = event.categories.slice(0, 3);
  const showParticipateButton = options?.showParticipateButton ?? false;
  const isControlsLocked = options?.isControlsLocked ?? false;
  const onParticipateClick = options?.onParticipateClick;

  return (
    <div className="flex h-full flex-col">
      <div className="h-[52%] w-full shrink-0 bg-black md:aspect-[3/4] md:h-auto">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title || 'Мероприятие'}
            className="h-full w-full object-cover object-center select-none"
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">Нет изображения</div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col space-y-2 p-3 md:space-y-3 md:p-4">
        <h2 className="line-clamp-2 text-base font-semibold text-gray-900 md:text-xl">
          {event.title || 'Без названия'}
        </h2>
        <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
        <p className="text-sm font-medium text-indigo-600">{formatPrice(event.price)}</p>
        {visibleCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((category) => (
              <span key={category} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                {category}
              </span>
            ))}
          </div>
        )}
        {showParticipateButton && (
          <button
            onClick={onParticipateClick}
            disabled={isControlsLocked}
            className="mt-auto w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Буду участвовать"
          >
            Буду участвовать
          </button>
        )}
      </div>
    </div>
  );
};

export const SwipePage = () => {
  const {
    currentEvent,
    nextEvent,
    loading,
    isActionInFlight,
    canUndo,
    undoSecondsLeft,
    hasCards,
    performAction,
    undoLastAction,
  } = useSwipeQueue();

  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCardAnimating, setIsCardAnimating] = useState(false);
  const [flyingAction, setFlyingAction] = useState<EventAction | null>(null);
  const [cardTransition, setCardTransition] = useState(RESET_TRANSITION);

  const activePointerIdRef = useRef<number | null>(null);
  const startPointRef = useRef<DragPoint | null>(null);
  const lastPointRef = useRef<DragPoint | null>(null);

  const controlsLocked = isActionInFlight || isCardAnimating;

  const swipeOverlay = useMemo(() => {
    if (flyingAction === 'like' || flyingAction === 'dislike') {
      return flyingAction;
    }

    if (drag.x > 28) return 'like';
    if (drag.x < -28) return 'dislike';
    return null;
  }, [drag.x, flyingAction]);

  const isSwipingLike = swipeOverlay === 'like';
  const isSwipingDislike = swipeOverlay === 'dislike';
  const swipeStrength = Math.min(1, Math.abs(drag.x) / (SWIPE_DISTANCE_THRESHOLD * 1.1));
  const swipeProgress = Math.min(1, Math.abs(drag.x) / SWIPE_DISTANCE_THRESHOLD);
  const nextCardScale = 0.94 + swipeProgress * 0.06;
  const nextCardOpacity = 0.55 + swipeProgress * 0.45;
  const pageBackgroundColor = useMemo(() => {
    const intensity = swipeStrength * 0.9;
    const target = isSwipingLike
      ? LIKE_BACKGROUND_RGB
      : isSwipingDislike
        ? DISLIKE_BACKGROUND_RGB
        : BASE_BACKGROUND_RGB;

    const mixed = [
      mixColorChannel(BASE_BACKGROUND_RGB[0], target[0], intensity),
      mixColorChannel(BASE_BACKGROUND_RGB[1], target[1], intensity),
      mixColorChannel(BASE_BACKGROUND_RGB[2], target[2], intensity),
    ];

    return `rgb(${mixed[0]} ${mixed[1]} ${mixed[2]})`;
  }, [isSwipingDislike, isSwipingLike, swipeStrength]);

  const resetCard = () => {
    setFlyingAction(null);
    setCardTransition(RESET_TRANSITION);
    setDrag({ x: 0, y: 0 });
  };

  const animateAndPerformAction = async (action: EventAction) => {
    if (!currentEvent || controlsLocked) {
      return;
    }

    setIsCardAnimating(true);
    setFlyingAction(action);
    setCardTransition(EXIT_TRANSITION);

    if (action === 'like') {
      setDrag({ x: EXIT_X, y: -EXIT_Y });
    } else if (action === 'dislike') {
      setDrag({ x: -EXIT_X, y: EXIT_Y });
    } else {
      setDrag({ x: 0, y: PARTICIPATE_EXIT_Y });
    }

    await new Promise((resolve) => {
      window.setTimeout(resolve, 220);
    });

    await performAction(action);
    resetCard();
    setIsCardAnimating(false);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!currentEvent || controlsLocked) {
      return;
    }

    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    const now = performance.now();
    const point = { x: event.clientX, y: event.clientY, time: now };
    activePointerIdRef.current = event.pointerId;
    startPointRef.current = point;
    lastPointRef.current = point;
    setCardTransition('none');
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || activePointerIdRef.current !== event.pointerId || !startPointRef.current) {
      return;
    }

    const rawX = event.clientX - startPointRef.current.x;
    const rawY = event.clientY - startPointRef.current.y;
    const dampedY = Math.max(-120, Math.min(120, rawY * 0.35));
    setDrag({ x: rawX, y: dampedY });
    lastPointRef.current = { x: event.clientX, y: event.clientY, time: performance.now() };
  };

  const resolveActionFromGesture = (distanceX: number, velocityX: number) => {
    if (distanceX >= SWIPE_DISTANCE_THRESHOLD || velocityX >= SWIPE_VELOCITY_THRESHOLD) {
      return 'like' as const;
    }

    if (distanceX <= -SWIPE_DISTANCE_THRESHOLD || velocityX <= -SWIPE_VELOCITY_THRESHOLD) {
      return 'dislike' as const;
    }

    return null;
  };

  const handlePointerUp = async (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || activePointerIdRef.current !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);
    activePointerIdRef.current = null;

    const now = performance.now();
    const lastPoint = lastPointRef.current;
    const currentX = event.clientX;
    const distanceX = currentX - (startPointRef.current?.x || currentX);
    const velocityX = lastPoint ? (currentX - lastPoint.x) / Math.max(now - lastPoint.time, 1) : 0;
    const action = resolveActionFromGesture(distanceX, velocityX);

    startPointRef.current = null;
    lastPointRef.current = null;

    if (!action) {
      setCardTransition(RESET_TRANSITION);
      setDrag({ x: 0, y: 0 });
      return;
    }

    await animateAndPerformAction(action);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);
    activePointerIdRef.current = null;
    startPointRef.current = null;
    lastPointRef.current = null;
    setCardTransition(RESET_TRANSITION);
    setDrag({ x: 0, y: 0 });
  };

  const handleActionClick = async (action: EventAction) => {
    await animateAndPerformAction(action);
  };

  return (
    <div
      className="h-[100dvh] overflow-hidden transition-colors duration-200 md:h-auto md:min-h-screen md:overflow-visible"
      style={{
        backgroundColor: pageBackgroundColor,
      }}
    >
      <Header />
      <div className="mx-auto flex h-full w-full max-w-md flex-col px-4 pb-20 pt-4 md:py-8 md:pb-0">

        {canUndo && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <p className="text-sm text-amber-800">Отменить действие ({undoSecondsLeft}с)</p>
            <button
              onClick={undoLastAction}
              className="rounded-md bg-amber-500 px-3 py-1 text-sm font-medium text-white hover:bg-amber-600"
              aria-label="Отменить последнее действие"
            >
              Undo
            </button>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          {loading ? (
            <div className="h-full overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="h-[52%] animate-pulse bg-gray-200 md:aspect-[3/4] md:h-auto" />
              <div className="space-y-3 p-4">
                <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ) : !hasCards || !currentEvent ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-gray-700">Карточки закончились. Попробуй позже.</p>
            </div>
          ) : (
            <div className="relative min-h-0 flex-1 select-none">
              <div className="relative h-full">
                {nextEvent && (
                  <div
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl bg-white shadow-sm"
                    style={{
                      transform: `scale(${nextCardScale}) translateY(8px)`,
                      opacity: nextCardOpacity,
                      transition: 'transform 180ms ease-out, opacity 180ms ease-out',
                    }}
                  >
                    {renderEventCard(nextEvent)}
                  </div>
                )}

                <div
                  className="relative z-10 h-full overflow-hidden rounded-2xl bg-white shadow-md touch-none"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerCancel}
                  style={{
                    transform: `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${drag.x * 0.045}deg)`,
                    transition: isDragging ? 'none' : cardTransition,
                  }}
                >
                  {(isSwipingLike || isSwipingDislike) && (
                    <div
                      className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-150 ${
                        isSwipingLike
                          ? 'bg-gradient-to-l from-transparent via-transparent to-emerald-400'
                          : 'bg-gradient-to-r from-transparent via-transparent to-rose-400'
                      }`}
                      style={{
                        opacity: 0.08 + swipeStrength * 0.24,
                      }}
                    />
                  )}
                  {renderEventCard(currentEvent, {
                    showParticipateButton: true,
                    isControlsLocked: controlsLocked,
                    onParticipateClick: () => {
                      void handleActionClick('participate');
                    },
                  })}
                </div>

                {swipeOverlay === 'like' && (
                  <div
                    className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border-2 border-green-500 bg-green-100 px-6 py-2 text-4xl shadow-lg transition-transform duration-150"
                    style={{
                      transform: `scale(${1 + swipeStrength * 0.2}) rotate(${-8 + swipeStrength * 8}deg)`,
                    }}
                  >
                    👍
                  </div>
                )}
                {swipeOverlay === 'dislike' && (
                  <div
                    className="pointer-events-none absolute right-4 top-4 z-20 rounded-full border-2 border-red-500 bg-red-100 px-6 py-2 text-4xl shadow-lg transition-transform duration-150"
                    style={{
                      transform: `scale(${1 + swipeStrength * 0.2}) rotate(${8 - swipeStrength * 8}deg)`,
                    }}
                  >
                    👎
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
