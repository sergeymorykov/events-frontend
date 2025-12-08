import { Header } from '@widgets/Header';
import { useAuth } from '@shared/hooks/useAuth';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

