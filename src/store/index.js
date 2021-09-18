import Vue from 'vue';
import Vuex from 'vuex';
import $mConstDataConfig from '@/config/constData.config';
import $mSettingConfig from '@/config/setting.config';

Vue.use(Vuex);
const ACCESSTOKEN = uni.getStorageSync('accessToken') || '';
const ORGACCESSTOKEN = uni.getStorageSync('orgAccessToken') || '';
const REFERRER = uni.getStorageSync('referrer') || '';
const USER = uni.getStorageSync('user') || {};
const REFRESHTOKEN = uni.getStorageSync('refreshToken') || '';
const GLOBALCONFIG = uni.getStorageSync('globalConfig') || {};
const CARTNUM = uni.getStorageSync('cartNum') || 0;
const NOTIFYNUM = uni.getStorageSync('notifyNum') || 0;
const IMHISTORY = uni.getStorageSync('imHistory') || [];
const IMNOREAD = uni.getStorageSync('imNoRead') || 0;
const THEMECOLOR = uni.getStorageSync('themeColor');
const LOCALE = uni.getStorageSync('locale') || 'zh';
const ORGID = uni.getStorageSync('orgId') || 48;
const ORGLIST = uni.getStorageSync('orgList') || [];

const MESSAGEDATA = uni.getStorageSync('messageData') || {};

const OPENID = uni.getStorageSync('openid') || '';
const SESSIONKEY = uni.getStorageSync('session_key') || '';
const WXUSERINFO = uni.getStorageSync('wx_userInfo') || {};

const ORGUSERINFO = uni.getStorageSync('orgUserInfo') || {};

