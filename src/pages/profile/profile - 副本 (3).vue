<template>
	<view class="user">
		<!--头部-->
		<view class="user-section" :class="'bg-' + themeColor.name">
			<view class="imgBox" :style="{'background-image':'url('+userBg+')'}" ></view>
			<view :style="{top:(statusBarHeight+10)+'px'}" class="userTitle">個人中心</view>
			<!--用户信息-->
			<view class="user-info-box">
				<view
					class="portrait-box"

				>
					<image
						class="portrait"
						:src="userInfo.umsMember.icon || headImg"
					></image>
					<view class="userInfoTBox">
						<view class="userInfoT" @tap="navTo(userInfo ? '/pages/user/userinfo/userinfo' : 'login')">
							{{userInfo.memberName || '登錄/註冊'}}
						</view>
						<view v-if="userInfo.orgId == 46" class="userInfoT">{{userInfo.umsMember.memberNum}}</view>
						<view v-else class="userInfoT">{{userInfo.username}}</view>
					</view>
				</view>
				<uni-icons @tap="navTo(userInfo ? '/pages/user/userinfo/userinfo' : 'login')" type="arrowright" color="#ffffff" class="downIcon" size="20"></uni-icons>
			</view>
		</view>
		<!-- 个人中心 内容区-->
		<view
			class="cover-container"
			:style="[
				{
					transform: coverTransform,
					transition: coverTransition
				}
			]"
			@touchstart="coverTouchstart"
			@touchmove="coverTouchmove"
			@touchend="coverTouchend"
		>
			<!--余额 优惠券 积分信息-->
				<view class="myBoxList">
					<view class="myBoxItem" @tap="navTo('/pages/user/coupon/coupon')">
						<image style="width: 50rpx;height: 50rpx;" src="../../static/shandong/fuliIcon.png"></image>
						<text>我的福利</text>
						<view class="itemNum" v-if="flNum != 0">{{flNum}}</view>
						<uni-icons type="arrowright" class="rightIcon" color="#b3b3b3" size="20"></uni-icons>
					</view>
					<!-- <view class="myBoxItem" @tap="navTo('/pages/cart/cart')">
						<image style="width: 50rpx;height: 50rpx;" src="../../static/shandong/gwc.png"></image>
						<text>購物車</text>
						<view class="itemNum" v-if="cartNum != 0">{{cartNum}}</view>
						<uni-icons type="arrowright" class="rightIcon" color="#b3b3b3" size="20"></uni-icons>
					</view>
					<view class="myBoxItem" @tap="navTo('/pages/order/order')">
						<image style="width: 50rpx;height: 50rpx;" src="../../static/shandong/dd.png"></image>
						<text>訂單</text>
						<view class="itemNum" v-if="orderNum != 0">{{orderNum}}</view>
						<uni-icons type="arrowright" class="rightIcon" color="#b3b3b3" size="20"></uni-icons>
					</view> -->
					<view class="myBoxItem" @tap="navTo('/pages/activity/index')">
						<image style="width: 50rpx;height: 50rpx;" src="../../static/shandong/hd.png"></image>
						<text style="border-bottom: none;">我的活動</text>
						<view class="itemNum" v-if="activityNum != 0">{{activityNum}}</view>
						<uni-icons type="arrowright" class="rightIcon" color="#b3b3b3" size="20"></uni-icons>
					</view>
					<!-- <view class="myBoxItem" @tap="navTo('/pages/set/set')">
						<image style="width: 50rpx;height: 50rpx;" src="../../static/shandong/setIcon.png"></image>
						<text style="border-bottom: none;">設置</text>
						<uni-icons type="arrowright" class="rightIcon" color="#b3b3b3" size="20"></uni-icons>
					</view> -->
				</view>

				<view class="logOutBtn" @tap="toLogout" v-if="hasLogin">
					<image :src="logoutIcon" style="width: 32rpx;height: 32rpx;vertical-align: middle;margin-right: 10rpx;" mode=""></image>
					<text style="color: #f75857;vertical-align: middle;">退出登錄</text>
				</view>

		</view>

		<!--页面加载动画-->
		<rfLoading isFullScreen :active="loading"></rfLoading>
	</view>
