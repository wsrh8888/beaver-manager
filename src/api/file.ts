/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-manager
 * https://github.com/wsrh8888/beaver-manager
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-manager-header-v1
 */

import type {
  IBatchDeleteFileReq,
  IBatchDeleteFileRes,
  IDeleteFileRes,
  IGetFileDetailRes,
  IGetFileListReq,
  IGetFileListRes
} from "@/types/api/file"
import config from "@/config/env"
import { ajax } from "@/utils/request"
import { getFileInfo, getFileType, getImageAttribute, getVideoInfo, getAudioInfo, getMd5 } from "@/utils/tools"
import { uploadFileToQiniuOss } from "@/utils/qiniu/qiniu"
import { ElMessage } from "element-plus"

// 获取文件列表
export function getFileListApi(params: IGetFileListReq) {
  return ajax<IGetFileListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/file/v1/list`,
    params
  })
}

// 获取文件详情
export function getFileDetailApi(id: number) {
  return ajax<IGetFileDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/file/v1/detail`,
    params: { id }
  })
}

// 删除文件
export function deleteFileApi(id: number) {
  return ajax<IDeleteFileRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/file/v1/delete`,
    data: { id }
  })
}

// 批量删除文件
export function batchDeleteFileApi(data: IBatchDeleteFileReq) {
  return ajax<IBatchDeleteFileRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/file/v1/batch_delete`,
    data
  })
}

// Token缓存
let tokenCache: { token: string; expires: number } | null = null

// 检查token是否有效（30分钟内）
function isTokenValid(): boolean {
  if (!tokenCache) return false
  
  const now = Date.now()
  const thirtyMinutes = 30 * 60 * 1000 // 30分钟
  return (tokenCache.expires - now) > thirtyMinutes
}

// 获取七牛云上传token（带缓存）
export async function getQiniuUploadTokenApi() {
  if (isTokenValid()) {
    return Promise.resolve({ result: tokenCache! })
  }

  try {
    const response = await ajax<{ uploadToken: string; expiresIn: number }>({
      method: "POST",
      url: `${config.baseAPI}/admin/backend/file/v1/qiniu_token`
    })
    
    tokenCache = {
      token: response.result.uploadToken,
      expires: Date.now() + response.result.expiresIn * 1000
    }
    
    return { result: tokenCache }
  } catch (error) {
    console.error('获取七牛云token失败:', error)
    throw new Error('获取上传凭证失败')
  }
}

