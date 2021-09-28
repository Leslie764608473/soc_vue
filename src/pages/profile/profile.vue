<template>
	<view class="user">
		<!--头部-->
		<view class="user-section">
			<view class="imgBox" :style="{'background-image':'url('+my_bg+')'}" ></view>
			<view :style="{top:(statusBarHeight+10)+'px'}" class="userTitle">個人中心</view>
			<!--用户信息-->
			<view class="user-info-box">
				<view
					class="portrait-box"

				>
					<image v-if="hasLogin" class="portrait" :src="orgUserInfo.umsMember.icon || headImg" ></image>
					<image v-if="!hasLogin" class="portrait" :src="userInfo.icon || headImg" ></image>
					<view class="userInfoTBox" v-if="hasLogin">
						<view class="userInfoT" @tap="navTo(userInfo ? '/pages/user/userinfo/userinfo' : 'login')">
							{{orgUserInfo.umsMember.nickname || '登錄/註冊'}}
						</view>
						<view v-if="orgId == 46" class="userInfoT">{{orgUserInfo.umsMember.memberNum}}</view>
						<view v-else class="userInfoT">{{orgUserInfo.username}}</view>
					</view>
					<view class="userInfoTBox" v-if="!hasLogin">
						<view class="userInfoT" v-if="userInfo.nickname">
							{{userInfo.nickname}}
						</view>
						<view class="userInfoT">{{userInfo.mobile}}</view>
					</view>
				</view>
				<uni-icons v-if="hasLogin" @tap="navTo(hasLogin ? '/pages/user/userinfo/userinfo' : '')" type="arrowright" color="#ffffff" class="downIcon" size="20"></uni-icons>
			</view>
		</view>


		<view class="bottomBox">
			<view class="myBoxItem" @tap="navTo('/pages/user/coupon/coupon')">
				<image class="item_image" :src="my_fuli"></image>
				<view class="item_text">
					<text>我的福利</text>
					<view class="itemNum" v-if="flNum != 0">{{flNum}}</view>
				</view>
			</view>
			<view class="myBoxItem" style="margin-top: 20rpx;" @tap="navTo('/pages/activity/index')">
				<image class="item_image" :src="my_huodong"></image>
				<view class="item_text">
					<text>我的活動</text>
					<view class="itemNum" v-if="flNum != 0">{{flNum}}</view>
				</view>
			</view>
			<!-- <view class="myBoxItem" style="margin-top: 20rpx;" @tap="navTo('/pages/user/mysoc/index')">
				<image class="item_image" :src="my_shetuan"></image>
				<view class="item_text">
					<text>我的社團</text>
					<view class="itemNum" v-if="flNum != 0">{{flNum}}</view>
				</view>
			</view> -->
			<view class="logOutBtn" @tap="toLogout">
				<image :src="logoutIcon" style="width: 32rpx;height: 32rpx;vertical-align: middle;margin-right: 10rpx;" mode=""></image>
				<text style="color: #1185f8;vertical-align: middle;">退出登錄</text>
			</view>
		</view>

	</view>
</template>
<script>
	import logoutIcon from './icon/logout.png';
	import my_fuli from './icon/my_fuli.jpg';
	import my_bg from './icon/my_bg.jpg';
	import my_huodong from './icon/my_huodong.jpg';
	import my_shetuan from './icon/my_shetuan.jpg';
