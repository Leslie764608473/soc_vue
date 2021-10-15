const CONFIG = {
    // 开发环境配置
    development: {
			orgId: 46,
        assetsPath: '/static', // 静态资源路径
				baseUrl: 'https://socface02.newsinfohk.com', // 后台接口请求地址
				//baseUrl: 'https://testface02.newsinfohk.com',
				//baseUrl: 'http://2.1.2.29:11002',
				hostUrl: 'https://testface02.newsinfohk.com', // H5地址(前端运行地址)
        websocketUrl: '', // websocket服务端地址
        weixinAppId: '' // 微信公众号appid
    },
    // 生产环境配置
    production: {
				orgId: 46,
        assetsPath: '/static', // 静态资源路径
        //baseUrl: 'https://socface02.newsinfohk.com', // 后台接口请求地址
				baseUrl: 'https://testface02.newsinfohk.com', // 后台接口请求地址
        hostUrl: 'https://testface02.newsinfohk.com', // H5地址(前端运行地址)
        websocketUrl: '', // websocket服务端地址
        weixinAppId: '' // 微信公众号appid
    }
};
export default CONFIG[process.env.NODE_ENV];
