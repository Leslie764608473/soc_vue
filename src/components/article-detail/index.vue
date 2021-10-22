<template>
  <view class="rf-product-detail">
		<view class="detail">
			<view class="title">{{product.title}}</view>
			<view class="time" style="position: relative;">
				{{product.pubtime | time}}
				<!-- <view class="share">
						<button class="share-btn" open-type="share" :class="'text-' + themeColor.name" @tap.stop="share()">
							<text class="iconfont iconfenxiang"></text>
							<text class="tui-share-text tui-gray">分享</text>
						</button>
						<button class="share-btn" :class="'text-' + themeColor.name" @tap.stop="copyFn()">
							<text class="iconfont iconcopy"></text>
							<text class="tui-share-text tui-gray">複製鏈接</text>
						</button>
				</view> -->
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
		<!-- 评论组件 -->
		<comment :commentDataNew="commentData" :productId="product.id"/>
		<!-- <view class="bottomTitle">到底啦~</view> -->
		<view class="bottomBtns">
			<view @click="copyFn()" class="fristBox"><i class="iconfont icon-icon-" style="color: #0f7df7;"></i>複製鏈接</view>
			<!-- <button class="share-btn" open-type="share">
				<i class="iconfont icon-fenxiang-weixin" style="color: #28c445;"></i>分享給好友
			</button> -->
			<!-- <view class="share-btn" open-type="share" @click="share()"><i class="iconfont icon-fenxiang-weixin" style="color: #28c445;"></i>分享給好友</view> -->
		</view>

	</view>
</template>
<script>
import moment from '@/common/moment'
import mpHtml from '@/components/mp-html/mp-html'
import comment from '@/components/comment/index'
// 评论假数据
import commentData from './comment.js'
export default {
  name: 'rfProductDetail',
  props: {
    product: {
      type: Object,
      default () {
        return {
        }
      }
    },
    userInfo: {
      type: Object,
      default () {
        return {}
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
    mpHtml,
    comment
  },
  async onShareAppMessage () {
		  // #ifdef MP

		  // #endif
  },
  data () {
    return {
      commentData: commentData.items,
      shareBg: this.$mAssetsPath.shareBg,
      shareClass: 'none'
    }
  },
  async onShareAppMessage () {

  },
  filters: {
    time (val) {
      return moment(val).format('YYYY-MM-DD HH:mm')
    }
  },
  onLoad (options) {
    const orgId = options.orgId
    if (orgId && orgId != this.$mStore.getters.orgId) {
      this.$mStore.commit('setOrgId', orgId)
    }
  },
  computed: {

  },
  created () {

  },
  methods: {
    copyFn () {
      uni.setClipboardData({
        data: 'http://app.link-heart.hk/#/pages/product/article?id=' + this.product.id,
        success: function (res) {
          /* uni.showToast({
										title: '複製成功',
								}); */
        },
        fail: function (res) {
          /* uni.showToast({
										title: '複製失敗',
								}); */
        }
      })
    },
    share () {
			  // #ifdef H5
			  if (this.$mPayment.isWechat()) {
			    this.shareClass = 'show'
			  } else {
			    this.$mHelper.h5Copy(this.url)
			  }
			  // #endif
			  // #ifdef APP-PLUS
      this.$mHelper.handleAppShare(this.url, this.appName, this.product.name, this.product.picture)
      // #endif
    }
  }
}
</script>
<style lang="scss" scoped>
	.bottomTitle{
		color: #d9d9d9;
		// border-top: 1px solid #d9d9d9;
		width: 80vw;
		display: block;
		margin: 0 auto;
		font-size: 25rpx;
		padding-top: 10rpx;
		text-align: center;
	}
	.bottomBtns{
		border-top: 1px solid #d9d9d9;
		width: 100vw;
		padding: 35rpx 0 60rpx 0;
		margin: 25rpx 0 0 0;
		display: block;
		display: flex;
		view{
			flex: 1;
			color: #333333;
			font-size: 28rpx;
			text-align: center;
			cursor: pointer;
			&.fristBox{
				border-right: 1px solid #d9d9d9;
			}
			.iconfont{
				font-size: 35rpx !important;
				display: inline-block;
				vertical-align: middle;
				margin-right: 9rpx;
			}
		}
		.share-btn{
			flex: 1;
			background-color: white;
			background: none;
			font-size: 28rpx;
			line-height: 1.5;
			height: auto;
			&::after{
				border: none;
			}
			.iconfont{
				font-size: 35rpx !important;
				display: inline-block;
				vertical-align: middle;
				margin-right: 9rpx;
			}
		}
	}
.rf-product-detail {
	background-color: white;
	min-height: 100vh;
	.detail {
		padding-bottom: 20rpx;
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
