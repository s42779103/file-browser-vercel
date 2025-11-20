import { getFiles } from './actions';
import FileBrowser from '@/components/FileBrowser';

// 强制动态渲染，避免 Next.js 缓存构建时的页面
export const dynamic = 'force-dynamic';

export default async function Home() {
  const files = await getFiles();
  return <FileBrowser initialFiles={files} />;
}