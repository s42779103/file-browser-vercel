'use server'

import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";

const METADATA_FILE = "_metadata.json";

export interface FileData {
  key: string;
  size: number;
  lastModified: string;
  url: string;
  note?: string;
}

// 读取存储在 R2 中的备注 JSON 文件
async function getMetadataStore(): Promise<Record<string, string>> {
  try {
    const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: METADATA_FILE });
    const response = await r2Client.send(command);
    if (!response.Body) return {};
    const str = await response.Body.transformToString();
    return JSON.parse(str);
  } catch (e: any) {
    // 如果文件不存在，视为没有备注
    return {};
  }
}

// 获取文件列表并合并备注
export async function getFiles(): Promise<FileData[]> {
  try {
    const listCommand = new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME });
    
    // 并行请求：文件列表 + 备注文件
    const [listRes, metadata] = await Promise.all([
      r2Client.send(listCommand),
      getMetadataStore()
    ]);

    if (!listRes.Contents) return [];

    return listRes.Contents
      .filter(file => file.Key !== METADATA_FILE) // 隐藏系统文件
      .map(file => ({
        key: file.Key!,
        size: file.Size || 0,
        lastModified: file.LastModified?.toISOString() || "",
        url: `${R2_PUBLIC_URL}/${file.Key}`,
        note: metadata[file.Key!] || "" // 注入备注
      }))
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}

// 保存备注到 R2
export async function saveFileNote(key: string, note: string) {
  try {
    const currentMetadata = await getMetadataStore();
    
    if (note && note.trim() !== "") {
      currentMetadata[key] = note;
    } else {
      delete currentMetadata[key];
    }

    const putCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: METADATA_FILE,
      Body: JSON.stringify(currentMetadata, null, 2),
      ContentType: "application/json",
      // 防止缓存导致备注读取滞后
      CacheControl: "no-cache" 
    });
    
    await r2Client.send(putCommand);
    revalidatePath('/'); // 刷新页面缓存
    return { success: true };
  } catch (e) {
    console.error("Save error:", e);
    throw new Error("保存失败");
  }
}