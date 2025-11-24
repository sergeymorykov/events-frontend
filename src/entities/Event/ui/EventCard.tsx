import { Link } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown, FaCalendarPlus } from 'react-icons/fa';
import { formatDate, formatPrice } from '@shared/lib/utils';
import type { EventResponse } from '@shared/types';

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL;

// Вспомогательная функция для безопасной сборки URL изображения
const buildImageUrl = (path: string | undefined | null): string | null => {
  if (!path) return null;

  const basePath = API_BASE_URL.replace(/\/+$/, ''); // убираем завершающие слэши
  const cleanPath = path.replace(/^\/+/, '');       // убираем начальные слэши
  return `${basePath}/images/${cleanPath}`;
};

interface EventCardProps {
  event: EventResponse;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({ event, className }) => {
  const imagePath = event.image_urls?.[0] || event.image_url;
  const imageUrl = buildImageUrl(imagePath);
  const hasImage = Boolean(imageUrl);
  console.log(imageUrl)
  return (
    <Link
      to={`/event/${event.id}`}
      className={`block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${className || ''}`}
    >
      <div className="aspect-video w-full bg-gray-200 rounded-t-lg overflow-hidden">
        {hasImage ? (
          <img
            src={imageUrl || undefined}
            alt={event.image_caption || event.title || 'Мероприятие'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://via.placeholder.com/400x225?text=Event';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Нет изображения
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title || 'Без названия'}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{formatDate(event.date)}</p>
        <p className="text-sm font-medium text-indigo-600 mb-2">
          {formatPrice(event.price)}
        </p>
        {event.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {event.categories.slice(0, 3).map((category) => (
              <span
                key={category}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                {category}
              </span>
            ))}
          </div>
        )}
        
        {/* User Actions Display */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center ${event.user_actions.includes('like') ? 'text-green-600' : 'text-gray-400'}`}>
              <FaThumbsUp className="text-xs" />
              <span className="ml-1 text-xs">Нравится</span>
            </div>
            <div className={`flex items-center ${event.user_actions.includes('dislike') ? 'text-red-600' : 'text-gray-400'}`}>
              <FaThumbsDown className="text-xs" />
              <span className="ml-1 text-xs">Не нравится</span>
            </div>
            <div className={`flex items-center ${event.user_actions.includes('participate') ? 'text-blue-600' : 'text-gray-400'}`}>
              <FaCalendarPlus className="text-xs" />
              <span className="ml-1 text-xs">Участвую</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};