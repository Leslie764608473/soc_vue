<template>
	<view class="indexMain">
		<noLogin v-if="!hasLogin && NowOrgId == null"></noLogin>
		<view v-else :style="{'padding-top': inputTop+'px'}">
						<view class="rf-search-bar" id="socTopView">
							<view v-if="!hasLogin" :style="{'top': backTop+'px'}" class="noLoginBack">
								<image @tap="backAll" class="backLogo" :src="allLogo"></image>
								<!-- <uni-icons @tap="backAll" type="home" color="#4f4f4f" size="30"></uni-icons> -->
							</view>
				<view class="contentBox">
					<image class="logo" :src="messageData.orgLogo"></image>
					<view class="logoLeft">
						<view class="st_name">{{messageData.orgName}}</view>
					</view>
					<view class="logoRight">
						<button v-if="!hasLogin" type="default" @tap="toRegister" class="bColor logoBtn">申請加入</button>
					</view>
				</view>
				<view class="st_jianjie">
					<view :class="{'turnOpen': downFlag}">
						<view class="introBox" v-html="messageData.intro"></view>
						<text @tap="toSTDetail" v-if="downFlag" class="lookBtn">查看詳情</text>
					</view>
					<uni-icons v-if="!downFlag" @tap="toSTDetail" type="arrowdown" color="#4f4f4f" class="downIcon" size="20"></uni-icons>
					<uni-icons v-if="downFlag" @tap="downFlagFn" type="arrowup" color="#4f4f4f" class="downIcon" size="20"></uni-icons>
				</view>
			</view>
			<productSD class="homeView" :messageHeight="messageHeight" :style="{'height': 'calc(100vh - '+(messageHeight+50)+'px)'}" ref="productSd"></productSD>
		</view>

		<!-- <rfLoading isFullScreen :active="initLoading"></rfLoading> -->
	</view>
