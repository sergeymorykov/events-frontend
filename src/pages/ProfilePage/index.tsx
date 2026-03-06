import { Header } from '@widgets/Header';
import { useAuth } from '@shared/hooks/useAuth';
import { useEffect, useMemo } from 'react';
import { useEventActionsStore } from '@app/store/useEventActionsStore';

export const ProfilePage = () => {
  const { user, loadUser } = useAuth();
  const actionsByEvent = useEventActionsStore((state) => state.actionsByEvent);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const counters = useMemo(() => {
    const values = Object.values(actionsByEvent);

    return values.reduce(
      (acc, actions) => {
        if (actions.includes('like')) acc.likes += 1;
        if (actions.includes('dislike')) acc.dislikes += 1;
        if (actions.includes('participate')) acc.participates += 1;
        return acc;
      },
      { likes: 0, dislikes: 0, participates: 0 }
    );
  }, [actionsByEvent]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Профиль</h1>
          {user && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Никнейм</p>
                <p className="text-lg font-medium text-gray-900">@{user.nickname}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Имя</p>
                <p className="text-lg font-medium text-gray-900">{user.name}</p>
              </div>
              {user.interests && user.interests.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Интересы</p>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-2">Ваши действия</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="rounded-md bg-green-50 px-3 py-2 text-green-700">Лайки: {counters.likes}</div>
                  <div className="rounded-md bg-red-50 px-3 py-2 text-red-700">Дизлайки: {counters.dislikes}</div>
                  <div className="rounded-md bg-indigo-50 px-3 py-2 text-indigo-700">
                    Участвую: {counters.participates}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

