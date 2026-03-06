import { Link } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown, FaCalendarPlus } from 'react-icons/fa';
import { formatSchedule } from '@shared/lib/formatSchedule';
import { buildEventImageUrl, formatPrice } from '@shared/lib/utils';
import type { EventResponse } from '@shared/types';

interface EventCardProps {
  event: EventResponse;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({ event, className }) => {
  const imagePath = event.image_urls?.[0] || event.image_url;
  const imageUrl = buildEventImageUrl(imagePath);
  const hasImage = Boolean(imageUrl);
  const scheduleText = formatSchedule(event.schedule) || event.date || 'Дата уточняется';

  return (
    <Link
      to={`/event/${event.id}`}
      className={`flex h-full flex-col rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md ${className || ''}`}
    >
      <div className="aspect-video w-full bg-gray-200 rounded-t-lg overflow-hidden">
        {hasImage ? (
          <img
            src={imageUrl || undefined}
            alt={event.image_caption || event.title || 'Мероприятие'}
            className="w-full h-full object-contain object-center"
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
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900">
            {event.title || 'Без названия'}
          </h3>
          {event.location && <p className="mb-1 text-sm text-gray-700">{event.location}</p>}
          {event.address && <p className="mb-1 text-sm text-gray-500">{event.address}</p>}
          <p className="text-sm text-gray-600">{scheduleText}</p>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-indigo-600">{formatPrice(event.price)}</p>

          {event.categories.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {event.categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
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
      </div>
    </Link>
  );
};