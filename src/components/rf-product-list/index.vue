<template>
	<view class="rf-product-list">
		<view class="rf-product-list-container">
			<block v-for="(item, index) in list" :key="index">
				<!--资讯-->
				<view v-if="dataType == 0 && index%4 != 0" class="rf-product-item rf-product-itemHome rf-product-flex-list"
				 hover-class="hover" :hover-start-time="150" @tap.stop="navTo(`/pages/product/article?id=${item.id}`)">
					<view class="rf-pro-content" :class="item.coverPic?'':'rf-pro-content-noImg'">
						<view class="rf-pro-tit">{{ item.title }}</view>
						<view class="bottomText">
							<text class="bottomName" v-if="item.websiteName">來源：{{item.websiteName}}</text>
							<text class="bottomTime">{{item.pubtime | time}}</text>
						</view>
					</view>
					<view v-if="item.coverPic" class="rf-product-image-wrapper">
						<view class="imgBox" :style="{'background-image':'url('+item.coverPic+')'}" ></view>
					</view>
				</view>
				<view v-if="dataType == 0 && index%4 == 0" class="rf-product-item rf-product-itemHome"
				 hover-class="hover" :hover-start-time="150" @tap.stop="navTo(`/pages/product/article?id=${item.id}`)">
					<view class="rf-pro-content rf-pro-content-big" :class="item.coverPic?'':'rf-pro-content-noImg'">
						<view class="rf-pro-tit">{{ item.title }}</view>
						<view class="bottomText">
							<text class="bottomName" v-if="item.websiteName">來源: {{item.websiteName}}</text>
							<text class="bottomTime">{{item.pubtime | time}}</text>
						</view>
					</view>
					<view v-if="item.coverPic" class="rf-product-image-wrapper rf-product-image-wrapper-big">
						<view class="imgBox" :style="{'background-image':'url('+item.coverPic+')'}" ></view>
					</view>
				</view>
				<!--资讯-->
				<!--商品列表-->
				<view
					v-if="dataType == 1"
					class="rf-product-item rf-product-itemHome rf-product-flex-list rf-product-itemFl"
					@tap.stop="navTo(`/pages/product/product?id=${item.id}`)"
					hover-class="hover"
					:hover-start-time="150"
				>
					<view class="rf-product-image-wrapper">
						<view v-if="item.pic" class="imgBox" :style="{'background-image':'url('+item.pic+')'}" ></view>
						<image v-else :src="errorImage" mode="widthFix"></image>
					</view>
					<view class="rf-pro-content">
						<view class="rf-pro-tit">{{ item.name }}</view>
						<view class="bottomText">
							<text class="bottomName">領取時間: {{item.promotionStartTime | timeFl}}到{{item | timeFlEnd}}</text>
						</view>
						<view v-if="item.cartItemStatus != 1" class="statusBox">
							<text class="lqOk" v-if="item.getReceiveStatus == 1 || item.getStatus == 1">已領取</text>
							<text class="lqNo" v-if="item.getReceiveStatus != 1 && item.getStatus != 1">未領取</text>
							<image v-if="item.getReceiveStatus == 1 || item.getStatus == 1" style="width: 40rpx;height: 40rpx;float: right;margin-right: 20rpx;" src="../../static/shandong/erCodeIcon.png" mode=""></image>
						</view>
						<!-- <view v-if="item.brandName" style="margin-bottom: 20rpx;">
							<text style="display: inline-block;width: auto;padding: 10rpx 20rpx;background-color: #9bca38;color: white;border-radius: 10rpx;">{{item.brandName}}</text>
						</view> -->
					</view>
				</view>
				<!--商品列表-->
				<!--活動列表-->
				<view
					v-if="dataType == 2"
					class="rf-product-item rf-product-flex-list rf-product-itemFl"
					@tap.stop="activityNavTo(item.id,item.apply_status)"
					hover-class="hover"
					:hover-start-time="150"
				>
					<view class="rf-product-image-wrapper">
						<view class="imgBox" v-if="item.cover_pic" :style="{'background-image':'url('+item.cover_pic+')'}" ></view>
						<image v-else :src="errorImage" mode="widthFix"></image>
					</view>
					<view class="rf-pro-content" style="justify-content:start !important">
						<view class="rf-pro-tit" style="font-size: 28rpx;">{{ item.title }}</view>
						<!-- <view  class="bottomText" v-if="!hasLoginOrg">
							<text class="bottomName">{{item.activity_type}}</text>
							<text class="right">{{item.pub_time | time}}</text>
						</view> -->
						<view class="statusBox" style="margin-top: 20rpx;">
							<text class="hd_noStart" v-if="item.apply_status < 0">未報名</text>
							<text class="hd_noStart" v-if="item.apply_status == 0">正在審核中</text>
							<text class="hd_noStart" v-if="item.apply_status == 1">已報名</text>
							<text class="hd_no" v-if="item.apply_status == 2">審核未通過</text>
							<text class="hd_noStart" v-if="item.activity_timeFilter">活動未開始報名</text>
							<text class="hd_over" v-if="item.apply_status == 3">報名活動已結束</text>
							<text class="hd_over" v-if="item.apply_status == 5">活動已結束</text>
						</view>
						<!-- <view v-else class="statusBox" style="margin-top: 20rpx;">
							<text class="hd_noStart" v-if="item.activity_timeFilter">活動未開始報名</text>
						</view> -->
					</view>
				</view>
				<!--活動列表-->
				<!--社團列表-->
				<view
					v-if="dataType == 3"
					class="rf-product-item rf-product-flex-list rf-product-itemFl"
					@tap.stop="socNavTo(item.id)"
					hover-class="hover"
					:hover-start-time="150"
				>
					<view class="rf-product-image-wrapper-soc">
						<image  :src="item.logo" class="logoImg"></image>
					</view>
					<view class="rf-pro-content-soc">
						<view class="socName">{{item.name}}</view>
					</view>
				</view>
				<!--社團列表-->
			</block>
		</view>

	</view>
