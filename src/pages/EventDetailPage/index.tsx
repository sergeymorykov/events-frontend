import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@widgets/Header';
import { useEventActions } from '@shared/hooks/useEventActions';
import { useAuth } from '@shared/hooks/useAuth';
import { eventsApi } from '@shared/api/eventsApi';
import { formatDate, formatPrice } from '@shared/lib/utils';
import { FaHeart, FaRegHeart, FaThumbsDown, FaRegThumbsDown, FaCheckCircle, FaRegCheckCircle } from 'react-icons/fa';
import type { EventResponse } from '@shared/types';
import toast from 'react-hot-toast';

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;

// Вспомогательная функция для безопасной сборки URL изображения
const buildImageUrl = (path: string | undefined | null): string | null => {
  if (!path) return null;
  const basePath = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${basePath}/images/${cleanPath}`;
};

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [initialLiked, setInitialLiked] = useState(false);
  const [initialDisliked, setInitialDisliked] = useState(false);
  const [initialParticipating, setInitialParticipating] = useState(false);

  useEffect(() => {
    if (event) {
      setInitialLiked(event.user_actions?.includes('like') || false);
      setInitialDisliked(event.user_actions?.includes('dislike') || false);
      setInitialParticipating(event.user_actions?.includes('participate') || false);
    }
  }, [event]);

  const { isLiked, isDisliked, isParticipating, toggleLike, toggleDislike, toggleParticipation } =
    useEventActions(
      id || '',
      initialLiked,
      initialDisliked,
      initialParticipating
    );

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await eventsApi.getEvent(id);
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Ошибка загрузки мероприятия'));
        toast.error('Ошибка загрузки мероприятия');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600">Ошибка: {error?.message || 'Мероприятие не найдено'}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Определяем путь к изображению: приоритет у image_urls[0], затем image_url
  const imagePath = event.image_urls?.[0] || event.image_url;
  const imageUrl = buildImageUrl(imagePath);
  const hasImage = Boolean(imageUrl);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-indigo-600 hover:text-indigo-700"
        >
          ← Назад
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="aspect-video w-full bg-gray-200">
            {hasImage ? (
              <img
                src={imageUrl || undefined}
                alt={event.title || 'Мероприятие'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/800x450?text=Event';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Нет изображения
              </div>
            )}
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {event.title || 'Без названия'}
            </h1>

            <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
              <span>{formatDate(event.date)}</span>
              <span className="font-medium text-indigo-600">
                {formatPrice(event.price)}
              </span>
            </div>

            {event.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {event.categories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            {event.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Описание</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {isAuthenticated && (
              <div className="flex gap-4 pt-4 border-t">
                <button
                  onClick={toggleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isLiked
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label={isLiked ? 'Убрать лайк' : 'Лайкнуть'}
                >
                  {isLiked ? <FaHeart /> : <FaRegHeart />}
                  <span>{isLiked ? 'Лайкнуто' : 'Лайк'}</span>
                </button>

                <button
                  onClick={toggleDislike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isDisliked
                      ? 'bg-gray-800 text-white hover:bg-gray-900'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label={isDisliked ? 'Убрать дизлайк' : 'Дизлайкнуть'}
                >
                  {isDisliked ? <FaThumbsDown /> : <FaRegThumbsDown />}
                  <span>{isDisliked ? 'Дизлайкнуто' : 'Дизлайк'}</span>
                </button>

                <button
                  onClick={toggleParticipation}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isParticipating
                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-label={isParticipating ? 'Отменить участие' : 'Участвовать'}
                >
                  {isParticipating ? <FaCheckCircle /> : <FaRegCheckCircle />}
                  <span>{isParticipating ? 'Участвую' : 'Участвовать'}</span>
                </button>
              </div>
            )}

            {event.source_post_url && (
              <div className="mt-6 pt-4 border-t">
                <a
                  href={event.source_post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  Источник →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};