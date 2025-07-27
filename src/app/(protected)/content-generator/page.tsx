// src/app/(protected)/content-generator/page.tsx
import { getContentHistory } from '@/services/firestore';
import { ContentGeneratorClient } from './content-generator-client';

export const revalidate = 0;

export default async function ContentGeneratorPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const topicFromQuery = typeof searchParams.topic === 'string' ? searchParams.topic : '';
  const history = await getContentHistory();

  return <ContentGeneratorClient initialHistory={history} topicFromQuery={topicFromQuery} />;
}
