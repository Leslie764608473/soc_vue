<template>
	<view class="my-coupon">
		<view>
			<!--顶部导航栏-->
			<view class="tabr" :style="{ top: headerTop }">
				<view :class="typeClass == 'valid' ? `text-${themeColor.name} on` : ''" @tap="switchType('valid', 0)"
					>可用
					<text style="color: #0f7df7;margin-left: 20rpx;" v-if="state === 0">{{ couponList.length }}</text>
				</view>
				<view :class="typeClass == 'used' ? `text-${themeColor.name} on` : ''" @tap="switchType('used', 1)"
					>已使用
					<text style="color: #0f7df7;margin-left: 20rpx;" v-if="state === 1">{{ couponList.length }}</text>
				</view>
				<view
					:class="typeClass == 'invalid' ? `text-${themeColor.name} on` : ''"
					@tap="switchType('invalid', -1)"
					>已失效
					<text style="color: #0f7df7;margin-left: 20rpx;" v-if="state === -1">{{ couponList.length }}</text>
				</view>
				<view class="border" :class="[typeClass, 'bg-' + themeColor.name]"></view>
			</view>
			<!--占位符-->
			<view class="place"></view>
			<!--优惠券列表-->
			<view class="coupon-list">
				<!-- 优惠券列表 -->
				<view
					class="sub-list valid"
					:style="{ marginTop: state === 0 ? '50upx' : 0 }"
				>
					<view class="row" @tap="toDetail(item)" v-for="(item, index) in couponList" :key="index">
						<!-- content -->
						<view class="carrier">
							<view class="rf-product-image-wrapper">
								<view v-if="item.product[0].pic" class="imgBox" :style="{'background-image':'url('+item.product[0].pic+')'}" ></view>
								<image v-else :src="errorImage" mode="widthFix"></image>
							</view>
							<!-- <rf-image :preview="false" style="width: 24vw;height: 24vw;" :src="item.product[0].pic"></rf-image> -->
							<view class="coupon_content">
										<view class="coupon_title" style="width: calc(100% - 50rpx);">{{item.product[0].subTitle}}</view>
										<view class="coupon_bottom">
											<text>領用有效期：</text>
											<text v-if="item.product[0].receiveType == 1">{{item.product[0].promotionEndTime | time}}</text>
											<text v-if="item.product[0].receiveType != 1">{{item.receive.subDate | time}}</text>
											<!-- <uni-dateformat v-if="item.product[0].receiveType == 1" format="yyyy年MM月dd日" :date="item.product[0].promotionEndTime"></uni-dateformat>
											<uni-dateformat v-if="item.product[0].receiveType != 1" format="yyyy年MM月dd日" :date="item.receive.subDate"></uni-dateformat> -->
											<image style="width: 40rpx;height: 40rpx;float: right;" src="../../../static/shandong/erCodeIcon.png" mode=""></image>
										</view>
									</view>
						</view>
					</view>
				</view>
				<rf-load-more
					:status="loadingType"
					v-if="couponList.length > 0"
				></rf-load-more>
			</view>
		</view>
		<rf-empty
			class="empty"
			info="暫無數據"
			:isRecommendShow="false"
			v-if="couponList.length === 0 && !loading"
		></rf-empty>
		<rfLoading isFullScreen :active="loading"></rfLoading>
	</view>
</template>
<script>
/**
 * @des 优惠券管理
 *
 * @author stav stavyan@qq.com
 * @date 2019-12-09 10:13
 * @copyright 2019
 */