</template>
<script>
	import logoutIcon from './icon/logout.png';
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
			userBg: this.$mAssetsPath.userBg,
			coverTransform: 'translateY(0px)',
			coverTransition: '0s',
			moving: false,
			userInfo: this.$mStore.getters.userObj,
			footPrintList: [], // 足迹列表
			loading: true,
			appName: this.$mSettingConfig.appName,
			hasLogin: false,
			currentLanguage: this._i18n.locale === 'zh' ? 'English' : '中文',
			statusBarHeight: 0,
			logoutIcon: logoutIcon
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
			path: '/pages/index/index'
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
						this.$http.post(`${logout}`,{},{params: {orgId : this.userInfo.orgId, username : this.userInfo.username}}).then(() => {
							this.$mStore.commit('logout');
							uni.reLaunch({
								url: '/pages/index/index?orgId='+this.userInfo.orgId
							});
						});
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
			this.hasLogin = this.$mStore.getters.hasLogin;
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
			if (this.hasLogin) {
				//await this.getMemberInfo();
				this.loading = false;
			} else {
				this.loading = false;
				//this.resetSectionData();
			}
		},
		// 获取用户信息
		async getMemberInfo() {
			await this.$http
				.get(verifyAccessToken)
				.then(async r => {
					this.loading = false;
					this.userInfo = r.msg;
					this.$forceUpdate();
					//await this.setCartNum(r.data.cart_num);
					//await this.initNotifyNum();
					/// 获取足迹列表
					//await this.getFootPrintList();
					//await this.setSectionData(r.data);
				})
				.catch(() => {
					this.hasLogin = false;
					this.userInfo = {};
					//this.resetSectionData();
					this.loading = false;
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
			if (route === '/pages/index/notice/notice') {
				this.$mRouter.push({ route });
			} else if (!this.hasLogin) {
				uni.removeStorageSync('backToPage');
				this.$mRouter.push({ route: '/pages/public/logintype' });
			} else {
				this.$mRouter.push({ route });
			}
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
	background-color: $page-color-base;
}
.logOutBtn{
	border-radius: 20rpx;
	    padding: 28rpx 0;
	    background-color: white;
	    position: relative;
	    top: 125rpx;
	    text-align: center;
	    font-weight: 500;
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
		height: 420upx;
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

	.cover-container {
		margin-top: -150upx;
		padding: 0 30upx 20upx;
		position: relative;
		//background-color: #0081ff;//$page-color-base;
		background: none;
		.arc {
			position: absolute;
			left: 0;
			top: -34upx;
			width: 100%;
			height: 36upx;
		}

		.promotion-center {
			background: #fff;
			margin-bottom: 20upx;
			/*分类列表*/
			.category-list {
				width: 100%;
				padding: 0 0 30upx 0;
				border-bottom: solid 2upx #f6f6f6;
				display: flex;
				flex-wrap: wrap;
				.category {
					width: 33.3%;
					margin-top: 50upx;
					display: flex;
					justify-content: center;
					flex-wrap: wrap;
					.img {
						width: 100%;
						display: flex;
						justify-content: center;

						.iconfont {
							font-size: $font-lg + 24upx;
						}
					}

					.text {
						width: 100%;
						display: flex;
						justify-content: center;
						font-size: 24upx;
						color: #3c3c3c;
					}
					.share-btn {
						height: 142upx;
						text-align: left;
						background: none;
						padding: 0;
						margin: 0;
					}

					.share-btn:after {
						border: none;
						border-radius: none;
					}
				}
			}
		}

		.tj-sction {
			@extend %section;
			display: flex;

			.tj-item {
				@extend %flex-center;
				flex: 1;
				flex-direction: column;
				margin: 30upx 0;
				font-size: $font-sm;
				color: #75787d;
				/*border-right: 2upx solid rgba(0, 0, 0, 0.2);*/
			}

			/*.tj-item:last-child {*/
			/*border-right: none;*/
			/*}*/
			.num {
				font-size: $font-base;
			}

			.red {
				color: $base-color;
			}
		}

		.myBoxList{
			border-radius: 20rpx;
			padding: 10rpx 0 10rpx 20rpx;
			background-color: white;
			position: relative;
			top: 100rpx;
			.myBoxItem{
				width: 100%;
				height: 100rpx;
				line-height: 100rpx;
				position: relative;
				image{
					display: inline-block;
					vertical-align: middle;
				}
				text{
					display: inline-block;
					width: calc(100% - 27px - 20rpx);
					border-bottom: 1px solid #d9d9d9;
					margin-left: 20rpx;
					padding-left: 5rpx;
				}
				.itemNum{
					position: absolute;
					top: 30rpx;
					right: 66rpx;
					height: 40rpx;
					width: 40rpx;
					background-color: #f75756;
					color: white;
					line-height: 40rpx;
					border-radius: 50%;
					font-size: 28rpx;
					text-align: center;
				}
				.rightIcon{
					position: absolute;
					top: 0;
					right: 10rpx;
				}
			}
		}

		.order-section {
			@extend %section;
			padding: 28upx 0;

			.order-item {
				@extend %flex-center;
				width: 120upx;
				height: 120upx;
				border-radius: 10upx;
				font-size: $font-sm;
				color: $font-color-dark;
				position: relative;
			}

			.badge {
				position: absolute;
				top: 0;
				right: 4upx;
			}

			.iconfont {
				font-size: 48upx;
			}

			.icon-shouhoutuikuan {
				font-size: 44upx;
			}
		}

		.history-section {
			background: #fff;
			margin-bottom: $spacing-sm;
			.h-list-history {
				margin: 0;
				border-radius: 10upx;
				white-space: nowrap;
				background-color: $page-color-base;
				.h-item-history {
					background-color: $color-white;
					display: inline-block;
					font-size: $font-sm;
					color: $font-color-base;
					width: 180upx;
					margin: $spacing-sm $spacing-sm 0 0;
					border-radius: 10upx;
					position: relative;
					top: 0;
					overflow: hidden;
					.h-item-img {
						width: 180%;
						height: 200upx;
						border-top-left-radius: 12upx;
						border-top-right-radius: 12upx;
						border-bottom: 1upx solid rgba(0, 0, 0, 0.01);
					}
					.tag {
						position: absolute;
						border-top-left-radius: 12upx;
						left: 0;
						right: 0;
						width: 60upx;
						height: 60upx;
					}
					.h-item-text {
						font-size: $font-sm;
						margin: $spacing-sm 4upx;
					}
				}
			}
			.no-foot-print {
				text-align: center;
				padding: 48upx 0;

				.no-foot-print-icon {
					font-size: $font-lg + 2upx;
					margin-right: 10upx;
				}
			}
			.share-btn {
				height: 102upx;
				text-align: left;
				background: none;
				padding: 0;
				margin: 0;
			}

			.share-btn:after {
				border: none;
				border-radius: none;
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
