<template>
	<view class="login">
		<view class="login-type-2">
			<!--顶部返回按钮-->
			<text class="back-btn iconfont iconzuo" @tap="navBack"></text>
			<view class="login-top" :class="'bg-' + themeColor.name">
				<view class="logoBox">
					<image class="logoImg" :src="NowLogo"></image>
					<text class="logoText">{{messageData.orgName}}</text>
				</view>
			</view>
			<view class="login-type-content">
				<image class="login-bg" :src="loginBg" :style="{height: messageData.orgId == 48 ? '100vw' : '83vw'}"></image>
				<view class="main">
					<block v-if="tabCurrentIndex === 0">
						<view class="login-type-form">
							<view class="input-item" v-if="messageData.orgId == 48" style="border-bottom: 1px solid #D0D0FF;">
								<picker @change="bindPickerChangeOrg" :value="orgIndex" rangeKey="name" :range="orgArr">
									<text class="iconfont iconkuaijiecaidan" :class="'text-' + themeColor.name"></text>
									<uni-easyinput style="display: inline-block;margin-left: 80rpx;background: white;" disabled :inputBorder="false" type="text" v-model="orgChoseName" placeholder="請選擇要註冊的社團" />
								</picker>
							</view>
							<view class="input-item" style="border-bottom: 1px solid #D0D0FF;">
								<picker @change="bindPickerChange" :value="serviceIndex" :range="serviceNameArr">
									<text class="iconfont iconkuaijiecaidan" :class="'text-' + themeColor.name"></text>
									<uni-easyinput style="display: inline-block;margin-left: 80rpx;background: white;" disabled :inputBorder="false" type="text" v-model="registerSt" placeholder="請選擇所屬社團分會" />
								</picker>
							</view>
							<view class="input-item">
								<text class="iconfont icondianhua" :class="'text-' + themeColor.name"></text>
								<selectBox style="position: absolute;left: 60rpx;top: 15rpx;" :select="phoneType"></selectBox>
								<input
									class="login-type-input"
									style="padding-left: 230rpx;"
									type="number"
									name="mobile"
									v-model="loginParams.mobile"
									placeholder="請輸入手機號碼"
									maxlength="13"
									@blur="blurMobileChange"
								/>
							</view>
							<view class="input-item input-item-sms-code" >
								<text class="iconfont iconyanzhengma" :class="'text-' + themeColor.name"></text>
								<view class="input-wrapper">
									<view class="rf-input-wrapper">
										<input
											type="number"
											class="login-type-input"
											v-model="loginParams.code"
											placeholder="請輸入驗證碼"
											maxlength="11"
										/>
									</view>
									<button
										class="sms-code-btn"
										:disabled="smsCodeBtnDisabled"
										@tap.stop="getSmsCode('login')"
									>
										<text v-if="!smsCodeBtnDisabled">獲取驗證碼</text>
										<text v-else class="sms-code-resend">{{
											`重新發送 (${codeSeconds})`
											}}</text>
									</button>
								</view>
							</view>
						</view>
						<!-- <view class="login-type-tips">
							<view @tap="showLoginBySmsCode" class="forget-section">
								{{ loginByPass ? '验证码登录' : '密码登录' }}
							</view>
							<text @tap="navTo('/pages/public/password')">忘记密码？</text>
						</view> -->
						<button
							class="confirm-btn"
							:class="'bg-' + themeColor.name"
							:disabled="btnLoading"
							:loading="btnLoading"
							@tap="toLogin"
						>下一步 </button>
					</block>
				</view>
			</view>
		</view>
	</view>
</template>
<script>
	import LXLogo from '@/static/LX.png';
		import HBLogo from '@/static/HB.jpg';
		import SDLogo from '@/static/shandong/logo.jpg';
