<template>
  <view class="rf-product-detail">
		<mp-html v-if="product.welfareDisplay" class="productContent" container-style="color:#333333;padding: 0 30rpx;font-size: 32rpx" :content="product.welfareDisplay.trim()" />
		<!-- <rf-parser lazy-load :html="product.welfareDisplay"></rf-parser> -->
		<view class="detail">
			<view class="title" style="margin-bottom: 20rpx;">{{product.name}}</view>
			<view class="activityShow">
				<text class="showTitle">活動類型</text>
				<text class="showContent">{{product.typeName}}</text>
			</view>
			<view class="activityShow">
				<text class="showTitle">費用</text>
				<text class="showContent">{{product.charge}}</text>
			</view>
			<view class="activityShow">
				<text class="showTitle">活動時間</text>
				<text class="showContent">{{product.startTime}} 到 {{product.endTime}}</text>
			</view>
			<view class="activityShow">
				<text class="showTitle">報名時間</text>
				<text class="showContent">{{product.signStartTime}} 到 {{product.signEndTime}}</text>
			</view>
			<view class="activityShow">
				<text class="showTitle">活動報名上限</text>
				<text class="showContent">{{product.enrollmentUpperlimit}}</text>
			</view>
		</view>
	</view>
</template>
<script>
	import moment from '@/common/moment';
	import {areaDic,simpleWebSign,signUpActivity} from '@/api/activity';
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

		},
		data() {
			return {
				btnLoading: false,
				hasLogin: this.$mStore.getters.hasLogin,
				dqIndex: 0,
				zqIndex: 0,
				xqIndex: 0,
				dqArr: [],
				zqArr: [],
				xqArr: [],
				dqValue: "",
				zqValue: "",
				xqValue: "",
				activityParams: {

				},
				date: "",
				bmFlag: 1,
				showBm: 0,
				bmType: [
					{
						value: 1,
						name: "自己報名"
					},
					{
						value: 0,
						name: "為他人報名"
					}
				],
				genders: [
					{
						value: '男',
						name: '男'
					},
					{
						value: '女',
						name: '女'
					}
				],

			};
		},
		async onShareAppMessage () {

		},
		filters: {
			time(val) {
				return moment(val).format('YYYY-MM-DD HH:mm');
			}
		},
		computed: {

		},
		created() {
			
		},
    methods: {
			showBmFn() {
				this.showBm = 1;
			},
			handleBmChange(e) {
				this.bmFlag = e.detail.value;
			},
			clearData() {
				for(let i in this.activityParams) {
					this.activityParams[i] = "";
				}
				this.date = "";
				this.dqIndex = 0;
				this.zqIndex = 0;
				this.xqIndex = 0;
				this.dqArr= [];
				this.zqArr= [];
				this.xqArr= [];
				this.dqValue= "";
				this.zqValue= "";
				this.xqValue= "";
			},
			signUpActivityFn() {},
			simpleWebSign() {},
			dqChange(e) {
				this.dqIndex = e.target.value;
				this.dqValue = this.dqArr[this.dqIndex].namec;
				this.changeZqData(this.dqArr[this.dqIndex].id);
			},
			zqChange(e) {
				this.zqIndex = e.target.value;
				this.zqValue = this.zqArr[this.zqIndex].namec;
				this.changeXqData(this.zqArr[this.zqIndex].id);
			},
			xqChange(e) {
				this.xqIndex = e.target.value;
				this.xqValue = this.xqArr[this.xqIndex].namec;
			},
			changeZqData(pid) {
				this.zqIndex = 0;
				this.zqValue = "";
				this.$http
					.post(`${areaDic}`,{},{params:{level : 2,pid:pid}})
					.then(async r => {
						this.zqArr = r.data;
					})
					.catch(err => {

					});
			},
			changeXqData(pid) {
				this.xqIndex = 0;
				this.xqValue = "";
				this.$http
					.post(`${areaDic}`,{},{params:{level : 3,pid: pid}})
					.then(async r => {
						this.xqArr = r.data;
					})
					.catch(err => {

					});
			},
			getAddreeData() {
				 this.$http
					.post(`${areaDic}`,{},{params:{level : 1}})
					.then(async r => {
						this.dqArr = r.data;
					})
					.catch(err => {

					});
					this.$http
						.post(`${areaDic}`,{},{params:{level : 2}})
						.then(async r => {
							this.zqArr = r.data;
						})
						.catch(err => {

						});
				this.$http
					.post(`${areaDic}`,{},{params:{level : 3}})
					.then(async r => {
						this.xqArr = r.data;
					})
					.catch(err => {

					});
			},
			// 监听日期更改
			bindDateChange(e) {
				this.date = e.target.value;
			},
			// 监听性别更改
			handleGenderChange(e) {
				this.activityParams.gender = e.detail.value;
			},
    }
  };
</script>
<style lang="scss" scoped>
.rf-product-detail {
	background-color: white;
	min-height: 100vh;
	.noBm{
		text-align: center;
		font-size: 50rpx;
		margin: 100rpx 0;
		color: #e6a23c;
		font-weight: bold;
	}
	.input-content {
		padding: 40upx 30upx;
		.input-item {
			margin-bottom: 30rpx;
			&:last-child {
				margin-bottom: 0;
			}
			.tit {
				width: 100%;
				font-size: 27rpx;
				color: $font-color-base;
				position: relative;
				color: #333333;
			}
			input {
				width: 100%;
				height: 50upx;
				line-height: 50upx;
				font-size: 29rpx;
				color: $font-color-dark;
				border-bottom: 1px solid #dedede;
			}
			.date {
				height: 80upx;
				line-height: 80upx;
				font-size: $font-base + 2upx;
				color: $font-color-dark;
			}


		}
	}

	.gender-item {
		margin-right: 20upx;

		.gender-item-text {
			padding-left: 10upx;
		}

		radio .wx-radio-input.wx-radio-input-checked {
			background: $uni-color-primary;
			border-color: $uni-color-primary;
		}
	}

	.limit-condition{
		padding: 20rpx 60rpx 0;
		color: #e6a23c;
		font-size: 30rpx;
		view{
			font-size: 28rpx;
			margin: 12rpx 0;
		}
	}
	.impor{
		color: #d9534f;
		font-style: initial;
		font-size: 30rpx;
	}
	.detail {
		padding-bottom: 60upx;
		.title{
			font-size: 32rpx;
			font-weight: bolder;
			padding: 30rpx 30rpx 0;
		}
		.activeTitle{
			padding-left: 15rpx;
			border-left: 7rpx solid #3F9DFD;
			font-size: 33rpx;
			margin: 20rpx 0 10rpx 30rpx;
		}
		.activityShow{
			padding: 0 10rpx 0 30rpx;
			margin: 20rpx 0;
			font-size: 27rpx;
			color: #333333;
			.showTitle{
				display: inline-block;
				width: 200rpx;
			}
			.showContent{
				display: inline-block;
				width: calc(100% - 200rpx);
			}
			.showContentBlack{
				display: block;
				width: 100%;
			}
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
