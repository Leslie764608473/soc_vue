<template>
	<view class="order">
		<!--导航栏-->
		<view class="navbar">
			<view
				v-for="(item, index) in navList"
				:key="index"
				class="nav-item"
				:class="tabCurrentIndex == item.state ? `text-${themeColor.name} current` : ''"
				@tap="tabClick(item.state)"
			>
				{{ item.text }}
			</view>
		</view>
		<!--订单列表-->
		<swiper
			class="swiper-box"
			duration="300"
			@change="changeTab"
		>
			<swiper-item
				class="tab-content"
				v-for="(tabItem, tabIndex) in navList"
				:key="tabIndex"
			>
				<scroll-view
					class="list-scroll-content"
					scroll-y
					@scrolltolower="getMoreOrderList"
				>
					<view
						v-for="(item, index) in orderList"
						:key="index"
						class="rf-order-item"
					>
						<view class="i-top b-b" style="display: block;text-align: right;line-height: 80rpx;">
							<text
								class="state"
								:class="'text-' + themeColor.name"
								v-if="parseInt(item.order_status, 10) !== 0"
								>{{ item.order_status | orderStatusFilter }}</text
							>
						</view>
						<!--						<scroll-view  v-if="item && item.product && item.product.length > 1"-->
						<!--												 class="goods-box" scroll-x>-->
						<!--							<view-->
						<!--								v-for="(goodsItem, goodsIndex) in item.product"-->
						<!--								:key="goodsIndex"-->
						<!--								@tap="navTo(`/pages/product/product?id=${goodsItem.product_id}`)"-->
						<!--								class="goods-item"-->
						<!--							>-->
						<!--								<image class="goods-img" :src="goodsItem.product_picture" mode="aspectFill"></image>-->
						<!--								<text class="goods-title in2line">{{goodsItem.product_name}}</text>-->
						<!--							</view>-->
						<!--						</scroll-view>-->
						<!--							v-if="item.product && item.product.length === 1"-->
						<view
							class="goods-box-single"
							style="border-bottom: none;"
							@tap.stop="
								navTo(`/pages/order/detail?id=${item.order_id}`)
							"
							v-for="(goodsItem, goodsIndex) in item.product"
							v-if="goodsIndex == 0"
							:key="goodsIndex"
						>
							<image
								class="goods-img"
								:src="goodsItem.product_pic"
								mode="aspectFill"
							></image>
							<view class="right">
								<text class="title in2line">{{ goodsItem.product_name }}</text>
							</view>
						</view>
						<view class="price-box">
							共
							<text class="num">{{ item.total_count }}</text>
							件商品 實付款
							<text class="price" style="margin-left: 10rpx;" :class="'text-'+themeColor.name">{{ moneySymbol }}{{ item.total_amount }}</text>
						</view>
						<view class="action-box b-t">
							<button
								class="action-btn"
								:class="'text-' + themeColor.name"
								v-if="item.order_status == 1"
								@tap="handleOrderOperation(item, 'delete')"
							>
								刪除訂單
							</button>
							<button
								class="action-btn"
								:class="'bg-' + themeColor.name"
								@tap="handleOrderOperation(item, 'detail')"
							>
								訂單詳情
							</button>
						</view>
					</view>
					<rf-load-more
						:status="loadingType"
						v-if="orderList.length > 0"
					></rf-load-more>
					<rf-empty
						:list="guessYouLikeList"
						info="暫無訂單"
						v-if="orderList.length === 0 && !loading"
					></rf-empty>
				</scroll-view>
			</swiper-item>
		</swiper>
		<rfLoading isFullScreen :active="loading"></rfLoading>
	</view>
</template>
<script>
/**
 * @des 订单管理
 *
 * @author stav stavyan@qq.com
 * @date 2020-01-15 11:54
 * @copyright 2019
 */
