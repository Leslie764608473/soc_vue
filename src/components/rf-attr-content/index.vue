<template>
	<view class="attr-content">
			<view class="select-count" style="border-top: none;">
				<text>购买数量</text>
				<rf-number-box
					class="step"
					:min="parseInt(product.min_buy, 10) || minNum"
					:max="parseInt(product.max_buy, 10) || (maxNum === 0 ? parseInt(stock || product.stock, 10) : maxNum)"
					:value="cartCount"
					@eventChange="numberChange"
				></rf-number-box>
			</view>
		<button class="btn bg-blue" @tap="toggleSpec">確認</button>
	</view>
</template>
<script>
/**
 *@des 商品规范组件
 *@author stav stavyan@qq.com
 *@blog https://stavtop.club
 *@date 2020/05/03 19:17:15
 */
import rfNumberBox from '@/components/rf-number-box';
export default {
	name: 'rfAttrContent',
	components: { rfNumberBox },
	props: {
		showBuyBtn: {
			type: Boolean,
			default: false
		},
    isSelectedNum: {
			type: Boolean,
			default: true
    },
    type: {
			type: String,
			default: 'buy_now'
    },
		product: {
			type: Object,
			default() {
				return {};
			}
		},
		minNum: {
			type: Number,
			default: 1
		},
		maxNum: {
			type: Number,
			default: 0
		}
	},
	data() {
		return {
			styleObject: null,
			specList: [],
			specChildList: [],
			skuId: this.product && this.product.sku_id,
			price: null,
			stock: null,
			cartCount: 1,
			picture: null,
			specSelected: [],
			vipPrice: this.$mAssetsPath.vipPrice,
      moneySymbol: this.moneySymbol,
			skuName: null
		};
	},
  methods: {
    initData() {},
		numberChange(data) {
      this.cartCount = parseInt(data.number, 10);
		},
		toggleSpec() {
			this.$emit('toggle', {
				cartCount: this.cartCount,
			});
		}
	}
};
</script>
<style scoped lang="scss">
	.sku-info-wrapper {
		width: 100%;
		padding-bottom: $spacing-sm;
	}
	.price-wrapper {
		height: 38upx;
		display: flex;
		align-items: center;
		margin: $spacing-sm 0;
		.image {
			width: 120upx;
			height: 38upx;
		}
		.base-color {
			margin-top: 2upx;
		}
	}
	.btn-group {
		display: flex;
		justify-content: space-between;
		.btn {
			width: 40vw;
		}
	}
</style>
