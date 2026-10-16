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
  IBatchDeleteChatMessagesReq,
  IBatchDeleteChatMessagesRes,
  IBatchRestoreChatMessagesReq,
  IBatchRestoreChatMessagesRes,
  IClearConversationReq,
  IClearConversationRes,
  IDeleteChatMessageRes,
  IDeleteMessagesByTypeReq,
  IDeleteMessagesByTypeRes,
  IGetChatMessageDetailRes,
  IGetChatMessageListReq,
  IGetChatMessageListRes,
  IGetChatSessionListReq,
  IGetChatSessionListRes,
  IRestoreChatMessageReq,
  IRestoreChatMessageRes
} from "@/types/api/chat"
import config from "@/config/env"
import { ajax } from "@/utils/request"

export function getChatSessionListApi(params: IGetChatSessionListReq) {
  return ajax<IGetChatSessionListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/chat/v1/sessions`,
    params
  })
}

export function getChatMessageListApi(params: IGetChatMessageListReq) {
  return ajax<IGetChatMessageListRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/chat/v1/list`,
    params
  })
}

export function getChatMessageDetailApi(messageId: string) {
  return ajax<IGetChatMessageDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/admin/backend/chat/v1/detail`,
    params: { id: messageId }
  })
}

export function deleteChatMessageApi(messageId: string) {
  return ajax<IDeleteChatMessageRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/chat/v1/delete`,
    data: { id: messageId }
  })
}

export function batchDeleteChatMessagesApi(data: IBatchDeleteChatMessagesReq) {
  return ajax<IBatchDeleteChatMessagesRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/chat/v1/batch_delete`,
    data
  })
}

export function restoreChatMessageApi(data: IRestoreChatMessageReq) {
  return ajax<IRestoreChatMessageRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/chat/v1/restore`,
    data
  })
}

export function batchRestoreChatMessagesApi(data: IBatchRestoreChatMessagesReq) {
  return ajax<IBatchRestoreChatMessagesRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/chat/v1/batch_restore`,
    data
  })
}

export function clearConversationApi(data: IClearConversationReq) {
  return ajax<IClearConversationRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/chat/v1/clear_conversation`,
    data
  })
}

export function deleteMessagesByTypeApi(data: IDeleteMessagesByTypeReq) {
  return ajax<IDeleteMessagesByTypeRes>({
    method: "POST",
    url: `${config.baseAPI}/admin/backend/chat/v1/delete_by_type`,
    data
  })
}
