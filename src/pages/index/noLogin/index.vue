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
			<image src="../../../static/allLogo.png" @tap="getOrgListFn()" class="allLogo"></image>
			<view class="name">連心</view>
			<view class="title">用心聯繫會員，拉近彼此距離</view>
		</view>
		<view class="loadingBox" v-if="orgLoading">
			<cover-image class="loadingImg" src="https://wecarecard.oss-cn-hongkong.aliyuncs.com/mall/images/2021-09/f9pkb7fqz5r1631775970000"></cover-image>
		</view>
		<view class="orgList" :style="{top: rTop+'px'}" v-if="orgList && orgList.length > 0 && !orgLoading" @touchstart="refreshStart" @touchmove="refreshMove" @touchend="refreshEnd">

			<refresh ref="refresh" @isRefresh='isRefresh'></refresh>
			<!-- 為了排序 start-->
			<view class="orgListItem" @tap="changeOrg(item.id,item.joinStatus)" v-if="item.joinStatus == 1" v-for="(item,index) in orgList" :key="index">
					<image :src="item.logo" class="logoImg"></image>
					<view class="orgName">{{item.name}}</view>
					<view class="joinStatusT joinOk"><text class="word">已加入</text></view>
			</view>
			<view class="orgListItem" @tap="changeOrg(item.id,item.joinStatus)" v-if="item.joinStatus == -1" v-for="(item,index) in orgList" :key="index">
					<image :src="item.logo" class="logoImg"></image>
					<view class="orgName">{{item.name}}</view>
					<view class="joinStatusT joinO"><text class="word">已申請</text></view>
			</view>
			<view class="orgListItem" @tap="changeOrg(item.id,item.joinStatus)" v-if="item.joinStatus != 1 && item.joinStatus != -1" v-for="(item,index) in orgList" :key="index">
					<image :src="item.logo" class="logoImg"></image>
					<view class="orgName">{{item.name}}</view>
			</view>
			<!-- 為了排序 end -->
		</view>
		<view v-if="(!orgList || orgList.length == 0) && !orgLoading" class="noDataBox">
				<view class="image"><image :src="notFoundImg"></image></view>
				<view class="noDataTitle">加載失敗，請檢查一下網絡設置</view>
				<view @tap="getOrgListFn()" slot="refresh" class="noDataBtn">重新加載</view>
		</view>
	</view>
</template>

<script>
	import refresh from '@/components/xlsx/refresh.vue';
	import noLoginBg from '@/static/my_topBg.jpg';
	import rfNoData from '@/components/rf-no-data';
	import { getOrgList } from '@/api/login';
	export default {
		data() {
			return {
				noLoginBg: noLoginBg,
				orgList: this.$mStore.getters.orgList,
				userInfo: this.$mStore.getters.userObj,
				headImg: this.$mAssetsPath.headImg,
				notFoundImg: this.$mAssetsPath.notFoundImg,
				errorInfo: "",
				orgLoading: true,
				startTop: 0,
				rTop:0,
			};
		},
		components: {
			rfNoData,
			refresh
		},
		props:["backTop"],
		onLoad(options) {

		},
		created() {
			if(this.orgList.length == 0) {
				this.getOrgListFn();
			} else {
				this.orgLoading = false;
			}
		},
		methods: {
			// 刷新touch监听
			refreshStart(e) {
				this.startTop = e.touches[0].clientY - e.currentTarget.offsetTop;
				this.$refs.refresh.refreshStart(e);
			},
			refreshMove(e){
				let moveTop = e.touches[0].clientY - e.currentTarget.offsetTop;
				if(this.startTop < moveTop) {
					this.rTop += 0.17;
				} else {
					this.rTop -= 0.17;
				}
				if(this.rTop>=20) {
					this.rTop = 20;
				}
				if(this.rTop<=0) {
					this.rTop = 0;
				}
				this.$refs.refresh.refreshMove(e);
			},
			refreshEnd(e) {
				this.rTop = null;
				this.$refs.refresh.refreshEnd(e);
			},
			isRefresh(){
				this.getOrgListFn();
			},
			getOrgListFn() {
				this.orgLoading = true;
				this.$http.get(getOrgList,{mobile:this.userInfo.mobile}).then((r) => {
					if(r.code == 200) {
						this.$mStore.commit('setOrgList',r.data);
						this.orgList = r.data;
						this.$forceUpdate();
					} else {

					}
					this.orgLoading = false;
				}).catch((err)=>{
					this.orgLoading = false;
				});
			},
			changeOrg(orgId,joinStatus) {
				this.$mStore.commit('setAuditStatus',parseFloat(joinStatus));
				this.$parent.auditStatus = parseFloat(joinStatus);
				this.$forceUpdate();
				if(joinStatus == 1) {
					// 登錄狀態
					this.$parent.hasLoginOrg = true;
					this.$parent.choseSoc = 0;
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
		background-color: #f0f2f2;
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
		.loadingBox{
			display: block;
			width: 100vw;
			height: calc(100% - 450rpx);
			text-align: center;
			background-color: #FFFFFF;
			padding: 100rpx 0;
			.loadingImg{
				display: block;
				width: 30vw;
				height: 30vw;
				margin: 30rpx auto;
			}
		}
		.noDataBox{
			display: block;
			width: 100vw;
			height: calc(100% - 450rpx);
			text-align: center;
			background-color: #f0f2f2;
			padding: 100rpx 0;
			.image {
				width: 60vw;
				height: 40vw;
				display: block;
				margin: 0 auto;
				image {
					width: 100%;
					height: 100%;
				}
			}
			.noDataTitle{
				margin: 50rpx 0;
				color: #b2b2b2;
			}
			.noDataBtn{
				color: #363435;
				padding: 10rpx 0;
				border-radius: 30rpx;
				border: 1px solid #363435;
				width: 30vw;
				display: block;
				margin: 0 auto;
			}
		}
		.orgList {
			height: calc(100% - 450rpx);
			overflow-y: auto;
			overflow-x: hidden;
			background-color: #f0f2f2;
			padding: 20rpx;
			position: relative;
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
