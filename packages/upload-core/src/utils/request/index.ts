import { request } from './imp'
import { inject, requestExtender } from '@net-vert/core'
inject(request)

const {
    requestor,
    concurrentPool
} = requestExtender.concurrentPoolRequestor()

export {
    requestor,
    concurrentPool
}