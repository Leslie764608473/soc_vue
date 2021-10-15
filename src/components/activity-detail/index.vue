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
			<view class="activityShow" v-if="product.activityAddr">
				<text class="showTitle">地點</text>
				<text class="showContent">{{product.activityAddr}}</text>
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
				<text class="showTitle">報名人數上限</text>
				<text class="showContent">{{product.enrollmentUpperlimit}}</text>
			</view>
			<!-- <view class="activeTitle">活動詳情</view> -->
			<button v-if="showBm == 0 && overdue" class="confirm-btn confirmBtn" style="border-radius: 20rpx;width: 50vw;" disabled="disabled">我要報名</button>
			<button v-if="showBm == 0 && !overdue" class="confirm-btn confirmBtn" style="border-radius: 20rpx;width: 50vw;" :class="'bg-' + themeColor.name" @tap="showBmFn">我要報名</button>

			<view style="margin: 50rpx 0;padding: 0 30rpx;" v-if="showBm == 1">
				<text style="display: inline-block;width: 200rpx;">報名對象：</text>
				<radio-group @change="handleBmChange" style="font-size: 28rpx;">
					<label
						class="gender-item"
						v-for="(item, index) in bmType"
						:key="index"
					>
						<radio
							class="gender-item-radio"
							:color="themeColor.color"
							:value="item.value"
							:checked="item.value == bmFlag"
						/>
						<text class="gender-item-text">{{ item.name }}</text>
					</label>
				</radio-group>
			</view>

			<view class="noBm" v-if="product.webStartOr == 0">
				該活動報名已關閉
			</view>

			<view class="title" v-if="product.webStartOr != 0 && bmFlag == 0 && showBm == 1">報名活動</view>

			<view class="limit-condition" v-if="(product.limit_age_start || product.limit_age_end || product.limit_address || product.isMember) && product.webStartOr != 0 && showBm == 1 && bmFlag == 0">
				<text>注意事項</text>
				<view v-if="product.limit_age_end">僅限 {{product.limit_age_start}} ~ {{product.limit_age_end}} 歲人員參與</view>
				<view v-if="product.limit_address">僅限
				 <text v-for="(addItem,addIndex) in product.limit_address" :key="addIndex">
					 {{addItem.region_name}}{{addItem.central_district_name}}{{addItem.xq_name}}{{addItem.street}}{{addItem.edifice}}
				 </text>
				  的居民參與</view>
					<view v-if="product.isMember">僅限 會員 參與</view>
			</view>
			<view class="input-content" v-if="product.webStartOr != 0 && bmFlag == 0 && showBm == 1">
				<view class="input-item" >
					<text class="tit">姓名</text>
					<input
						v-model="activityParams.name_zh"
						placeholder="請輸入您的姓名"
					/>
				</view>
				<view class="input-item" >
					<text class="tit">英文名</text>
					<input
						v-model="activityParams.name_en"
						placeholder="請輸入您的英文名"
					/>
				</view>
				<view class="input-item" >
					<text class="tit">手提電話<text class="impor">*</text></text>
					<input
						type="number"
						v-model="activityParams.mobile"
						placeholder="請輸入手提電話"
					/>
				</view>
				<view class="input-item" v-if="item.show_status == 1 && item.value!='area'" v-for="(item,index) in product.selected_field" :key="index">
					<text class="tit">{{item.label}}<text v-if="item.fill_status == 1" class="impor">*</text></text>
					<radio-group v-if="item.value=='sex'" style="display: block;width: 100%;margin-top: 10rpx;font-size: 27rpx;" @change="handleGenderChange">
						<label
						style="margin-right: 50rpx;"
							class="gender-item"
							v-for="(item, index) in genders"
							:key="index"
						>
							<radio
								class="gender-item-radio"
								:color="themeColor.color"
								:value="item.value"
								:checked="item.value == activityParams['gender']"
							/>
							<text class="gender-item-text">{{ item.name }}</text>
						</label>
					</radio-group>

					<picker v-else-if="item.value=='birth'" style="width: 100%;" mode="date" v-model="date" @change="bindDateChange">
						<view class="date" style="background: none;border-bottom: 1px solid #dedede;">{{
							date || '選擇'
						}}</view>
					</picker>
					<input
					v-else
						v-model="activityParams[item.value]"
						:placeholder="'請輸入'+item.label"
					/>
				</view>

				<view class="input-item" v-if="item.show_status == 1 && item.value=='area'" v-for="(item,index) in product.selected_field" :key="index">
							<text class="tit">大區<text v-if="item.fill_status == 1" class="impor">*</text></text>
							<picker style="width: 100%;" @change="dqChange" :value="dqIndex" rangeKey="namec" :range="dqArr">
								<view class="date" style="background: none;border-bottom: 1px solid #dedede;">{{
									dqValue || '請選擇大區'
								}}</view>
							</picker>
				</view>
				<view class="input-item" v-if="item.show_status == 1 && item.value=='area'" v-for="(item,index) in product.selected_field" :key="index">
							<text class="tit">中區<text v-if="item.fill_status == 1" class="impor">*</text></text>
							<picker style="width: 100%;" @change="zqChange" :value="zqIndex" rangeKey="namec" :range="zqArr">
								<view class="date" style="background: none;border-bottom: 1px solid #dedede;">{{
									zqValue || '請選擇中區'
								}}</view>
							</picker>
				</view>
				<view class="input-item" v-if="item.show_status == 1 && item.value=='area'" v-for="(item,index) in product.selected_field" :key="index">
							<text class="tit">小區<text v-if="item.fill_status == 1" class="impor">*</text></text>
							<picker style="width: 100%;" @change="xqChange" :value="xqIndex" rangeKey="namec" :range="xqArr">
								<view class="date" style="background: none;border-bottom: 1px solid #dedede;">{{
									xqValue || '請選擇小區'
								}}</view>
							</picker>
				</view>
			</view>


			<button
			v-if="product.webStartOr != 0 && showBm == 1"
				class="confirm-btn"
				style="border-radius: 20rpx;width: 92vw;"
				:class="'bg-' + themeColor.name"
				:disabled="btnLoading"
				:loading="btnLoading"
				@tap="simpleWebSign">
				報 名
			</button>
			<button
			v-if="product.webStartOr != 0 && showBm == 1"
			class="confirmBtn"
				style="width: 92vw;
    color: #999999;
    background: #ffffff;
    margin-top: 20rpx;"
				@tap="showBm = 0;this.clearData()">
				取消
			</button>
		</view>
	</view>