import { footPrintList, memberInfo, notifyUnRreadCount } from '@/api/userInfo';
import {verifyAccessToken,logout} from '@/api/login.js';
import listCell from '@/components/rf-list-cell';
import { mapMutations } from 'vuex';
import rfBadge from '@/components/rf-badge/rf-badge';
import $mAssetsPath from '@/config/assets.config';
let startY = 0, moveY = 0, pageAtTop = true;
export default {
	components: {
		listCell,
		rfBadge
	},
	data() {
		return {
			flNum: 0,
			cartNum: 0,
			orderNum: 0,
			activityNum: 0,
			orderSectionList: this.$mConstDataConfig.orderSectionList,
			amountList: this.$mConstDataConfig.amountList,
			isOpenLiveStreaming: this.$mSettingConfig.isOpenLiveStreaming,
			headImg: this.$mAssetsPath.headImg,
			vipCardBg: this.$mAssetsPath.vipCardBg,
			arc: this.$mAssetsPath.arc,
			coverTransform: 'translateY(0px)',
			coverTransition: '0s',
			moving: false,
			userInfo: this.$mStore.getters.userObj,
			orgUserInfo: this.$mStore.getters.orgUserInfo,
			footPrintList: [], // 足迹列表
			loading: true,
			appName: this.$mSettingConfig.appName,
			hasLogin: false,
			orgId: null,
			currentLanguage: this._i18n.locale === 'zh' ? 'English' : '中文',
			statusBarHeight: 0,
			logoutIcon: logoutIcon,
			my_fuli: my_fuli,
			my_huodong: my_huodong,
			my_shetuan: my_shetuan,
			my_bg: my_bg
		};
	},
	filters: {
		filterMemberLevel(val) {
      if (!val) return '普通用户';
			return val.name;
		},
		marketingTypeTag(marketingType) {
			let tag;
			switch (marketingType) {
				case 'discount':
					tag = $mAssetsPath.discountTag;
					break;
				case 'bargain':
					tag = $mAssetsPath.bargainTag;
					break;
				case 'group_buy':
					tag = $mAssetsPath.groupTag;
					break;
				case 'wholesale':
					tag = $mAssetsPath.wholesaleTag;
					break;
			}
			return tag;
		}
	},
  computed: {
    // 判断推广中心是否显示 当有分销商信息的时候显示
    settingItemShowFilter() {
      return function (val) {
        let type = 'block';
        if (val === '推广中心' && this.userInfo.promoter) {
          type = 'none';
        } else if (val === '直播' && !this.isOpenLiveStreaming) {
          type = 'none';
        }
        return type;
      };
    },
		settingList() {
			return [
				{ icon: 'iconshezhi3', url: '/pages/set/set', title: "設置", color: '#ff6b81' }
			];
		}
  },
	// 小程序分享
	onShareAppMessage() {
		return {
			title: `歡迎來到${this.appName}`,
			path: '/pages/index/index?choseSoc=1&orgId=' + this.$mStore.getters.orgId
		};
	},
	onLoad() {
		let obj = {};
		// #ifdef MP-WEIXIN
		obj = wx.getMenuButtonBoundingClientRect();
		// #endif
		uni.getSystemInfo({
			success: (res) => {
				this.statusBarHeight = res.statusBarHeight;
			}
		});

		this.initData();
	},
	async onShow() {
		// 初始化数据
		//await this.initData();
	},
	// #ifndef MP
	onNavigationBarButtonTap(e) {
		const index = e.index;
		if (index === 0) {
			this.navTo('/pages/set/set');
		} else if (index === 1) {
			// #ifdef APP-PLUS
			// eslint-disable-next-line
			const pages = getCurrentPages();
			const page = pages[pages.length - 1];
			const currentWebview = page.$getAppWebview();
			currentWebview.hideTitleNViewButtonRedDot({
				index
			});
			// #endif
			this.$mRouter.switchTab({ route: '/pages/notify/notify' });
		}
	},
	// #endif
	methods: {
		// 切换语言
		switchLanguage() {
			if (this._i18n.locale === 'zh') {
				this._i18n.locale = 'en';
				this.currentLanguage = '中文';
			} else if (this._i18n.locale === 'en') {
				this._i18n.locale = 'zh';
				this.currentLanguage = 'English';
			}
			this.initData();
			this.$mStore.commit('setLocale', this._i18n.locale);
			uni.setNavigationBarTitle({ title: this._i18n.t('menu.my') });
			uni.setTabBarItem({ index: 0, text: this._i18n.t('menu.index') });
			uni.setTabBarItem({ index: 1, text: this._i18n.t('menu.category') });
			/* uni.setTabBarItem({ index: 2, text: this._i18n.t('menu.notify') });
			uni.setTabBarItem({ index: 3, text: this._i18n.t('menu.cart') }); */
			uni.setTabBarItem({ index: 2, text: this._i18n.t('menu.my') });
		},
		toLogout() {
			uni.showModal({
				content: '確定要退出登錄嗎？',
				success: e => {
					if (e.confirm) {
							this.$mStore.commit('logout');
							this.$mStore.commit('logoutOrg');
							this.$mRouter.reLaunch({ route: '/pages/index/welcome/index'});
					}
				}
			});

		},
		...mapMutations(['setNotifyNum', 'setCartNum']),
		// 分享
    share() {
			const url = `${this.$mConfig.hostUrl}/pages/index/index`;
      // #ifdef H5
			this.$mHelper.h5Copy(url);
			// #endif
      // #ifdef APP-PLUS
			const shareImg = `${this.$mSettingConfig.appLogo}`;
			this.$mHelper.handleAppShare(url, this.appName, `欢迎来到${this.appName}`, shareImg);
			// #endif
		},
		//...mapMutations(['login']),
		// 数据初始化
		async initData() {
			this.hasLoginOrg = this.$mStore.getters.hasLoginOrg;
			this.hasLogin = this.$mStore.getters.hasLogin;

			if(this.hasLogin) {
				// 社團登錄

			} else {
				// 社團未登錄

			}

			this.orgId = this.$mStore.getters.orgId;
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
		},
		// 设置未读消息个数
		async initNotifyNum () {
      await this.$http.get(notifyUnRreadCount).then(r => {
        this.setNotifyNum(r.data.count);
      });
    },
		// 清空个人中心的各模块状态
		resetSectionData() {
			this.userInfo = {};
			uni.removeTabBarBadge({ index: this.$mConstDataConfig.cartIndex });
			uni.removeTabBarBadge({ index: this.$mConstDataConfig.notifyIndex });
			this.amountList[0].value = 0;
			this.amountList[1].value = 0;
			this.amountList[2].value = 0;
			this.orderSectionList[0].num = 0;
			this.orderSectionList[1].num = 0;
			this.orderSectionList[2].num = 0;
			this.orderSectionList[3].num = 0;
			this.orderSectionList[4].num = 0;
		},
		// 给个人中心的各模块赋值
		setSectionData(data) {
			const orderSynthesizeNumArr = [];
			for (let item in data.order_synthesize_num) {
				orderSynthesizeNumArr.push(data.order_synthesize_num[item]);
			}
			for (let i = 0; i < this.orderSectionList.length; i++) {
				this.orderSectionList[i].num = orderSynthesizeNumArr[i].toString();
			}
			this.amountList[0].value = data.account.user_money || 0;
			this.amountList[1].value = data.coupon_num || 0;
			this.amountList[2].value = data.account.user_integral || 0;
			// 更新userInfo缓存
			uni.setStorageSync('userInfo', data);
		},
		// 获取足迹列表
		async getFootPrintList() {
			await this.$http.get(`${footPrintList}`).then(r => {
				this.footPrintList = r.data;
			});
		},
		// 统一跳转接口,拦截未登录路由
		navTo(route) {
			if (!route) return;
			if(!this.hasLogin) {
				this.$mRouter.reLaunch({ route: '/pages/index/welcome/index'});
				return false;
			} else {
				if(!this.hasLoginOrg) {
					this.$mRouter.push({ route: '/pages/public/register' });
					return false;
				}
			}
			this.$mRouter.push({ route });
			/* if(!this.hasLogin) {
				this.$mRouter.push({ route: '/pages/public/register' });
				//uni.showToast({title:"您還未加入本社團！",icon:"none"});
			} else {
				this.$mRouter.push({ route });
			} */
		},
		/**
		 *  会员卡下拉和回弹
		 *  1.关闭bounce避免ios端下拉冲突
		 *  2.由于touchmove事件的缺陷（以前做小程序就遇到，比如20跳到40，h5反而好很多），下拉的时候会有掉帧的感觉
		 *    transition设置0.1秒延迟，让css来过渡这段空窗期
		 *  3.回弹效果可修改曲线值来调整效果，推荐一个好用的bezier生成工具 http://cubic-bezier.com/
		 */
		coverTouchstart(e) {
			if (pageAtTop === false) {
				return;
			}
			this.coverTransition = 'transform .1s linear';
			startY = e.touches[0].clientY;
		},
		coverTouchmove(e) {
			moveY = e.touches[0].clientY;
			let moveDistance = moveY - startY;
			if (moveDistance < 0) {
				this.moving = false;
				return;
			}
			this.moving = true;
			if (moveDistance >= 80 && moveDistance < 100) {
				moveDistance = 80;
			}
			if (moveDistance > 0 && moveDistance <= 80) {
				this.coverTransform = `translateY(${moveDistance}px)`;
			}
		},
		coverTouchend() {
			if (this.moving === false) {
				return;
			}
			this.moving = false;
			this.coverTransition = 'transform 0.3s cubic-bezier(.21,1.93,.53,.64)';
			this.coverTransform = 'translateY(0px)';
		},
		// 跳转至商品详情
		navToProduct(type, id) {
			let route = `/pages/product/product?id=${id}`;
			switch (type) {
				case 'discount':
					route = `/pages/marketing/discount/product?id=${id}`;
					break;
				case 'bargain':
					route = `/pages/marketing/bargain/product?id=${id}`;
					break;
				case 'group_buy':
					route = `/pages/marketing/group/product?id=${id}`;
					break;
				case 'wholesale':
					route = `/pages/marketing/wholesale/product?id=${id}`;
					break;
			}
			this.$mRouter.push({ route });
		}
	}
};
</script>
<style lang="scss" scoped>
page {
	background-color: white;
}
.bottomBox{
	height: calc(100vh - 380rpx);
	background-color: white;
	.myBoxItem{
		margin-top: -310rpx;
		width: calc(100vw - 50rpx);
		position: relative;
		z-index: 10;
		margin-left: 25rpx;
		background-color: white;
		padding: 15rpx;
		border-radius: 20rpx;
		.item_image{
			width: 200rpx;
			height: 156rpx;
			border-radius: 20rpx;
			display: inline-block;
			vertical-align: middle;
		}
		.item_text{
			display: inline-block;
			vertical-align: middle;
			display: inline-block;
			width: calc(100% - 200rpx);
			font-size: 32rpx;
			color: #333333;
			padding-left: 40rpx;
			margin-top: -30rpx;
		}
	}
}
.logOutBtn{
	width: calc(100vw - 50rpx);
	border-radius: 20rpx;
	padding: 28rpx 0;
	background-color: white;
	position: relative;
	top: 50rpx;
	text-align: center;
	font-weight: 500;
	border: 1px solid #1185f8;
	margin-left: 25rpx;
}
.userTitle{
	color: white;
	font-size: 38rpx;
	position: absolute;
	z-index: 1;
}
.imgBox{
		width: 100%;
		height: 100%;
		background-position: 100% 100%;
		background-repeat: no-repeat;
		background-size: cover;
		position: absolute;
		top: 0;
		left: 0;
	}