</template>
<script>
	import allLogo from '@/static/SOC_logo.png'

	import socTop from '@/components/soc-top/index'
	import productSD from '@/pages/index/product/index.vue'
	import noLogin from '@/pages/index/noLogin/index.vue'

	import rfProductList from '@/components/rf-product-list';
	import rfLoadMore from '@/components/rf-load-more/rf-load-more';
	import { getMessage } from '@/api/userInfo';
	import {productList} from '@/api/product';
	import {logout,verifyAccessToken,login,loginNot} from '@/api/login.js';

	export default {
		components: {
			socTop,
			noLogin,
			productSD
		},
		data() {
			return {
				allLogo: allLogo,
				initLoading: true,
				NowOrgName: "",
				NowOrgId: null,
				height: 0,
				width: 0,
				inputTop: 0,
				downFlag: false,
				messageData: {},
				messageHeight: 221,
				backTop: 44,
				hasLogin: false,
				userInfo: this.$mStore.getters.userObj,
			};
		},
		onShow(options) {

		},
		onTabItemTap(item) {
			// && !this.hasLogin
		    if(item.index == 1) {
					this.backAll();
				}
		},
		onShareAppMessage: function() {
			return {
			 title: 'soc連心',
			 path: '/pages/index/index?orgId=' + this.$mStore.getters.orgId,
			}
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.$refs.productSd.dataParams.pageNum = 1;
			this.$refs.productSd.dataList = [[],[],[]];
			this.$refs.productSd.initList("refresh");
			this.initMessage();
		},
		// 加载更多
		onReachBottom() {
			if(this.$refs.productSd.loadingType == "nomore") return;
			this.$refs.productSd.dataParams.pageNum++;
			this.$refs.productSd.initList();
		},
		onLoad(options) {
			let obj = {};
			// #ifdef MP-WEIXIN
			obj = wx.getMenuButtonBoundingClientRect();
			// #endif
			uni.getSystemInfo({
				success: (res) => {
					this.backTop = res.statusBarHeight;
					this.inputTop = obj.top ? (obj.top + obj.height) : (res.statusBarHeight + 44);
				}
			});

			setTimeout(()=>{
				this.hasLogin = this.$mStore.getters.hasLogin;
				this.userInfo = this.$mStore.getters.userObj;
				this.$forceUpdate();

				if(this.hasLogin) {
					// 登錄狀態
					this.initLoading = false;
					if(options.orgId) {
						// 連接帶 orgId
						if(this.userInfo.umsMember.orgIdList.indexOf(parseFloat(options.orgId)) == -1) {
							this.toLogout();
							this.$mStore.commit('setOrgId',options.orgId);
							this.NowOrgId = options.orgId;
						} else {
							if(this.userInfo.umsMember.orgId == options.orgId) {
								// 當前社團一致
								this.$mStore.commit('setOrgId',options.orgId);
								this.NowOrgId = options.orgId;
							} else {
								// 當前社團不一致  重新登錄
								this.toLogin(options.orgId);
								return false;
							}
						}
					} else {
						// 連接不帶 orgId
						this.NowOrgId = this.$mStore.getters.orgId;
					}
					this.initAllOne();
				} else {
					// 非登錄狀態
					if(options.orgId) {
						// 連接帶 orgId
						this.$mStore.commit('setOrgId',options.orgId);
						this.NowOrgId = options.orgId;
					} else {
						// 連接不帶 orgId
						this.NowOrgId = null;
					}
					this.initAll();
				}
				this.$forceUpdate();
			},500);
		},
		methods: {
			toLogin(orgChoseId) {
				let uuid = this.getUuid();
				let login_param = {};
				login_param = {
					username: this.userInfo.umsMember.mobile,
					orgId: orgChoseId,
					onlyUuid: uuid
				}
				this.$http
					.post(loginNot,{},{params:login_param})
					.then(res => {
						if(res.code == 200) {
							uni.setStorageSync('accessToken', res.data.tokenHead+""+res.data.token);
							uni.setStorageSync('refreshToken',res.data.tokenHead+""+res.data.token);
							this.$http.get(verifyAccessToken).then((r) => {
									this.$mStore.commit('login',{
										Token: res.data.tokenHead+""+res.data.token,
										UserInfo: r.msg
									});

									setTimeout(()=>{
										this.$mStore.commit('setOrgId',orgChoseId);
										this.$mRouter.reLaunch({ route: `/pages/index/index?orgId=${orgChoseId}` });
									},500);

							})
						}
					}).catch(() => {

					});
			},
			getUuid() {
				 	var s = [];
			    var hexDigits = "0123456789abcdef";
			    for (var i = 0; i < 36; i++) {
			        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
			    }
			    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
			    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
			    s[8] = s[13] = s[18] = s[23] = "-";
			    var uuid = s.join("");
			    return uuid;
			},
			backAll() {
				this.NowOrgId = null;
				uni.setNavigationBarColor({
				    frontColor: '#ffffff',
				    backgroundColor: '#ff0000',
				    animation: {
				        duration: 400,
				        timingFunc: 'easeIn'
				    }
				});
				uni.hideTabBar();
			},
			initAllOne() {
				uni.showTabBar();
				this.initLoading = false;
				this.initMessage();
				uni.setNavigationBarColor({
				    frontColor: '#000000',
				    backgroundColor: '#ff0000',
				    animation: {
				        duration: 400,
				        timingFunc: 'easeIn'
				    }
				})
				setTimeout(()=>{
					this.changeHeight();
					this.$refs.productSd.initList();
				},500);
			},
			initAll() {
				this.initLoading = false;
				if(this.NowOrgId == null) {
					uni.setNavigationBarColor({
					    frontColor: '#ffffff',
					    backgroundColor: '#ff0000',
					    animation: {
					        duration: 400,
					        timingFunc: 'easeIn'
					    }
					})
					uni.hideTabBar();
					return false;
				}
				this.initMessage();
				uni.showTabBar();
				uni.setNavigationBarColor({
				    frontColor: '#000000',
				    backgroundColor: '#ff0000',
				    animation: {
				        duration: 400,
				        timingFunc: 'easeIn'
				    }
				})
				uni.showLoading();
				setTimeout(()=>{
					uni.hideLoading();
					this.changeHeight();
					this.$refs.productSd.initList();
				},500);
			},
			toLogout(orgId) {
				this.$http.post(`${logout}`,{},{params: {orgId : this.userInfo.orgId, username : this.userInfo.username}}).then(() => {
					this.$mStore.commit('logout');
				});
			},
			changeHeight() {
				const query = uni.createSelectorQuery().in(this);
				query.select('#socTopView').boundingClientRect(data => {
					this.messageHeight = data.height;
					this.$forceUpdate();
				}).exec();
			},
			initMessage() {
				let orgId = (this.NowOrgId == null)? 48 : this.NowOrgId
				this.$http.post(`${getMessage}`,{},{params: {orgId : orgId}})
				.then( r => {
					this.$mStore.commit('setMessageData',r.data.data[0]);
					this.messageData = r.data.data[0];
					this.$forceUpdate();
				})
				.catch(err => {

				});
			},
			downFlagFn() {
				setTimeout(()=>{
					this.changeHeight();
				},10);
				this.downFlag = !this.downFlag;
			},
			toSTDetail() {
				this.$mRouter.push({ route: '/pages/stDetail/stDetail' });
			},
			toRegister() {
				this.$mRouter.push({ route: '/pages/public/registerFirst' });
				//this.$mRouter.push({ route: '/pages/public/register' });
			},
		}
	};
