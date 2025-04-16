import type { UserConfig } from '@/types/userConfig'
import { inject, requestExtender } from '@net-vert/core'
import { poolConfig } from './default'
// @ts-ignore
import type { TaskQueue } from ".pnpm/id-queue@1.0.10/node_modules/id-queue";

export const initPool = (cfg: UserConfig) => {
    const { parallelCount, retries } = cfg
    const { requestor, concurrentPool } = requestExtender.concurrentPoolRequestor({
        ...poolConfig,
        parallelCount,
        retries
    })
    return {
        pool: concurrentPool,
        requestor
    }
}

export const initRequest = (cfg: UserConfig) => {
    const { request } = cfg
    // 注入依赖
    inject(request)
}