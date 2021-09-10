<template>
	<view class="rf-create-order">
		<view class="order">
			<!--商品列表-->
			<view class="rf-goods-section">
				<view class="g-header b-b">
					<text class="name" style="margin-left: 0;">商品列表</text>
				</view>
				<!-- 商品列表 -->
				<view
					class="g-item"
					v-for="(item, index) in orderDetail"
					:key="index"
				>
					<rf-image :preview="false" mode="aspectFit" :src="item.product.pic"></rf-image>
					<view class="right">
						<text class="title clamp in2line" @tap="navTo(`/pages/product/product?id=${item.product.id}`)">
							{{ item.product.name}} | {{ item.product.subTitle }}
						</text>
						<view class="price-box">
							<text class="price-wrapper">
								<text class="tip"></text><text :class="'text-' + themeColor.name">{{ moneySymbol }}{{ item.product.price }}</text>
								<text class="number" style="float: right;">共{{item.cartItem.quantity}}件</text>
							</text>
						</view>
					</view>
				</view>
			</view>
			<!-- 优惠明细 -->
			<view class="yt-list">
				<view class="yt-list-cell b-b">
					<text class="cell-tit clamp">商品总价</text>
					<text class="cell-tip" :class="'text-' + themeColor.name">{{ moneySymbol }}{{ orderParams.total_amount }}</text>
				</view>
			</view>
			<!-- 金额明细 -->
			<view class="yt-list">
				<view class="yt-list-cell b-b" v-if="youji_type == 0">
					<uni-data-checkbox v-model="orderParams.mail_status" :localdata="youjiType" ></uni-data-checkbox>
				</view>
				<view v-if="orderParams.mail_status == 0 || youji_type == 1" class="yt-list-cell b-b" @tap="showSinglePicker">
					<text class="cell-tit clamp">自取服務處</text>
					<text class="cell-tip" :class="'text-' + themeColor.name">
						{{ orderParams.service_name || '請選擇服務處' }}
					</text>
					<text class="cell-more wanjia wanjia-gengduo-d"></text>
				</view>
				<view v-if="orderParams.mail_status == 1 || youji_type == 2" class="yt-list-cell desc-cell">
					<text class="cell-tit clamp">郵寄地址</text>
					<input
						class="desc"
						type="text"
						v-model="orderParams.receiver_detail_address"
						placeholder="請填寫郵寄地址"
						placeholder-class="placeholder"
					/>
				</view>
				<view class="yt-list-cell desc-cell">
					<text class="cell-tit clamp">收貨人姓名</text>
					<input
						class="desc"
						type="text"
						v-model="orderParams.receiver_name"
						placeholder="請填寫收貨人姓名"
						placeholder-class="placeholder"
					/>
				</view>
				<view class="yt-list-cell desc-cell">
					<text class="cell-tit clamp">收貨人電話</text>
					<input
						class="desc"
						type="text"
						v-model="orderParams.receiver_phone"
						placeholder="請填寫收貨人電話"
						placeholder-class="placeholder"
					/>
				</view>
				<view class="yt-list-cell desc-cell">
					<text class="cell-tit clamp">備註</text>
					<input
						class="desc"
						type="text"
						v-model="orderParams.note"
						placeholder="請填寫備註信息"
						placeholder-class="placeholder"
					/>
				</view>
			</view>
			<!-- 底部 -->
			<view class="footer" style="justify-content: flex-end;">
				<button
					class="submit"
					:class="'bg-' + themeColor.name"
					@tap="submit"
					:disabled="btnLoading"
					:loading="btnLoading">
					提交订单
				</button>
			</view>
		</view>
		<!-- 404页面 -->
		<view v-if="orderDetail.length == 0">
			<rf-no-data class="rf-no-data" :custom="true">
				<view class="title">
					{{ errorInfo || '訂單不存在' }}
				</view>
				<view @tap="getOrderDetail" slot="refresh" class="spec-color"
					>重新加載</view
				>
			</rf-no-data>
		</view>
		<!--页面加载动画-->
		<rfLoading isFullScreen :active="loading"></rfLoading>
		<rf-picker
			:themeColor="themeColor.color"
			ref="shippingTypePicker"
			mode="selector"
			:deepLength="1"
			@onConfirm="onShippingConfirm"
			:pickerValueArray="serviceNameArr"
		/>
		<rf-picker
			:themeColor="themeColor.color"
			ref="companyTypePicker"
			mode="selector"
			:deepLength="1"
			@onConfirm="onCompanyConfirm"
			:pickerValueArray="orderDetail.company"
		/>
		<rf-picker
			:themeColor="themeColor.color"
			ref="pickupPointPicker"
			mode="selector"
			:deepLength="1"
			@onConfirm="onPickupPointConfirm"
			:pickerValueArray="
				orderDetail.pickup_point_config && orderDetail.pickup_point_config.list
			"
		/>
	</view>
