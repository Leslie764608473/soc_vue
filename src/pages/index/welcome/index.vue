<template>
	<view class="welcomeMain">
		<image src="https://datalinc.oss-cn-shenzhen.aliyuncs.com/mall/images/2021-09/k7lkux444o1632135048000" class="mainBgImg"></image>
		<view class="loading" v-if="loadingFlag">
				<cover-image class="loadingImg" src="https://wecarecard.oss-cn-hongkong.aliyuncs.com/mall/images/2021-09/f9pkb7fqz5r1631775970000"></cover-image>
		</view>
		<view class="logoBox">
			<image src="../../../static/allLogo.png"></image>
			<view class="name">連心</view>
			<view class="title">用心聯繫會員，拉近彼此距離</view>
		</view>
		<view class="btnBox">
				<button class="wx_btn" open-type="getUserInfo" lang="zh_CN" @tap="appLoginWx">
					<image class="wxicon" src="https://datalinc.oss-cn-shenzhen.aliyuncs.com/mall/images/2021-09/tj87z7gn2v1632135229000"></image>
					<text>微信用戶一鍵登錄</text>
					</button>
				<button class="mobile_btn" @tap="mobile_login">手機號碼登錄</button>
		</view>
	</view>
</template>
<script>
import { getSessionKeyOrOpenId,wechatLogin,verifyAccessToken } from '@/api/login';
import moment from '@/common/moment';
import qs from 'qs'
export default {
	data() {
		return {
			loadingFlag: true,
			appId : this.$mStore.getters.appId,
			secret: this.$mStore.getters.secret,
			openId: "",
			session_key: "",
			userObj: {},
			userInfoAll: "",
			wxLoginParams: {},
			detailType: null,
			detailId: null,
			detailOrgId: null
		};
	},
	onShow() {
		uni.hideTabBar();
		if(this.$mStore.getters.hasLogin) {
			setTimeout(()=>{
				this.$mRouter.reLaunch({ route: '/pages/index/index?choseSoc=1' });
			},1000);
		} else {
			this.loadingFlag = false;
		}
	},
	onLoad(options) {
		var type = options.type;
		if(type && (type == 1 || type == 2)) {
			this.detailType = type;
			this.detailId = options.id;
			this.detailOrgId = options.orgId;
		}
		this.isAuth();
	},
	onHide() {
		uni.showTabBar();
	},
	methods: {
		mobile_login() {
			if(this.detailType != null) {
				this.$mRouter.push({ route: '/pages/index/mobile/index?type=1&detailType=' + this.detailType + '&id=' + this.detailId + '&orgId=' + this.detailOrgId });
			} else {
				this.$mRouter.push({ route: '/pages/index/mobile/index?type=1' });
			}
		},
		wechatLogin() {
			this.wxLoginParams = Object.assign({}, this.userObj);
			this.wxLoginParams.openid = this.openId;
			this.wxLoginParams.sessionkey = this.session_key;
			this.wxLoginParams.userInfo = this.userInfoAll;
			this.$http.post(wechatLogin,this.wxLoginParams).then((res) => {
				if(res.code == 200) {
					uni.setStorageSync('accessToken', res.data.tokenHead+""+res.data.token);
					uni.setStorageSync('refreshToken',res.data.tokenHead+""+res.data.token);

					this.$http.get(verifyAccessToken).then((r) => {
						if(r.status) {
							if(r.msg.wechatStatus == 1) {
								// 已綁定手機號
								this.$mStore.commit('login',{
									Token: res.data.tokenHead+""+res.data.token,
									UserInfo: r.msg
								});
								if(this.detailType != null) {
									this.$mRouter.reLaunch({ route: '/pages/index/index?choseSoc=0&type=' + this.detailType + '&id=' + this.detailId + '&orgId=' + this.detailOrgId });
								} else {
									this.$mRouter.reLaunch({ route: '/pages/index/index?choseSoc=1' });
								}
							} else {
								// 未綁定手機號
								uni.setStorageSync('wxLoginParams', JSON.stringify(this.wxLoginParams));
								if(this.detailType != null) {
									this.$mRouter.push({ route: '/pages/index/mobile/index?type=2&detailType=' + this.detailType + '&id=' + this.detailId + '&orgId=' + this.detailOrgId});
								} else {
									this.$mRouter.push({ route: '/pages/index/mobile/index?type=2' });
								}
							}
						} else {
							uni.showToast({title:"網絡異常，請檢查網絡後後再試",icon:"none"});
						}
					})
				} else {
					uni.showToast({title:"登錄失敗",icon:"none"});
				}
			});
		},
		getSessionKeyOrOpenIdFn(js_code) {
			this.$http.post(getSessionKeyOrOpenId,{},{params:{
				appid : this.appId,
				js_code : js_code,
				secret : this.secret,
			}}).then((res) => {
					let openId = JSON.parse(res.data).openid;
					let session_key = JSON.parse(res.data).session_key;
					this.openId = openId;
					this.session_key = session_key;
					this.$mStore.commit('setOpenid',openId);
					this.$mStore.commit('setSession_key',session_key);

					this.wechatLogin();

			});
		},
		isAuth() {
			uni.getSetting({
				 success(res) {
					 if (!res.authSetting['scope.userInfo']) {
								//这里调用授权
					 } else {
								//用户已经授权过了
					 }
				 }
			 })
		},
		toWxLogin() {
			uni.login({
					provider: 'weixin',
					success: (res) => {
						this.getSessionKeyOrOpenIdFn(res.code);
					},
					fail: () => {
							uni.showToast({title:"微信登錄授權失敗",icon:"none"});
					}
			})
		},
		appLoginWx() {
			uni.getUserProfile({
				desc:'weixin',
				success:res=>{
					let obj = Object.assign({}, res.userInfo);
					this.userObj = obj;
					this.userInfoAll = JSON.stringify(res);
					this.$mStore.commit('setWx_userInfo',res);
					this.toWxLogin();
				},
				fail:err=>{
					uni.showToast({title:"微信登錄授權失敗",icon:"none"});
				}
			})
		},
	}
};
</script>
<style lang="scss" scoped>
	.mainBgImg{
		position: fixed;
		width: 100vw;
		height: 100vh;
	}
	.welcomeText{

	}
	.loading{
		width: 100vw;
		height: 100vh;
		position: absolute;
		background: white;
		z-index: 99999;
		top: 0;
		left: 0;
		.loadingImg{
			display: block;
			width: 250rpx;
			height: 250rpx;
			margin: 300rpx auto;
		}
	}