import { loginByPass, loginBySmsCode, smsCode, authLogin, registerByPass,login,verifyAccessToken,serviceList,verifyTelephone } from '@/api/login';
import moment from '@/common/moment';
import selectBox from '@/components/select-box/select-box.vue'
import qs from 'qs'
export default {
	components: {
		selectBox
	},
	data() {
		return {
			NowLogo: null,
			messageData: this.$mStore.getters.messageData,
			phoneType: ["+852","+86"],
			/* orgArr: [
				{name:"連心1.0",id:48},
				{name:"香港山東社團總會",id:46},
				{name:"香港河北聯誼會",id:47}
			], */
			orgArr: this.$mStore.getters.orgList,
			orgIndex: 0,
			orgChoseName: "連心1.0",
			orgChoseId: this.$mStore.getters.orgId,
			serviceArr: [],
			serviceNameArr: [],
			serviceIndex: 0,
			registerSt: "",
			loginParams: {
				nameZh: '',
				mobile: '',
				code: '',
				userYear: ''
			},
			registerParams: {
				nameZh: '',
				mobile: '',
				password: '',
				password_repetition: '',
				promoCode: '',
				nickname: '',
				code: ''
			},
			btnLoading: false,
			reqBody: {},
			codeSeconds: 0, // 验证码发送时间间隔
			loginByPass: true,
			smsCodeBtnDisabled: true,
			userInfo: null,
			loginBg: this.$mAssetsPath.loginBg,
			loginPic: this.$mAssetsPath.loginPic,
			appName: this.$mSettingConfig.appName,
			styleLoginType: "two",//this.$mSettingConfig.styleLoginType,
			closeRegisterPromoCode: this.$mSettingConfig.closeRegisterPromoCode,
			tabCurrentIndex: 0,
			typeList: [
				{
					text: '短信登錄'
				},
				{
					text: '其他驗證'
				}
			]
		};
	},
	onShow() {
		let orgLogo =  this.$mStore.getters.messageData.orgLogo;
		if(orgLogo == "LX") {
			this.NowLogo = LXLogo;
		} else if(orgLogo == "SD") {
			this.NowLogo = SDLogo;
		} else if(orgLogo == "HB") {
			this.NowLogo = HBLogo;
		} else {
			this.NowLogo = LXLogo;
		}

		if (this.$mStore.getters.hasLogin) {
			this.$mRouter.reLaunch({ route: '/pages/index/index' });
		}
	},
	onLoad(options) {
		this.tabCurrentIndex = parseInt(options.type || 0, 10);
		const time =
			moment().valueOf() / 1000 - uni.getStorageSync('loginSmsCodeTime');
		if (time < 60) {
			this.codeSeconds =
				this.$mConstDataConfig.sendCodeTime - parseInt(time, 10);
			this.handleSmsCodeTime(this.codeSeconds);
		} else {
			this.codeSeconds = this.$mConstDataConfig.sendCodeTime;
			this.smsCodeBtnDisabled = false;
			uni.removeStorageSync('loginSmsCodeTime');
		}
		this.registerParams.promoCode = options.promo_code;
		this.loginParams.mobile = uni.getStorageSync('loginMobile') || '';
		this.loginParams.password = uni.getStorageSync('loginPassword') || '';
		this.userInfo = uni.getStorageSync('wechatUserInfo');
		this.getServeArr(this.$mStore.getters.orgId)
	},
	methods: {
		dropDownChange() {

		},
		getServeArr(id) {
			this.$http.post(serviceList+"?orgId="+id).then((res)=>{
				this.serviceArr = res.data;
				this.serviceNameArr = [];
				res.data.forEach((item)=>{
					let name = item.name;
					if(item.name == "香港山東社團总会") {
						name += "直屬會員（非現有屬會會員）";
					}
					this.serviceNameArr.push(name);
				})
				this.$forceUpdate();
			});
		},
		bindPickerChange(e) {
			this.serviceIndex = e.target.value;
			this.registerSt = this.serviceArr[parseFloat(e.target.value)].name;
		},
		bindPickerChangeOrg(e) {
			this.orgIndex = e.target.value;
			this.orgChoseName = this.orgArr[parseFloat(e.target.value)].name;
			this.orgChoseId = this.orgArr[parseFloat(e.target.value)].id;
			this.getServeArr(this.orgChoseId);
			if(this.registerSt != "") {
				this.registerSt = "";
				this.serviceIndex = 0;
			}
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
		loginTest(mobile, password) {
			this.loginParams.mobile = mobile;
			this.loginParams.password = password;
		},
		// 发送验证码并进入倒计时
		async getSmsCode(usage = 'login') {
			this.reqBody['mobile'] = this.tabCurrentIndex === 0 ? this.loginParams['mobile'] : this.registerParams['mobile'];
			let checkSendCode = this.$mGraceChecker.check(
				this.reqBody,
				this.$mFormRule.sendCodeRule
			);
			if (!checkSendCode) {
				this.$mHelper.toast(this.$mGraceChecker.error);
				return;
			}
			await this.$http
				.get(smsCode, {
					telephone: this.reqBody['mobile'],
					orgId : this.orgChoseId,
					type : 1
				})
				.then(r => {
					if (r.data) {
						this.$mHelper.toast(`驗證碼發送成功, 驗證碼是${r.data}`);
					} else {
						this.$mHelper.toast('驗證碼已發送');
					}
					this.smsCodeBtnDisabled = true;
					uni.setStorageSync('loginSmsCodeTime', moment().valueOf() / 1000);
					this.handleSmsCodeTime(59);
				}).catch((err)=>{
					if(err == "请求过于频繁，请30s后在尝试") {
						this.smsCodeBtnDisabled = true;
						uni.setStorageSync('loginSmsCodeTime', moment().valueOf() / 1000);
						this.handleSmsCodeTime(30);
					}
					this.$mHelper.toast(err);
				});
		},
		handleSmsCodeTime(time) {
			this.codeSeconds = time;
			let timer = setInterval(() => {
				if (time === 0) {
					clearInterval(timer);
					this.smsCodeBtnDisabled = false;
				} else {
					this.codeSeconds = time;
					this.smsCodeBtnDisabled = true;
					time--;
				}
			}, 1000);
		},
		// 失去焦点的手机号
		blurMobileChange(e) {
			this.mobile = e.detail.value;
		},
		// 切换登录方式
		showLoginBySmsCode() {
			this.loginByPass = !this.loginByPass;
		},
		// 返回上一页
		navBack() {
			this.$mRouter.reLaunch({ route: '/pages/index/index' });
			// this.$mRouter.back();/
		},
		// 统一跳转路由
		navTo(route) {
			this.$mRouter.push({ route });
		},
		// 返回主页
		toHome() {
			this.$mRouter.reLaunch({ route: '/pages/index/index' });
		},
		// 提交表单
		async toLogin() {
			let login_param = {};
				login_param = {
					username: this.loginParams.mobile,
					authCode: this.loginParams.code,
					name: this.loginParams.nameZh,
					orgId: this.orgChoseId,
				}
			if (login_param.username == "") {
				this.$mHelper.toast('請輸入手機號！');
				return;
			}
			if (login_param.authCode == "") {
				this.$mHelper.toast("請輸入驗證碼!");
				return;
			}
			if (this.registerSt == "") {
				this.$mHelper.toast("請選擇所屬社團名稱!");
				return;
			}

			this.$http
				.get(verifyTelephone, {
					telephone: this.loginParams.mobile,
					orgId : this.orgChoseId,
					authCode : this.loginParams.code
				})
				.then(r => {
						if(r.code == 200) {
							uni.setStorageSync('registerMobile', this.loginParams.mobile);
							uni.setStorageSync('registerService_center_id', this.registerSt);
							uni.setStorageSync('registerService_id', this.serviceIndex);
							uni.setStorageSync('registerOrg_id', this.orgChoseId);
							uni.setStorageSync('orgChoseName', this.orgChoseName);
							//this.$mStore.commit('setOrgId',this.orgChoseId);
							this.$mRouter.push({ route: '/pages/public/register' });
						}
				});
		},
		// 登录
		async handleLogin(params, loginApi) {
			this.btnLoading = true;
			await this.$http
				.post(loginApi, params)
				.then(r => {
					this.$mHelper.toast('恭喜您，登录成功！');
					this.$mStore.commit('login', r.data);
					if (this.userInfo) {
						this.btnLoading = false;
						const oauthClientParams = {};
						/*  #ifdef MP-WEIXIN */
						oauthClientParams.oauth_client = 'wechatMp';
						/*  #endif  */
						/*  #ifndef MP-WEIXIN */
						oauthClientParams.oauth_client = 'wechat';
						/*  #endif  */
						const userInfo = JSON.parse(this.userInfo);
						this.$http.post(authLogin, {
							...userInfo,
							...oauthClientParams,
							gender: userInfo.sex || userInfo.gender,
							oauth_client_user_id: userInfo.openid || userInfo.openId,
							head_portrait: userInfo.headimgurl || userInfo.avatarUrl
						});
					}
					uni.removeStorageSync('wechatUserInfo');
					const backToPage = uni.getStorageSync('backToPage');
					uni.removeStorageSync('backToPage');
					if (backToPage) {
						if (
							backToPage.indexOf('/pages/profile/profile') !== -1 ||
							backToPage.indexOf('/pages/cart/cart') !== -1 ||
							backToPage.indexOf('/pages/index/index') !== -1 ||
							backToPage.indexOf('/pages/notify/notify') !== -1 ||
							backToPage.indexOf('/pages/category/category') !== -1
						) {
							this.$mRouter.reLaunch(JSON.parse(backToPage));
						} else {
							this.$mRouter.redirectTo(JSON.parse(backToPage));
						}
					} else {
						this.$mRouter.reLaunch({ route: '/pages/profile/profile' });
					}
				})
				.catch(() => {
					this.btnLoading = false;
				});
		},
		// 切换登录/注册
		tabClick(index) {
			this.tabCurrentIndex = index;
		},
		// 注册账号
		async toRegister() {
			if (this.$mSettingConfig.closeRegister) {
				this.$mHelper.toast('暂未开放注册，敬请期待～');
				return;
			}
			this.reqBody['mobile'] = this.registerParams['mobile'];
			this.reqBody['password'] = this.registerParams['password'];
			this.reqBody['code'] = this.registerParams['code'];
			this.reqBody['nickname'] = this.registerParams['nickname'];
			const cheRes = this.$mGraceChecker.check(
				this.reqBody,
				this.$mFormRule.registerRule
			);
			if (!cheRes) {
				this.$mHelper.toast(this.$mGraceChecker.error);
				return;
			}
			if (
				this.registerParams['password'] !==
				this.registerParams['password_repetition']
			) {
				this.$mHelper.toast('两次输入的密码不一致');
				return;
			}
			this.reqBody['password_repetition'] = this.registerParams[
				'password_repetition'
				];
			this.reqBody['promo_code'] = this.registerParams['promoCode'];
			this.btnLoading = true;
			this.reqBody.group = this.$mHelper.platformGroupFilter();
			await this.$http
				.post(registerByPass, this.reqBody)
				.then(() => {
					this.btnLoading = false;
					this.$mHelper.toast('恭喜您注册成功');
					uni.setStorageSync('loginMobile', this.reqBody['mobile']);
					uni.setStorageSync('loginPassword', this.reqBody['password']);
					this.$mRouter.push({ route: '/pages/public/login' });
				})
				.catch(() => {
					this.btnLoading = false;
				});
		}
	}
};
</script>
<style lang="scss">
page {
	background: $color-white;
}
.is-disabled{
			background: none !important;
			background-color: none !important;
		}
.container {
	padding-top: 115px;
	position: relative;
	width: 100vw;
	overflow: hidden;
	background: #fff;
	.wrapper {
		position: relative;
		z-index: 90;
		background: #fff;
		padding-bottom: 40upx;
	}
	.back-btn {
		position: absolute;
		left: 40upx;
		z-index: 9999;
		padding-top: var(--status-bar-height);
		top: 40upx;
		font-size: 40upx;
		color: $font-color-dark;
	}
	.left-top-sign {
		font-size: 120upx;
		color: $page-color-base;
		position: relative;
		left: -16upx;
	}
	.right-top-sign {
		position: absolute;
		top: 80upx;
		right: -30upx;
		z-index: 95;

		&:before,
		&:after {
			display: block;
			content: '';
			width: 400upx;
			height: 80upx;
			background: #b4f3e2;
		}

		&:before {
			transform: rotate(50deg);
			border-radius: 0 50px 0 0;
		}

		&:after {
			position: absolute;
			right: -198upx;
			top: 0;
			transform: rotate(-50deg);
			border-radius: 50px 0 0 0;
			/* background: pink; */
		}
	}
	.left-bottom-sign {
		position: absolute;
		left: -270upx;
		bottom: -320upx;
		border: 100upx solid #d0d1fd;
		border-radius: 50%;
		padding: 180upx;
	}
	.welcome {
		position: relative;
		left: 50upx;
		top: -90upx;
		font-size: 46upx;
		color: #555;
		text-shadow: 1px 0px 1px rgba(0, 0, 0, 0.3);
	}
	.input-content {
		padding: 0 60upx;
	}
	.input-item {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		padding: 0 30upx;
		background: $page-color-light;
		height: 120upx;
		border-radius: 4px;
		margin-bottom: 50upx;

		&:last-child {
			margin-bottom: 0;
		}

		.tit {
			height: 50upx;
			line-height: 56upx;
			font-size: $font-sm + 2upx;
			color: $font-color-base;
		}

		input {
			height: 60upx;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			width: 100%;
		}
	}
	.input-item-sms-code {
		position: relative;
		width: 100%;
		.sms-code-btn {
			position: absolute;
			color: #111;
			right: 20upx;
			bottom: 20upx;
			font-size: 28upx;
		}

		.sms-code-resend {
			color: #999;
		}

		.sms-code-btn:after {
			border: none;
			background-color: transparent;
		}
	}
	.forget-section {
		font-size: $font-sm + 2upx;
		color: $font-color-spec;
		text-align: center;
		margin-top: 40upx;
	}
	.register-section {
		margin: 30upx 0 50upx 0;
		width: 100%;
		font-size: $font-sm + 2upx;
		color: $font-color-base;
		text-align: center;

		text {
			color: $font-color-spec;
			margin-left: 10upx;
		}

		text:first-child {
			margin-right: 10upx;
		}
	}
	.btn-group {
		display: flex;
		margin-bottom: 20upx;
	}
}
.login-type-2 {
	width: 100%;
	position: relative;
	.back-btn {
		position: absolute;
		left: 40upx;
		z-index: 9999;
		padding-top: var(--status-bar-height);
		top: 40upx;
		font-size: 48upx;
		color: $color-white;
	}
	.login-top {
		height: 460upx;
		position: relative;
		.logoBox{
			position: absolute;
			top: 200rpx;
			left: 100rpx;
			z-index: 9998;
		}
		.logoImg{
			border-radius: 50%;
			width: 150rpx;
			height: 150rpx;
			vertical-align: middle;
			margin-right: 30rpx;
		}
		.logoText{
			font-size: 40rpx;
			color: $color-white;
			font-weight: bolder;
		}
		.desc {
			position: absolute;
			top: 200upx;
			left: 40upx;
			font-size: 48upx;
			.title {
				font-size: 48upx;
			}
		}
		.login-pic {
			position: absolute;
			width: 100vw;
			height: auto;
			right: 30upx;
			top: 100upx;
		}
	}
	.login-type-content {
		position: relative;
		top: -72upx;
		.login-bg {
			width: 94vw;
			height: 94vw;
			margin: 0 3vw;
		}
		.main {
			width: 100vw;
			position: absolute;
			top: 0;
			left: 0;
			.nav-bar {
				display: flex;
				height: 100upx;
				justify-content: center;
				align-items: center;
				position: relative;
				z-index: 10;
				.nav-bar-item {
					flex: 1;
					display: flex;
					height: 100%;
					line-height: 96upx;
					font-size: $font-lg;
					display: flex;
					margin: 0 120upx;
					justify-content: center;
				}
				.nav-bar-item-active {
					border-bottom: 5upx solid;
				}
			}
			.login-type-form {
				width: 80%;
				margin: 50upx auto;
				.input-item {
					position: relative;
					height: 90upx;
					line-height: 90upx;
					margin-bottom: $spacing-lg;
					.iconfont {
						font-size: 50upx;
						position: absolute;
						left: 0;
					}
					.login-type-input {
						height: 90upx;
						padding-left: 80upx;
						border-bottom: 1upx solid rgba(0, 0, 0, .1);
					}
					.sms-code-btn, sms-code-resend {
						width: 280rpx;
						font-size: $font-base - 2upx;
					}
				}
			}
			.login-type-tips {
				padding: 0 50upx;
				display: flex;
				justify-content: space-between;
			}
			.confirm-btn {
				height: 80upx;
				line-height: 80upx;
			}
		}
	}
	.login-type-bottom {
		width: 100%;
		padding-bottom: 30upx;
		text-align: center;
		font-size: $font-lg;
	}
}
</style>
