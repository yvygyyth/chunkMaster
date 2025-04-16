export const xhrRequestor = <R = any, D = any>(config: {
    url: string;
    method: string;
    data?: D;
    onUploadProgress?: (progressEvent: ProgressEvent) => void;
    signal?: AbortSignal;
}): Promise<R> => {
    return new Promise((resolve, reject) => {
        // 创建 XHR 对象
        const xhr = new XMLHttpRequest();

        // 打开连接
        xhr.open(config.method, '/api' + config.url, true);

        // 设置请求头
        if (!(config.data instanceof FormData)) {
            // 只有非FormData数据才手动设置Content-Type
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        }

        // 监听上传进度
        if (config.onUploadProgress) {
            xhr.upload.addEventListener('progress', config.onUploadProgress);
        }

        // 处理请求完成
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = xhr.responseText ? JSON.parse(xhr.responseText) : null;
                    resolve(response as R);
                } catch (error) {
                    reject(new Error('Invalid JSON response'));
                }
            } else {
                reject(new Error(`Request failed with status: ${xhr.status}`));
            }
        };

        // 处理网络错误
        xhr.onerror = () => {
            reject(new Error('Network error'));
        };

        // 支持中止请求
        if (config.signal) {
            // 如果信号已经中止，立即中止请求
            if (config.signal.aborted) {
                xhr.abort();
                return reject(new Error('Request aborted'));
            }

            // 监听中止事件
            config.signal.addEventListener('abort', () => {
                xhr.abort();
                reject(new Error('Request aborted'));
            });
        }
        
        // 发送请求
        const body = config.data ? config.data : null;

        // @ts-ignore
        xhr.send(body);
    });
};