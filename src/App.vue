<script>
/* eslint-disable */
import Vue from 'vue';
import { verifyAccessToken } from '@/api/login';
import { getMessage } from '@/api/userInfo';
import { mapMutations } from 'vuex';
export default {
	async onLaunch(option) {
		await this.initData();
	},
	onShow() {

	},
	onShareAppMessage: function() {
		return {
		 title: 'soc連心',
		 path: '/pages/index/index?orgId=' + this.$mStore.getters.orgId,
		}
	},
	methods: {
		...mapMutations(['setCartNum', 'setNotifyNum']),
		// 数据初始化
		async initData() {
			uni.setTabBarStyle({
				selectedColor: this.themeColor.color,
				borderStyle: 'white'
			});
			this.themeColor.tabList && this.themeColor.tabList.forEach((selectedIconPath, index) => {
				uni.setTabBarItem({
					index,
					selectedIconPath
				});
			});
			// 获取页面设置配置
			const token = uni.getStorageSync('accessToken');
			// 获取系统title高度
			await this.initSystemInfo();
			if (token) {
				await this.handleVerifyAccessToken(token);
			}
		},
		// 初始化系统信息
		initSystemInfo() {
			uni.getSystemInfo({
				success(e) {
					// #ifndef MP
					Vue.prototype.StatusBar = e.statusBarHeight;
					if (e.platform === 'android') {
						Vue.prototype.CustomBar = e.statusBarHeight + 50;
					} else {
						Vue.prototype.CustomBar = e.statusBarHeight + 43;
					}
					// #endif
					// #ifdef MP-WEIXIN
					Vue.prototype.StatusBar = e.statusBarHeight;
					// eslint-disable-next-line
					const custom = wx.getMenuButtonBoundingClientRect();
					Vue.prototype.Custom = custom;
					Vue.prototype.CustomBar = custom.top - e.statusBarHeight;
					// #endif
					// #ifdef MP-ALIPAY
					Vue.prototype.StatusBar = e.statusBarHeight;
					Vue.prototype.CustomBar = e.statusBarHeight + e.titleBarHeight;
					// #endif
				}
			});
		},
		// 检验token是否有效
		async handleVerifyAccessToken (token) {
			  await this.$http.get(verifyAccessToken).then((r) => {
						if(r.status) {
							this.$mStore.commit('loginOrg',{
								Token: token,
								UserInfo: r.msg
							});
						}
			  });
		}
	}
};
</script>
<style lang="scss">
// 导入colorUI
@import '/static/css/colorui/main.css';
@import '/static/css/colorui/icon.css';
@import '/static/css/colorui/animation.css';
// 导入阿里巴巴矢量图标库
/*#ifdef MP*/
@import './static/css/iconfont/iconfont.css';
@import './static/css/iconfont/iconfontSOC.css';
/*#endif*/
/*#ifndef MP*/
@import url('https://at.alicdn.com/t/font_1681579_dwilkcq6mvg.css');
/*#endif*/
@import './static/css/reset.scss';
@import './static/css/uni.scss';
</style>
