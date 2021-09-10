<template>
	<view class="cart">
		<view class="tabr" :style="{ top: headerTop }">
			<view :class="typeClass == 'valid' ? `text-${themeColor.name} on` : ''" @tap="switchType('valid', 0)"
				>自取或郵寄
				<text v-if="state === 0"> ({{ cartList.length }})</text>
			</view>
			<view :class="typeClass == 'used' ? `text-${themeColor.name} on` : ''" @tap="switchType('used', 1)"
				>自取商品
				<text v-if="state === 1"> ({{ cartList.length }})</text>
			</view>
			<view
				:class="typeClass == 'invalid' ? `text-${themeColor.name} on` : ''"
				@tap="switchType('invalid', 2)"
				>郵寄商品
				<text v-if="state === 2"> ({{ cartList.length }})</text>
			</view>
			<view class="border" :class="[typeClass, 'bg-' + themeColor.name]"></view>
		</view>
		<!-- 购物车为空 -->
		<view v-if="cartList.length === 0" class="empty">
			<text class="iconfont icongouwuche" :class="'text-'+themeColor.name"></text>
			<view v-if="hasLogin" class="empty-tips">
				空空如也
			</view>
			<view v-else class="empty-tips">
				空空如也
				<view class="navigator" :class="'text-'+themeColor.name" @tap="navTo('/pages/public/logintype')"
					>登錄/註冊 ></view
				>
			</view>
		</view>
		<!-- 购物车列表 -->
		<view class="goods-list" v-else>
			<view class="rf-cart-row" v-for="(row, index) in cartList" :key="index">
				<!-- 商品 -->
				<view
					class="carrier"
					:class="[
						theIndex === index ? 'open' : oldIndex === index ? 'close' : ''
					]"
					@touchstart="touchStart(index, $event)"
					@touchmove="touchMove(index, $event)"
					@touchend="touchEnd(index, $event)"
				>
				<!-- 删除按钮 -->
				<view class="deleteIcon" @tap.stop="deleteCartItem(row, 'one')"  >
					<text class="iconfont icon iconiconfontshanchu1"></text>
				</view>
					<!-- checkbox -->
					<view class="checkbox-box" @tap="selected(index, row)">
						<view
							class="checkbox"
							:class="[
								parseInt(row.status, 10) === 0 ? `checkbox-disabled ${'text-'+themeColor.name}` : 'text-'+themeColor.name
							]"
						>
							<view :class="[row.selected ? `on ${'bg-'+themeColor.name}` : '']"></view>
						</view>
					</view>
					<!-- 商品信息 -->
					<view class="goods-info">
						<view class="img">
							<image :src="row.product.pic"></image>
						</view>
						<view class="info">
							<view
								class="title in2line"
								style="width: calc(100% - 38rpx);"
								@tap="navTo(`/pages/product/product?id=${row.product.id}`)"
							>
								{{ row.product.name }} | {{ row.product.subTitle }} 水電費水電費水電費第三方水電費水電費水電費第三方水電費水電費水電費第三方
							</view>
							<view class="price-number">
								<view class="price">{{ moneySymbol }}{{ row.product.price }}</view>
								<view class="number">
									<view class="sub" @tap.stop="sub(row, index)">
										<text class="iconfont icon icon-jianhao"></text>
									</view>
									<view class="input" style="width: 45rpx;height: 45rpx;" @tap.stop="discard">
										<input
											type="number"
											style="width: 45rpx;height: 45rpx;"
											:max="row.product.promotionPerLimit"
											:class="'text-'+themeColor.name"
											v-model="row.cartItem.quantity"
											@input.stop="numberChange(row, $event, index)"
										/>
									</view>
									<view class="add" @tap.stop="add(row, index)">
										<text class="iconfont icon iconjia1"></text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 脚部菜单 -->
		<view
			class="footer"
			:style="{ bottom: footerbottom }"
			v-if="cartList.length !== 0"
		>
			<view class="checkbox-box" @tap="allSelect">
				<view class="checkbox" :class="'text-'+themeColor.name">
					<view :class="[isAllselected ? `on ${'bg-'+themeColor.name}` : '']"></view>
				</view>
				<view class="text">全選</view>
			</view>
			<view
				class="delBtn"
				:class="'text-'+themeColor.name"
				@tap="deleteCartItem"
				v-if="selectedList.length > 0"
				>刪除</view
			>
			<!-- <view class="delBtn" :class="'text-'+themeColor.name" @tap="clearCart()" v-if="selectedList.length > 0"
				>清空</view> -->
			<view class="settlement">
				<view class="sum"
					>合計:
					<view class="money">{{ moneySymbol }}{{ sumPrice }}</view>
				</view>
				<view class="btn" :class="'bg-'+themeColor.name" @tap="createOrder"
					>結算({{ selectedList.length }})</view
				>
			</view>
		</view>
		<!-- 规格-模态层弹窗 -->
		<view
			class="popup spec show"
			v-if="specClass === 'show'"
			@touchmove.stop.prevent="stopPrevent"
			@tap="hideSpec"
		>
			<!-- 遮罩层 -->
			<view class="mask" @tap="hideSpec"></view>
			<view class="layer" @tap.stop="stopPrevent">
				<rf-attr-content
					:isSelectedNum="false"
					:product="productDetail"
					@toggle="toggleSpec"
					></rf-attr-content>
			</view>
		</view>
		<!--页面加载动画-->
		<rfLoading isFullScreen :active="loading"></rfLoading>
	</view>