.user {
	.user-section {
		height: 690rpx;
		padding: 100upx 30upx 0;
		position: relative;
		background-color: #0081ff;
		.bg {
			position: absolute;
			left: 0;
			top: 0;
			width: 100vw;
			height: 60vw;
			opacity: 1;
		}
		.user-info-box {
			height: 180rpx;
			display: flex;
			align-items: center;
			position: relative;
			z-index: 1;
			justify-content: space-between;
			margin-top: 50rpx;
			.portrait-box {
				width: 80vw;
				margin-left: 20rpx;
				.portrait {
					width: 130rpx;
					height: 130rpx;
					border: 5rpx solid #fff;
					border-radius: 15rpx;
					margin-right: 20rpx;
					float: left;
				}
				.userInfoTBox{
					float: left;
					width: calc(100% - 150rpx);
				}
				.userInfoT{
					width: 100%;
					font-size: 38rpx;
					display: block;
					height: 65rpx;
					line-height: 65rpx;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					color: white;
				}
				.username {
					font-size: $font-lg + 6upx;
					color: $color-white;
					margin-left: 20upx;
				}

				button {
					background-color: transparent;
					font-size: $font-lg + 6upx;
					color: $font-color-dark;
					border: none;
				}

				button::after {
					border: none;
				}
			}
		}

	}

}
%flex-center {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}
%section {
	justify-content: space-around;
	display: flex;
	align-content: center;
	background: #fff;
	border-radius: 10upx;
}
</style>