import { couponClear, myCouponList } from '@/api/userInfo';
import { getReceive } from '@/api/product.js';
import rfLoadMore from '@/components/rf-load-more/rf-load-more';
import moment from '@/common/moment';
import uniDrawer from '@/components/uni-drawer/uni-drawer';
export default {
	components: {
		rfLoadMore,
		uniDrawer
	},
	data() {
		return {
			headerTop: 0,
			errorImage: this.$mAssetsPath.errorImage,
			// 控制滑动效果
			typeClass: 'valid',
			theIndex: null,
			oldIndex: null,
			state: 0,
			isStop: false,
			couponList: [],
			loadingType: 'more',
			token: null,
			page: 1,
			pageSize:  10,
			showRight: false,
			moneySymbol: this.moneySymbol,
			currentCoupon: {},
			loading: true,
			orgUserInfo: this.$mStore.getters.orgUserInfo,
		};
	},
	filters: {
		// 格式化时间
		time(val) {
			return moment(val).format('YYYY年MM月DD日');
		},
		// 格式化时间
		timeFull(val) {
			return moment(val * 1000).format('YYYY-MM-DD HH:mm:ss');
		}
	},
	// 下拉刷新，需要自己在page.json文件中配置开启页面下拉刷新 "enablePullDownRefresh": true
	onPullDownRefresh() {
		this.page = 1;
		this.couponList = [];
		this.getMyCouponList('refresh');
	},
	// 加载更多
	onReachBottom() {
  if (this.loadingType === 'nomore') return;
		this.page++;
		this.getMyCouponList();
	},
	onLoad() {
		// 数据初始化
		this.initData();
		// 兼容H5下排序栏位置
		// #ifdef H5
		// 定时器方式循环获取高度为止，这么写的原因是onLoad中head未必已经渲染出来。
		let Timer = setInterval(() => {
			let uniHead = document.getElementsByTagName('uni-page-head');
			if (uniHead.length > 0) {
				this.headerTop = uniHead[0].offsetHeight + 'px';
				clearInterval(Timer); // 清除定时器
			}
		}, 1);
		// #endif
	},
	methods: {
		toDetail(obj) {
			let router = "/pages/user/coupon/detail?couponId="+obj.receive.id+"&delete_type="+this.state;
			this.$mRouter.push({route:router});
		},
		// 显示抽屉(可使用商品)
		show(item) {
			if (item.usableProduct.length === 0) return;
			this.currentCoupon = item;
			this.showRight = true;
		},
		// 隐藏抽屉
		hide() {
			this.showRight = false;
		},
		// 关闭抽屉
		closeDrawer() {
			this.showRight = false;
		},
		// 切换顶部优惠券类型
		switchType(type, state) {
			if (this.typeClass === type) {
				return;
			}
			uni.pageScrollTo({
				scrollTop: 0,
				duration: 0
			});
			this.typeClass = type;
			this.state = state;
			this.page = 1;
			this.couponList = [];
			this.loading = true;
			this.getMyCouponList();
		},
		// 清空失效优惠券
		async emptyInvalidCoupon() {
			await this.$http.get(`${couponClear}`).then(() => {
				this.getMyCouponList();
			});
		},
		// 占位方法
		discard() {
			// 丢弃
		},
		// 初始化数据
		initData() {
			this.page = 1;
			this.couponList = [];
			this.getMyCouponList();
		},
		// 统一跳转接口
		navTo(route, type) {
			if (type) {
				this.$mRouter.switchTab({ route });
			} else {
				this.$mRouter.push({ route });
			}
		},
		// 获取我的优惠券列表
		async getMyCouponList(type) {

			var time_status;
			var isUser;
			if(this.state==-1) {
				time_status = 1;
				isUser = 0;
			} else {
				time_status = 0;
				isUser = this.state;
			}

			await this.$http
				.post(`${getReceive}`, {},{
					params: {
						pageSize : this.pageSize,
						pageNum : this.page,
						is_use : isUser,
						member_id : this.orgUserInfo.memberId,
						time_status : time_status,
					}
				})
				.then(r => {
					this.loading = false;
					if (type === 'refresh') {
						uni.stopPullDownRefresh();
					}
					this.loadingType = r.data.length === 10 ? 'more' : 'nomore';
					this.couponList = [...this.couponList, ...r.data.list];
				})
				.catch(() => {
					this.loading = false;
					if (type === 'refresh') {
						uni.stopPullDownRefresh();
					}
				});
		}
	}
};
</script>
<style lang="scss">
view {
	display: flex;
	flex-wrap: wrap;
}
page {
	position: relative;
	background-color: $page-color-base;
}

.my-coupon {
	.place {
		width: 100%;
		height: 95upx;
	}
	.tabr {
		background-color: #fff;
		width: 100%;
		height: 95upx;
		padding: 0 3%;
		border-bottom: solid 1upx #dedede;
		position: fixed;
		top: 0;
		z-index: 10;
		view {
			width: 33.3%;
			height: 90upx;
			justify-content: center;
			align-items: center;
			font-size: 32upx;
			color: #333333 !important;
			font-weight: normal;
			&.on{
				font-weight: bolder;
			}
		}
		.border {
			width: 60rpx;
			height: 7rpx;
			transform: translate3d(11vw, 0, 0);
			background-color: #0f7df7;
			border-radius: 10rpx;
			&.used {
				transform: translate3d(42vw, 0, 0);
			}
			&.invalid {
				transform: translate3d(75vw, 0, 0);
			}
		}
	}
}