</template>
<script>
import {
	cartItemClear,
	cartItemDel,
	cartItemList,
	cartItemUpdateNum,
	cartItemUpdateSku,
	productDetail,
	listNew,
	quantity,
	deleteCart
} from '@/api/product';
import rfAttrContent from '@/components/rf-attr-content';
import { mapMutations } from 'vuex';
export default {
  components: { rfAttrContent },
	data() {
		return {
			typeClass: "valid",
			headerTop: 0,
			sumPrice: '0.00',
			headerPosition: 'fixed',
			statusTop: null,
			showHeader: true,
			selectedList: [],
			isAllselected: false,
			// 控制滑动效果
			theIndex: null,
			oldIndex: null,
			isStop: false,
			cartList: [],
			hasLogin: null,
			footerbottom: 0,
			specClass: 'none',
			productDetail: {
        base_attribute_format: [],
        sku: []
			},
			specSelected: [],
			specChildList: [],
			specList: [],
			currentSkuId: '',
			moneySymbol: this.moneySymbol,
			loading: true,
			singleSkuText: this.singleSkuText,
			state: 0,
		};
	},
	onPageScroll(e) {
		// 兼容iOS端下拉时顶部漂移
		this.headerPosition = e.scrollTop >= 0 ? 'fixed' : 'absolute';
		this.headerTop = e.scrollTop >= 0 ? null : 0;
		this.statusTop = e.scrollTop >= 0 ? null : -this.statusHeight + 'px';
	},
	// 下拉刷新，需要自己在page.json文件中配置开启页面下拉刷新 "enablePullDownRefresh": true
	onPullDownRefresh() {
		this.selectedList.length = 0;
		this.isAllselected = false;
		this.sumPrice = 0;
		this.getCartItemList('refresh');
	},
	onShow() {
		// 兼容H5下结算条位置
		// #ifdef H5
		this.footerbottom =
			document.getElementsByTagName('uni-tabbar')[0].offsetHeight + 'px';
		// #endif
		// #ifdef APP-PLUS
		this.showHeader = false;
		// eslint-disable-next-line
		this.statusHeight = plus.navigator.getStatusbarHeight();
		// #endif
		this.initData();
	},
	methods: {
		...mapMutations(['setCartNum']),
		// 规格弹窗开关
		toggleSpec(row) {

		},
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
			this.getCartItemList();
		},
		// 获取产品详情
		async getProductDetail(row) {

		},
		hideSpec() {
			this.specClass = 'hide';
			setTimeout(() => {
				this.specClass = 'none';
			}, 250);
		},
		stopPrevent() {},
		// 删除选中购物车商品
		async deleteCartItem(id, type) {
			var content = "確定刪除該商品？";
			var skuIds = "";
			if (type == "one") {
				skuIds = id.cartItem.id;
			} else {
				content = "確定刪除選中商品？"
				let idsArr = [];
				for (let i = 0; i < this.cartList.length; i++) {
					if (this.cartList[i].selected) {
						idsArr.push(parseInt(this.cartList[i].cartItem.id, 10));
					}
				}
				skuIds = idsArr.join();
			}

			uni.showModal({
				content,
				success: async e => {
					if (e.confirm) {
							await this.$http
							.post(`${deleteCart}`,{}, {
								params: {
									ids: skuIds
								}
							})
							.then(() => {
								this.selectedList.length = 0;
								this.isAllselected = false;
								this.sumPrice = 0;
								this.getCartItemList();
								this.oldIndex = null;
								this.theIndex = null;
							});
					} else {

					}
				}
			});
		},
		// 修改购物车商品sku
		async handleCartItemUpdateSku(skuId, newSkuId) {},
		// 数据初始化
		initData() {
			this.hasLogin = this.$mStore.getters.hasLogin;
			if (this.hasLogin) {
				this.theIndex = null;
				this.oldIndex = null;
				this.selectedList.length = 0;
				this.isAllselected = false;
				this.sumPrice = 0;
				this.getCartItemList();
			} else {
				this.cartList = [];
				this.selectedList.length = 0;
				this.loading = false;
			}
		},
		// 通用跳转
		navTo(route) {
			if (!this.$mStore.getters.hasLogin) {
				uni.setStorageSync('backToPage', JSON.stringify({ route: '/pages/cart/cart' }));
			}
			this.$mRouter.push({ route });
		},
		// 获取购物车列表
		async getCartItemList(type) {
			await this.$http
				.post(`${listNew}?type=${this.state}`)
				.then(r => {
					this.loading = false;
					if (type === 'refresh') {
						uni.stopPullDownRefresh();
					}
					this.cartList = r.data;
					let cartNum = 0;
					r.data.forEach(item => {
						if (parseInt(item.status, 10) === 1) {
							cartNum += 1;
						}
					});
					this.setCartNum(cartNum);
				})
				.catch(() => {
					this.cartList = [];
					this.loading = false;
					if (type === 'refresh') {
						uni.stopPullDownRefresh();
					}
				});
		},
		// 清空购物车
		clearCart(params) {
			const content = params ? '清空失效商品？' : '清空购物车？';
			uni.showModal({
				content,
				success: async e => {
					if (e.confirm) {
						await this.$http.post(`${cartItemClear}`, params).then(() => {
							this.selectedList.length = 0;
							this.isAllselected = false;
							this.sumPrice = 0;
							this.getCartItemList();
						});
					}
				}
			});
		},
		// 控制左滑删除效果
		touchStart(index, event) {
			// 多点触控不触发
			if (event.touches.length > 1) {
				this.isStop = true;
				return;
			}
			this.oldIndex = this.theIndex;
			this.theIndex = null;
			// 初始坐标
			this.initXY = [event.touches[0].pageX, event.touches[0].pageY];
		},
		touchMove(index, event) {
			// 多点触控不触发
			if (event.touches.length > 1) {
				this.isStop = true;
				return;
			}
			let moveX = event.touches[0].pageX - this.initXY[0];
			let moveY = event.touches[0].pageY - this.initXY[1];

			if (this.isStop || Math.abs(moveX) < 5) {
				return;
			}
			if (Math.abs(moveY) > Math.abs(moveX)) {
				// 竖向滑动-不触发左滑效果
				this.isStop = true;
				return;
			}

			if (moveX < 0) {
				this.theIndex = index;
				this.isStop = true;
			} else if (moveX > 0) {
				if (this.theIndex != null && this.oldIndex === this.theIndex) {
					this.oldIndex = index;
					this.theIndex = null;
					this.isStop = true;
					setTimeout(() => {
						this.oldIndex = null;
					}, 150);
				}
			}
		},
		touchEnd(index, $event) {
			// 结束禁止触发效果
			this.isStop = false;
		},
		// 选中商品
		selected(index, item) {
			if (parseInt(item.status, 10) === 0) return;
			this.cartList[index].selected = !this.cartList[index].selected;
			let i = this.selectedList.indexOf(this.cartList[index].cartItem.id);
			i > -1
				? this.selectedList.splice(i, 1)
				: this.selectedList.push(this.cartList[index].cartItem.id);
			this.isAllselected = this.selectedList.length === this.cartList.length;
			this.sum();
		},
		// 全选商品
		allSelect() {
			let len = this.cartList.length;
			let arr = [];
			for (let i = 0; i < len; i++) {
				// 当商品
				this.cartList[i].selected = !this.isAllselected;
				arr.push(this.cartList[i].cartItem.id);
			}
			this.selectedList = this.isAllselected ? [] : arr;
			this.isAllselected = !(this.isAllselected || arr.length === 0);
			if (arr.length > 0) {
				this.sum();
			}
		},
		// 减少数量(执行接口)
		sub(item, index) {
			if (this.cartList[index].cartItem.quantity <= 1) {
				return;
			}
			this.cartList[index].cartItem.quantity--;
			this.numberChange(item);
		},
		// 增加数量(执行接口)
		add(item, index) {
			this.cartList[index].cartItem.quantity++;
			this.numberChange(item, undefined, index, 'add');
		},
		// 控制可输入购物车商品数量
		discard() {},
		// 监听购物车商品数量改变
		async numberChange(item, data, index, type) {
			if (data) {
				this.cartList[index].cartItem.quantity = data.detail.value;
			}
			if(this.cartList[index].cartItem.quantity > item.product.promotionPerLimit) {
				this.cartList[index].cartItem.quantity = item.product.promotionPerLimit;
				this.$mHelper.toast('該商品限購   '+item.product.promotionPerLimit +'   件');
			}

			await this.$http
				.get(`${quantity}`, {
					id: item.cartItem.id,
					quantity: item.cartItem.quantity
				})
				.then(r => {
					if (r.code === 200) {
						this.sum();
					} else {
						if (type === 'add') {
							this.cartList[index].cartItem.quantity--;
						}
						this.$mHelper.toast(r.message);
					}
				})
				.catch(() => {
					if (type === 'add') {
						this.cartList[index].cartItem.quantity--;
					}
				});
		},
		// 创建订单
		async createOrder() {
			if (this.selectedList.length === 0) return;
			const data = {};
			const ids = [];
			let len = this.cartList.length;
			for (let i = 0; i < len; i++) {
				if (this.cartList[i].selected) {
					ids.push(parseInt(this.cartList[i].cartItem.id, 10));
				}
			}
			data.type = 'cart';
			data.data = ids.join(',');
			data.state = this.state;
			this.selectedList.length = 0;
			this.isAllselected = false;
			this.sumPrice = 0;
			this.navTo(`/pages/order/create/order?data=${JSON.stringify(data)}`);
		},
		// 合计
		sum() {
			this.sumPrice = 0;
			let len = this.cartList.length;
			const arr = [];
			for (let i = 0; i < len; i++) {
				if (this.cartList[i].selected) {
					arr.push(this.cartList[i]);
					this.sumPrice = this.arrSort(arr);
				}
			}
			this.sumPrice = this.sumPrice.toFixed(2);
		},
		// 向下舍去小数点后两位
		floor(val) {
			return Math.floor(val * 100) / 100;
		},
		// 计算相同商品不同规格价格
		arrSort(arr) {
			const map = {},
				dest = [];
			for (let i = 0; i < arr.length; i++) {
				const ai = arr[i];
				if (!map[ai.product.id]) {
					dest.push({
						id: ai.product.id,
						num: 0,
						price: 0,
						data: [ai]
					});
					map[ai.product.id] = ai;
				} else {
					for (let j = 0; j < dest.length; j++) {
						const dj = dest[j];
						if (dj.data[0].product.id === ai.product.id) {
							dj.data.push(ai);
							break;
						}
					}
				}
			}
			const discountArr = [];
			dest.forEach(item => {
				item.data.forEach(item2 => {
					item.num += parseInt(item2.cartItem.quantity, 10);
					item.price += parseInt(item2.cartItem.quantity, 10) * item2.cartItem.price;
				});
				/* const ladderPreferential = item.data[0].ladderPreferential || 0;
				for (let i = 0; i < ladderPreferential.length; i++) {
					if (item.num >= parseInt(ladderPreferential[i].quantity, 10)) {
						ladderPreferential[i].num = item.num;
						ladderPreferential[i].itemPrice = item.data[0].price;
						ladderPreferential[i].totalPrice = item.price;
						discountArr.push(ladderPreferential[i]);
						break;
					}
				} */
			});
			let amount = 0;
			let discount = 0;
			discountArr.forEach(item2 => {
				if (parseInt(item2.type, 10) === 1) {
					discount += item2.price * item2.num;
				} else {
					discount +=
						item2.totalPrice -
						this.floor((item2.itemPrice * item2.price) / 100) * item2.num;
				}
			});
			dest.forEach(item => {
				amount += item.price;
			});
			return amount - discount;
		}
	}
};
</script>
<style lang="scss">
page {
	background-color: #fff;
}
.deleteIcon{
	position: absolute;
	right: 15rpx;
	top: 15rpx;
	z-index: 100;
	text{
		font-size: 35rpx;
		color: #0081ff;
	}
}
.tabr {
	isplay: -webkit-box;
	    display: -webkit-flex;
	    display: flex;
	    -webkit-flex-wrap: wrap;
	    flex-wrap: wrap;

		background-color: #fff;
		width: 100%;
		height: 65upx;
		padding: 0 3%;
		border-bottom: solid 1upx #dedede;
		position: fixed;
		top: 0;
		z-index: 10;
		view {
			width: 33.3%;
			height: 60rpx;
			line-height: 60rpx;
			justify-content: center;
			align-items: center;
			font-size: 28rpx;
			text-align: center;
		}
		.border {
			height: 4upx;
			&.used {
				transform: translate3d(100%, 0, 0);
			}
			&.invalid {
				transform: translate3d(200%, 0, 0);
			}
		}
	}
