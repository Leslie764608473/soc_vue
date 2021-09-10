<template>
	<view class="indexMain" >
		<view class="rf-search-bar" id="socTopView">
			<!-- <view class="header" :style="{width: width+'px', marginTop: inputTop+'px'}"></view> -->
			<view class="contentBox">
				<image class="logo" :src="NowLogo"></image>
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
		<!-- <productSD class="homeView" :style="{paddingTop: messageHeight+'px',height: 'calc(100vh - '+messageHeight+'px)'}" ref="productSd"></productSD> -->
		<productSD class="homeView" :messageHeight="messageHeight" :style="{height: 'calc(100vh - '+messageHeight+'px)'}" ref="productSd"></productSD>
	</view>
</template>
<script>

	import LXLogo from '@/static/LX.png';
	import HBLogo from '@/static/HB.jpg';
	import SDLogo from '@/static/shandong/logo.jpg';

	import socTop from '@/components/soc-top/index'
	import productSD from '@/pages/index/product/index.vue'

	import rfProductList from '@/components/rf-product-list';
	import rfLoadMore from '@/components/rf-load-more/rf-load-more';
	import { getMessage } from '@/api/userInfo';
	import {productList} from '@/api/product';
	import {logout} from '@/api/login.js';


	export default {
		components: {
			socTop,
			productSD
		},
		data() {
			return {
				NowLogo: null,
				height: 0,
				width: 0,
				inputTop: 0,
				downFlag: false,
				messageData: {},
				messageHeight: 221,
				hasLogin: false,
				userInfo: this.$mStore.getters.userObj,
			};
		},
		onShow(options) {

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
			this.initMessage();
			setTimeout(()=>{
				this.hasLogin = this.$mStore.getters.hasLogin;
				this.userInfo = this.$mStore.getters.userObj;
				this.$forceUpdate();

				if(options.orgId) {
					if(this.hasLogin) {
						if(this.userInfo.orgId != options.orgId) {
							this.toLogout();
							this.$mStore.commit('setOrgId',options.orgId);
						} else {
							this.$mStore.commit('setOrgId',options.orgId);
						}
					} else {
						this.$mStore.commit('setOrgId',options.orgId);
					}
				} else {
					this.$mStore.commit('setOrgId',this.$mStore.getters.orgId);
				}
				this.$forceUpdate();
			},500);

			let obj = {};
			// #ifdef MP-WEIXIN
			obj = wx.getMenuButtonBoundingClientRect();
			// #endif
			uni.getSystemInfo({
				success: (res) => {
					this.width = obj.left || res.windowWidth;
					this.height = obj.top ? (obj.top + obj.height + 320) : (res.statusBarHeight + 44);
					this.inputTop = obj.top ? (obj.top + (obj.height - 10) / 2) : (res.statusBarHeight + 7);
				}
			});
			this.$refs.productSd.initList();
		},
		methods: {
			toLogout(orgId) {
				this.$http.post(`${logout}`,{},{params: {orgId : this.userInfo.orgId, username : this.userInfo.username}}).then(() => {
					this.$mStore.commit('logout');
					/* uni.reLaunch({
						url: '/pages/index/index?orgId='+orgId
					}); */
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
				this.$http.post(`${getMessage}`,{},{params: {orgId : this.$mStore.getters.orgId}})
				.then( r => {
					this.$mStore.commit('setMessageData',r.data.data[0]);
					if(r.data.data[0].orgLogo == "LX") {
						this.NowLogo = LXLogo;
					} else if(r.data.data[0].orgLogo == "SD") {
						this.NowLogo = SDLogo;
					} else if(r.data.data[0].orgLogo == "HB") {
						this.NowLogo = HBLogo;
					}
					this.messageData = r.data.data[0];


					this.changeHeight();
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
		background-color: #f8f8f8;
	}
</style>