.welcomeMain{
	display: inline-block;
	width: 100%;
	min-height: 100vh;
	height: 100%;
	background-color: white;
	position: absolute;
	z-index: 10;
	.logoBox{
		display: block;
		margin: 250rpx auto 170rpx auto;
		text-align: center;
		color: white;
		position: relative;
		image{
			width: 160rpx;
			height: 160rpx;
		}
			.name{
				font-size: 45rpx;
				margin: 10rpx;
				font-weight: 500;
			}
			.title{
				font-size: 30rpx;
			}
	}

	.btnBox{
		position: fixed;
		bottom: 100rpx;
		width: 100vw;
		button{
			display: block;
			width: 85vw;
			margin: 30rpx auto;
			color: white;
			height: 100rpx;
			line-height: 100rpx;
			&::after{
				border: none;
				border-radius: 25rpx;
			}
			&.wx_btn{
				/* background: linear-gradient(to right,#1eb2ff,#1797fb,#0f7df7);
				&.button-hover{
					background: linear-gradient(to left,#1eb2ff,#1797fb,#0f7df7);
					color: white;
				} */
				background-color: #08e06f;
				color: white;
				.wxicon{
					width: 50rpx;
					height: 50rpx;
					vertical-align: middle;
					margin-right: 20rpx;
				}
			}
			&.mobile_btn{
				background: none;
				color: white;
				&::after{
					border: 1px solid #ffffff;
				}
				/* &.button-hover{
					background-color: #d9d9d9;
					color: white;
				} */
			}
		}
	}

}
</style>