// 保存文件信息到数据库
export function saveFileApi(data: {
  fileName: string
  size: number
  path: string
  md5: string
  type: string
}) {
  return ajax<{ fileId: string }>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/file/v1/save`,
    data
  })
}

// =================== 文件上传相关类型 ===================

// 上传文件类型
export type UploadFileType = 'image' | 'video' | 'audio' | 'file'

// 上传结果的基础结构
export interface UploadResult {
  fileId?: string
  fileUrl: string
  type: UploadFileType
  originalName?: string
  size?: number
  // 文件信息
  md5: string
  filePath: string
  ext: string
  // 样式信息
  width?: number
  height?: number
  duration?: number
}

// 文件上传API返回结果
export interface IFileUploadResult {
  fileUrl: string
  originalName: string
  fileInfo: any
}

// 文件上传API响应（result部分）
export interface IFileRes {
  fileUrl: string
  originalName: string
  filePath?: string
  md5?: string
}

// 不同类型文件的样式信息
interface UploadStyle {
  width?: number
  height?: number
  duration?: number
}

/**
 * @description: 根据文件类型获取样式信息
 */
const getFileStyle = async (file: File, type: UploadFileType): Promise<UploadStyle> => {
  switch (type) {
    case 'image': {
      const imageInfo = await getImageAttribute(file)
      return {
        width: imageInfo.width,
        height: imageInfo.height,
      }
    }

    case 'video': {
      const videoInfo = await getVideoInfo(file)
      return {
        width: videoInfo.width,
        height: videoInfo.height,
        duration: videoInfo.duration,
      }
    }

    case 'audio': {
      const audioInfo = await getAudioInfo(file)
      return {
        duration: audioInfo.duration,
      }
    }

    case 'file':
    default:
      return {}
  }
}

// =================== 文件上传API（通过后端） ===================

/**
 * @description: 文件上传总入口
 */
export const uploadFileApi = async (file: File): Promise<IFileUploadResult> => {
  return await uploadToLocalApi(file)
}

/**
 * @description: 通用文件上传函数（通过后端API）
 */
export const uploadFileApiWithTarget = async (file: File, target: 'local' | 'qiniu' = 'local'): Promise<IFileUploadResult> => {
  // 根据目标选择URL
  const baseEndpoint = target === 'qiniu' ? 'upload_qiniu' : 'upload_local'
  const uploadUrl = `${config.baseAPI}/admin/backend/file/v1/${baseEndpoint}`

  // 获取文件信息
  const fileInfo = await getFileInfo(file)

  // 创建FormData - 将fileInfo作为FormData字段
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileInfo', JSON.stringify(fileInfo))
  formData.append('source', target) // 添加source字段

  const result = await ajax<IFileRes>({
    method: 'POST',
    data: formData,
    url: uploadUrl,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  if(result.code !== 0) {
    ElMessage.error(result.msg || '上传失败')
    return Promise.reject(new Error(result.msg || '上传失败'))
  }

  return {
    fileUrl: result.result.fileUrl,
    originalName: result.result.originalName,
    fileInfo,
  }
}

/**
 * @description: 上传文件到本地（通过后端API）
 */
export const uploadToLocalApi = (file: File) => uploadFileApiWithTarget(file, 'local')

/**
 * @description: 上传文件到七牛云（通过后端API）
 */
export const uploadQiniuApi = (file: File) => uploadFileApiWithTarget(file, 'qiniu')

// =================== 文件上传工具函数（直接上传） ===================

/**
 * @description: 通用文件上传函数（支持本地和七牛云，直接上传）
 * @param file 要上传的文件
 * @param path 上传路径（仅七牛云使用）
 * @param target 上传目标：'local' | 'qiniu'，默认 'qiniu'
 * @param argument 自定义参数（仅七牛云使用）
 * @returns Promise<UploadResult>
 */
export const uploadFileWithTarget = async (
  file: File,
  path: string,
  target: 'local' | 'qiniu' = 'qiniu',
  argument?: any
): Promise<UploadResult> => {
  try {
    // 自动检测文件类型
    const detectedType = getFileType(file.type)
    const fileType: UploadFileType = detectedType === 'other' ? 'file' : detectedType as UploadFileType

    let uploadResult: {
      fileUrl: string
      filePath: string
      md5: string
      originalName?: string
      size?: number
      ext?: string
      width?: number
      height?: number
      duration?: number
    }

    if (target === 'local') {
      // 本地上传（通过后端API）
      const result = await uploadToLocalApi(file)
      const md5 = await getMd5(file)
      const ext = file.name.substring(file.name.lastIndexOf('.') + 1)
      
      uploadResult = {
        fileUrl: result.fileUrl,
        filePath: result.fileInfo?.filePath || result.fileUrl,
        md5: md5,
        originalName: result.originalName,
        size: file.size,
        ext,
      }
    } else {
      // 七牛云上传（直接上传到OSS）
      const response = await getQiniuUploadTokenApi()
      const token = response.result.token

      const uploadInfo = await uploadFileToQiniuOss({
        file,
        path,
        token,
        argument
      })

      uploadResult = {
        fileUrl: uploadInfo.filePath,
        filePath: uploadInfo.filePath,
        md5: uploadInfo.md5,
        size: uploadInfo.size,
        ext: uploadInfo.ext,
        width: uploadInfo.width,
        height: uploadInfo.height,
        duration: uploadInfo.duration || 0,
      }
    }

    // 根据类型获取样式信息
    const style = await getFileStyle(file, fileType)

    return {
      type: fileType,
      originalName: uploadResult.originalName || file.name,
      size: uploadResult.size || file.size,
      md5: uploadResult.md5,
      filePath: uploadResult.filePath,
      ext: uploadResult.ext || file.name.substring(file.name.lastIndexOf('.') + 1),
      fileUrl: uploadResult.fileUrl,
      width: style.width || uploadResult.width,
      height: style.height || uploadResult.height,
      duration: style.duration || uploadResult.duration || 0,
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    throw error
  }
}

