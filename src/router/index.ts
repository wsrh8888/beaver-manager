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

import { createRouter, createWebHashHistory } from "vue-router"
import { useUserStore } from "@/pinia/user/user"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: () => import("@/layouts/index.vue"),
      redirect: "/workspace/operations",
      children: [
        {
          path: "workspace",
          redirect: "/workspace/operations",
          children: [
            {
              path: "operations",
              name: "运营工作台",
              component: () => import("@/pages/workspace/operations/index.vue")
            }
          ]
        },
        {
          path: "user",
          children: [
            {
              path: "list",
              name: "用户管理",
              component: () => import("@/pages/user/list/index.vue")
            },
            {
              path: "profile/:userId",
              name: "用户360",
              component: () => import("@/pages/user/profile/index.vue"),
              meta: { activeMenu: "/user/list" }
            }
          ]
        },
        {
          path: "compliance",
          children: [
            {
              path: "messages",
              name: "消息检索",
              component: () => import("@/pages/compliance/messages/index.vue")
            },
            {
              path: "sessions",
              name: "会话审计",
              component: () => import("@/pages/compliance/sessions/index.vue")
            }
          ]
        },
        {
          path: "safety",
          children: [
            {
              path: "appeals",
              name: "申诉",
              component: () => import("@/pages/safety/appeals/index.vue")
            }
          ]
        },
        {
          path: "service",
          children: [
            {
              path: "feedback",
              name: "用户反馈",
              component: () => import("@/pages/service/feedback/index.vue")
            }
          ]
        },
        {
          path: "open",
          children: [
            {
              path: "developers",
              name: "开发者",
              component: () => import("@/pages/open/developers/index.vue")
            },
            {
              path: "apps",
              name: "开放应用",
              component: () => import("@/pages/open/apps/index.vue")
            },
            {
              path: "workbench",
              name: "工作台应用",
              component: () => import("@/pages/open/workbench/index.vue")
            },
            {
              path: "integrations",
              name: "机器人集成",
              component: () => import("@/pages/open/integrations/index.vue")
            },
            {
              path: "digitals",
              name: "用户数字伙伴",
              component: () => import("@/pages/open/digitals/index.vue")
            }
          ]
        },
        {
          path: "agent",
          redirect: "/agent/apps",
          children: [
            {
              path: "apps",
              name: "场景智能体",
              component: () => import("@/pages/agent/apps/index.vue")
            },
            {
              path: "models",
              name: "模型",
              component: () => import("@/pages/agent/models/index.vue")
            },
            {
              path: "tools",
              name: "智能体工具",
              component: () => import("@/pages/agent/tools/index.vue")
            },
            {
              path: "mcp",
              name: "MCP 服务",
              component: () => import("@/pages/agent/mcp/index.vue")
            },
            {
              path: "digitals",
              name: "官方数字伙伴",
              component: () => import("@/pages/agent/digitals/index.vue")
            }
          ]
        },
        {
          path: "release",
          redirect: "/release/apps",
          children: [
            {
              path: "apps",
              name: "版本发布",
              component: () => import("@/pages/release/apps/index.vue")
            }
          ]
        },
        {
          path: "data",
          redirect: "/data/client-log",
          children: [
            {
              path: "client-log",
              name: "日志",
              component: () => import("@/pages/data/clientLog/index.vue")
            }
          ]
        },
        {
          path: "assets",
          redirect: "/assets/files",
          children: [
            {
              path: "files",
              name: "文件存储",
              component: () => import("@/pages/assets/files/index.vue")
            },
            {
              path: "emoji",
              redirect: "/assets/emoji/list",
              children: [
                {
                  path: "list",
                  name: "表情包列表",
                  component: () => import("@/pages/assets/emojis/index.vue")
                },
                {
                  path: "packages",
                  name: "表情包合集",
                  component: () => import("@/pages/assets/emoji-packages/index.vue")
                }
              ]
            }
          ]
        },
        {
          path: "system",
          children: [
            {
              path: "roles",
              name: "角色权限",
              component: () => import("@/pages/system/roles/index.vue")
            },
            {
              path: "admins",
              name: "管理员",
              component: () => import("@/pages/system/admins/index.vue")
            },
            {
              path: "online",
              name: "连接监控",
              component: () => import("@/pages/system/online/index.vue")
            }
          ]
        }
      ]
    },
    {
      path: "/login",
      name: "登录",
      component: () => import("@/pages/common/login/index.vue")
    },
    {
      path: "/redirect/:path(.*)",
      name: "重定向",
      component: () => import("@/pages/common/redirect/index.vue")
    },
    {
      path: "/error/404",
      name: "404",
      component: () => import("@/pages/common/error/404.vue")
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/error/404"
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.path === "/login") {
    next()
    return
  }
  if (!userStore.isLoggedIn) {
    next("/login")
    return
  }
  next()
})

export default router
