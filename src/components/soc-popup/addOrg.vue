<template name="popup">
	<view @touchmove.stop.prevent="clear">
		<view class="popup_mask" @touchmove.stop.prevent="clear"></view>
		<view class="popup_content">
			<view class="popup_title">新社團申請</view>
			<image :src="addOrgInfo.qrcode" show-menu-by-longpress="1" class="qrCodeImg"></image>
			<view class="name">{{addOrgInfo.name}}</view>
			<view class="tipText">您可以掃描上方QR Code，添加客服WeChat</view>
			<view class="tipText">或者通過以下方式聯繫</view>
			<view class="addItemBox">
				<view v-for="(item,index) in addOrgArr" :key="index" class="addItem" :class="'addItem'+item.border">
					<text class="iconfont" :class="item.icon" :style="{'color': item.color}"></text>
					<text class="iconValue">{{addOrgInfo[item.text]}}</text>
				</view>
			</view>
		</view>
		<view class="closeBox" @click="back()"> <i class="iconfont icon-guanbi"></i> </view>
	</view>
</template>

<script>
export default {
	name: 'popup',
	props: ["addOrgInfo"],
	data() {
		return {
			addOrgArr: [
				{
					icon: "icon-youxiang_1",
					text: "email",
					color: "#117df7",
					border: "Right"
				},
				{
					icon: "icon-dianhua_1",
					text: "mobile",
					color: "#ffa11b",
					border: "Bottom"
				},
				{
					icon: "icon-weixin",
					text: "wechatnum",
					color: "#27c446",
					border: "Top"
				},
				{
					icon: "icon-whatsapp1",
					text: "phone",
					color: "#24d366",
					border: "Left"
				}
			]
		};
	},
	created() {

	},
	methods: {
		clear() {},
		back() {
			this.$parent.addOrgShow = false;
		},
	}
};
</script>

<style lang="scss" scoped>
.popup_mask {
	position: fixed;
	bottom: 0;
	top: 0;
	left: 0;
	right: 0;
	background-color: rgba(0, 0, 0, 0.4);
	transition-property: opacity;
	transition-duration: 0.3s;
	opacity: 0;
	z-index: 98;
}

.popup_mask {
	opacity: 1;
}
.closeBox{
	position: fixed;
	right: 5%;
	top: 1170rpx;
	z-index: 100;
	background: white;
	text-align: center;
	line-height: 80rpx;
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	color: #0f7df7;
	.iconfont{
		line-height: 80rpx;
		font-weight: bolder;
	}
}
.popup_content {
	overflow: hidden;
	box-sizing: border-box;
	padding: 30rpx 20rpx;
	position: fixed;
	top: 200rpx;
	border-radius: 8px;
	min-height: 400rpx;
	background: #ffffff;
	width: 90%;
	left: 5%;
	z-index: 99;
	text-align: center;
	.popup_title,.name{
		color: #000000;
		font-size: 36rpx;
	}
	.name{
		font-size: 40rpx;
	}
	.tipText{
		font-size: 25rpx;
		color: #999999;
		margin: 10rpx 0;
	}
	.qrCodeImg{
		display: block;
		width: 50vw;
		height: 50vw;
		margin: 0 auto;
	}

	.addItemBox{
		width: 100%;
		margin-top: 20rpx;
		margin-bottom: 40rpx;
		.addItem{
			width: calc(50% - 4rpx);
			float: left;
			padding: 10rpx 0;
			&.addItemLeft{
				border-left: 2rpx solid #dedede;
				margin-left: -1rpx;
			}
			&.addItemRight{
				border-right: 2rpx solid #dedede;
				margin-right: -1rpx;
			}
			&.addItemTop{
				border-top: 2rpx solid #dedede;
				margin-top: -1rpx;
			}
			&.addItemBottom{
				border-bottom: 2rpx solid #dedede;
				margin-bottom: -1rpx;
			}
			text{
				display: block;
			}
			.iconValue{
				color: #333333;
				font-size: 30rpx;
			}
			.iconfont{
				display: inline-block;
				font-size: 60rpx !important;
			}
		}
	}

}
</style>
