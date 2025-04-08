import type { UserConfig } from '@/types/userConfig'
import { inject, requestExtender } from '@net-vert/core'
import { poolConfig } from './default'

export const initPool = (cfg: UserConfig) => {
    const { pool, parallelCount, retries } = cfg
    if(pool){
        return {
            pool,
            requestor:undefined
        }
    }else{
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
}

export const initRequest = (cfg: UserConfig) => {
    const { request } = cfg
    // 注入依赖
    inject(request)
}