<template>
	<view class="empty">
		<view class="empty-content" :class="{ emptyOnly: !isRecommendShow }">
			<!-- <text class="iconfont iconnodata-search" :class="'text-'+themeColor.name"></text> -->
			<view class="image"
				><image :src="notFoundImg" style="width: 80vw;height: 42vw;"></image
			></view>
			<text class="empty-content-info">{{ info }}</text>
		</view>
		<rf-recommend :bottom="bottom" v-if="isRecommendShow" :list="list" class="recommend" />
	</view>
</template>

<script>
import rfRecommend from '@/components/rf-recommend/rf-recommend';
export default {
	components: {
		rfRecommend
	},
	props: {
		src: {
			type: String,
			default: 'empty'
		},
		isRecommendShow: {
			type: Boolean,
			default: true
		},
		info: {
			type: String,
			default: ''
		},
		bottom: {
			type: Number,
			default: 0
		},
		list: {
			type: Array,
			default() {
				return [];
			}
		}
	},
	data() {
		return {
			notFoundImg: this.$mAssetsPath.notFoundImg,
		};
	},
	computed: {}
};
</script>

<style lang="scss">
.empty {
	background-color: $color-white;
	.empty-content {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		padding: 20upx 0 80upx;
		.empty-content-info {
			// font-size: $font-base - 2upx;
			font-size: 50rpx;
			color: #ccd3dc;
		}
		.iconfont {
			font-size: 240upx;
		}
		&-image {
			width: 200upx;
			height: 200upx;
		}
	}
	.emptyOnly {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
	}
}
</style>
