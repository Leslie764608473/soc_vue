<template>
	<view class="noLoginMain">
		<view class="userInfoBox" :style="{'top': (backTop+20)+'px'}">
			<image class="icon" :src="userInfo.icon || headImg" mode=""></image>
			<view v-if="userInfo.nickname" class="textBox">
				<view>{{userInfo.nickname}}</view>
				<view style="font-size: 27rpx;">{{userInfo.mobile}}</view>
			</view>
			<view v-else class="textBox">
				<view>{{userInfo.mobile}}</view>
			</view>
		</view>
		<image class="bgTopImg" :src="noLoginBg"></image>
		<view class="bgTop">
			<image src="../../../static/allLogo.png" class="allLogo"></image>
			<view class="name">連心</view>
			<view class="title">用心聯繫會員，拉近彼此距離</view>
		</view>
		<view class="orgList">
			<view class="orgListItem" @tap="changeOrg(item.id,item.joinStatus)" v-for="(item,index) in orgList" :key="index">
					<image :src="item.logo" class="logoImg"></image>
					<view class="orgName">{{item.name}}</view>
					<view class="joinStatusT joinOk" v-if="item.joinStatus == 1"><text class="word">已加入</text></view>
					<view class="joinStatusT joinO" v-if="item.joinStatus == -1"><text class="word">已申請</text></view>
					<!-- <image class="joinStatus" v-if="item.joinStatus == 1" src="../../../static/joinStatus.png" ></image> -->
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
				userInfo: this.$mStore.getters.userObj,
				headImg: this.$mAssetsPath.headImg,
			};
		},
		props:["backTop"],
		onLoad(options) {

		},
		created() {
			if(this.orgList.length == 0) {
				this.getOrgListFn();
			}
		},
		methods: {
			getOrgListFn() {
				this.$http.get(getOrgList,{mobile:this.userInfo.mobile}).then((r) => {
					if(r.code == 200) {
						this.$mStore.commit('setOrgList',r.data);
						this.orgList = r.data;
						this.$forceUpdate();
					}
				});
			},
			changeOrg(orgId,joinStatus) {
				this.$mStore.commit('setAuditStatus',parseFloat(joinStatus));
				this.$parent.auditStatus = parseFloat(joinStatus);
				this.$forceUpdate();
				if(joinStatus == 1) {
					// 登錄狀態
					this.$parent.hasLoginOrg = true;
					this.$parent.toLogin(orgId);
				} else {
					// 未登錄
					this.$mStore.commit('logoutOrg');
					this.$parent.hasLoginOrg = false;
					this.$mStore.commit('setOrgId',orgId);
					this.$parent.NowOrgId = orgId;
					this.$parent.choseSoc = 0;
					this.$forceUpdate();
					this.$parent.initAll();
				}
			}
		}
	};
</script>

<style scoped lang="scss">
	.userInfoBox{
		position: absolute;
		left: 20rpx;
		z-index: 100;
		.icon{
			border: 5rpx solid #fff;
			border-radius: 15rpx;
			margin-right: 20rpx;
			width: 70rpx;
			height: 70rpx;
			float: left;
		}
		.textBox{
			display: inline-block;
			color: white;
			float: left;
		}
	}
	.noLoginMain{
		width: 100vw;
		height: 100vh;
		.bgTopImg{
			position: fixed;
			width: 100%;
			height: 450rpx;
		}
		.bgTop{
			width: 100%;
			height: 450rpx;
			text-align: center;
			position: relative;
			.allLogo{
				width: 150rpx;
				height: 150rpx;
				margin-top: 140rpx;
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
			height: calc(100% - 450rpx);
			overflow-y: auto;
			overflow-x: hidden;
			background-color: #f0f2f2;
			padding: 20rpx;
			.orgListItem{
				display: inline-block;
				width: calc(50% - 20rpx);
				background-color: #ffffff;
				margin: 10rpx;
				border-radius: 20rpx;
				text-align: center;
				padding: 15rpx 10rpx;
				overflow-y: auto;
				position: relative;
				.joinStatusT{
					position: absolute;
					color: white;
					width: 128rpx;
					height: 128rpx;
					top:-64rpx;
					right:-64rpx;
					transform: rotate(45deg);
					&.joinOk{
						background-color: #0bd168;
					}
					&.joinO{
						background-color: #ffa11b;
					}
					.word{
						display: block;
						position: absolute;
						right: 35rpx;
						top: 95rpx;
						font-size: 24rpx;
						transform: rotate(0deg);
						width: 64rpx;
						height: 64rpx;
						white-space: nowrap;

					}
				}
				.joinStatus{
					position: absolute;
					right: 0;
					top: 0;
					width: 50px;
					height: 50px;
					border-radius: 0 20rpx 0 0;
				}
				.logoImg{
					display: block;
					margin: 0 auto;
					width: 19vw;
					height: 19vw;
				}
				.orgName{
					color: #333333;
					font-size: 30rpx;
					margin: 15rpx 0 10rpx 0;
					word-break: keep-all;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
		}

	}
</style>