import rfLoadMore from '@/components/rf-load-more/rf-load-more';
import moment from '@/common/moment';
import { orderList, orderTakeDelivery } from '@/api/userInfo';
import rfCountDown from '@/components/rf-count-down';
import { orderClose, guessYouLikeList,getOrderListUrl,orderDelete } from '@/api/product';
import mConstData from '@/config/constData.config';
export default {
	components: {
		rfLoadMore,
		rfCountDown
	},
	data() {
		return {
			tabCurrentIndex: 0,
			loadingType: 'more',
			navList: this.$mConstDataConfig.orderNavList,
			moneySymbol: this.moneySymbol,
			orderList: [],
			page: 1,
			loading: true,
			isRefreshing: true,
			guessYouLikeList: [],
			singleSkuText: this.singleSkuText,
			userObj: this.$mStore.getters.userObj,
		};
	},
	computed: {
		// 计算倒计时时间
		second() {
			return function(val) {
				return Math.floor(val - new Date() / 1000);
			};
		}
	},
	filters: {
		// 时间格式化
		time(val) {
			return moment(val * 1000).format('YYYY-MM-DD HH:mm:ss');
		},
		// 状态显示格式化
		orderStatusFilter(orderStatus) {
			let state;
			mConstData.orderStatus.forEach(orderItem => {
				if (orderItem.key === parseInt(orderStatus, 10)) {
					state = orderItem.value;
				}
			});
			return state;
		}
	},
	onShow() {
		this.initData();
	},
	onLoad(options) {
		/**
		 * 修复app端点击除全部订单外的按钮进入时不加载数据的问题
		 * 替换onLoad下代码即可
		 */
		//this.tabCurrentIndex = parseInt(options.state, 10) + 1;
	},
	// 下拉刷新
	onPullDownRefresh() {
		this.page = 1;
		this.orderList.length = 0;
		this.getOrderList('refresh');
	},
	// 加载更多
	onReachBottom() {
    if (this.loadingType === 'nomore' || this.orderList.length === 0) return;
		this.page++;
		this.getOrderList();
	},
	methods: {
		// 倒计时关闭订单
		timeUp(item) {
			if (this.isRefreshing) {
				this.isRefreshing = false;
				this.handleOrderClose(item.id);
			}
		},
		// 订单操作
		handleOrderOperation(item, type) {
			switch (type) {
				case 'detail': // 订单详情
					this.navTo(`/pages/order/detail?id=${item.order_id}`);
					break;
				case 'evaluation': // 我要评价
					this.navTo(`/pages/order/evaluation/evaluation?order_id=${item.id}`);
					break;
				case 'close': // 取消订单
					this.handleOrderClose(item.id);
					break;
				case 'delete': // 删除订单
					this.handleOrderDelete(item.order_id);
					break;
				case 'shipping': // 查看物流
					this.navTo(`/pages/order/shipping/shipping?id=${item.id}`);
					break;
				case 'delivery': // 确认收货
					this.handleOrderTakeDelivery(item.id);
					break;
			}
		},
		// 跳转页面
		navTo(route) {
			this.$mRouter.push({ route });
		},
		// 关闭订单
		async handleOrderClose(id) {
			await this.$http
				.get(`${orderClose}`, {
					id
				})
				.then(() => {
					this.isRefreshing = true;
					this.$mHelper.toast('订单取消成功');
					setTimeout(() => {
						this.loading = true;
						this.page = 1;
						this.orderList.length = 0;
						this.getOrderList();
					}, 500);
				});
		},
		// 删除已关闭订单
		async handleOrderDelete(id) {
			let content = "確定刪除該訂單？";
			uni.showModal({
				content,
				success: async e => {
					if (e.confirm) {
							await this.$http.post(`${orderDelete}?orderId=${id}`, {}).then(() => {
								this.$mHelper.toast('訂單刪除成功！');
								setTimeout(() => {
									this.page = 1;
									this.orderList.length = 0;
									this.getOrderList();
								}, 500);
							});
					} else {
			
					}
				}
			});
		},
		// 确认收货
		async handleOrderTakeDelivery(id) {
			await this.$http
				.get(`${orderTakeDelivery}`, {
					id
				})
				.then(() => {
					this.page = 1;
					this.orderList.length = 0;
					this.getOrderList();
				});
		},
		// 数据初始化
		async initData() {
			this.page = 1;
			this.orderList.length = 0;
			await this.getOrderList();
		},
		// 获取订单列表
		async getOrderList(type) {
			var params = {};
			params.member_id = this.userObj.memberId
			if(this.tabCurrentIndex==0) {
			} else {
				params.status = this.tabCurrentIndex
			}
			await this.$http
				.post(`${getOrderListUrl}`,{}, {
					params: params
				})
				.then(async r => {
					if (type === 'refresh') {
						uni.stopPullDownRefresh();
					}
					this.loadingType = r.data.length === 10 ? 'more' : 'nomore';
					this.orderList = [...this.orderList, ...r.data];
					this.loading = false;
				})
				.catch(() => {
					this.loading = false;
					if (type === 'refresh') {
						uni.stopPullDownRefresh();
					}
				});
		},
		async getGuessYouLikeList() {
			await this.$http.get(`${guessYouLikeList}`).then(r => {
				this.guessYouLikeList = r.data;
			});
		},
		// 监听swiper切换
		changeTab(e) {
			let index = e.target.current;
			if(index == 0) {
				this.tabCurrentIndex = 0;
			} else if(index == 1) {
				this.tabCurrentIndex = 3;
			} else if(index == 2) {
				this.tabCurrentIndex = 1;
			}
			this.page = 1;
			this.orderList.length = 0;
			this.loading = true;
			this.getOrderList();
		},
		// 顶部tab点击
		tabClick(index) {
			this.page = 1;
			this.orderList.length = 0;
			if(index == 0) {
				this.tabCurrentIndex = 0;
			} else if(index == 1) {
				this.tabCurrentIndex = 3;
			} else if(index == 2) {
				this.tabCurrentIndex = 1;
			}
			//this.tabCurrentIndex = index;
			this.loading = true;
			this.getOrderList();
		},
		// 顶部tab点击
		getMoreOrderList() {
      if (this.loadingType === 'nomore' || this.orderList.length === 0) return;
			this.page++;
			this.getOrderList();
		}
	}
};
</script>
<style lang="scss">
page,
.order {
	background: $page-color-base;
	height: 100%;
	.order-search {
		padding: $spacing-sm $spacing-base;
		position: relative;
		.order-search-input {
			width: 100%;
			background-color: $color-white;
			border-radius: 40upx;
			padding: $spacing-sm 0 $spacing-sm $spacing-lg;
			color: $font-color-light;
		}
		.iconfont {
			position: absolute;
			right: 48upx;
			top: 22upx;
		}
	}
	.swiper-box {
		height: calc(100% - 160upx);
	}
	.list-scroll-content {
		height: 100%;
	}
	.uni-swiper-item {
		height: auto;
	}
}
</style>
