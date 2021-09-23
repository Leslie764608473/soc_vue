<template>
	<view class="rf-search-bar">
		<view class="header" :style="{width: width+'px', marginTop: inputTop+'px'}"></view>
		<view class="contentBox">
			<!-- <image class="logo" src="../../static/shandong/logo.jpg"></image> -->
			<view class="logoLeft">
				<view class="st_name">香港山東社團總會</view>
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
			<uni-icons v-if="!downFlag" @tap="downFlagFn" type="arrowdown" color="#4f4f4f" class="downIcon" size="20"></uni-icons>
			<uni-icons v-if="downFlag" @tap="downFlagFn" type="arrowup" color="#4f4f4f" class="downIcon" size="20"></uni-icons>
		</view>
	</view>
</template>
<script>
	// #ifdef H5
	import jweixin from '@/common/jweixin';
	// #endif
	import { productVirtualVerificationVerify,getMessage } from '@/api/userInfo';
	import {verifyAccessToken} from '@/api/login.js';
	import uniIcons from '@/components/uni-icons/uni-icons.vue';
	export default {
		props: {},
		components: {
			uniIcons
		},
		data() {
			return {
				height: 0,
				width: 0,
				inputTop: 0,
				followNum: 0,// 社團關注人數
				downFlag: false,
				messageData: {},
				hasLogin: false,
				userInfo: this.$mStore.getters.userObj
			};
		},
		onLaunch(options) {
			/* if(options.orgId) {
				this.$mStore.commit('setOrgId',options.orgId);
				this.$mStore.commit('setOrgId',1);
			} */
		},
		created() {
			setTimeout(()=>{
				this.hasLogin = this.$mStore.getters.hasLogin;
				this.messageData = this.$mStore.getters.messageData;
				this.userInfo = this.$mStore.getters.userObj;
				this.$forceUpdate();
			},500);

			let obj = {};
			// #ifdef MP-WEIXIN
			// eslint-disable-next-line
			obj = wx.getMenuButtonBoundingClientRect();
			// #endif
			uni.getSystemInfo({
				success: (res) => {
					this.width = obj.left || res.windowWidth;
					this.height = obj.top ? (obj.top + obj.height + 320) : (res.statusBarHeight + 44);
					this.inputTop = obj.top ? (obj.top + (obj.height - 10) / 2) : (res.statusBarHeight + 7);
				}
			});
		},
		methods: {
			downFlagFn() {
				this.downFlag = !this.downFlag;
				if(this.downFlag) {
					this.$parent.$refs.productSd.height = this.height+590;
				} else {
					this.$parent.$refs.productSd.height = this.height;
				}
			},
			toSTDetail() {
				this.$mRouter.push({ route: '/pages/stDetail/stDetail' });
			},
			toRegister() {
				this.$mRouter.push({ route: '/pages/public/registerFirst' });
				//this.$mRouter.push({ route: '/pages/public/register' });
			},
			goFollow() {
				this.$mRouter.push({ route: '/pages/public/login' });
			}
		}
	};
</script>
<style lang="scss">
.rf-search-bar {
	position: fixed;
	width: 100%;
	top: 0;
	left: 0;
	z-index: 10;
	background-color: white;
	color: #000000;
	padding-bottom: 80rpx;
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
			&:first-child{
				flex: 2;
				margin-right: 10rpx;
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
</style>
