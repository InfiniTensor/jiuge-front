//静态资源获取，解决vite打包不识别静态资源路径问题
export function getAssetsFile(url){
    return  new URL(`/src/assets/${url}`, import.meta.url).href
}



