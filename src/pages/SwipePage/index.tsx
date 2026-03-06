import { Header } from '@widgets/Header';
import { useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { useSwipeQueue } from '@shared/hooks';
import { buildEventImageUrl, formatDate, formatPrice } from '@shared/lib/utils';
import type { EventAction } from '@shared/types';

export const SwipePage = () => {
  const { currentEvent, loading, isActionInFlight, canUndo, undoSecondsLeft, hasCards, performAction, undoLastAction } =
    useSwipeQueue();
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pointerStartXRef = useRef<number | null>(null);

  const swipeThreshold = 90;

  const swipeOverlay = useMemo(() => {
    if (dragX > 25) return 'like';
    if (dragX < -25) return 'dislike';
    return null;
  }, [dragX]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!currentEvent || isActionInFlight) {
      return;
    }

    pointerStartXRef.current = event.clientX;
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || pointerStartXRef.current === null) {
      return;
    }

    const delta = event.clientX - pointerStartXRef.current;
    setDragX(delta);
  };

  const handlePointerUp = async () => {
    if (!isDragging) {
      return;
    }

    setIsDragging(false);
    pointerStartXRef.current = null;

    if (dragX >= swipeThreshold) {
      setDragX(0);
      await performAction('like');
      return;
    }

    if (dragX <= -swipeThreshold) {
      setDragX(0);
      await performAction('dislike');
      return;
    }

    setDragX(0);
  };

  const handleActionClick = async (action: EventAction) => {
    if (isActionInFlight) {
      return;
    }

    await performAction(action);
    setDragX(0);
  };

  const imagePath = currentEvent?.image_urls?.[0] || currentEvent?.image_url;
  const imageUrl = buildEventImageUrl(imagePath);
  const hasImage = Boolean(imageUrl);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto w-full max-w-md px-4 py-6 sm:py-8">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-900">Свайпы</h1>

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

        {loading ? (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="aspect-[3/4] animate-pulse bg-gray-200" />
            <div className="space-y-3 p-4">
              <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ) : !hasCards || !currentEvent ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-gray-700">Карточки закончились. Попробуй позже.</p>
          </div>
        ) : (
          <div
            className="relative select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div
              className="overflow-hidden rounded-2xl bg-white shadow-md transition-transform duration-150"
              style={{
                transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
              }}
            >
              <div className="aspect-[3/4] w-full bg-gray-200">
                {hasImage ? (
                  <img
                    src={imageUrl || undefined}
                    alt={currentEvent.title || 'Мероприятие'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">Нет изображения</div>
                )}
              </div>

              <div className="space-y-3 p-4">
                <h2 className="text-xl font-semibold text-gray-900">{currentEvent.title || 'Без названия'}</h2>
                <p className="text-sm text-gray-600">{formatDate(currentEvent.date)}</p>
                <p className="text-sm font-medium text-indigo-600">{formatPrice(currentEvent.price)}</p>
                {currentEvent.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentEvent.categories.map((category) => (
                      <span key={category} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {swipeOverlay === 'like' && (
              <div className="pointer-events-none absolute left-4 top-4 rounded border-2 border-green-500 bg-green-100 px-3 py-1 font-bold text-green-700">
                LIKE
              </div>
            )}
            {swipeOverlay === 'dislike' && (
              <div className="pointer-events-none absolute right-4 top-4 rounded border-2 border-red-500 bg-red-100 px-3 py-1 font-bold text-red-700">
                DISLIKE
              </div>
            )}

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => handleActionClick('dislike')}
                disabled={isActionInFlight}
                className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Дизлайк"
              >
                Дизлайк
              </button>
              <button
                onClick={() => handleActionClick('participate')}
                disabled={isActionInFlight}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Буду участвовать"
              >
                Буду участвовать
              </button>
              <button
                onClick={() => handleActionClick('like')}
                disabled={isActionInFlight}
                className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Лайк"
              >
                Лайк
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