</template>
<script>
import {
	cartItemCount,
	orderCreate,
	orderFreightFee,
	orderPreview,
	listNew,
	putProductOrder,
	putOrder,
	getProductServiceCenter,
	productDetail
} from '@/api/product';
import { serviceList } from '@/api/login.js'
import rfPicker from '@/components/rf-picker';
import moment from '@/common/moment';
import rfNoData from '@/components/rf-no-data';
import { mapMutations } from 'vuex';
export default {
	components: {
		rfPicker,
		rfNoData
	},
	data() {
		return {
			youjiType: [{"value": 0,"text": "自取"	},{"value": 1,"text": "郵寄"}],
			youji_type: 0,
			orderParams: {
				"total_amount": 0,
				"source_type":1,
				"order_type":0,
				"mail_status": 0,
				"receiver_name": "",
				"receiver_phone": "",
				"receiver_detail_address": "",
				"service_id": "",
				"service_name": "",
				"note": "",
				"member_id" : this.$mStore.getters.userObj.memberId,
				"member_username" : this.$mStore.getters.userObj.username,
				"product_id" : "",
				"product_count": ""
			},
			maskState: 0, // 优惠券面板显示状态
			isFullPayment: 0, // 是否全款预定，默认全款预定
			desc: '', // 备注
			payType: 1, // 1微信 2支付宝
			orderDetail: {},
			pointExchangeType: [],
			loadingType: 'more', // 加载更多状态
			pickerShippingType: [],
			btnLoading: false,
			currentShippingType: {
				value: ''
			},
			currentCompany: {},
			currentPickupPoint: {},
			cartIds: null,
			invoiceItem: {},
			addressData: {},
			couponItem: {},
			pointConfig: {},
			product: null,
			shippingMoney: 0,
			isUsePoint: false,
			isUsePointDisabled: false,
			data: {},
			userInfo: {},
			use_point: 0,
			invoiceContent: null,
			loading: true,
			errorInfo: '',
			buyerMessage: '',
			promoCode: '',
			moneySymbol: this.moneySymbol,
			logo: this.$mSettingConfig.appLogo,
			singleSkuText: this.singleSkuText,
			serviceArr: [],
			serviceNameArr:[]
		};
	},
	computed: {
		// 计算商品金额
		amountGoods() {
			return this.orderDetail.preview && this.orderDetail.preview.product_money;
		},
		// 计算优惠金额
		discountAmount() {
			const discountMoney = this.floor(
				((100 - this.couponItem.discount) / 100) * this.amountGoods
			);
			return parseInt(this.couponItem.type, 10) === 2
				? discountMoney
				: this.couponItem.money || 0;
		},
		// 计算实付金额
		realAmount() {
			const realAmount =
				this.amountGoods -
				this.discountAmount +
				parseFloat(this.shippingMoney) -
				(this.isUsePoint ? this.maxUsePointFee : 0);
			return (parseFloat(this.invoiceAmount) + realAmount > 0 ? (parseFloat(this.invoiceAmount) + realAmount) : 0).toFixed(2);
		},
		// 计算发票税费
		invoiceAmount() {
			const realAmount =
				this.amountGoods -
				this.discountAmount -
				(this.isUsePoint ? this.maxUsePointFee : 0);
			return this.invoiceItem.type
				? this.floor((this.orderDetail.invoice.order_invoice_tax / 100) * realAmount)
				: 0;
		},
		// 计算可用积分
		maxUsePoint() {},
		// 计算最大积分可抵扣金额
		maxUsePointFee() {},
		givePoint() {
			return function(val) {
				if (this.couponItem.discount) {
					return Math.floor(this.couponItem.discount / 100 * val);
				} else {
					return val;
				}
			};
		}
	},
	filters: {
		time(val) {
			return moment(val * 1000).format('YY/MM/DD HH:mm');
		}
	},
	onShow() {
		if (this.addressData && this.addressData.realname) {
			//this.getOrderFreightFee();
		}
	},
	onLoad(options) {
		this.youji_type = options.state;
		this.initData(options);
	},
	methods: {
    ...mapMutations(['setCartNum']),
		handleIsFullPayment (e) {
			this.isFullPayment = e.detail.value;
		},
		getServeArr() {
			this.$http.post(serviceList+"?orgId="+this.$mStore.getters.orgId).then((res)=>{
				this.serviceArr = res.data;
				this.serviceNameArr = [];
				res.data.forEach((item)=>{
					this.serviceNameArr.push({
						label: item.name
					});
				})
				this.$forceUpdate();
			});
		},
		handleInvoiceChange(val) {
			this.invoiceContent = val;
		},
		navTo(route) {
			this.$mRouter.push({ route });
		},
		// 不使用发票
		closeInvoice() {
			this.invoiceItem = {};
		},
		// 不使用优惠券
		clearCoupon () {
			this.couponItem = {};
		},
		// 向下取整
		floor(val) {
			return Math.floor(val * 100) / 100;
		},
		// 是否使用积分抵扣
		handleIsUsePoint() {
			if (this.isUsePoint) {
				this.isUsePoint = false;
				this.use_point = 0;
			} else {
				this.isUsePoint = true;
				this.use_point = this.maxUsePoint;
			}
		},
		// 选择物流
		showSinglePicker() {
			this.$refs.shippingTypePicker.show();
		},
		// 选择快递公司
		showCompanyPicker() {
			this.$refs.companyTypePicker.show();
		},
		// 选择自提点
		showPickupPointPicker() {
			this.$refs.pickupPointPicker.show();
		},
		// 确定选择物流
		onShippingConfirm(e) {
			let name = e.label;
			this.orderParams.service_name = name;
			this.serviceArr.forEach((item)=>{
				if(item.name == name) {
					this.orderParams.service_id = item.id;
				}
			})
		},
		// 确定选择快递公司
		async onCompanyConfirm(e) {
			e.value = e.value[0];
			this.currentCompany = e;
			if (this.orderDetail.is_full_mail) {
				this.shippingMoney = 0;
				return;
			}
			this.getOrderFreightFee();
		},
		// 确定选择自提点
		async onPickupPointConfirm(e) {
			e.value = e.value[0];
			this.currentPickupPoint = e;
			if (this.currentPickupPoint) {
				this.shippingMoney = parseFloat(this.orderDetail.pickup_point_config.pickup_point_fee) || 0;
			}
		},
		// 计算运费
		async getOrderFreightFee() {
			const params = {};
			if (this.addressData) {
				params.address_id = this.addressData.id;
			}
			if (this.currentCompany) {
				params.company_id = this.currentCompany.value;
			}
			await this.$http
				.get(`${orderFreightFee}`, {
					...params,
					...this.data
				})
				.then(r => {
					this.shippingMoney = r.data.shipping_money || 0;
				});
		},
		// 数据初始化
		async initData(options) {
			this.data = await JSON.parse(options.data);
			this.userInfo = uni.getStorageSync('userInfo');
			this.loading = true;
			await this.getOrderDetail();
			this.getProductServiceCenterFn();
		},
		getProductServiceCenterFn() {
			let ids = this.data.data;
				this.$http
					.post(`${getProductServiceCenter}?id=${ids}`)
					.then(res => {
						this.serviceArr = res.data;
						this.serviceNameArr = [];
						res.data.forEach((item)=>{
							this.serviceNameArr.push({
								label: item.name
							});
						})
						this.$forceUpdate();
					})
					.catch(err => {

					});
		},
		// 获取订单详情
		async getOrderDetail() {
			if(this.data.type == "cartNo") {
await this.$http
				.post(`${productDetail}`,{},{
					params: {Id: this.data.data}
				})
				.then(async r => {
					this.loading = false;
					this.orderDetail = [{
						product :  r.data.list,
						cartItem : {
							quantity: this.data.quantity
						}
					}];
					//this.orderDetail.push(r.data);
					this.orderParams.mail_status = 0;
					this.orderParams.product_id = r.data.list.id;
					this.orderParams.product_count = this.data.quantity;
					this.orderParams.total_amount = r.data.list.price*this.data.quantity;
					this.$forceUpdate();
				}).catch(err => {
						this.loading = false;
						this.errorInfo = err;
					});
			} else {
				await this.$http
					.post(`${listNew}?type=${this.data.state}`)
					.then(r => {
						this.loading = false;
						this.orderDetail = [];
						r.data.forEach((item)=>{
							if(item.cartItem.id == this.data.objId) {
								this.orderDetail.push(item);
								this.orderParams.mail_status = 0;
								this.orderParams.product_id = item.cartItem.productId;
								this.orderParams.product_count = item.cartItem.quantity;
								this.orderParams.total_amount = item.cartItem.quantity*item.cartItem.price;
								this.$forceUpdate();
							}
						})
					})
					.catch(err => {
						this.loading = false;
						this.errorInfo = err;
					});
			}
		},
		// 显示优惠券面板
		toggleMask(type) {
			if ('combination,wholesale,group_buy'.indexOf(this.data.type) !== -1) {
				this.$mHelper.toast('套餐购买/拼团/团购下单不支持选择购物券');
				return;
			}
			let timer = type === 'show' ? 10 : 300;
			let state = type === 'show' ? 1 : 0;
			this.maskState = 2;
			setTimeout(() => {
				this.maskState = state;
			}, timer);
		},
		numberChange(data) {
			this.number = data.number;
		},
		changePayType(type) {
			this.payType = type;
		},
		async submit() {
			this.btnLoading = true;
			if(this.orderParams.mail_status == 0) {
				//自取

			} else if (this.orderParams.mail_status == 1) {
				//郵寄

			}

			if(this.data.type == "cartNo") {
				await this.$http
					.post(`${putProductOrder}`,{},{
						params: {data:JSON.stringify(this.orderParams)}
					})
					.then(r => {
						this.btnLoading = false;
						if(r.code == 200) {
							this.$mHelper.toast(r.data);
							setTimeout(()=>{
								this.$mRouter.push({ route: '/pages/order/order' });
							},2000);
						}
					})
					.catch(() => {
						this.btnLoading = false;
					});
			} else {
				await this.$http
					.post(`${putOrder}`,{},{
						params: {data:JSON.stringify(this.orderParams)}
					})
					.then(r => {
						this.btnLoading = false;
						if(r.code == 200) {
							this.$mHelper.toast(r.data);
							setTimeout(()=>{
								this.$mRouter.push({ route: '/pages/order/order' });
							},2000);
						}
					})
					.catch(() => {
						this.btnLoading = false;
					});
			}
		},
		// 设置购物车数量角标
		async setCartItemCount() {
			await this.$http.get(`${cartItemCount}`).then(r => {
				if (parseInt(r.data, 10) > 0) {
					this.setCartNum(r.data);
				} else {
					uni.removeStorageSync('cartNum');
					uni.removeTabBarBadge({ index: this.$mConstDataConfig.cartIndex });
				}
			});
		},
		stopPrevent() {},
		selectCoupon(item) {
			if (parseFloat(item.at_least) > parseFloat(this.amountGoods)) {
				this.$mHelper.toast('不满足优惠券使用条件~');
				return;
			}
			this.maskState = 0;
			this.couponItem = item;
		}
	}
};
</script>
<style lang="scss">
page {
	background: $page-color-base;
}
.order {
	padding-bottom: 100upx;
	.price-wrapper {
				margin-bottom: 10upx;
				flex: 1;
        .tip {
          font-size: $font-sm;
          color: $font-color-light;
        }
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
}
.yt-list {
	margin-top: 16upx;
	background: #fff;
	.iconshanchu4 {
		margin-left: $spacing-sm;
	}
}

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
	}

	.cell-tip {
		max-width: 70%;
		font-size: 26upx;
		&.disabled {
			color: $font-color-light;
		}

		&.active {
			color: $base-color;
		}
		&.red {
			color: $base-color;
		}
		.invoice {
			display: flex;
			justify-content: space-between;
		}
	}

	&.desc-cell {
		.cell-tit {
			max-width: 160rpx;
		}
	}

	.desc {
		flex: 1;
		font-size: $font-base;
		color: $font-color-dark;
	}
}

.footer {
	position: fixed;
	left: 0;
	bottom: 0;
	z-index: 98;
	display: flex;
	align-items: center;
	width: 100%;
	height: 90upx;
	justify-content: space-between;
	font-size: 30upx;
	background-color: #fff;
	color: $font-color-base;
	box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
	.price-content {
		padding-left: 30upx;
	}
	.price-tip {
		margin-left: 8upx;
	}
	.price {
		font-size: $font-lg;
	}
	.disabled {
		background-color: $border-color-dark;
	}
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
		.no-coupon {
			display: flex;
			justify-content: center; /* 水平居中 */
			line-height: 16vh;
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

.rf-no-data {
	height: calc(100vh - 90upx);
}
</style>