const store = new Vuex.Store({
	state: {
		// 用户token
		accessToken: ACCESSTOKEN,
		orgAccessToken: ORGACCESSTOKEN,
		orgId: ORGID,
		orgList: ORGLIST,
		socName: "香港山東社團總會",
		// 用户信息
		userInfo: USER,
		// 推荐人
		referrer: REFERRER,
		// 小程序openid
		openid: OPENID,
		wx_userInfo: WXUSERINFO,
		session_key: SESSIONKEY,
		appId: 'wx368905d55ac733da',
		secret: 'c06d0cfaeab3b7c04c5e45ece907ba01',
		// 网络状态，用于下载提醒
		networkState: 'unknown',
		globalConfig: GLOBALCONFIG,
		refreshToken: REFRESHTOKEN,
		// 购物车数字角标
		cartNum: CARTNUM,
		// 消息中心数字角标
		notifyNum: NOTIFYNUM,
		// 历史聊天消息，仅保存最后100条
		imHistory: IMHISTORY,
		// 当前未读聊天消息数量
		imNoRead: IMNOREAD,
		// 当前是否处于聊天面板
		isImPanel: false,
		// 当前是否人工客服服务
		isStuffService: false,
		themeColor: THEMECOLOR,
		// 国际化
		locale: LOCALE,
		userObj: USER,
		orgUserInfo: ORGUSERINFO,
		messageData: MESSAGEDATA,
		socUrlArr: [
			"/soc/sso/getOrgLis",
			"/soc/sso/verifyUserToken"
		],
	},
	getters: {
		socUrlArr: state => {
			return state.socUrlArr
		},
		wx_userInfo: state => {
			return state.wx_userInfo
		},
		openid: state => {
			return state.openid
		},
		appId: state => {
			return state.appId
		},
		secret: state => {
			return state.secret
		},
		orgList: state => {
			return state.orgList;
		},
		orgId: state => {
			return state.orgId;
		},
		socName: state => {
			return state.socName;
		},
		// 国际化
		locale: state => {
			return state.locale;
		},
		userObj: state => {
			return state.userObj;
		},
		orgUserInfo: state => {
			return state.orgUserInfo;
		},
		// 社團信息
		messageData: state => {
			return state.messageData;
		},
		// 全局配置
		themeColor: state => {
			let theme = state.themeColor;
			if (!theme) {
				theme = $mConstDataConfig.themeList.filter((item) => item.name === ($mSettingConfig.styleType || 'rf'))[0];
			}
			theme = {
				title: 'soc',
				name: 'blue',
				color: '#0081ff',
				tabList: [
					'/static/tab/home_select.png',
					'/static/SOC_logo.png',
					'/static/tab/my_select.png',
				]
			}
			return theme;
		},
		// 全局配置
		globalConfig: state => {
			return state.globalConfig;
		},
		// 获取网络状态
		networkStatus: state => {
			return state.networkState;
		},
		// 判断用户是否登录--平台
		hasLogin: state => {
			return !!state.accessToken;
		},
		// 判断用户是否登录--平台
		hasLoginOrg: state => {
			return !!state.orgAccessToken;
		}
	},
	mutations: {
		setWx_userInfo(state,wx_userInfo) {
			state.wx_userInfo = wx_userInfo;
			uni.setStorageSync('wx_userInfo', wx_userInfo);
		},
		setOpenid(state,openid) {
			state.openid = openid;
			uni.setStorageSync('openid', openid);
		},
		setSession_key(state,session_key) {
			state.session_key = session_key;
			uni.setStorageSync('session_key', session_key);
		},
		setOrgList(state,orgList) {
			state.orgList = orgList;
			uni.setStorageSync('orgList', orgList);
		},
		setOrgId(state,orgId) {
			state.orgId = orgId;
			uni.setStorageSync('orgId', orgId);
		},
		loginOrg(state,Obj) {
			state.accessToken = Obj.Token;
			state.refreshToken = Obj.Token;
			state.orgAccessToken = Obj.Token;
			state.orgUserInfo = Obj.UserInfo;
			uni.setStorageSync('orgUserInfo', Obj.UserInfo);
			uni.setStorageSync('orgAccessToken', Obj.Token);
			uni.setStorageSync('accessToken', Obj.Token);
			uni.setStorageSync('refreshToken',Obj.Token);
		},
		logoutOrg(state) {
			state.orgAccessToken = '';
			state.orgUserInfo = {}
			uni.removeStorageSync('orgAccessToken');
		},
		login(state,Obj) {
			state.accessToken = Obj.Token;
			state.refreshToken = Obj.Token;
			state.user = Obj.UserInfo;
			state.userObj = Obj.UserInfo;
			uni.setStorageSync('user', Obj.UserInfo);
			uni.setStorageSync('accessToken', Obj.Token);
			uni.setStorageSync('refreshToken',Obj.Token);
		},
		logout(state) {
			state.accessToken = '';
			state.refreshToken = '';
			//state.userInfo = {};
			state.user = {}
			state.userObj = {}
			uni.removeStorageSync('accessToken');
			uni.removeTabBarBadge({ index: $mConstDataConfig.notifyIndex });
			uni.removeTabBarBadge({ index: $mConstDataConfig.cartIndex });
			uni.removeStorageSync('refreshToken');
			//uni.removeStorageSync('userInfo');
			uni.removeStorageSync('user');
		},
		setMessageData(state,messageData) {
			state.messageData = messageData;
			uni.setStorageSync('messageData', messageData);
		},
		setUserObj(state,userObj) {
			state.orgUserInfo = userObj;
			uni.setStorageSync('orgUserInfo', userObj);
		},
		setReferrer(state, referrer) {
			state.referrer = referrer;
			uni.setStorageSync('referrer', referrer);
		},
		setOpenId(state, openId) {
			state.openId = openId;
			uni.setStorageSync('openId', openId);
		},
		setNetworkState(state, provider) {
			state.networkState = provider;
		},
		setCartNum(state, provider) {
			state.cartNum = provider;
			uni.setStorageSync('cartNum', provider);
			if (!provider || parseInt(provider, 10) === 0) {
				uni.removeTabBarBadge({
					index: $mConstDataConfig.cartIndex
				});
			} else {
				uni.setTabBarBadge({
					index: $mConstDataConfig.cartIndex,
					text: provider.toString()
				});
			}
		},
		setNotifyNum(state, provider) {
			state.notifyNum = provider;
			uni.setStorageSync('notifyNum', provider);
			if (parseInt(provider, 10) === 0) {
				uni.removeTabBarBadge({
					index: $mConstDataConfig.notifyIndex
				});
			} else {
				uni.setTabBarBadge({
					index: $mConstDataConfig.notifyIndex,
					text: provider.toString()
				});
			}
		},
		setGlobalConfig(state, provider) {
			state.globalConfig = provider;
			uni.setStorageSync('globalConfig', provider);
		},
		addImHistory(state, provider) {
			if (provider) {
				let data = state.imHistory;
				data.push(provider);
				uni.setStorageSync('imHistory', data);
				state.imHistory = data;
				if (!state.isImPanel) {
					this.commit('addImNoRead', 1);
				}
			}
		},
		clearImHistory(state) {
			state.imHistory = [];
			uni.setStorageSync('imHistory', []);
			state.imNoRead = 0;
			uni.setStorageSync('imNoRead', 0);
		},
		addImNoRead(state, provider) {
			state.imNoRead = state.imNoRead + provider;
			// if (state.imNoRead > $mAppConfig.imHisotryNum) {
			// 	state.imNoRead = $mAppConfig.imHisotryNum;
			// }
			uni.setStorageSync('imNoRead', state.imNoRead);
		},
		setIsImPanel(state, provider) {
			state.isImPanel = provider;
			if (provider) {
				state.imNoRead = 0;
				uni.setStorageSync('imNoRead', 0);
			}
		},
		setIsStuffService(state, provider) {
			state.isStuffService = provider;
		},
		setThemeColor(state, val) {
			state.themeColor = val;
			uni.setStorageSync('themeColor', val);
		},
		setLocale(state, val) {
			state.locale = val;
			uni.setStorageSync('locale', val);
		}
	},
	actions: {
		globalConfigChange({ commit }, info) {
			commit('setGlobalConfig', info);
		},
		networkStateChange({ commit }, info) {
			commit('setNetworkState', info);
		},
		logoutOrg({ commit }) {
			commit('logoutOrg');
		},
		logout({ commit }) {
			commit('logout');
		}
	}
});

export default store;