</template>
<script>
	import moment from '@/common/moment';
	import {areaDic,simpleWebSign,signUpActivity} from '@/api/activity';
	import {verifyAccessToken,login,loginNot,getOrgList,getCreateQRCodeMessage} from '@/api/login.js';
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
			isShare: {
				type: Boolean,
				default: false,
			},
			shareOrgId: {
				type: String,
				default: ''
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
				erCodeImgurl: "",
				appId : this.$mStore.getters.appId,
				secret: this.$mStore.getters.secret,
				orgList: this.$mStore.getters.orgList,
				btnLoading: false,
				hasLoginOrg: this.$mStore.getters.hasLoginOrg,
				userInfoU: this.$mStore.getters.userObj,
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
				otherOrg: false,
				overdue: false
			};
		},
		async onShareAppMessage () {

		},
		onLoad(options) {
			let orgId = options.orgId;
			if(orgId && orgId != this.$mStore.getters.orgId) {
				this.otherOrg = true;
			}
		},
		filters: {
			time(val) {
				return moment(val).format('YYYY-MM-DD HH:mm');
			}
		},
		computed: {

		},
		created() {
			this.getAddreeData();
			setTimeout(()=>{
				this.product.selected_field.forEach((item)=>{
						if(item.show_status == 1) {
							this.activityParams[item.value] = "";
							if(item.value == "sex") {
								this.activityParams["gender"] = "男";
							}
						}
				});
				let signEndTimeStr = this.product.signEndTime;
				signEndTimeStr = signEndTimeStr.replace(/\./g,"/");
				let signEndTime = new Date(signEndTimeStr).getTime();
				let nowTime = new Date().getTime();
				if(signEndTime < nowTime) {
					this.overdue = true;
				} else {
					this.overdue = false;
				}
				this.getAccessToken();
			},1000);
		},
    methods: {
			getAccessToken() {
				this.$http.post(getCreateQRCodeMessage,{},{dataType: "arraybuffer",responseType: 'arraybuffer',params:{
					appid: this.appId,
					secret: this.secret,
					width: 500,
					path: "pages/product/activity?id="+this.product.id,
				}},
				).then(res => {
					console.log(res);
					const arrayBuffer = res.data;
					this.erCodeImgurl = 'data:image/jpeg;base64,'+ uni.arrayBufferToBase64(arrayBuffer);
					console.log(this.erCodeImgurl);
				}).catch((err)=>{
					console.log(err);
				})
			},
			getUuid() {
				 	var s = [];
			    var hexDigits = "0123456789abcdef";
			    for (var i = 0; i < 36; i++) {
			        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
			    }
			    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
			    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
			    s[8] = s[13] = s[18] = s[23] = "-";
			    var uuid = s.join("");
			    return uuid;
			},
			toLogin(orgChoseId,type) {
				let uuid = this.getUuid();
				let login_param = {};
				login_param = {
					username: this.userInfoU.mobile,
					orgId: orgChoseId,
					onlyUuid: uuid
				}
				this.$http
					.post(loginNot,{},{params:login_param})
					.then(res => {
						if(res.code == 200) {
							uni.setStorageSync('accessToken', res.data.tokenHead+""+res.data.token);
							uni.setStorageSync('refreshToken',res.data.tokenHead+""+res.data.token);
							uni.setStorageSync('orgAccessToken',res.data.tokenHead+""+res.data.token);
							this.$http.get(verifyAccessToken).then((r) => {
									this.$mStore.commit('loginOrg',{
										Token: res.data.tokenHead+""+res.data.token,
										UserInfo: r.msg
									});
									// 自動登錄後
									uni.showLoading();
									setTimeout(()=>{
										uni.hideLoading();
										this.simpleWebSign_new();
									},1000);
							})
						}
					}).catch(() => {

					});
			},
			orgLogin(orgId) {
				// 未登錄社團  ----  1. 驗證是否可登錄  2. 可登錄——自動登錄    不可登錄——註冊
				if(this.orgList.length == 0) {
					this.orgList = [];
					this.$http.get(getOrgList,{mobile:this.userInfo.mobile}).then((r) => {
						if(r.code == 200) {
							this.orgList = r.data;
							this.$mStore.commit('setOrgList',r.data);
							this.orgList.forEach((item)=>{
								if(orgId == item.id) {
									if(item.joinStatus == 1) {
										// 已註冊  自動登錄
										this.toLogin(orgId);
										return true;
									} else if (item.joinStatus == -1) {
										// 審核中
										this.$mHelper.toast("您的賬號還在審核中，審核成功即可領取！");
										return false;
									} else {
										// 未註冊
										this.$mRouter.push({route: '/pages/public/register' });
										return false;
									}
								}
							});
						}
					});
					return false;
				}
				this.orgList.forEach((item)=>{
					if(orgId == item.id) {
						if(item.joinStatus == 1) {
							// 已註冊  自動登錄
							this.toLogin(orgId);
							return true;
						} else if (item.joinStatus == -1) {
							// 審核中
							this.$mHelper.toast("您的賬號還在審核中，審核成功即可領取！");
							return false;
						} else {
							// 未註冊
							this.$mRouter.push({route: '/pages/public/register' });
							return false;
						}
					}
				});
			},
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
			signUpActivityFn() {
				this.$http
					.post(`${signUpActivity}`,{},{params:{id:this.product.id}})
					.then(async r => {
							if(r.data.status == 0) {
								this.$mHelper.toast(r.data.msg,6000);
							} else if (r.data.status == 1) {
								let pages = getCurrentPages(); // 当前页面
								let beforePage = pages[pages.length - 2]; // 上一页
								beforePage.onPullDownRefresh(); // 执行上一页的onLoad方法
								this.$mHelper.toast("報名成功！有關資料稍後會專人核對，如有任何查詢，可於辦公時間聯繫當值職員聯絡。請注意：如有重複提交，資料僅以第一次提交為準",10000);
							}
					})
					.catch(err => {

					});
			},
			simpleWebSign_new() {
				if(parseFloat(this.bmFlag) == 1) {
					this.signUpActivityFn();
					return false;
				}
				if(this.activityParams.mobile == "" || this.activityParams.mobile == null) {
					this.$mHelper.toast('請輸入手提電話！');
					return false;
				}
				if((this.activityParams.name_zh == "" || this.activityParams.name_zh == null) && (this.activityParams.name_en == "" || this.activityParams.name_en == null)) {
					this.$mHelper.toast('請輸入您的姓名或英文名！');
					return false;
				}

				var fill_status = true;
				this.product.selected_field.forEach((item)=>{
						if(item.fill_status == 1) {
							if(item.value == "sex" && this.activityParams["gender"] == "") {
								this.$mHelper.toast('請選擇性別！');
								fill_status = false;
								return false;
							}
							if(item.value != "sex" && this.activityParams[item.value] == "") {
								this.$mHelper.toast('請輸入'+item.label);
								fill_status = false;
								return false;
							}
						}
				});

				if(!fill_status) {

					return false;
				}
				 this.activityParams.webActivityId = this.product.id;
				 this.activityParams.activityId = this.product.id;
				 if(this.date.indexOf("-") != -1) {
					 this.activityParams.bir_year = this.date.split("-")[0];
					 this.activityParams.bir_month = this.date.split("-")[1];
					 this.activityParams.bir_day = this.date.split("-")[2];
				 }

				 this.activityParams.region_name = this.dqValue;
				 this.activityParams.central_district_name = this.zqValue;
				 this.activityParams.xq_name = this.xqValue;

				 this.activityParams.region_code = this.dqArr[this.dqIndex].code;
				 this.activityParams.central_district_code = this.zqArr[this.zqIndex].code;
				 this.activityParams.xq_number = this.xqArr[this.xqIndex].code;

				this.$http
					.post(`${simpleWebSign}`,this.activityParams)
					.then(async r => {
							if(r.code == 200) {
								this.$mHelper.toast("報名成功！有關資料稍後會專人核對，如有任何查詢，可於辦公時間聯繫當值職員聯絡。請注意：如有重複提交，資料僅以第一次提交為準",10000);
								this.clearData();
							} else {
								this.$mHelper.toast(r.data);
							}
					})
					.catch(err => {
						this.$mHelper.toast(err);
					});
			},
			simpleWebSign() {
				if(!this.hasLogin) {
					this.$mRouter.reLaunch({ route: '/pages/index/welcome/index?orgId='+this.shareOrgId+'&type=2&id='+this.product.id});
					return false;
				} else {
					if(!this.hasLoginOrg) {
						this.orgLogin(this.shareOrgId);
						return false;
					} else {
						if(this.otherOrg) {
							this.orgLogin(this.shareOrgId);
							return false;
						}
					}
				}
				this.simpleWebSign_new();
			},
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
	height: 100%;
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


	.confirmBtn::after{
		border-radius: 40rpx !important;
		width: 199%;
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
