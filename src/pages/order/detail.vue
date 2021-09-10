<template>
	<view class="rf-order-detail">
		<view class="order-detail" v-if="orderDetail.product">
			<view class="rf-goods-section">
				<view
					class="g-item"
					v-for="(item, index) in orderDetail.product"
					v-if="index == 0"
					:key="index"
				>
					<rf-image :preview="false" :src="item.product_pic"></rf-image>
					<view class="right">
						<text class="title clamp in2line">
							{{ item.product_name }}
						</text>
						<view class="price-box">
							<text class="price-wrapper">
								<text>
									實付：<text :class="'text-' + themeColor.name">{{ moneySymbol }}{{ item.product_price*item.product_quantity }}</text>
								</text>
							</text>
						</view>
					</view>
				</view>
			</view>
			<!-- 订单号 -->
			<view class="yt-list">
				<view class="yt-list-cell b-b">
					<text class="cell-tit clamp">訂單號</text>
					<text class="cell-tip">
						{{ orderDetail.order[0].orderSn }}
					</text>
					<text class="cell-tip copy" :class="'text-' + themeColor.name" @tap.stop="copy(orderDetail.order[0].orderSn)">複製</text>
				</view>
				<view class="yt-list-cell b-b">
					<text class="cell-tit clamp">下單時間</text>
					<text class="cell-tip">
						{{ orderDetail.order[0].createTime | timeCreatTime }}
					</text>
				</view>
			</view>
			<!-- 金额明细 -->
			<view class="yt-list">
				<view class="yt-list-cell b-b">
					<text class="cell-tit clamp">收貨人姓名</text>
					<text class="cell-tip" :class="'text-' + themeColor.name">{{orderDetail.order[0].receiverName}}</text>
				</view>
				<view class="yt-list-cell b-b">
					<text class="cell-tit clamp">收貨人電話</text>
					<text class="cell-tip" :class="'text-' + themeColor.name">{{orderDetail.order[0].receiverPhone}}</text>
				</view>
				<view class="yt-list-cell b-b" v-if="orderDetail.order[0].mailStatus != 0">
					<text class="cell-tit clamp">收貨地址</text>
					<text class="cell-tip" :class="'text-' + themeColor.name">{{orderDetail.order[0].receiverDetailAddress}}</text>
				</view>
			</view>

			<view class="yt-list" v-if="orderDetail.order[0].mailStatus == 0">
				<view class="yt-list-cell b-b">
					<text class="cell-tit clamp">服務處名稱</text>
					<text class="cell-tip" :class="'text-' + themeColor.name">{{orderDetail.service_message[0].service_name}}</text>
				</view>
				<view class="yt-list-cell b-b">
					<text class="cell-tit clamp">服務處地址</text>
					<text class="cell-tip" :class="'text-' + themeColor.name">{{orderDetail.service_message[0].service_address}}</text>
				</view>
				<view class="yt-list-cell b-b">
					<text class="cell-tit clamp">服務處電話</text>
					<text class="cell-tip" :class="'text-' + themeColor.name">{{orderDetail.service_message[0].service_phone}}</text>
				</view>
			</view>

			<view class="yt-list">
				<view class="yt-list-cell b-b">
					<text class="cell-tit clamp">备注</text>
					<text class="cell-tip">{{ orderDetail.order[0].note }}</text>
				</view>
			</view>

			<!-- 底部 -->
			<view class="footer">
				<button
					class="action-btn"
					:class="'bg-' + themeColor.name"
					v-if="orderDetail.order_status == 1"
					@tap="handleOrderOperation(orderDetail, 'delete')"
				>
					删除订单
				</button>
			</view>
		</view>
		<!-- 404页面 -->
		<view v-if="!orderDetail.product && !loading">
			<rf-no-data class="rf-no-data" :custom="true">
				<view class="title" @tap="getOrderDetail">
					{{ errInfo || '订单不存在' }}
				</view>
				<view @tap="getOrderDetail" slot="refresh" class="spec-color"
					>重新加载</view
				>
			</rf-no-data>
		</view>
		<!--页面加载动画-->
		<rfLoading isFullScreen :active="loading"></rfLoading>
	</view>
