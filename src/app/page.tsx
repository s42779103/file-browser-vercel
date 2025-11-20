// src/app/page.tsx
import { getFiles } from './actions';
import FileBrowser from '@/components/FileBrowser';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // 获取数据结果
  const result = await getFiles();

  // 如果出错，显示错误信息
  if (!result.success) {
    return (
      <div style={{ padding: 40, color: 'red', fontFamily: 'monospace' }}>
        <h1>连接 R2 失败</h1>
        <p><strong>错误信息:</strong> {result.error}</p>
        <div style={{ background: '#fff0f0', padding: 20, borderRadius: 8, marginTop: 20 }}>
          <h3>排查建议：</h3>
          <ul>
            <li>检查 <strong>R2_ACCOUNT_ID</strong> 是否填了完整的 URL？(只需要填 ID 字符串)</li>
            <li>检查 <strong>R2_BUCKET_NAME</strong> 是否拼写正确？</li>
            <li>检查 <strong>R2_ACCESS_KEY</strong> 是否有权限？</li>
          </ul>
          <p style={{marginTop: 10, color: '#666'}}>原始堆栈: {result.stack}</p>
        </div>
      </div>
    );
  }

  return (
    <main>
       <FileBrowser initialFiles={result.files} />
    </main>
  );
}