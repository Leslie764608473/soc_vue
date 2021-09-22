<template>
	<view class="welcomeMain">
		<view class="loading">
				<cover-image class="loadingImg" src="https://wecarecard.oss-cn-hongkong.aliyuncs.com/mall/images/2021-09/f9pkb7fqz5r1631775970000"></cover-image>
		</view>
	</view>
</template>
<script>

export default {
	data() {
		return {

		};
	},
	onShow() {
		//this.$mRouter.reLaunch({ route: '/pages/index/index?choseSoc=1' });
	},
	onLoad(options) {
		this.$mRouter.reLaunch({ route: '/pages/index/index?choseSoc=1' });
	}
};
</script>
<style lang="scss" scoped>
.welcomeMain{
	width: 100%;
	min-height: 100vh;
	height: 100%;
	background-color: white;
	position: absolute;
	z-index: 10;
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
}
</style>