</template>
<script>
import moment from '@/common/moment';
import mConstData from '@/config/constData.config';
import rfNoData from '@/components/rf-no-data';
import { orderClose,getOrderDetial } from '@/api/product';
import uniTag from '@/components/uni-tag/uni-tag';
import rfKefu from '@/components/rf-kefu';
import {
	closeOrderRefundApply,
	orderCustomerRefundClose,
	orderDelete,
	orderTakeDelivery,
	orderInvoiceCreate
} from '@/api/userInfo';
import { configList } from '@/api/basic';
export default {
	components: {
		uniTag,
		rfKefu,
		rfNoData
	},
	data() {
		return {
			maskState: 0, // 优惠券面板显示状态
			orderDetail: {
        pickup: {}
			},
			logo: this.$mSettingConfig.appLogo,
			appName: this.$mSettingConfig.appName,
			invoiceItem: {},
			loading: true,
			errInfo: null,
			order_id: null,
			moneySymbol: this.moneySymbol,
			orderInvoiceContent: '',
			singleSkuText: this.singleSkuText
		};
	},
	computed: {
		orderTimeLine() {
			const timeLine = [];
			if (this.orderDetail.created_at !== '0') {
				timeLine.push({ time: this.orderDetail.created_at, value: '订单创建' });
			}
			if (
				this.orderDetail.close_time <
				(new Date().getTime() / 1000 && this.orderDetail.pay_time !== '0')
			) {
				timeLine.push({
					time: this.orderDetail.close_time,
					value: '未付款订单关闭时间'
				});
			}
			if (this.orderDetail.pay_time !== '0') {
				timeLine.push({ time: this.orderDetail.pay_time, value: '订单支付' });
			}
			if (this.orderDetail.shipping_time !== '0') {
				timeLine.push({
					time: this.orderDetail.shipping_time,
					value: '买家要求发货'
				});
			}
			if (this.orderDetail.consign_time !== '0') {
				timeLine.push({
					time: this.orderDetail.consign_time,
					value: '卖家发货'
				});
			}
			if (this.orderDetail.sign_time !== '0') {
				timeLine.push({
					time: this.orderDetail.sign_time,
					value: '买家确认收货'
				});
			}
			if (this.orderDetail.finish_time !== '0') {
				timeLine.push({
					time: this.orderDetail.finish_time,
					value: '订单完成'
				});
			}
			return timeLine.reverse();
		}
	},
	filters: {
		time(val) {
			return moment(val * 1000).format('YYYY-MM-DD HH:mm:ss');
		},
		timeCreatTime(val) {
			console.log(val);
			return moment(val).format('YYYY-MM-DD HH:mm:ss');
		},
		orderStatusFilter(orderStatus) {
			let state = null;
			mConstData.orderStatus.forEach(orderItem => {
				if (orderItem.key === parseInt(orderStatus, 10)) {
					state = orderItem.value;
				}
			});
			return state;
		},
		filterProductStatus(item) {
			let status = null;
			if (
				parseInt(item.refund_status, 10) !== 0 &&
				parseInt(item.refund_status, 10) !== -1 &&
				parseInt(item.refund_status, 10) !== -2
			) {
				mConstData.refundStatus.forEach(refundItem => {
					if (refundItem.key === parseInt(item.refund_status, 10)) {
						status = refundItem.value;
					}
				});
			} else if (parseInt(item.order_status, 10) === 4) {
				mConstData.evaluateStatus.forEach(evaluateItem => {
					if (evaluateItem.key === parseInt(item.is_evaluate, 10)) {
						status = evaluateItem.value;
					}
				});
			} else {
				mConstData.orderStatus.forEach(orderItem => {
					if (orderItem.key === parseInt(item.order_status, 10)) {
						status = orderItem.value;
					}
				});
				// 有物流信息则说明已发货
				if (item.order_status === '1' && item.shipping_status === '1') {
					status = '已发货';
				}
			}
			return status;
		},
		filterShippingType(value) {
			const data = ['', '物流配送', '买家自提', '本地配送'];
			return data[parseInt(value, 10)];
		}
	},
	onLoad(options) {
		this.order_id = options.id;
	},
	onShow() {
		this.initData();
	},
	methods: {
		// 监听发票内容发生改变
		handleInvoiceContentChange(e) {
			this.orderInvoiceContent = e.detail.value;
		},
		// 显示优惠券面板
		toggleMask(type) {
			let timer = type === 'show' ? 10 : 300;
			let state = type === 'show' ? 1 : 0;
			this.maskState = 2;
			setTimeout(() => {
				this.maskState = state;
			}, timer);
		},
    stopPrevent() {
    },
		// 订单号复制
		copy(content) {
			/* #ifdef H5 */
			this.$mHelper.h5Copy(content);
			/* #endif */
			/* #ifndef H5 */
			uni.setClipboardData({
				data: content,
				success: function() {
					this.$mHelper.toast('复制成功');
				}
			});
			/* #endif */
		},
		navTo(route) {
			this.$mRouter.push({ route });
		},
		navToEvaluation(item, type) {
			this.$mRouter.push({
				route: `/pages/order/evaluation/evaluation?data=${JSON.stringify(
					item
				)}&type=${type}`
			});
		},
		navToRefund(item, type) {
			this.$mRouter.push({
				route: `/pages/order/refund/refund?data=${JSON.stringify(
					item
				)}&refundType=${type}`
			});
		},
		navToShippingReturn(item) {
			this.$mRouter.push({
				route: `/pages/order/shipping/return?data=${JSON.stringify(item)}`
			});
		},
		// 订单操作
		handleOrderOperation(item, type) {
			switch (type) {
				case 'detail': // 订单详情
					this.navTo(`/pages/order/detail?id=${item.id}`);
					break;
				case 'evaluation': // 我要评价
					this.navTo(`/pages/order/evaluation/evaluation?order_id=${item.id}`);
					break;
				case 'close': // 取消订单
					this.handleOrderClose(item.id);
					break;
				case 'delete': // 删除订单
					this.handleOrderDelete(item.id);
					break;
				case 'shipping': // 查看物流
					this.navTo(`/pages/order/shipping/shipping?id=${item.id}`);
					break;
				case 'delivery': // 确认收货
					this.handleOrderTakeDelivery(item.id);
					break;
			}
		},
		// 初始化数据
		initData() {
			this.getOrderDetail();
		},
		// 获取订单详情
		async getOrderDetail() {
			await this.$http
				.post(`${getOrderDetial}`,{},{
					params: {id: this.order_id}
				})
				.then(r => {
					this.loading = false;
					this.orderDetail = r.data;
				})
				.catch(err => {
					this.loading = false;
					this.errInfo = err;
				});
		},
		async handleOrderInvoiceCreate() {
			await this.$http.post(orderInvoiceCreate, {
				order_id: this.orderDetail.id,
				invoice_id: this.invoiceItem.id,
				invoice_content: this.orderInvoiceContent
			}).then(() => {
				this.toggleMask();
				this.getOrderDetail();
			});
		},
		// 取消订单
		async handleOrderClose(id) {
			await this.$http
				.get(`${orderClose}`, {
					id
				})
				.then(() => {
					this.$mHelper.toast('订单取消成功');
					this.getOrderDetail();
				});
		},
		// 删除已关闭订单
		async handleOrderDelete(id) {
			await this.$http.delete(`${orderDelete}?id=${id}`, {}).then(() => {
				this.$mHelper.toast('订单删除成功');
				this.$mRouter.back();
			});
		},
		// 确认收货
		async handleOrderTakeDelivery(id) {
			await this.$http
				.get(`${orderTakeDelivery}`, {
					id
				})
				.then(() => {
					this.$mHelper.toast('确认收货成功');
					this.getOrderDetail();
				});
		},
		// 产品退款/退货关闭申请
		async handleCloseOrderRefundApply(status, id) {
      uni.showModal({
				content: '取消退款后将无法再次提交申请，是否继续取消退款?',
				success: async e => {
					if (e.confirm) {
            let closeOrderApi = closeOrderRefundApply;
						if (parseInt(status, 10) === 4) {
							closeOrderApi = orderCustomerRefundClose;
						}
						await this.$http
							.post(`${closeOrderApi}`, {
								id
							})
							.then(r => {
								this.$mHelper.toast('取消成功');
								this.getOrderDetail();
							});
					}
				}
			});
		}
	}
};
</script>
<style lang="scss" scoped>
page {
	background: $page-color-base;
}
.order-detail {
	padding-bottom: 100upx;
}
.rf-goods-section {
	.g-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		.title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			.cover {
				width: 48upx;
				height: 48upx;
				border-radius: 50%;
				margin-right: 10upx;
			}
		}
	}
	.g-item {
		border-bottom: 1upx solid rgba(0, 0, 0, 0.1);
	}
	.g-item:last-child {
		border-bottom: none;
	}
	.right {
		.price-box {
			display: flex;
			align-items: center;
			justify-content: space-between;
			color: $font-color-dark;
			.price-wrapper {
				margin-bottom: 10upx;
				flex: 1;

				.price {
					font-size: $font-sm;
					margin-bottom: 4upx;
				}

				.number {
					font-size: $font-sm;
					color: $font-color-base;
					margin-left: $font-sm;
				}
				.original-price {
					font-size: $font-sm;
					color: $font-color-light;
					margin-left: $spacing-sm;
					text-decoration: line-through;
				}
			}

			.status {
				font-size: 24upx;
				margin-left: $spacing-sm;
			}

			.spec-color {
				color: $font-color-spec;
			}
		}
		.btn-box {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			margin: $spacing-sm 0;
			.action-btn {
				font-size: $font-sm;
				margin: 0 0 0 15upx;
				padding: 0 28upx;
				color: $font-color-base;
				text-align: center;
				height: 50upx;
				border-radius: 32upx;
				line-height: 50upx;
				border: 1upx solid rgba(0, 0, 0, 0.15);
			}
		}
	}
}
.yt-list {
	margin-top: 16upx;
	background: #fff;

	.yt-list-cell {
		display: flex;
		align-items: center;
		padding: 10upx 30upx 10upx 40upx;
		line-height: 70upx;
		position: relative;

		&.cell-hover {
			background: #fafafa;
		}

		&.b-b:after {
			left: 30upx;
		}

		.cell-icon {
			height: 32upx;
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

		.cell-more {
			align-self: center;
			font-size: 24upx;
			color: $font-color-light;
			margin-left: 8upx;
			margin-right: -10upx;
		}

		.cell-tit {
			flex: 1;
			font-size: 26upx;
			color: $font-color-light;
			margin-right: 10upx;
			min-width: 160rpx;
		}

		.cell-tip {
			font-size: 26upx;
			display: inline-block;
			line-height: 1.2;
			max-width: calc(100% - 160rpx);
			&.disabled {
				color: $font-color-light;
			}
		}

		&.desc-cell {
			.cell-tit {
				max-width: 90rpx;
			}
		}

		.desc {
			flex: 1;
			font-size: $font-base;
			color: $font-color-dark;
		}

		.copy {
			margin-left: $spacing-sm;
		}
	}
}
.uni-timeline {
	padding: $spacing-lg;
	background-color: $color-white;
}
.footer {
	position: fixed;
	left: 0;
	bottom: 0;
	z-index: 98;
	width: 100%;
	background-color: $color-white;
	color: $font-color-base;
	box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
	display: flex;
	justify-content: flex-end;
	align-items: center;
	padding: 15upx $spacing-base;
	.action-btn {
		font-size: $font-sm;
		margin: 0 0 0 15upx;
		padding: 0 $spacing-lg;
		text-align: center;
		height: 60upx;
		line-height: 60upx;
	}
}
.rf-no-data {
	height: calc(100vh - 90upx);
}
.pickup-tag {
	margin-right: $spacing-sm;
}
/* 优惠券面板 */
.mask {
	display: flex;
	align-items: flex-end;
	position: fixed;
	left: 0;
	top: var(--window-top);
	bottom: 0;
	width: 100%;
	background: rgba(0, 0, 0, 0);
	z-index: 99;
	transition: 0.3s;
	.mask-content {
		width: 100%;
		max-height: 70vh;
		min-height: 16vh;
		background: #f3f3f3;
		transform: translateY(100%);
		transition: 0.3s;
		overflow-y: scroll;
		.sub-list {
			padding: $spacing-lg;
			.radio-wrapper {
				display: flex;
				justify-content: space-between;
			}
			.title {
				width: 300upx;
			}
			.invoice-content {
				.invoice-content-item-radio {
					margin: 0 $spacing-sm $spacing-sm $spacing-base;
				}
			}
		}
		.confirm-btn {
			margin: $spacing-base auto $spacing-lg;
		}
	}
	&.none {
		display: none;
	}
	&.show {
		background: rgba(0, 0, 0, 0.4);

		.mask-content {
			transform: translateY(0);
		}
	}
}
</style>
