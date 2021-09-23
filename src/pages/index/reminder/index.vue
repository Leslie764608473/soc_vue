<template>
	<view class="reminderView" v-show="reminderFlag">
		<view class="popup_mask"></view>
		<view class="popup_content">
			<view class="reminderBox">
				<view class="reminderHeader">
					<image src="https://datalinc.oss-cn-shenzhen.aliyuncs.com/mall/images/2021-09/9zl6ky0ti81632134898000" mode=""></image>
				</view>
				<view class="reminderBody">
					<p class="title">【換領條件】</p>
					<p class="content" @tap="navToProduct(reminderJson.id)">{{ reminderJson.note }}</p>
					<p class="foot">最終解釋權歸香港山東社團總會所有</p>
				</view>
			</view>
			<view class="close" @tap="closeReminder">
				<icon type="cancel" color="white" size="35"/>
			</view>
		</view>
	</view>
</template>

<script>
	import {birthWishesReminder} from '@/api/activity';
	export default {
		data() {
			return {
				reminderJson: {},
				reminderFlag: false,
			}
		},
		methods: {
			closeReminder(){
				this.reminderFlag = false;
			},
			getReminder(memberId){
				this.$http.post(`${birthWishesReminder}`,{},{params: {memberId: memberId}})
					.then(res => {
						if (res.code == 200){
							if (Array.isArray(res.data)){
								this.reminderFlag = true;
								this.reminderJson = res.data[0];
								this.$forceUpdate();
							} else {
								//uni.showToast({title: res.data, icon: "none"});
							}
						}
					}).catch( err => {
						console.log(err)
					})
			},
			navToProduct(id){
				this.reminderFlag = false;
				let route = `/pages/product/product?id=${id}`;
				this.$mRouter.push({ route });
			}
		},
		mounted() {

		}
	}
</script>

<style lang="scss">
.reminderView {
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
		z-index: 1001;
	}

	.popup_mask {
		opacity: 1;
	}
	.popup_content {
		// overflow: hidden;
		box-sizing: border-box;
		padding: 80rpx 0 0;
		position: fixed;
		bottom: 30%;
		border-radius: 16px;
		min-height: 600rpx;
		background: #ffffff;
		width: 80%;
		left: 10%;
		z-index: 1002;
		background-image: url("https://datalinc.oss-cn-shenzhen.aliyuncs.com/mall/images/2021-09/6xgriizat671632134986000");
		background-position: bottom;
		background-size: 100% 90rpx;
		background-repeat: no-repeat;
		.reminderBox {
			.reminderHeader {
				position: absolute;
				top: -90rpx;
				left: -2rpx;
				width: 612rpx;
				height: 180rpx;
				image {
					width: 100%;
					height: 100%;
				}
			}
			.reminderBody {
				padding: 30rpx;
				.title {
					color: #333333;
					font-weight: 550;
					margin-bottom: 20rpx;
				}
				.content {
					white-space: pre-wrap;
					margin-bottom: 30rpx;
					line-height: 50rpx;
					max-height: 250rpx;
					overflow-y: auto;
				}
				.foot {
					font-size: 27rpx;
					color: #1799fc;
				}
			}
		}
		.close {
			position: absolute;
			bottom: -100rpx;
			left: 50%;
			transform: translateX(-50%);
		}
	}
}
</style>
