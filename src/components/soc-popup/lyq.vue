<template name="popup">
	<view @touchmove.stop.prevent="clear">
		<view class="popup_mask" @touchmove.stop.prevent="clear"></view>
		<view class="popup_content">
				<uni-forms class="lyqForm" ref="lyqForm" :modelValue="lyqParams" label-width="100" style="width: 100vw;">
					<uni-forms-item class="registerFormItem" required label="福利領取機構 " >
						<view style="position: relative;">
							<view class="clickNoBox" :class="disabledArr.length===serviceNameArr.length?'disabledClass':''" @tap.stop="serviceFn"></view>
							<picker @change="bindPickerChange" @tap="serviceNameArr_tap" :value="serviceIndex" range-key="name" :range="serviceNameArr">
								<uni-easyinput disabled :inputBorder="false" type="text" v-model="lyqParamsSt" placeholder="請選擇福利領取機構" />
							</picker>
						</view>
							<!-- <picker @change="bindPickerChange" :value="serviceIndex" range-key="name" :range="serviceNameArr">
								<uni-easyinput disabled :inputBorder="false" type="text" v-model="lyqParamsSt" placeholder="請選擇福利包含機構" />
							</picker> -->
					</uni-forms-item>
					<uni-forms-item class="registerFormItem" required label="領取日期 " >
						<view style="position: relative;">
							<view class="clickNoBox" :class="dateFlag?'disabledClass':''" @tap.stop="dateFlagFn"></view>
							<picker @change="sub_date_change" @tap="sub_date_tap" :value="subDateIndex" range-key="time" :range="sub_date_arr">
								<uni-easyinput disabled :inputBorder="false" type="text" v-model="lyqParams.sub_date" placeholder="請選擇領取日期" />
							</picker>
						</view>
					</uni-forms-item>
					<uni-forms-item class="registerFormItem" required label="領取時間 " >
						<picker @change="sub_time_change" @tap="sub_time_tap" :value="subTimeIndex" range-key="value" :range="sub_time_arr_now">
							<uni-easyinput disabled :inputBorder="false" type="text" v-model="lyqParams.sub_time" placeholder="請選擇領取時間" />
						</picker>
					</uni-forms-item>
					<uni-forms-item class="registerFormItem" required label="領取数量 " >
						<picker :value="countIndex" @change="count_change" :range="get_count_arr">
							<uni-easyinput disabled :inputBorder="false" type="text" v-model="lyqParams.get_count" placeholder="請選擇領取数量" />
						</picker>
					</uni-forms-item>
				</uni-forms>
			<view class="button">
				<view class="back" @tap="back">取消</view>
				<view class="consent" @tap="to_receive" :loading="btnLoading">確認</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {getServiceByMid,getSubTime,addReceive} from '@/api/product.js';
