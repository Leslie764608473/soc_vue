<template>
	<view class="coupon-detail" style="background-color: white;height: 100%;min-height: 100vh;">
		<image style="width: 95vw;margin-left: 2.5vw;border-radius: 15rpx;" v-if="couponData.product" :src="couponData.product.pic"></image>
		<!-- <view style="width: 90vw;margin: 50rpx auto;">
		    <tki-barcode :opations="{
					displayValue: false
				}" style="width: 100%" ref="barcode":val="coupon_code" unit="rpx" :onval="true" />
				<view style="text-align: center;font-size: 40rpx;">{{coupon_code}}</view>
		</view> -->
		<view class="detailTitle">{{couponData.product.detailTitle}}</view>
		<mp-html v-if="couponData.product" class="productContent" container-style="color:#333333;padding: 0 5vw;font-size: 30rpx" :content="couponData.product.detailDesc.trim()" />
		<view class="yyInfoBox" v-if="couponData.product">
			<!-- <view>您的預約信息：</view> -->
			<!-- <view>会员编号：{{userObj.umsMember.memberNum}}</view> -->
			<view><text class="titleName">姓名</text>{{userObj.umsMember.nameZh}}</view>
			<view><text class="titleName">电话</text>{{userObj.umsMember.mobile}}</view>
			<view><text class="titleName">領取數量</text><text style="font-weight: bold;color: red;">{{couponData.receiveOrder.getCount}}</text></view>
			<view><text class="titleName">領取服務處</text><text class="longText">{{couponData.serviceCenter.name+" ( "+couponData.serviceCenter.address+" ) "}}</text></view>

			<view v-if="couponData.product.receiveType != 1"><text class="titleName">領取時間</text><text>{{couponData.product.promotionEndTime | time}}</text></view>
			<view v-if="couponData.product.receiveType == 1"><text class="titleName">截止時間</text><text></text>{{couponData.receiveOrder.subDate | time}}</view>
		</view>

		<!-- <button @tap="shareEr = 'show'" type="default" style="background-color: #0f7df7;color: white;width: 50vw;">展示二維碼</button> -->

		<view class="detail-desc" style="padding: 0 35rpx 40rpx;">
			<!-- <view class="d-header">
				<text style="z-index: 1;">商品詳情</text>
			</view> -->
			<!-- <view>商品詳情</view> -->
			<!-- <rf-parser :html="couponData.product.detailDesc" lazy-load></rf-parser> -->
			<!-- <view>福利展示</view> -->
			<rf-parser style="margin: 50rpx 0;" :html="couponData.product.detailMobileHtml" lazy-load></rf-parser>
			<!-- <view>條款及細則</view> -->
			<rf-parser :html="couponData.product.note" lazy-load></rf-parser>
		</view>

		<view style="width: 90vw;margin:30rpx auto 0 auto;padding-bottom: 30rpx;">
			<button style="background-color: #0f7df7;color: white;width: 50vw;" v-if="receive_btn_name != '已領取' && receive_btn_name != '已過期'" type="primary" @tap="to_receive">{{receive_btn_name}}</button>

			<button v-if="receive_btn_name == '已領取' || receive_btn_name == '已過期'" style="background-color: #a1b17f;width: 50vw;" @tap="to_receive" type="primary">{{receive_btn_name}}</button>

			<button v-if="receive_btn_name!='已領取' && receive_btn_name!='已過期' && couponData.product.receiveType != 1" @tap="delete_lyq" style="background: none;color: gray;width: 50vw;margin: 20px auto;text-decoration: underline;" type="primary">取消領取</button>
		</view>

		<!--加载动画-->
		<rfLoading isFullScreen :active="loading"></rfLoading>

		<payKeyboard v-if="showKeyBoard" title="SOC安全鍵盤" @success="enterKeyBoard" @close="closeKeyBoard"></payKeyboard>

		<view
			class="popup spec show"
			v-if="shareEr === 'show'"
			@touchmove.stop.prevent="stopPrevent"
		>
			<!-- 遮罩层 -->
			<view class="mask"></view>
			<view class="share-bg">
				<view @tap="hideShareSpec"><text style="font-size: 55rpx;position: absolute;right: 10rpx;top: -7rpx;" class="iconfont iconguanbi" :class="'text-' + themeColor.name"></text></view>
				<view style="width: 100%;margin: 80rpx auto 30rpx auto;">
				    <tki-barcode :opations="{
							displayValue: false
						}" style="width: 100%" ref="barcode":val="coupon_code" unit="rpx" :onval="true" />
						<view style="text-align: center;font-size: 40rpx;">{{coupon_code}}</view>
				</view>
			</view>

		</view>

	</view>