.coupon-list {
	width: 100%;
	display: block;
	position: relative;
	.empty-invalid {
		position: absolute;
		right: 20upx;
		top: 10upx;
		font-size: $font-base;
	}
}
@keyframes showValid {
	0% {
		transform: translateX(-100%);
	}
	100% {
		transform: translateX(0);
	}
}
@keyframes showInvalid {
	0% {
		transform: translateX(0);
	}
	100% {
		transform: translateX(-100%);
	}
}
.sub-list {
	width: 100%;
	&.invalid {
		position: absolute;
		top: 0;
		left: 100%;
		display: none;
	}

	&.showvalid {
		display: flex;
		animation: showValid 0.2s linear both;
	}

	&.showinvalid {
		display: flex;
		animation: showInvalid 0.2s linear both;
	}

	.tis {
		width: 100%;
		height: 60upx;
		justify-content: center;
		align-items: center;
		font-size: 32upx;
	}

	.row {
		width: 92%;
		height: 206.667rpx;
		margin: 15rpx auto;
		border-radius: 8upx;
		// box-shadow: 0upx 0 10upx rgba(0,0,0,0.1);
		align-items: center;
		position: relative;
		overflow: hidden;
		z-index: 4;
		border: 0;

		.coupon_content{
			width: calc(100% - 25vw);padding-left: 30rpx;
			flex-flow: column;
			justify-content: space-between !important;
			view{
				display: block;
			}
			.coupon_title{
				color: #333333;
				font-size: 32rpx;
				font-weight: 550;
			}
			.coupon_bottom{
				white-space: normal;
				color: #999999;
				overflow: hidden;
				font-size: 25rpx;
				margin: 10rpx 0;
			}
		}

		.carrier {
			@keyframes showMenu {
				0% {
					transform: translateX(0);
				}
				100% {
					transform: translateX(-28%);
				}
			}
			@keyframes closeMenu {
				0% {
					transform: translateX(-28%);
				}
				100% {
					transform: translateX(0);
				}
			}

			&.open {
				animation: showMenu 0.25s linear both;
			}

			&.close {
				animation: closeMenu 0.15s linear both;
			}

			background-color: #fff;
			position: absolute;
			width: 100%;
			padding: 20rpx 20rpx;
			height: 100%;
			z-index: 3;
			flex-wrap: nowrap;

			.rf-product-image-wrapper{
				width: 250rpx;
				height: 166.667rpx;
				.imgBox{
					width: 100%;
					height: 100%;
					background-position: center;
					background-repeat: no-repeat;
					background-size: cover;
				}
			}

			.left {
				width: 100%;
				position: relative;

				.title {
					padding-top: 3vw;
					width: 90%;
					margin: 0 5%;
					font-size: 36upx;

					.cell-icon {
						display: inline-block;
						height: 32upx;
						margin-top: 15upx;
						width: 32upx;
						font-size: 22upx;
						text-align: center;
						line-height: 32upx;
						border-radius: 4upx;
						margin-right: 12upx;
						&.hb {
							background: #ffaa0e;
						}
						&.lpk {
							background: #3ab54a;
						}
					}
				}

				.term {
					width: 90%;
					margin: 0 5%;
					font-size: 26upx;
					color: #999;
				}

				.usage {
					width: 90%;
					margin: 0 5%;
					font-size: 26upx;
					color: $font-color-light;
				}

				.gap-top,
				.gap-bottom {
					position: absolute;
					width: 20upx;
					height: 20upx;
					right: -10upx;
					border-radius: 100%;
					background-color: #f5f5f5;
				}

				.gap-top {
					top: -10upx;
				}

				.gap-bottom {
					bottom: -10upx;
				}

				.overdue {
					position: absolute;
					right: 10upx;
					top: 0;

					.iconyiguoqi2 {
						font-size: $font-lg + 40upx;
					}

					.iconyishiyong {
						font-size: $font-lg + 40upx;
						color: $font-color-base;
					}
				}
			}

			.right {
				flex-shrink: 0;
				width: 28%;
				color: #fff;
				&.invalid {
					background: linear-gradient(to right, #aaa, #999);
					.use {
						color: #aaa;
					}
				}

				justify-content: center;

				.ticket,
				.criteria {
					width: 100%;
				}

				.ticket {
					padding-top: 1vw;
					justify-content: center;
					align-items: baseline;
					height: 6vw;

					.num {
						font-size: 42upx;
						font-weight: 600;
					}

					.unit {
						font-size: 24upx;
					}
				}

				.criteria {
					justify-content: center;

					font-size: 28upx;
				}

				.use {
					width: 45%;
					margin: 0 2.5%;
					height: 40upx;
					justify-content: center;
					align-items: center;
					font-size: 24upx;
					background-color: #fff;
					border-radius: 40upx;
					padding: 0 4upx;
				}
			}
		}
	}
}
.empty {
	width: 100vw;
	display: block;
}
</style>