export default {
	name: 'popup',
	props: ["serviceArr","serviceNameArr","disabledArr","product"],
	data() {
		return {
			btnLoading: false,
			lyqParams: {
				sub_date: "",
				sub_time: "",
				get_count: 1
			},
			serviceDisabled: false,
			showPopup: true,
			serviceIndex: 0,
			subDateIndex: 0,
			subTimeIndex: 0,
			countIndex: 0,
			lyqParamsSt: "",
			sub_date_arr: [],
			sub_time_arr: [],
			sub_time_arr_now: [],
			get_count_arr: [1],
			receive_falg: 1,
			userObj: this.$mStore.getters.userObj,
			dateFlag: true
		};
	},
	created() {

	},
	methods: {
		serviceFn() {
			if(this.disabledArr.length!=this.serviceNameArr.length) {
				return false;
			}

			this.$mHelper.toast("您所在機構沒有參與此次福利,詳情請聯係社團管理員");
			return false;
		},
		dateFlagFn() {
			if(!this.dateFlag) {
				return false;
			}
			if(this.lyqParamsSt == "") {
				this.$mHelper.toast("請先選擇領取機構");
				return false;
			}
		},
		sub_time_tap(e) {
			if(this.lyqParams.sub_date == "") {
				e.preventDefault();
				e.stopPropagation();
				this.$mHelper.toast("請先選擇領取日期");
				return false;
			}
		},
		serviceNameArr_tap(e) {
			this.serviceDisabled = true;
		},
		sub_date_tap(e) {
			if(this.lyqParamsSt == "") {
				e.preventDefault();
				e.stopPropagation();
				this.$mHelper.toast("請先選擇領取機構");
				return false;
			}
		},
		count_change(e) {
			this.countIndex = e.target.value;
			let count = this.get_count_arr[this.countIndex]
			this.lyqParams.get_count = count;
			this.$forceUpdate();
		},
		sub_time_change(e) {
			this.subTimeIndex = e.target.value;
			let time = this.sub_time_arr_now[this.subTimeIndex].value
			this.lyqParams.sub_time = time;
			this.$forceUpdate();
		},
		sub_date_change(e) {
			this.subDateIndex = e.target.value;
			let date = this.sub_date_arr[this.subDateIndex].time

			if(new Date(date+" 00:00:00").getTime() < new Date().getTime()) {
				this.$mHelper.toast("該領取日期已過期！");
				this.lyqParams.sub_date = "";
				return false;
			}

			this.lyqParams.sub_date = date;
			this.sub_time_arr.forEach((item)=>{
				if(Object.keys(item)[0] == date) {
					this.sub_time_arr_now = [];
					item[date].forEach((item_)=>{
						this.sub_time_arr_now.push({
							value: item_.startTime+" 至 "+item_.endTime,
							label: item_.status==1?item_.startTime+" 至 "+item_.endTime:item_.startTime+" 至 "+item_.endTime+"  (已約滿)",
							disabled : item_.status==1?false:true
						})
					});
					this.$forceUpdate();
				}
			});
		},
		bindPickerChange(e) {
			this.serviceIndex = e.target.value;
			let serviceObj = this.serviceArr[parseFloat(e.target.value)];
			if(serviceObj.status == 0) {
				this.$mHelper.toast("非本機構，不可選擇！");
				this.lyqParamsSt = "";
				return false;
			}
			if(serviceObj.stock == 0) {
				this.$mHelper.toast("該機構預約已滿");
				this.lyqParamsSt = "";
				return false;
			}

			this.lyqParamsSt = this.serviceArr[parseFloat(e.target.value)].name;
			this.service_id_change(this.serviceArr[parseFloat(e.target.value)].id);
		},
		service_id_change(id) {
				this.get_count_arr = [];
				for(let i=this.product.promotionPerLimit;i>0;i--) {
					this.get_count_arr.push(i);
				}
				this.dateFlag = true;
				uni.showLoading();
				this.$http.post(getSubTime,{},{
					params: {
						serviceId : id,
						pid : this.product.id
					}
				}).then((res)=>{
					this.sub_date_arr = [];
					this.sub_time_arr = [];
					this.sub_time_arr_now = [];
					res.data.forEach((item)=>{
						this.sub_date_arr.push({
							time : item.subDate,
							status : item.timeOut==1?true:false
						});
						let obj = {};
						let arr = [];
						item.time.forEach((item_)=>{
							arr.push(item_);
						});
						obj[item.subDate] = arr;
						this.sub_time_arr.push(obj);
						this.$forceUpdate();
					});

					this.dateFlag = false;
					uni.hideLoading();

				}).catch((err)=>{
					uni.hideLoading();
				});
		},
		// 禁止滚动
		clear() {
		},
		back() {
			this.$parent.isLyqPopupShow = false;
		},
		to_receive() {
			if(this.lyqParamsSt == "" || this.lyqParamsSt == null) {
					this.$mHelper.toast("請選擇領取服務處");
					return false;
			}
			if(this.lyqParams.sub_date == "" || this.lyqParams.sub_date == null) {
					this.$mHelper.toast("請選擇領取日期");
					return false;
			}
			if(this.lyqParams.sub_time == "" || this.lyqParams.sub_time == null) {
					this.$mHelper.toast("請選擇領取時間");
					return false;
			}
			if(this.lyqParams.get_count == "" || this.lyqParams.get_count == null) {
					this.$mHelper.toast("請選擇領取数量");
					return false;
			}

			this.lyqParams.service_id = this.serviceArr[this.serviceIndex].id;
			this.lyqParams.member_id = this.userObj.memberId;
			this.lyqParams.org_id = this.$mStore.getters.orgId;
			this.lyqParams.product_id = this.product.id;
			if(this.lyqParams.sub_time.indexOf("至") != -1) {
				this.lyqParams.start_time = (this.lyqParams.sub_time.split("至")[0]);
				this.lyqParams.end_time = (this.lyqParams.sub_time.split("至")[1]);
			}
			this.btnLoading = true;
			if(this.receive_falg == 1) {

			} else {
				this.btnLoading = false;
				return;
			}
			this.receive_falg = 0;

			this.$http.post(addReceive,{},{
				params: this.lyqParams
			}).then((res)=>{
				this.btnLoading = false;
				this.receive_falg = 1;
				if(res.code == 200) {
					this.$mHelper.toast("領取成功！");
					setTimeout(()=>{
						this.$parent.isLyqPopupShow = false;
						this.$parent.get_receive_status = 1;
					},2000);
				} else {
					this.$mHelper.toast(res.message);
				}
			}).catch((err)=>{
				this.btnLoading = false;
				this.receive_falg = 1;
				this.$mHelper.toast(err);
			});
		}
	}
};
</script>

<style lang="scss">
	.clickNoBox{
		position: absolute;
		width: 100%;
		height: 100%;
		z-index: 1;
	}
	.disabledClass{
		z-index: 100;
	}
	.is-disabled{
				background: none !important;
				background-color: none !important;
	}
	.registerFormItem .label-text{
		height: 100%;
	}
.popup_mask {
	position: fixed;
	bottom: 0;
	top: 0;
	left: 0;
	right: 0;
	background-color: rgba(0, 0, 0, 0.4);
	transition-property: opacity;
	transition-duration: 0.3s;
	opacity: 0;
	z-index: 98;
}

.popup_mask {
	opacity: 1;
}

.popup_content {
	overflow: hidden;
	box-sizing: border-box;
	padding: 50rpx 0 0;
	position: fixed;
	bottom: 30%;
	border-radius: 8px;
	min-height: 400upx;
	background: #ffffff;
	width: 80%;
	left: 10%;
	z-index: 99;

	.title {
		text-align: center;
		font-size: 34upx;
		padding: 10upx 0 0 0;
	}

	.explain_text {
		font-size: 30upx;
		padding: 30upx 30upx 40upx 30upx;
		line-height: 38upx;

		.line {
			display: block;

			.path {
				color: #007aff;
				display: inline-block;
				text-align: center;
			}
		}
	}

	.button {
		display: flex;
		padding: 20upx;
		align-items: center;
		font-size: 34upx;
		justify-content: space-around;
		border-top: 1upx solid #f2f2f2;

		view {
			text-align: center;
		}
	}
}
</style>
