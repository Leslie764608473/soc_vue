<template>
	<view class="noLoginMain">
		<image class="bgTopImg" :src="noLoginBg"></image>
		<view class="bgTop">
			<image src="../../../static/allLogo.png" class="allLogo"></image>
			<view class="name">SOC 連心</view>
			<view class="title">用心聯繫會員，拉近彼此距離</view>
		</view>
		<view class="orgList">
			<view class="orgListItem" @tap="changeOrg(item.id)" v-for="(item,index) in orgList" :key="index">
					<image :src="item.logo" class="logoImg"></image>
					<view class="orgName">{{item.name}}</view>
					<!-- <view>已有 {{item.count}} 人加入</view> -->
			</view>
		</view>
	</view>
</template>

<script>
	import noLoginBg from '@/static/my_topBg.jpg';
	import { getOrgList } from '@/api/login';
	export default {
		data() {
			return {
				noLoginBg: noLoginBg,
				orgList: this.$mStore.getters.orgList,
			};
		},
		onLoad(options) {

		},
		created() {
			if(this.orgList.length == 0) {
				this.getOrgListFn();
			}
		},
		methods: {
			getOrgListFn() {
				this.$http.get(getOrgList).then((r) => {
					if(r.code == 200) {
						this.$mStore.commit('setOrgList',r.data);
						this.orgList = r.data;
						this.$forceUpdate();
					}
				});
			},
			changeOrg(orgId) {
				this.$mStore.commit('setOrgId',orgId);
				this.$parent.NowOrgId = orgId;
				this.$parent.initAll();
			}
		}
	};
</script>

<style scoped lang="scss">
	.noLoginMain{
		width: 100vw;
		height: 100vh;
		.bgTopImg{
			position: fixed;
			width: 100%;
			height: 420rpx;
		}
		.bgTop{
			width: 100%;
			height: 420rpx;
			text-align: center;
			position: relative;
			.allLogo{
				width: 150rpx;
				height: 150rpx;
				margin-top: 110rpx;
			}
			view{
				color: white;
				font-size: 26rpx;
				&.name{
					font-size: 40rpx;
					margin: 10rpx;
				}
				&.title{

				}
			}
		}

		.orgList {
			height: calc(100% - 420rpx);
			background-color: #f0f2f2;
			padding: 20rpx;
			.orgListItem{
				display: inline-block;
				width: calc(50% - 20rpx);
				background-color: #ffffff;
				margin: 10rpx;
				border-radius: 20rpx;
				text-align: center;
				padding: 20rpx 10rpx;
				overflow-y: auto;
				.logoImg{
					display: block;
					margin: 0 auto;
					width: 22vw;
					height: 22vw;
				}
				.orgName{
					color: #333333;
					font-size: 30rpx;
					margin: 20rpx 0 10rpx 0;
					word-break: keep-all;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
		}

	}
</style>
