// config.ts
import type { UploadConfig } from '@/types/libConfig'
import type { UserConfig } from '@/types/userConfig'
import { fileUploadConfig } from './default'
import { initPool, initRequest } from './init'
import { mergeObjects } from '@/utils'
// 内部保存配置
let UPLOAD_CONFIG: UploadConfig

// 初始化配置，合并默认值
const config = (cfg: UserConfig) => {
    initRequest(cfg)
    const { pool, requestor } = initPool(cfg)
    const {
        pool:P, parallelCount, retries, request,
        ...otherConfig
    } = cfg

    UPLOAD_CONFIG = {
        ...mergeObjects(fileUploadConfig, otherConfig),
        pool
    }

    return {
        requestor 
    }
}

export { config, UPLOAD_CONFIG }