</script>
<style lang="scss">
	page {
		background-color: $page-color-base;
	}
	.indexMain{
		background-color: $color-white;
	}
</style>
<style lang="scss" scoped>
	.noLoginBack{
		position: absolute;
		left: 20rpx;
		.backLogo{
			width: 70rpx;
			height: 70rpx;
		}
	}
	.rf-search-bar {
		/* position: fixed;
		width: 100%;
		top: 0;
		left: 0;
		z-index: 10; */
		background-color: white;
		color: #000000;
		padding-bottom: 50rpx;
		.bColor{
			color: #0f7df7;
		}
		.header {
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 12;
			padding-bottom: 10upx;
			height: 60upx;
			line-height: 60upx;
		}
		.contentBox{
			background-color: white;
			padding: 0 20rpx;
			display: flex;
			align-items: flex-start;
			justify-content: center;
			.logo{
				width: 130rpx;
				height: 130rpx;
			}
			.logoLeft{
				flex: 4;
				height: 130rpx;
				line-height: 130rpx;
				color: #333333;
				padding-left: 10rpx;
				.st_name{
					font-size: 37rpx;
					height: 65rpx;
					line-height: 130rpx;
					font-weight: bolder;
				}
				.st_gz{
					font-size: 20rpx;
					height: 65rpx;
					line-height: 65rpx;
					view{
						display: inline-block;
					}
					.bColor{
						margin-left: 25rpx;
					}
				}
			}
			.logoBtn{
				display: inline-block;
				font-size: 25rpx;
				font-weight: 500;
				height: 65rpx;
				line-height: 65rpx;
				margin-top: 35rpx;
				flex: 1;
				background-color: #f0f2f2;
				&:first-child{
					flex: 2;
					margin-right: 10rpx;
				}
				&::after{
					border: none !important;
				}
			}
		}

		.st_jianjie{
			padding: 0 40rpx;
			margin: 0;
			font-size: 25rpx;
			position: relative;
			view{
				width: calc(100% - 20rpx);
				overflow: hidden;
				-webkit-line-clamp: 2;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				height: 90rpx;
				color: #333333;
				.introBox{
					font-size: 30rpx;
					white-space: pre-wrap;
					word-wrap: break-word;
				}
				&.turnOpen{
					height: auto;
					position: relative;
					.introBox{
						height: 100%;
						display: block;
						-webkit-line-clamp: 100;
						text-overflow: initial;
						-webkit-box-orient: initial;
					}
				}
			}
			.lookBtn{
				position: absolute;
				bottom: 0;
				right: 40rpx;
				font-size: 30rpx;
				color: #0f7df7;
			}
			.downIcon{
				position: absolute;
				right: 20rpx;
				top: 10rpx;
			}
		}
	}
	.homeView{
		display: block;
		background-color: #f0f2f2;
	}
</style>