</template>
<script>

import { productDetail, cartItemCount, cartItemCreate } from '@/api/product';
import {loginNot,verifyAccessToken} from '@/api/login';
import rfAttrContent from '@/components/rf-attr-content';
import moment from '@/common/moment';
import $mAssetsPath from '@/config/assets.config';
import { mapMutations } from 'vuex';
export default {
	name: 'rfProductList',
	props: {
		list: {
			type: Array,
			default() {
				return [];
			}
		},
		// 是否以列表展示 | 列表或大图
		isList: {
			type: Boolean,
			default: false
		},
		showType: {
			type: Number,
			default: 0
		},
		dataType: {
			type: Number,
			default: 0
		},
		// 是否以列表展示 | 列表或大图
		bottom: {
			type: Number,
			default: 0
		}
	},
	components: {
		rfAttrContent
	},
	onLoad(options) {
		let orgId = options.orgId;
		if(orgId && orgId != this.$mStore.getters.orgId) {
			this.$mStore.commit('setOrgId',orgId);
		}
	},
	created() {
		setTimeout(()=>{
			this.hasLoginOrg = this.$mStore.getters.hasLoginOrg;
		},500);
	},
	data() {
		return {
			specClass: 'none',
      moneySymbol: this.moneySymbol,
			productDetail: {},
			errorImage: this.$mAssetsPath.errorImage,
			hasLoginOrg : this.$mStore.getters.hasLoginOrg,
			userInfo: this.$mStore.getters.userObj,
		};
	},
	filters: {
		timeFlEnd(val) {
			let yearS = moment(val.promotionStartTime).format('YYYY');
			let yearE = moment(val.promotionEndTime).format('YYYY');
			if(yearS == yearE) {
				return moment(val.promotionEndTime).format('MM.DD');
			} else {
				return moment(val.promotionEndTime).format('YYYY.MM.DD');
			}
		},
		timeFl(val) {
			return moment(val).format('YYYY.MM.DD');
		},
		time(val) {
			let year = moment(val).format('YYYY');
			if(year == moment().format('YYYY')) {
				return moment(val).format('MM.DD');
			} else {
				return moment(val).format('YYYY-MM-DD');
			}
		},
		filterTotalSales(val) {
			if (val > 10000) {
				val = `${(val / 10000).toFixed(2)}w`;
			}
			return val;
		},
		filterTagName(val) {
			if (val.commissionRate) {
				// 分销商品
				return $mAssetsPath.distribution;
			} else if (val.is_virtual === '1') {
				// 虚拟产品
				return $mAssetsPath.virtual;
			} else if (val.shipping_type === '1') {
				// 包邮产品
				return $mAssetsPath.pinkage;
			}
		}
	},
	methods: {
		// 跳转详情
		navTo(route) {
			console.log(route)
			this.$mRouter.push({ route });
		},
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

		socNavTo(id) {
			//this.$mRouter.reLaunch({ route: `/pages/index/index?orgId=${id}` });
			this.toLogin(id);
		},
		activityNavTo(id,status) {
			if(this.showType == 0) {
				this.navTo(`/pages/product/activity?id=${id}`)
			} else {
				this.navTo(`/pages/product/activityShow?id=${id}`)
			}
		}
	}
};
</script>
<style scoped lang="scss">
	.hover{
		background-color: #f0f0f0 !important;
	}
	.rf-product-list {
		background-color: #f0f2f2 !important;
		padding: 0;
	}

	.rf-product-image-wrapper{
		width: 250rpx;
		height: 166.667rpx;
	}
	.rf-product-image-wrapper-soc{
		width: 150rpx !important;
		height: 150rpx !important;
		.logoImg{
			width: 100%;
			height: 100%;
			border-radius: 50%;
		}
	}
	.rf-pro-content-soc{
		width: calc(100% - 150rpx);
		padding: 0;
		.socName{
			font-size: 33rpx;
			color: #333333;
			font-weight: 500;
			height: 150rpx;
			line-height: 150rpx;
			padding-left: 30rpx;
		}
	}
	.rf-pro-content{
		width: calc(100% - 250rpx);
		padding: 0 20rpx 0 0;
		.rf-pro-tit{
			color: #333333;
			font-size: 32rpx;
			font-weight: 550;
			height: auto;
		}
	}
	.rf-pro-content-big{
		width: 100%;
		.bottomText {
			margin: 12rpx 0;
			.bottomName{
				max-width: 500rpx !important;
			}
		}
	}
	.rf-pro-content-noImg{
		width: 100%;
		.bottomText {
			margin: 20rpx 0 0 0 !important;
		}
	}
	.rf-product-image-wrapper-big{
		width: 660rpx !important;
		height: 371.25rpx !important;
	}
	.imgBox{
		width: 100%;
		height: 100%;
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
	}

	.statusBox{
		position: relative;
		text{
			padding: 10rpx 15rpx;
			color: white;
			font-size: 24rpx;
			border-radius: 10rpx;
		}
		.lqOk{
			background-color: #0f7df7;
		}
		.lqNo{
			background-color: #f75857;
		}
		.hd_over{
			background-color: #f5f5f5;
			color: #999999;
		}
		.hd_noStart{
			background-color: #e7f2fe;
			color: #0f7df7;
		}
		.hd_no{
			background-color: #feeeee;
			color: #f75756;
		}
	}

	.rf-product-item{
		padding: 30rpx 20rpx;
		margin-bottom: 25rpx !important;
		&.rf-product-itemHome{
			margin-top: 0 !important;
			margin-bottom: 25rpx !important;
			background-color: white !important;
		}
		.rf-pro-content{
			justify-content: flex-start !important;
		}
	}
	.rf-product-itemFl{
		padding: 20rpx 18rpx;
		.rf-pro-content{
			padding: 0 0 0 20rpx;
			justify-content: space-between !important;
			.bottomName{
				max-width: 100%;

			}
		}
	}
	.bottomText{
		white-space: normal;
		color: #999999;
		overflow: hidden;
		font-size: 25rpx;
		margin: 10rpx 0;
		.bottomName{
			display: inline-block;
			max-width: 250rpx;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
			float: left;
			margin-right: 35rpx;
		}
		.bottomTime{
			float: left;
		}
	}
</style>
