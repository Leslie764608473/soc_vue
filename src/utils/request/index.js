/* eslint-disable */
import Request from './request';
import { verifyAccessToken } from '@/api/login';
import indexConfig from '@/config/index.config';
import mHelper from '@/utils/helper';
import store from '@/store';

const http = new Request();

// request全局参数设置
http.setConfig(config => {
	/* 设置全局配置 */
	config.baseUrl = indexConfig.baseUrl; /* 根域名不同 */
	const systemInfo = uni.getSystemInfoSync();
	const systemInfoHeaders = {
		'device-name': systemInfo.brand, // 设备名称
		width: systemInfo.screenWidth, // 屏幕宽度
		height: systemInfo.screenHeight, // 屏幕高度
		os: systemInfo.platform, // 客户端平台
		'os-version': systemInfo.system // 操作系统版本
	};
	config.header = {
		...config.header,
		...systemInfoHeaders
	};
	return config;
});

let isRefreshing = false;
let requests = [];
http.interceptor.request(
	config => {
		/* 请求之前拦截器 */
		console.log(config.url)
		console.log(store.state.socUrlArr);
		if(store.state.socUrlArr.indexOf(config.url) == -1) {
			config.header['Authorization'] = uni.getStorageSync('orgAccessToken');
		} else {
			config.header['Authorization'] = uni.getStorageSync('accessToken');
		}

		//config.header['Authorization'] = uni.getStorageSync('accessToken');
		// 单商户
		// config.header['merchant-id'] = uni.getStorageSync('merchantId') || 1;
		return config;
	},
	error => {
		return Promise.reject(error);
	}
);

// 刷新refreshToken
async function handleRefreshToken(refresh_token) {
	const params = {};
	params.group = mHelper.platformGroupFilter();
	params.refresh_token = refresh_token;
	await http.get(verifyAccessToken).then(async r => {
		//store.commit('login', refresh_token,r.msg);
		isRefreshing = false;
	});
}
http.interceptor.response(
	async response => {
		/* 请求之后拦截器 */
		if(response.data.status) {
			return response.data;
		}
		switch (response.data.code) {
			case 200:
				return response.data;
			case 400:
				mHelper.toast('错误的请求');
				return Promise.reject(response.data.message);
				break;
			case 401:
				isRefreshing = false;
				// refreshToken 的返回状态为401
				if (response.config.url === refreshToken) {
					uni.removeStorageSync('accessToken');
					await store.commit('logout');
					uni.showModal({
						content: '会话已过期，是否跳转登录页面？',
						success: confirmRes => {
							if (confirmRes.confirm) {
								mHelper.backToLogin();
								throw response.data.message;
							}
						}
					});
					break;
				} else {
					// 如果refreshToken为空 则直接跳转登录
					if (!store.state.refreshToken) {
						uni.removeStorageSync('accessToken');
						await store.commit('logout');
						uni.showModal({
							content: '会话已过期，是否跳转登录页面？',
							success: confirmRes => {
								if (confirmRes.confirm) {
									mHelper.backToLogin();
									throw response.data.message;
								}
							}
						});
						throw response.data.message;
					} else {
						// isRefreshing同一个页面只执行一次
						if (!isRefreshing) {
							isRefreshing = true;
							// 刷新token
							await handleRefreshToken(store.state.refreshToken, response);
							requests.forEach(cb => cb());
							requests = [];
							isRefreshing = false;
							return http.request(response.config);
						} else {
							return new Promise(resolve => {
								// 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
								requests.push(() => {
									resolve(http.request(response.config));
								});
							});
						}
					}
				}
				break;
			case 405:
				mHelper.toast('当前操作不被允许');
				return Promise.reject(response.data.message);
			case 404:
				mHelper.toast(response.data.message);
				return Promise.reject(response.data.message);
			case 429:
				mHelper.toast('请求过多，先休息一下吧');
				return Promise.reject(response.data.message);
			case 500:
				if(response.config.url == "/receive/getServiceByMid") {
					return response.data;
				}
				mHelper.toast(response.data.message);
				return Promise.reject(response.data.message);
		}
	},
	error => {
		return Promise.reject(error);
	}
);

export { http };
