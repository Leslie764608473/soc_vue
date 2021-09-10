<template>
	<view class="register">
		<!--顶部返回按钮-->
		<text class="back-btn iconfont iconzuo" @tap="navBack"></text>
		<view class="right-top-sign"></view>
		<!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
		<view class="wrapper">
			<view class="left-top-sign">REGISTER</view>
			<view class="welcome">
				您正在申請加入
				<image src="../../static/shandong/logo.jpg" class="logo"></image>
				<text>香港山東社團總會</text>
				<view>請準確填寫以下信息</view>
			</view>
			<uni-forms class="registerForm" ref="registerForm" :modelValue="registerParams" label-position="top" label-width="500">
				<uni-forms-item class="registerFormItem" :required="item.isRequired==1?true:false" :label="item.nameZh" :name="item.nameEn" v-for="(item,index) in registerItems" :key="index">
					<uni-data-checkbox v-if="item.nameEn == 'gender'" v-model="registerParams[item.nameEn]" :localdata="genderArr" ></uni-data-checkbox>
					<uni-easyinput v-else style="border-bottom: 1px solid #dedede;" :inputBorder="false" type="text" v-model="registerParams[item.nameEn]" :placeholder="'請輸入'+item.nameZh" />
				</uni-forms-item>
			</uni-forms>

			<button
				class="confirm-btn"
				:class="'bg-' + themeColor.name"
				:disabled="btnLoading"
				:loading="btnLoading"
				@tap="toRegister"
			>
				注册
			</button>
		</view>
		<view class="register-section">
			已经注册过了?
			<text @tap="navTo('/pages/public/login')">马上登录</text>
		</view>
		<!-- 底部协议 -->
		<view class="footer-protocol">
			<text
				@tap="isAppAgreementDefaultSelect"
				class="cuIcon"
				:class="appAgreementDefaultSelect ? `text-${themeColor.name} cuIcon-radiobox` : 'cuIcon-round'"
			></text>
			<text class="content">同意</text>
			<!-- 协议地址 -->
			<navigator :class="'text-' + themeColor.name" url="/pages/set/about/detail?field=protocol_register&title=注册协议" open-type="navigate">《注册协议》</navigator>
		</view>
	</view>
</template>
<script>
	import qs from "qs";
import { mapMutations } from 'vuex';
import { registerByPass, smsCode,getRegister } from '@/api/login';
import moment from '@/common/moment';

import uniForms from '@/components/uni-forms/uni-forms.vue';
import uniFormsItem from '@/components/uni-forms-item/uni-forms-item.vue';
import uniEasyinput from '@/components/uni-easyinput/uni-easyinput';
import uniDataCheckbox from '@/components/uni-data-checkbox/uni-data-checkbox.vue';
export default {
	data() {
		return {
			appAgreementDefaultSelect: this.$mSettingConfig.appAgreementDefaultSelect, // 是否允许点击登录按钮
			closeRegisterPromoCode: this.$mSettingConfig.closeRegisterPromoCode, // 是否允许点击登录按钮
			registerParams: {},
			registerItems: [],
			genderArr: [{"value": "男","text": "男"	},{"value": "女","text": "女"}],
			btnLoading: false,
			reqBody: {},
			codeSeconds: 0, // 验证码发送时间间隔
			smsCodeBtnDisabled: true
		};
	},
	components: {
		uniForms,
		uniFormsItem,
		uniEasyinput,
		uniDataCheckbox
	},
	onShow() {
		if (uni.getStorageSync('accessToken')) {
			this.$mRouter.reLaunch({ route: '/pages/index/index' });
		}
	},
	onLoad(options) {
		if (this.$mStore.getters.hasLogin) {
			this.$mRouter.reLaunch({ route: '/pages/index/index' });
		}
		const time =
			moment().valueOf() / 1000 - uni.getStorageSync('registerSmsCodeTime');
		if (time < 60) {
			this.codeSeconds =
				this.$mConstDataConfig.sendCodeTime - parseInt(time, 10);
			this.handleSmsCodeTime(this.codeSeconds);
		} else {
			this.codeSeconds = this.$mConstDataConfig.sendCodeTime;
			this.smsCodeBtnDisabled = false;
			uni.removeStorageSync('registerSmsCodeTime');
		}
		const backUrl = uni.getStorageSync('backToPage');
		if (backUrl.indexOf('promo_code') !== -1) {
			this.registerParams.promoCode = JSON.parse(backUrl)['query']['promo_code'];
		} else {
			this.registerParams.promoCode = options.promo_code;
		}
	},
	created() {
		this.getRegisterFn();
	},
	watch: {
		registerParams(val) {
			console.log(val);
		}
	},
	methods: {
		getRegisterFn() {
			this.$http.post(getRegister+"?orgId="+this.$mStore.getters.orgId).then((res)=>{
				this.registerItems = res.data;
				this.registerParams = {};
				res.data.forEach((item)=>{
					console.log(item.fieldType)
					this.registerParams[item.nameEn] = "";
				});
			});
		},
    isAppAgreementDefaultSelect() {
      // 是否选择协议
      this.appAgreementDefaultSelect = !this.appAgreementDefaultSelect;
    },
		...mapMutations(['login']),
		navBack() {
			this.$mRouter.back();
		},
		// 通用跳转
		navTo(route) {
			this.$mRouter.push({ route });
		},
		// 获取手机验证码
		getSmsCode() {
			this.reqBody['mobile'] = this.registerParams['mobile'];
			let checkSendCode = this.$mGraceChecker.check(
				this.reqBody,
				this.$mFormRule.sendCodeRule
			);
			if (!checkSendCode) {
				this.$mHelper.toast(this.$mGraceChecker.error);
				return;
			}
			this.$http
				.post(smsCode, {
					mobile: this.registerParams.mobile,
					usage: 'register'
				})
				.then(r => {
					if (r.data) {
						this.$mHelper.toast(`验证码发送成功, 验证码是${r.data}`);
					} else {
						this.$mHelper.toast('验证码已发送.');
					}
					this.smsCodeBtnDisabled = true;
					uni.setStorageSync('registerSmsCodeTime', moment().valueOf() / 1000);
					this.handleSmsCodeTime(59);
				});
		},
		handleSmsCodeTime(time) {
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
		// 注册账号
		async toRegister() {
			if (this.$mSettingConfig.closeRegister) {
				this.$mHelper.toast('暂未开放注册，敬请期待～');
				return;
			}
			if (!this.appAgreementDefaultSelect) {
        this.$mHelper.toast('请勾选同意注册协议，即可注册哦');
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
.register {
	padding-top: 60px;
	position: relative;
	width: 100vw;
	overflow: hidden;
	background: #fff;
	.wrapper {
		position: relative;
		width: 100vw;
		z-index: 90;
		background: #fff;
		padding-bottom: 40upx;

		.welcome {
			position: relative;
			left: 50upx;
			top: -90upx;
			font-size: 30upx;
			color: #555;
			text-shadow: 1px 0px 1px rgba(0, 0, 0, 0.3);
			.logo{
				width: 50rpx;
				height: 50rpx;
				vertical-align: middle;
			}
		}
	}

	.registerForm{
		width: 100vw;
		padding: 0 60rpx;
		.registerFormItem{
			input{
				border-bottom: 1px solid #dedede;
			}
		}
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

	.register-section {
		margin: 30upx 0 50upx;
		width: 100%;
		font-size: $font-sm + 2upx;
		color: $font-color-base;
		text-align: center;

		text {
			color: $font-color-spec;
			margin-left: 10upx;
		}
	}

}

</style>
