<template>
  <view class="rf-product-detail">
		<view class="detail">
			<view class="title">{{product.title}}</view>
			<view class="time" style="position: relative;">
				{{product.pubtime | time}}
				<view class="share">
						<button class="share-btn" open-type="share" :class="'text-' + themeColor.name" @tap.stop="share()">
							<text class="iconfont iconfenxiang"></text>
							<text class="tui-share-text tui-gray">分享</text>
						</button>
						<!-- <button class="share-btn" :class="'text-' + themeColor.name" @tap.stop="copyFn()">
							<text class="iconfont iconcopy"></text>
							<text class="tui-share-text tui-gray">複製鏈接</text>
						</button> -->
				</view>
			</view>
			<!-- <view class="productContent" v-html="product.contentHtml.trim()"></view> -->
			<!-- <rf-parser lazy-load :html="product.contentHtml"></rf-parser> -->
			<mp-html v-if="product.contentHtml" class="productContent" container-style="color:#333333;padding: 0 30rpx;font-size: 32rpx" :content="product.contentHtml.trim()" />
		</view>

		<!-- 分享引导 -->
		<view
			class="popup spec show"
			v-if="shareClass === 'show'"
			@touchmove.stop.prevent="stopPrevent"
			@tap="hideShareSpec"
		>
			<!-- 遮罩层 -->
			<view class="mask" @tap="hideShareSpec"></view>
			<view class="share-bg">
				<image :src="shareBg"></image>
			</view>
		</view>

	</view>
</template>
<script>
	import moment from '@/common/moment';
	import mpHtml from '@/components/mp-html/mp-html'
  export default {
    name: 'rfProductDetail',
    props: {
			product: {
				type: Object,
				default() {
					return {
					};
				}
			},
			userInfo: {
				type: Object,
				default() {
					return {};
				}
			},
			url: {
				type: String,
				default: ''
			},
			marketType: {
				type: String,
				default: 'buy_now'
			}
    },
		components: {
			mpHtml
		},
		async onShareAppMessage () {
		  // #ifdef MP

		  // #endif
		},
		data() {
			return {
				shareBg: this.$mAssetsPath.shareBg,
				shareClass: "none"
			};
		},
		async onShareAppMessage () {

		},
		filters: {
			time(val) {
				return moment(val).format('YYYY-MM-DD HH:mm');
			}
		},
		onLoad(options) {
			let orgId = options.orgId;
			if(orgId && orgId != this.$mStore.getters.orgId) {
				this.$mStore.commit('setOrgId',orgId);
			}
		},
		computed: {

		},
		created() {

		},
    methods: {
			copyFn() {

			},
			share() {
			  // #ifdef H5
			  if (this.$mPayment.isWechat()) {
			    this.shareClass = 'show';
			  } else {
			    this.$mHelper.h5Copy(this.url);
			  }
			  // #endif
			  // #ifdef APP-PLUS
				this.$mHelper.handleAppShare(this.url, this.appName, this.product.name, this.product.picture);
				// #endif
			},
    }
  };
</script>
<style lang="scss" scoped>
.rf-product-detail {
	background-color: white;
	min-height: 100vh;
	.detail {
		.share{
			position: absolute;top: 0;right: 0;
		}
		.share-btn{
			height: 55rpx;
			line-height: 55rpx;
			display: inline-block;
			margin: 0 10rpx;
			&::after{
				border: none;
			}
			text{
				font-size: 22rpx;
				display: inline-block;
				margin: 0 5rpx;
			}
		}

		padding-bottom: 60upx;
		.title{
			font-size: 38rpx;
			font-weight: bolder;
			padding: 30rpx 30rpx 0;
		}
		.time{
			margin: 40rpx 0 0;
			padding: 0 30rpx;
			font-size: 34rpx;
		}
		.productContent{
			word-break: keep-all;
			white-space: pre-wrap;
			word-break: break-all;

		}
	}
}
</style>
<style>
	.productContent >>> rich-text{
		display: block;
		margin: 25rpx 0 !important;
		line-height: 1.5;
	}
</style>