</template>

<script>
/**
 * @des 优惠券详情
 *
 * @author stav stavyan@qq.com
 * @date 2019-12-09 10:13
 * @copyright 2019
 */
import { couponDetail, couponReceive } from '@/api/userInfo';
import { getReceiveDetail,useReceive,delReceive } from '@/api/product.js';
import moment from '@/common/moment';
import uniDrawer from '@/components/uni-drawer/uni-drawer';
import tkiBarcode from "@/components/tki-barcode/tki-barcode.vue"
 import payKeyboard from '@/components/mi-payKeyboard/mi-payKeyboard.vue'
export default {
	components: {
		uniDrawer,
		tkiBarcode,
		payKeyboard
	},
	data() {
		return {
			shareEr: false,
			showKeyBoard: false,
			password: "",
			coupon_code: "",
			receive_btn_name: "現場工作人員確認",
			headerTop: 0,
			// 控制滑动效果
			typeClass: 'valid',
			theIndex: null,
			oldIndex: null,
			state: 1,
			isStop: false,
			couponList: [],
			loadingType: 'more',
			token: null,
			page: 1,
			showRight: false,
			currentCoupon: {},
			moneySymbol: this.moneySymbol,
			loading: true,
			couponData: {},
			userObj: this.$mStore.getters.userObj,
			couponId: ""
		};
	},
	filters: {
		time(val) {
			return moment(val).format('YYYY年MM月DD日');
		},
		timeFull(val) {
			return moment(val * 1000).format('YYYY-MM-DD HH:mm:ss');
		}
	},
	onLoad(options) {
		this.initData(options);
	},
	methods: {
		stopPrevent() {

		},
		hideShareSpec() {
			this.shareEr = 'hide';
			setTimeout(() => {
				this.shareEr = 'none';
			}, 250);
		},
		enterKeyBoard() {

		},
		closeKeyBoard() {

		},
		show(item) {
			if (item.usableProduct.length === 0) return;
			this.currentCoupon = item;
			this.showRight = true;
		},
		hide() {
			this.showRight = false;
		},
		closeDrawer() {
			this.showRight = false;
		},
		// 初始化数据
		initData(options) {
			this.couponId = options.couponId;
			let delete_type = options.delete_type;
			if(delete_type == "0") {
				this.receive_btn_name = "現場工作人員確認";
			} else if(delete_type == "-1") {
				this.receive_btn_name = "已過期";
			} else {
				this.receive_btn_name = "已領取";
			}
			this.getMyCouponDetail(options.couponId);
		},
		// 获取优惠券
		async getCoupon(item) {
			if (!this.$mStore.getters.hasLogin) {
				this.$mHelper.toast('请您先登录！');
				return;
			}
			if (parseInt(item.is_get, 10) === 0) {
				this.$mHelper.toast('该优惠券暂不可领取！');
				return;
			}
			await this.$http
				.post(`${couponReceive}`, {
					id: item.id
				})
				.then(() => {
					
					let pages = getCurrentPages();
					let prevPage = pages[pages.length - 2];
					prevPage.$vm.initData();
					
					this.$mHelper.toast('领取成功');
					setTimeout(() => {
						this.couponList = [];
						this.getMyCouponDetail(item.id);
					}, 1.5 * 1000);
				});
		},
		// 统一跳转接口
		navTo(route) {
			this.$mRouter.push({ route });
		},
		delete_lyq() {
			uni.showModal({
				cancelText: "取消",
				confirmText: "確認",
				content: '取消后需要重新預約',
				title: '確定取消領取該領用券嗎',
				confirmColor:'#3B8BFF',
				cancelColor:'#222222',
				success: res => {
					if (res.confirm) {
						this.$http
										.post(`${delReceive}`, {},{
											params: {
												id : this.couponId,
											}
										})
										.then(r => {
											if(r.data == "删除成功") {
												this.$mHelper.toast("取消成功！");
												setTimeout(()=>{
													let pages = getCurrentPages();
													let prevPage = pages[pages.length - 2];
													prevPage.$vm.initData();
													uni.navigateBack();
												},2000);
											} else {
												this.$mHelper.toast("取消失敗!");
											}
										})
										.catch((err) => {

										});
					} else if (res.cancel) {
						// 取消
						console.log('cancel')
					}
				}
			});
		},
		to_receive() {
			if(this.receive_btn_name == "現場工作人員確認") {
				uni.showModal({
					cancelText: "取消",
					confirmText: "確認",
					content: '否則不予发放',
					title: '請服務處員工查看本頁信息后再點擊確認領取',
					confirmColor:'#3B8BFF',
					cancelColor:'#222222',
					success: res => {
						if (res.confirm) {
							this.showKeyBoard = true;
						} else if (res.cancel) {
							// 取消
							console.log('cancel')
						}
					}
				});

			}
		},
		useReceiveFn() {
			 this.$http
				.post(`${useReceive}`, {},{
					params: {
						id : this.couponId,
						password : this.password
					}
				})
				.then(r => {
					if(r.code == 500) {
						this.$mHelper.toast(r.message);
						this.password = "";
					} else if(r.code == 200) {
						this.$mHelper.toast("領取成功!");
						this.receive_btn_name = "已領取";
						this.showKeyBoard = false;
						this.password = "";
					}
				})
				.catch((err) => {

				});
		},
		// 获取我的收货地址列表
		async getMyCouponDetail(id) {
			await this.$http
				.post(`${getReceiveDetail}`, {},{
					params: {
						order_id : id
					}
				})
				.then(r => {
					this.loading = false;
					this.couponData = r.data[0];
					this.coupon_code = r.data[0].receiveOrder.qrCode;
					this.$forceUpdate();
				})
				.catch(() => {
					this.loading = false;
				});
		}
	}
};
</script>
<style lang="scss">
	.share-bg {
		width: 90vw;
		background-color: white;
		z-index: 10;
		text-align: center;
		position: relative;
		margin: 150rpx auto;
		border-radius: 15rpx;
		padding: 20rpx 30rpx;
		.titleShare{
			margin-top: 40rpx;
			font-size: 35rpx;
		}

	}
