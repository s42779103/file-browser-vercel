// src/app/actions.ts
'use server'

// ... 保持引入不变 ...
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

// ... 保持其他辅助函数不变 ...

// 修改 getFiles 函数
export async function getFiles() {
  try {
    // 检查环境变量是否存在 (调试用)
    if (!process.env.R2_ACCOUNT_ID) throw new Error("R2_ACCOUNT_ID 未设置");
    if (!process.env.R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME 未设置");

    const listCommand = new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME });
    
    // 尝试连接 R2
    const listRes = await r2Client.send(listCommand);

    // 如果连接成功，处理数据
    const files = (listRes.Contents || [])
      .filter(file => file.Key !== "_metadata.json")
      .map(file => ({
        key: file.Key!,
        size: file.Size || 0,
        lastModified: file.LastModified?.toISOString() || "",
        url: `${R2_PUBLIC_URL}/${file.Key}`,
        // 暂时不获取备注，先确保列表能出来
        note: "" 
      }))
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

    return { success: true, files }; // 返回对象结构

  } catch (e: any) {
    console.error("详细错误信息:", e);
    // 返回错误信息给前端
    return { 
      success: false, 
      files: [], 
      error: e.message || "未知错误", 
      stack: JSON.stringify(e) 
    };
  }
}
// ... 保持 saveFileNote 不变 ...