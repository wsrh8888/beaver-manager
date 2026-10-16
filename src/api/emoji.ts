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
  IAddEmojiToPackageReq,
  IAddEmojiToPackageRes,
  IBatchDeleteEmojiCollectsReq,
  IBatchDeleteEmojiCollectsRes,
  ICreateEmojiPackageReq,
  ICreateEmojiPackageRes,
  ICreateEmojiReq,
  ICreateEmojiRes,
  IDeleteEmojiCollectRes,
  IDeleteEmojiPackageRes,
  IDeleteEmojiRes,
  IGetEmojiCollectListReq,
  IGetEmojiCollectListRes,
  IGetEmojiListReq,
  IGetEmojiListRes,
  IGetEmojiPackageEmojisReq,
  IGetEmojiPackageEmojisRes,
  IGetEmojiPackageListReq,
  IGetEmojiPackageListRes,
  IRemoveEmojiFromPackageReq,
  IRemoveEmojiFromPackageRes,
  IUpdateEmojiPackageReq,
  IUpdateEmojiPackageRes,
  IUpdateEmojiReq,
  IUpdateEmojiRes
} from "@/types/api/emoji"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getEmojiListApi(params: IGetEmojiListReq) {
  return ajax<IGetEmojiListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/emoji/v1/list`,
    params
  })
}

export function createEmojiApi(data: ICreateEmojiReq) {
  return ajax<ICreateEmojiRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/emoji/v1/create`,
    data
  })
}

export function updateEmojiApi(id: string, data: Omit<IUpdateEmojiReq, "emojiId">) {
  return ajax<IUpdateEmojiRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/emoji/v1/update`,
    data: { emojiId: id, ...data }
  })
}

export function deleteEmojiApi(id: string) {
  return ajax<IDeleteEmojiRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/emoji/v1/delete`,
    data: { emojiId: id }
  })
}

export function getEmojiPackageListApi(params: IGetEmojiPackageListReq) {
  return ajax<IGetEmojiPackageListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/emoji/v1/package_list`,
    params
  })
}

export function createEmojiPackageApi(data: ICreateEmojiPackageReq) {
  return ajax<ICreateEmojiPackageRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/emoji/v1/package_create`,
    data
  })
}

export function updateEmojiPackageApi(data: IUpdateEmojiPackageReq) {
  return ajax<IUpdateEmojiPackageRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/emoji/v1/package_update`,
    data
  })
}

export function deleteEmojiPackageApi(packageId: string) {
  return ajax<IDeleteEmojiPackageRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/emoji/v1/package_delete`,
    data: { packageId }
  })
}

export function getEmojiPackageEmojisApi(params: IGetEmojiPackageEmojisReq) {
  return ajax<IGetEmojiPackageEmojisRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/emoji/v1/package_emojis`,
    params
  })
}

export function addEmojiToPackageApi(data: IAddEmojiToPackageReq) {
  return ajax<IAddEmojiToPackageRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/emoji/v1/package_add_emoji`,
    data
  })
}

export function removeEmojiFromPackageApi(data: IRemoveEmojiFromPackageReq) {
  return ajax<IRemoveEmojiFromPackageRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/emoji/v1/package_remove_emoji`,
    data
  })
}

export function getEmojiCollectListApi(params: IGetEmojiCollectListReq) {
  return ajax<IGetEmojiCollectListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/emoji/v1/collect_list`,
    params
  })
}

export function deleteEmojiCollectApi(collectId: string) {
  return ajax<IDeleteEmojiCollectRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/emoji/collectdelete`,
    data: { collectId }
  })
}

export function batchDeleteEmojiCollectsApi(data: IBatchDeleteEmojiCollectsReq) {
  return ajax<IBatchDeleteEmojiCollectsRes>({
    method: "DELETE",
    url: `${config.baseAPI}/admin/emoji/collectbatch`,
    data
  })
}
