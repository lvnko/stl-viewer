import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import models from '../data/models.json';

export default function ListPage() {
  const { language } = useLanguage();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">3D Models</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {models.map((model) => (
          <Link
            key={model.id}
            to={`/model/${model.id}`}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-lg font-semibold">{model.name[language]}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