.checkbox-box {
	display: flex;
	align-items: center;

	.checkbox {
		width: 35upx;
		height: 35upx;
		border-radius: 100%;
		border: solid 2upx;
		display: flex;
		justify-content: center;
		align-items: center;

		.on {
			width: 25upx;
			height: 25upx;
			border-radius: 100%;
		}
	}

	.checkbox-disabled {
		border: solid 2upx $font-color-disabled;
	}

	.text {
		font-size: 28upx;
		margin-left: 10upx;
	}
}
.status {
	width: 100%;
	height: 0;
	position: fixed;
	z-index: 10;
	background-color: #fff;
	top: 0;
	/*  #ifdef  APP-PLUS  */
	height: var(--status-bar-height); //覆盖样式
	/*  #endif  */
}
.header {
	width: 92%;
	padding: 0 4%;
	height: 100upx;
	display: flex;
	align-items: center;
	position: fixed;
	top: 0;
	z-index: 10;
	background-color: #fff;
	/*  #ifdef  APP-PLUS  */
	top: var(--status-bar-height);
	/*  #endif  */
	.title {
		font-size: 36upx;
	}
}
.place {
	background-color: #fff;
	height: 100upx;
	/*  #ifdef  APP-PLUS  */
	margin-top: var(--status-bar-height);
	/*  #endif  */
}
.goods-list {
	width: 100%;
	padding: 0 0 100upx 0;
	margin-top: 70rpx;
	.btn-clear {
		text-align: right;
		padding: 0 $spacing-lg;
		font-size: $font-base + 2upx;
	}

	.tis {
		width: 100%;
		height: 60upx;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 32upx;
	}
}
.empty {
	position: fixed;
	left: 0;
	top: 0;
	width: 100%;
	height: 100vh;
	padding-bottom: 100upx;
	display: flex;
	justify-content: center;
	flex-direction: column;
	align-items: center;
	background: #fff;

	.icongouwuche {
		font-size: $font-lg + 100upx;
	}

	.empty-tips {
		display: flex;
		font-size: $font-sm + 2upx;
		color: $font-color-disabled;

		.navigator {
			margin-left: 16upx;
		}
	}
}
.footer {
	width: 100%;
	padding: 0 2%;
	background-color: #fbfbfb;
	height: 100upx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 28upx;
	position: fixed;
	bottom: 0upx;
	z-index: 5;

	.delBtn {
		border: solid 1upx;
		padding: 0 24upx;
		height: 42upx;
		border-radius: 24upx;
		font-size: $font-sm;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.settlement {
		width: 65%;
		display: flex;
		justify-content: flex-end;
		align-items: center;

		.sum {
			font-size: $font-base;
			margin-right: 8upx;
			display: flex;
			justify-content: flex-end;

			.money {
				font-weight: 600;
			}
		}

		.btn {
			padding: 0 26upx;
			height: 50upx;
			color: #fff;
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 30upx;
		}
	}
}
.popup .layer {
	// #ifndef H5
	bottom: 0;
	// #endif
}
</style>
