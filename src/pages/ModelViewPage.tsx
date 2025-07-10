import { useParams } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import models from '../data/models.json';
import ModelViewer from '../components/ModelViewer';

export default function ModelViewPage() {
  const { modelId } = useParams<{ modelId: string }>();
  const { language } = useLanguage();
  const model = models.find((m) => m.id === modelId);

  if (!model) {
    return <div>Model not found</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{model.name[language]}</h2>
      <p className="mb-4">{model.description[language]}</p>
      <ModelViewer path={model.path} />
    </div>
  );
}