.list {
	display: flex;
	width: 100%;
	position: relative;
}
.detailTitle{
	padding: 0 5vw;
	font-size: 36rpx;
	font-weight: bolder;
	margin: 20rpx 0;
}
.yyInfoBox{
	width: 90vw;margin: 20rpx auto;
	border-top: 1px solid #d9d9d9;
	view{
		margin: 20rpx 0;
		font-size: 30rpx;
		.titleName{
			font-weight: 550;
			margin-right: 20rpx;
			display: inline-block;
			    width: 180rpx;
					font-size: 28rpx;
		}
		.longText{
			display: inline-block;
			    width: calc(100% - 200rpx);
			    vertical-align: top;
		}
	}
}

.sub-list {
	width: 100%;
	padding-top: 10upx;
	.row {
		width: 92%;
		height: 24vw;
		margin: 10upx auto;
		border-radius: 8upx;
		align-items: center;
		position: relative;
		overflow: hidden;
		z-index: 4;
		border: 0;
		.carrier {
			background-color: #fff;
			position: absolute;
			width: 100%;
			padding: 0 0;
			height: 100%;
			z-index: 3;
			display: flex;
			.left {
				flex: 1;
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
						color: #fff;
						text-align: center;
						line-height: 32upx;
						background: #f85e52;
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
				position: relative;
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
				.used {
					position: absolute;
					right: 10upx;
					bottom: 5upx;
					font-size: $font-sm;
					color: $base-color;
				}
				.shixiao {
					position: absolute;
					right: 0;
					top: -20upx;
					font-size: 150upx;
					z-index: 6;
					color: rgba(153, 153, 153, 0.2);
				}
			}
			.right {
				width: 28%;
				color: #fff;
				text-align: center;
				background: linear-gradient(
					to right,
					rgba(250, 67, 106, 0.72),
					rgba(250, 67, 106, 0.64)
				);
				.ticket,
				.criteria {
					width: 100%;
				}
				.ticket {
					padding-top: 20upx;
					.num {
						font-size: $font-lg + 12upx;
						font-weight: 600;
						line-height: 1.2;
					}
					.unit {
						font-size: 24upx;
					}
				}
				.criteria {
					font-size: $font-base;
				}
				.btn-group {
					display: flex;
					justify-content: space-between;
					align-items: center;
					.use {
						flex: 1;
						margin: 0 6upx;
						height: 40upx;
						justify-content: center;
						align-items: center;
						font-size: 24upx;
						background-color: #fff;
						color: $base-color;
						border-radius: 40upx;
						padding: 0 4upx;
					}
				}
			}
		}
	}
}
.drawer {
	.close {
		.btn {
			width: 320upx;
			height: 76upx;
			line-height: 76upx;
			border-radius: 50px;
			margin-top: 70upx;
			background: $uni-color-primary;
			color: #fff;
			font-size: $font-lg;
			border: none;
			&:after {
				border-radius: 100px;
			}
		}
	}
}
</style>
