<template>
	<view class="register">
		<!--顶部返回按钮-->
		<!-- <text class="back-btn iconfont iconzuo" @tap="navBack"></text> -->
		<!-- <view class="right-top-sign"></view> -->
		<!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
		<view class="wrapper">
			<!-- <view class="left-top-sign"></view> -->
			<view class="welcome">
				您正在申請加入
				<image :src="NowLogo" class="logo"></image>
				<text class="registerOrgName">{{registerSt}}</text>
				<view>請準確填寫以下信息</view>
			</view>
			<uni-collapse class="collapseBox">
				<uni-collapse-item :open="openOne" v-if="showOne">
					<template slot="title">
						<view slot="title" class="collapseTitle">
							<image :src="rIcon1" class="collapseIcon" mode=""></image>
							<text class="collapseText">基本信息</text>
						</view>
					</template>
					<view class="collapseContent">
						<uni-forms class="registerForm" ref="registerForm1" :modelValue="registerParams" label-position="top" label-width="500">
							<!-- <view style="display: block;margin-top: 20rpx;margin-left: -15rpx;border-bottom: 1px solid #dedede;">
								<view style="padding: 0 10rpx;font-size: 14px;"><text class="label-text">社團分會</text><text class="is-required" style="color: #dd524d;">*</text></view>
								<picker @change="bindPickerChange" :value="serviceIndex" :range="serviceNameArr">
									<uni-easyinput style="background: white;" disabled :inputBorder="false" type="text" v-model="registerSt" placeholder="請選擇所屬社團分會" />
								</picker>
							</view> -->
							<uni-forms-item class="registerFormItem" :required="true" :label="registerOrg_id==47?'相關社團':'社團分會'" name="server_fh_id">
								<picker @change="bindPickerChange" style="margin-left: -15rpx;" :value="serviceIndex" :range="serviceNameArr">
									<uni-easyinput style="background: white;" class="disabledPicker" disabled :inputBorder="false" type="text" v-model="registerSt" :placeholder="parseFloat(registerOrg_id) == 47?'請選擇相關社團':'請選擇社團分會'" />
								</picker>
							</uni-forms-item>
							<uni-forms-item v-if="item.type == '基本信息'" class="registerFormItem" :required="item.isRequired==1?true:false" :label="item.nameZh" :name="item.nameEn" v-for="(item,index) in registerItems" :key="index">
								<uni-data-checkbox v-if="item.nameEn == 'gender'" v-model="registerParams[item.nameEn]" :localdata="JSON.parse(item.selectContent)" ></uni-data-checkbox>
								<view v-else-if="item.nameEn == 'birthday_str' && registerOrg_id!=50" style="position: relative;">
									<picker mode="date" fields="month" style="margin-left: -15rpx;" @change="birthdayChange">
											<uni-easyinput :clearable="false" disabled :inputBorder="false" type="text" v-model="birthday_strShow" placeholder="YYYY-MM" />
											<text style="position: absolute;right: 10rpx;top: -10rpx;color: #499CF9;">選擇</text>
									</picker>
								</view>
								<view v-else-if="item.nameEn == 'birthday_str' && registerOrg_id==50" style="position: relative;">
									<picker mode="date" fields="day" style="margin-left: -15rpx;" @change="birthdayChange">
											<uni-easyinput :clearable="false" disabled :inputBorder="false" type="text" v-model="birthday_strShow" placeholder="YYYY-MM-DD" />
											<text style="position: absolute;right: 10rpx;top: -10rpx;color: #499CF9;">選擇</text>
									</picker>
								</view>
								<view v-else-if="item.nameEn == 'arrive_date'" style="position: relative;">
									<picker mode="date" fields="month" style="margin-left: -15rpx;" @change="arriveChange">
											<uni-easyinput :clearable="false" disabled :inputBorder="false" type="text" v-model="arrive_dateShow" placeholder="YYYY-MM" />
											<text style="position: absolute;right: 10rpx;top: -10rpx;color: #499CF9;">選擇</text>
									</picker>
								</view>
								<view v-else-if="item.nameEn == 'native_place'" style="position: relative;">
									<!-- <uni-data-picker class="nativeBox" placeholder="請選擇籍貫" popup-title="請選擇籍貫" :localdata="nativePlaceData" @nodeclick="onnodeclick" @change="onchange" ></uni-data-picker> -->

									<picker @change="pickerChange" style="margin-left: -15rpx;" @columnchange="columnchange" :range="addArrAll" range-key="name" mode="multiSelector">
										<uni-easyinput :clearable="false" disabled :inputBorder="false" type="text" v-model="native_placeShow" placeholder="請選擇籍貫" />
										<text style="position: absolute;right: 10rpx;top: -10rpx;color: #499CF9;">選擇</text>
									</picker>
								</view>
								<uni-easyinput v-else-if="item.nameEn == 'mobile'" trim="both" :inputBorder="false" :clearable="false" type="text" v-model="registerParams['mobile']" :placeholder="'請輸入'+item.nameZh" />
								<uni-easyinput v-else trim="both" :inputBorder="false" :clearable="false" type="text" v-model="registerParams[item.nameEn]" :placeholder="'請輸入'+item.nameZh" />
							</uni-forms-item>
						</uni-forms>
					</view>
				</uni-collapse-item>
				<view class="centerLine"></view>
				<uni-collapse-item :open="openTwo" v-if="showTwo">
					<template slot="title">
						<view slot="title" class="collapseTitle">
							<image :src="rIcon2" class="collapseIcon" mode=""></image>
							<text class="collapseText">聯繫方式</text>
						</view>
					</template>
					<view class="collapseContent">
						<uni-forms class="registerForm" ref="registerForm2" :modelValue="registerParams" label-position="top" label-width="500">
							<uni-forms-item v-if="item.type == '聯係方式'" class="registerFormItem" :required="item.isRequired==1?true:false" :label="item.nameZh" :name="item.nameEn" v-for="(item,index) in registerItems" :key="index">
								<view v-if="item.nameEn == 'wechat_num'">
									<uni-data-checkbox v-model="wechatType" v-if="item.nameZh != '微信'" :localdata="wechat_numArr" ></uni-data-checkbox>
									<view class="line10" v-if="item.nameZh != '微信'"></view>
									<uni-easyinput style="border-bottom: 1px solid #dedede;" :clearable="false" :inputBorder="false" type="text" v-model="registerParams[item.nameEn]" :placeholder="'請輸入'+wechatType" />
								</view>
								<view v-else-if="item.nameEn == 'priority_contact'">
									<uni-data-checkbox @change="priority_contactChange" v-model="registerParams[item.nameEn]" :localdata="JSON.parse(item.selectContent)" ></uni-data-checkbox>
								</view>
								<view v-else-if="item.nameEn == 'address'">
									<uni-data-checkbox v-model="addressType" v-if="item.selectContent" :localdata="JSON.parse(item.selectContent)" ></uni-data-checkbox>
									<view class="line10" v-if="item.selectContent"></view>
									<uni-easyinput v-if="registerOrg_id != 47" style="border-bottom: 1px solid #dedede;" :clearable="false" :inputBorder="false" type="text" v-model="registerParams[item.nameEn]" :placeholder="'請輸入'+addressType+'地址'" />
									<view v-if="registerOrg_id == 47">
										<uni-forms-item class="registerFormItem" :required="item_.isRequired==1?true:false" :label="item_.nameZh" :name="item_.nameEn" v-for="(item_,index_) in item.nextDic" :key="index_">
											<picker v-if="item_.nameEn == 'region_name'" @change="regionNameChange" style="margin-left: -15rpx;" :value="regionNameIndex" rangeKey="name" :range="regionNameArr">
												<uni-easyinput style="background: white;" class="disabledPicker" disabled :inputBorder="false" type="text" v-model="registerParams['region_name']" :placeholder="'請選擇'+item_.nameZh" />
											</picker>
											<picker v-else-if="item_.nameEn == 'central_district_name'" @change="xqNameChange" style="margin-left: -15rpx;" :value="xqNameIndex" :range="xqNameArr" rangeKey="name">
												<uni-easyinput style="background: white;" class="disabledPicker" disabled :inputBorder="false" type="text" v-model="registerParams['central_district_name']" :placeholder="'請選擇'+item_.nameZh" />
											</picker>
											<uni-easyinput v-else style="border-bottom: 1px solid #dedede;" :clearable="false" :inputBorder="false" type="text" v-model="registerParams[item_.nameEn]" :placeholder="'請輸入'+item_.nameZh" />
										</uni-forms-item>
									</view>

								</view>
								<view v-else-if="item.nameEn == 'special_name'">
									<uni-easyinput style="border-bottom: 1px solid #dedede;" :clearable="false" :inputBorder="false" type="text" v-model="registerParams[item.nameEn]" placeholder="「例：太平紳士」" />
								</view>
								<uni-easyinput v-else style="border-bottom: 1px solid #dedede;" :clearable="false" :inputBorder="false" type="text" v-model="registerParams[item.nameEn]" :placeholder="'請輸入'+item.nameZh" />
							</uni-forms-item>
						</uni-forms>
					</view>
				</uni-collapse-item>
				<view class="centerLine"></view>
				<uni-collapse-item :open="openThree" v-if="showThree">
					<template slot="title">
						<view slot="title" class="collapseTitle">
							<image :src="rIcon3" class="collapseIcon" mode=""></image>
							<text class="collapseText">工作信息</text>
						</view>
					</template>
					<view class="collapseContent">
						<uni-forms class="registerForm" ref="registerForm3" :modelValue="registerParams" label-position="top" label-width="500">
							<uni-forms-item v-if="item.type == '工作信息'" class="registerFormItem" :required="item.isRequired==1?true:false" :label="item.nameZh" :name="item.nameEn" v-for="(item,index) in registerItems" :key="index">
								<view v-if="item.nameEn == 'professional_sector'">
									<uni-data-checkbox class="longCheckbox" v-model="registerParams[item.nameEn]" :localdata="JSON.parse(item.selectContent)" ></uni-data-checkbox>
								</view>
								<uni-easyinput v-else style="border-bottom: 1px solid #dedede;" :clearable="false" :inputBorder="false" type="text" v-model="registerParams[item.nameEn]" :placeholder="'請輸入'+item.nameZh" />
							</uni-forms-item>
						</uni-forms>
					</view>
				</uni-collapse-item>
				<view class="centerLine"></view>
				<uni-collapse-item :open="openFour" v-if="showFour">
					<template slot="title">
						<view slot="title" class="collapseTitle">
							<image :src="rIcon4" class="collapseIcon" mode=""></image>
							<text class="collapseText">其他</text>
						</view>
					</template>
					<view class="collapseContent">
						<uni-forms class="registerForm" ref="registerForm4" :modelValue="registerParams" label-position="top" label-width="500">
							<uni-forms-item v-if="item.type == '其他' && item.nameEn != 'sign' && item.nameEn != 'service_center_id'" class="registerFormItem" :required="item.isRequired==1?true:false" :label="item.nameZh" :name="item.nameEn" v-for="(item,index) in registerItems" :key="index">
								<view v-if="item.nameEn == 'is_pr'">
									<uni-data-checkbox class="longCheckbox" v-model="registerParams[item.nameEn]" :localdata="JSON.parse(item.selectContent)" ></uni-data-checkbox>
								</view>
								<view v-else-if="item.nameEn == 'state'">
									<radio-group>
											<label>
													<view>
															<radio color="#1aa5fd" style="transform:scale(0.7)" value="1" :checked="stateType == 1" />
															<text style="display: inline-block;vertical-align: middle;">是（請列明選區）</text>
															<uni-easyinput style="display: inline-block;position: relative;top: 16rpx;" :clearable="false" :inputBorder="false" type="text" v-model="registerParams['xq']" />
													</view>
											</label>
											<label>
													<view>
															<radio color="#1aa5fd" style="transform:scale(0.7)" value="0" :checked="stateType == 0" />
															<text>否</text>
													</view>
											</label>
									</radio-group>
								</view>
								<view v-else-if="item.nameEn == 'is_sector'">
									<radio-group>
											<label>
													<view>
															<radio color="#1aa5fd" style="transform:scale(0.7)" value="1" :checked="isSectorType == 1" />
															<text style="display: inline-block;vertical-align: middle;">是（請列明界別）</text>
															<uni-easyinput style="display: inline-block;position: relative;top: 16rpx;" :clearable="false" :inputBorder="false" type="text" v-model="registerParams['record_sector']" />
													</view>
											</label>
											<label>
													<view>
															<radio color="#1aa5fd" style="transform:scale(0.7)" value="0" :checked="isSectorType == 0" />
															<text>否</text>
													</view>
											</label>
									</radio-group>
								</view>
								<uni-easyinput v-else style="border-bottom: 1px solid #dedede;" :clearable="false" :inputBorder="false" type="text" v-model="registerParams[item.nameEn]" :placeholder="'請輸入'+item.nameZh" />
							</uni-forms-item>
						</uni-forms>
					</view>
				</uni-collapse-item>
			</uni-collapse>
			<view class="signBox" style="padding-bottom: 10rpx;">
				<view class="signTitle">申請日期</view>
				<view class="signVlaue"><uni-dateformat format="yyyy年MM月dd日" :date="registerDate"></uni-dateformat></view>

				<view class="signTitle" v-if="isUploadIds">身份證照片 ( 正面 )</view>
				<view class="grace-idcard-items" v-if="isUploadIds">
					<view class="grace-idcard-uper-btn" @tap="selectImg1">
						<view class="img"><image :src="camera" mode="widthFix" /></view>
						<view class="text">拍攝或選擇照片</view>
					</view>
					<view class="grace-idcard-preview">
						<image :src="idCard1"  @tap="previewImg1" mode="widthFix"></image>
					</view>
				</view>
				<view class="signTitle" v-if="isUploadIds">身份證照片 ( 背面 )</view>
				<view class="grace-idcard-items" v-if="isUploadIds">
					<view class="grace-idcard-uper-btn" @tap="selectImg2">
						<view class="img"><image :src="camera" mode="widthFix" /></view>
						<view class="text">拍攝或選擇照片</view>
					</view>
					<view class="grace-idcard-preview">
						<image :src="idCard2" @tap="previewImg2" mode="widthFix" />
					</view>
				</view>

				<view class="signTitle">申請人簽名</view>
				<view style="margin: 20rpx 0;">
					<view class="chongqian" @tap='clearClick' style="color: #f98585;text-align: right;">重簽</view>
					<canvas class='firstCanvas' canvas-id="firstCanvas" @touchmove='move' @touchstart='start($event)' @touchend='end'
					 @touchcancel='cancel' @longtap='tap' disable-scroll='true' @error='error'></canvas>
				</view>
				<!-- 底部协议 -->
				<view style="margin-bottom: 20rpx;">
					<text
						@tap="isAppAgreementDefaultSelect"
						class="cuIcon"
						style="margin-right: 10rpx;"
						:class="appAgreementDefaultSelect ? `text-${themeColor.name} cuIcon-radiobox` : 'cuIcon-round'"
					></text>
					<text class="content">我已閱讀確認並同意</text>
					<!-- 协议地址 -->
					<navigator style="display: inline;" :class="'text-' + themeColor.name" :url="'/pages/set/about/detail?orgId='+registerOrg_id+'&title=成員須知'" open-type="navigate">《{{orgChoseName}}成員須知》</navigator>
					<text>和</text>
					<navigator style="display: inline;" :class="'text-' + themeColor.name" :url="'/pages/set/about/detail?orgId='+registerOrg_id+'&title=個人信息收集聲明'" open-type="navigate">《個人信息收集聲明》</navigator>
				</view>
				<view style="margin-bottom: 20rpx;" v-if="registerOrg_id == 47 && registerSt != '香港河北聯誼會' && registerSt != ''">
					<text
						@tap="isAppAgreementDefaultSelectNew"
						style="margin-right: 10rpx;"
						class="cuIcon"
						:class="appAgreementDefaultSelect_ ? `text-${themeColor.name} cuIcon-radiobox` : 'cuIcon-round'"
					></text>
					<text class="content">本人同時申請加入香港河北聯誼會</text>
				</view>
			</view>

			<button
				class="confirm-btn"
				:class="'bg-' + themeColor.name"
				:disabled="btnLoading"
				:loading="btnLoading"
				@tap="toRegister"
			>
				提交申請
			</button>
		</view>
		<!-- <view class="register-section">
			已經註冊過了?
			<text @tap="navTo('/pages/public/login')">馬上登錄</text>
		</view> -->
		<view
			class="popup spec show"
			v-if="shareEr === 'show'"
			@touchmove.stop.prevent="stopPrevent"
		>
			<!-- 遮罩层 -->
			<view class="mask"></view>
			<view class="share-bg">
				<view @tap="hideShareSpec"><text style="font-size: 55rpx;position: absolute;right: 10rpx;top: -7rpx;" class="iconfont iconguanbi" :class="'text-' + themeColor.name"></text></view>
				<view class="titleShare">請您添加香港山東社團總會秘書處官方微信號，謝謝！</view>
				<image class="image" show-menu-by-longpress="1" @tap="previewImage" data-source="img" :src="sdErcode" />
			</view>

		</view>

	</view>
</template>
<script>
	var _self;
	var content = null;
	var touchs = [];
	var canvasw = 0;
	var canvash = 0;
	var _that;
	//获取系统信息
	uni.getSystemInfo({
		success: function(res) {
			canvasw = res.windowWidth;
			canvash = res.windowHeight;
		},
	})
	import qs from "qs";
import { mapMutations } from 'vuex';
import { registerByPass, smsCode,getRegister,serviceList,register,getNative,getHometownDict } from '@/api/login';
import moment from '@/common/moment';
import htzSignature from '@/components/htz-signature/htz-signature.vue'
import AllAddress from './AddressData.js';
import rIcon1 from "./icon/register_1.png";
import rIcon2 from "./icon/register_2.png";
import rIcon3 from "./icon/register_3.png";
import rIcon4 from "./icon/register_4.png";
import sdErcode from "./icon/sdErcode.jpg";
import camera from "./icon/camera.png";
import idcard1 from "./icon/idcard1.png";
import idcard2 from "./icon/idcard2.png";
export default {
	data() {
		return {
			NowLogo: null,
			rIcon1: rIcon1,
			rIcon2: rIcon2,
			rIcon3: rIcon3,
			rIcon4: rIcon4,
			sdErcode:sdErcode,
			camera: camera,
			shareEr: false,
			level: 3,
			addArrAll: [],
			appAgreementDefaultSelect: false,//this.$mSettingConfig.appAgreementDefaultSelect, // 是否允许点击登录按钮
			appAgreementDefaultSelect_: false,
			closeRegisterPromoCode: this.$mSettingConfig.closeRegisterPromoCode, // 是否允许点击登录按钮
			registerParams: {},
			registerItems: [],
			xqNameArr_all: [{"value": "中西區","name": "中西區"},{"value": "東區","name": "東區"},{"value": "南區","name": "南區"},{"value": "灣仔區","name": "灣仔區"},
			{"value": "九龍城區","name": "九龍城區"},{"value": "觀塘區","name": "觀塘區"},{"value": "深水埗區","name": "深水埗區"},{"value": "黃大仙區","name": "黃大仙區"},
			{"value": "油尖旺區","name": "油尖旺區"},{"value": "離島區","name": "離島區"},{"value": "葵青區","name": "葵青區"},{"value": "北區","name": "北區"},
			{"value": "西貢區","name": "西貢區"},{"value": "沙田區","name": "沙田區"},{"value": "大埔區","name": "大埔區"},{"value": "荃灣區","name": "荃灣區"},
			{"value": "屯門區","name": "屯門區"},{"value": "元朗區","name": "元朗區"}],
			xqNameArr: [{"value": "中西區","name": "中西區"},{"value": "東區","name": "東區"},{"value": "南區","name": "南區"},{"value": "灣仔區","name": "灣仔區"},
			{"value": "九龍城區","name": "九龍城區"},{"value": "觀塘區","name": "觀塘區"},{"value": "深水埗區","name": "深水埗區"},{"value": "黃大仙區","name": "黃大仙區"},
			{"value": "油尖旺區","name": "油尖旺區"},{"value": "離島區","name": "離島區"},{"value": "葵青區","name": "葵青區"},{"value": "北區","name": "北區"},
			{"value": "西貢區","name": "西貢區"},{"value": "沙田區","name": "沙田區"},{"value": "大埔區","name": "大埔區"},{"value": "荃灣區","name": "荃灣區"},
			{"value": "屯門區","name": "屯門區"},{"value": "元朗區","name": "元朗區"}],
			xqNameArr_xgd: [{"value": "中西區","name": "中西區"},{"value": "東區","name": "東區"},{"value": "南區","name": "南區"},{"value": "灣仔區","name": "灣仔區"},{"value": "離島區","name": "離島區"}],
			xqNameArr_jl: [{"value": "黃大仙區","name": "黃大仙區"},{"value": "觀塘區","name": "觀塘區"},{"value": "油尖旺區","name": "油尖旺區"},{"value": "深水埗區","name": "深水埗區"},{"value": "九龍城區","name": "九龍城區"}],
			xqNameArr_xj: [{"value": "西貢區","name": "西貢區"},{"value": "沙田區","name": "沙田區"},{"value": "北區","name": "北區"},{"value": "元朗區","name": "元朗區"},
			{"value": "屯門區","name": "屯門區"},{"value": "荃灣區","name": "荃灣區"},{"value": "葵青區","name": "葵青區"},{"value": "沙田區","name": "沙田區"},{"value": "大埔區","name": "大埔區"}],
			xqNameIndex: 0,
			xqNameStr: "",
			regionNameArr: [{"value": "香港島","name":"香港島"},{"value": "九龍","name":"九龍"},{"value": "新界","name":"新界"}],
			regionNameIndex: 0,
			regionNameStr: "",
			genderArr: [{"value": "男","text": "男"	},{"value": "女","text": "女"}],
			wechat_numArr: [{"value": "微信","text": "微信"	},{"value": "WhatsApp","text": "WhatsApp"}],
			addressArr: [{"value": "辦事處","text": "辦事處"	},{"value": "住宅","text": "住宅"}],
			addressType: "辦事處",
			priority_contactArr: [{"value": "電郵","text": "電郵"	},{"value": "手機號","text": "手機號"},{"value": "微信","text": "微信"	},{"value": "WhatsApp","text": "WhatsApp"}],
			wechatType: "微信",
			professionalArr: ["進出口","工業","金融業","地產、建業","酒店、餐飲","旅游","專業人士","公務員","交通運輸","零售業","其他"],
			professional_sectorArr: [],
			stateType: "1",
			isSectorType: "1",
			btnLoading: false,
			reqBody: {},
			codeSeconds: 0, // 验证码发送时间间隔
			smsCodeBtnDisabled: true,
			dateShowFlag: false,
			openFour: false,
			openThree: false,
			openTwo: false,
			openOne: false,
			showFour: true,
			showThree: true,
			showTwo: true,
			showOne: true,
			registerDate: new Date(),
			signImage: '',
			isEnd: false ,// 是否签名
			registerMobile: "",
			registerService_id: "",
			registerOrg_id: "",
			orgChoseName: "",
			idCard1 : idcard1,
			idCard2 : idcard2,
			uploadFalg: false,
			birthday_strShow: "",
			arrive_dateShow: "",
			native_placeShow: "",
			serviceArr: [],
			serviceNameArr: [],
			serviceIndex: 0,
			registerSt: "",
			userInfo: this.$mStore.getters.userObj,
			isUploadIds: false,
			nativePlaceData: [],
		};
	},
	components: {
		htzSignature
	},
	onShow() {

	},
	onLoad(options) {
		_that = this;
		_self = this;
		//获得Canvas的上下文
		content = wx.createCanvasContext('firstCanvas')
		//设置线的颜色
		content.setStrokeStyle("#000")
		//设置线的宽度
		content.setLineWidth(5)
		//设置线两端端点样式更加圆润
		content.setLineCap('round')
		//设置两条线连接处更加圆润
		content.setLineJoin('round')

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
		this.registerOrg_id = this.$mStore.getters.orgId;
		this.getServeArr(this.registerOrg_id);
		this.isUploadIds = parseFloat(this.$mStore.getters.messageData.isIdcard) == 0 ? false : true;
		this.orgChoseName = this.$mStore.getters.messageData.orgName;
		let orgLogo =  this.$mStore.getters.messageData.orgLogo;
		this.NowLogo = orgLogo;
		this.registerMobile = this.userInfo.mobile;

		this.initAddress();
		this.getRegisterFn();

		this.getHometownFn();

		this.professional_sectorArr = [];
		this.professionalArr.forEach((item)=>{
			let obj = {
				value: item,
				text: item
			}
			this.professional_sectorArr.push(obj);
		})
		this.$nextTick(function() {
			this.ctx = uni.createCanvasContext("mycanvas", this);
		});


		//this.registerService_id = uni.getStorageSync('registerService_id');
	},
	watch: {

	},
	methods: {
		getHometownFn() {
			this.$http.post(getHometownDict,{"level": 1}).then((res)=>{
				var newArr = [];
				res.data.forEach((item)=>{
					let children = [];
					this.$http.post(getHometownDict,{"level": 2,"regionNames": [item.namec]}).then((res_)=>{
						res_.data.forEach((item_)=>{
							children.push({
								value: item_.namec,
								text: item_.namec,
							})
						});
					});
					newArr.push({
						value: item.namec,
						text: item.namec,
						children: children
					})
				})
				this.nativePlaceData = newArr;
				this.$forceUpdate();
			});
		},
		getHometownFnThree() {
			this.$http.post(getHometownDict,{"level": 1}).then((res)=>{
				var newArr = [];
				res.data.forEach((item)=>{
					let children = [];
					this.$http.post(getHometownDict,{"level": 2,"regionNames": [item.namec]}).then((res_)=>{
						res_.data.forEach((item_)=>{
							let children_ = [];
							this.$http.post(getHometownDict,{"level": 3,"regionNames": [item_.namec]}).then((res__)=>{
								res__.data.forEach((item__)=>{
									children_.push({
										value: item__.namec,
										text: item__.namec,
									})
								});
							});
							children.push({
								value: item_.namec,
								text: item_.namec,
								children: children_
							})
						});
					});
					newArr.push({
						value: item.namec,
						text: item.namec,
						children: children
					})
				})
				this.nativePlaceData = newArr;
				console.log(this.nativePlaceData);
				this.$forceUpdate();
			});
		},
		onchange(e) {
			const value = e.detail.value
		},
		onnodeclick(node) {
			// node 当前点击节点
		},
		getServeArr(id) {
			this.$http.post(serviceList+"?orgId="+id).then((res)=>{
				this.serviceArr = res.data;
				this.serviceNameArr = [];
				res.data.forEach((item)=>{
					let name = item.name;
					if(item.name == "香港山東社團总会" || item.name == "香港山東社團總會") {
						name += "直屬會員（非現有屬會會員）";
					}
					if(item.name == "香港海南社團總會") {
						return false;
					}

					this.serviceNameArr.push(name);
				})
				this.$forceUpdate();
			});
		},
		xqNameChange(e) {
			this.xqNameIndex = e.target.value;
			this.xqNameStr = this.xqNameArr[parseFloat(e.target.value)].name;
			this.registerParams['central_district_name'] = this.xqNameArr[parseFloat(e.target.value)].name;
			this.$forceUpdate();
		},
		regionNameChange(e) {
			this.regionNameIndex = e.target.value;
			this.regionNameStr = this.regionNameArr[parseFloat(e.target.value)].name;
			this.registerParams['region_name'] = this.regionNameArr[parseFloat(e.target.value)].name;
			this.xqNameStr = "";
			this.registerParams['xq'] = "";
			if(this.regionNameStr == "香港島") {
				this.xqNameArr = this.xqNameArr_xgd;
			} else if (this.regionNameStr == "九龍") {
				this.xqNameArr = this.xqNameArr_jl;
			} else if (this.regionNameStr == "新界") {
				this.xqNameArr = this.xqNameArr_xj;
			} else {
				this.xqNameArr = this.xqNameArr_all;
			}
			this.$forceUpdate();
		},
		bindPickerChange(e) {
			this.serviceIndex = e.target.value;
			this.registerSt = this.serviceArr[parseFloat(e.target.value)].name;
			this.$forceUpdate();
		},
		previewImage: function (e) {
		    uni.previewImage({
		      urls: [this.sdErcode]
		    })
		  },
		stopPrevent() {

		},
		hideShareSpec() {
			this.shareEr = 'hide';
			setTimeout(() => {
				this.shareEr = 'none';
			}, 250);
		},
		priority_contactChange(e) {
			if(e.detail.value == "微信" && this.registerOrg_id == 46) {
				// 山東社團
				this.shareEr = "show";
			}
		},
		initAddress() {
			this.addArrAll = new Array(3);
			for(let i = 0; i<this.addArrAll.length;i++){
				if(i==0){
					this.addArrAll[i] = AllAddress
				} else {
					this.addArrAll[i] = [];
					if (this.addArrAll[i-1][0].children != null) {
						this.addArrAll[i] = this.addArrAll[i-1][0].children;
					}
				}
			}
			console.log(this.addArrAll);
			this.$forceUpdate()
		},
		columnchange(e) {
			let aIndex = JSON.parse(JSON.stringify(e.detail.column+1));//第几组
			let j = e.detail.value;//索引值
			for(let i=aIndex; i<this.addArrAll.length; i++){
				this.addArrAll[i] = [];
				 if(e.detail.column === 0 && i===2){
					 if (this.addArrAll[i-1][0].children != null) {
					 	this.addArrAll[i] = this.addArrAll[i-1][0].children;
					 }
				 }else{
					 if (this.addArrAll[i-1][j].children != null) {
					 	this.addArrAll[i] = this.addArrAll[i-1][j].children;
					 }
				 }
			}
			this.$forceUpdate();
		},
		pickerChange(e) {
			var resultText = "";
			for(let i=0; i<this.addArrAll.length; i++){
				if(i == 0) {
					resultText += this.addArrAll[i][e.target.value[i]].name
				} else if(this.addArrAll[i][e.target.value[i]]){
					resultText += "-"+this.addArrAll[i][e.target.value[i]].name
				}
			};
			//this.registerParams.native_place = resultText;
			this.native_placeShow = resultText;
			this.$forceUpdate();
		},
		selectImg1 : function() {
			uni.chooseImage({
				count:1,
				success:function(res){
					_self.idCard1 = res.tempFilePaths[0];
				}
			})
		},
		selectImg2 : function() {
			uni.chooseImage({
				count:1,
				success:function(res){
					_self.idCard2 = res.tempFilePaths[0];
				}
			})
		},
		previewImg1 : function(){
			uni.previewImage({
				urls:[_self.idCard1]
			});
		},
		previewImg2 : function(){
			console.log(_self.idCard2);
			uni.previewImage({
				urls:[_self.idCard2]
			});
		},
		uploadCards : function(){
			if(this.idCard1 == '/pages/public/icon/idcard1.png' || this.idCard2 == '/pages/public/icon/idcard2.png'){
				//uni.showToast({title:"請選擇身份證照片",icon:"none"});
				_self.registerParams.attachment = "";
				this.uploadFalg = false;
				return false;
			}
			this.uploadFalg = true;
			// 因底层限制一次上传一个
			//uni.showLoading({title:"上傳中"});
			// 上传正面
			var uploadTask1 = uni.uploadFile({
				url: _self.$mConfig.baseUrl+'/soc/sso/uploadMemberFile',
				filePath: _self.idCard1,
				name: 'file',
				fail:(err)=>{
						//uni.showToast({title:err,icon:"none"});
						//this.uploadFalg = true;
				},
				success: function (fileResOne) {
					// 上传背面
					var uploadTask2 = uni.uploadFile({
						url: _self.$mConfig.baseUrl+'/soc/sso/uploadMemberFile',
						filePath: _self.idCard2,
						name: 'file',
						fail:(err)=>{
								//uni.showToast({title:err,icon:"none"});
								//this.uploadFalg = true;
						},
						success: function (fileResTwo) {
							// 至此2张照片上传完毕
							//uni.hideLoading();
							let Arr = [JSON.parse(fileResOne.data).data,JSON.parse(fileResTwo.data).data]
							_self.registerParams.attachment = JSON.stringify(Arr);
						}
					 });
				}
			 });
			 return true;
		},
		overSign: function() {
			var _this = this;
			if (this.isEnd) {
				uni.canvasToTempFilePath({
					canvasId: 'firstCanvas',
					success: function(res) {
						var uploadTask = uni.uploadFile({
							url: _this.$mConfig.baseUrl+'/soc/sso/uploadMemberFile',
							filePath: res.tempFilePath,
							name: 'file',
							success: function (uploadFileRes) {
								_this.registerParams.sign = JSON.parse(uploadFileRes.data).data;
							}
						 });
					}
				})
				return true;
			} else {
				uni.showToast({
					title: '請先完成簽名',
					icon: "none",
					duration: 1500,
					mask: true
				})
				return false;
			}
		},
		// 画布的触摸移动开始手势响应
		start: function(event) {
			let point = {
				x: event.changedTouches[0].x,
				y: event.changedTouches[0].y
			}
			touchs.push(point);
		},
		// 画布的触摸移动手势响应
		move: function(e) {
			let point = {
				x: e.touches[0].x,
				y: e.touches[0].y
			}
			// console.log(point)
			touchs.push(point)
			if (touchs.length >= 2) {
				this.draw(touchs)
			}
		},
		// 画布的触摸移动结束手势响应
		end: function(e) {
			console.log("触摸结束" + e)
			// 设置为已经签名
			this.isEnd = true
			// 清空轨迹数组
			for (let i = 0; i < touchs.length; i++) {
				touchs.pop()
			}
			this.overSign();
		},
		// 画布的触摸取消响应
		cancel: function(e) {
			console.log("触摸取消" + e)
		},
		// 画布的长按手势响应
		tap: function(e) {
			console.log("长按手势" + e)
		},
		error: function(e) {
			console.log("画布触摸错误" + e)
		},
		//绘制
		draw: function(touchs) {
			let point1 = touchs[0]
			let point2 = touchs[1]
			touchs.shift()
			content.moveTo(point1.x, point1.y)
			content.lineTo(point2.x, point2.y)
			content.stroke()
			content.draw(true)
		},
		//清除操作
		clearClick: function() {
			this.isEnd = false
			//清除画布
			content.clearRect(0, 0, canvasw, canvash);
			content.draw(true);
			this.registerParams.sign = "";
		},
		/* bindPickerChange(e) {
			this.serviceIndex = e.target.value;
			this.registerParams.service_center_id = this.serviceArr[parseFloat(e.target.value)].name;
		}, */
		birthdayChange(val) {
			this.birthday_strShow = val.detail.value;
			this.registerParams["birthday_str"] = val.detail.value;
			this.$forceUpdate();
		},
		arriveChange(val) {
			this.arrive_dateShow = val.detail.value;
			this.registerParams["arrive_date"] = val.detail.value;
			this.$forceUpdate();
		},
		IsHKID(str) {
			if(str == "" || str == null || str == undefined) {
				return true
			}
			var strValidChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			 if(str.length < 4) {
				 this.$mHelper.toast('香港身份證號碼格式錯誤');
				 return false;
			 }
			 if(str.indexOf("(") != -1 || str.indexOf(")") != -1) {
				 str = str.replace("(","");
				 str = str.replace(")","");
			 }
			 if(str.indexOf("（") != -1 || str.indexOf("）") != -1) {
					str = str.replace("（","");
					str = str.replace("）","");
			 }

			 /* if (str.charAt(str.length-3) == '(' && str.charAt(str.length-1) == ')')
			 str = str.substring(0, str.length - 3) + str.charAt(str.length -2); */
			 str = str.toUpperCase();
			 var hkidPat = /^([A-Z]{1,2})([0-9]{0,})([A0-9])$/;
			 var matchArray = str.match(hkidPat);
			 if (matchArray == null)
			 return false;
			 return true;
		},
		getRegisterFn() {
			this.$http.post(getRegister+"?orgId="+this.registerOrg_id).then((res)=>{
				this.registerItems = res.data;
				this.registerParams = {};
				this.registerParams.mobile = "";
				this.openFour = true;
				this.openThree = true;
				this.openTwo = true;
				this.openOne = true;

				this.showFour = false;
				this.showThree = false;
				this.showTwo = false;
				this.showOne = false;

				res.data.forEach((item)=>{
					if(item.nameEn == "mobile") {
							let mobileStr = this.userInfo.mobile;
							if(mobileStr == undefined || mobileStr == null) {
								mobileStr = "";
							}
							this.registerParams.mobile = mobileStr;
							this.$forceUpdate();
					} else {
						this.registerParams[item.nameEn] = "";
					}
					if(item.type == "基本信息") {
						this.showOne = true;
					} else if(item.type == "聯係方式") {
						this.showTwo = true;
					} else if(item.type == "工作信息") {
						this.showThree = true;
					} else if(item.type == "其他" && item.nameEn != "sign") {
						this.showFour = true;
					}
				});

				this.$forceUpdate();
			});
		},
    isAppAgreementDefaultSelect() {
      // 是否选择协议
      this.appAgreementDefaultSelect = !this.appAgreementDefaultSelect;
    },
		isAppAgreementDefaultSelectNew() {
			// 是否选择协议
			this.appAgreementDefaultSelect_ = !this.appAgreementDefaultSelect_;
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
			this.uploadCards();
			this.btnLoading = true;
			var isRequiredF = true;

			if(this.registerSt == "") {
				this.$mHelper.toast('請選擇要加入的社團分會!');
				this.btnLoading = false;
				return false;
			}

			var nativePlace = this.native_placeShow;
			if(nativePlace != "" && nativePlace.indexOf("-") != -1) {
				this.registerParams.native_place = nativePlace.split("-")[0];
				this.registerParams.native_city = nativePlace.split("-")[1];
				try{
					this.registerParams.native_county = nativePlace.split("-")[2];
				}catch(e){
					this.registerParams.native_county = "";
				}
			} else {
				this.registerParams.native_place = "";
				this.registerParams.native_city = "";
				this.registerParams.native_county = "";
			}

			this.registerItems.forEach((item)=>{
				if(item.isRequired==1 && this.registerParams[item.nameEn] == "" && item.nameEn != 'mobile' && item.nameEn != 'wechat_num' && item.nameEn != 'state' && item.nameEn != 'is_sector') {
						isRequiredF = false;
						this.$mHelper.toast(item.nameZh+'不能為空!');
						this.btnLoading = false;
						return false;
				}
				if(item.isRequired==1 && item.nameEn == 'identity_num') {
					if(!this.IsHKID(this.registerParams.identity_num)) {
						isRequiredF = false;
						uni.showToast({
							title: '請至少輸入首4位數字包括英文字母的身份證號碼',
							icon: "none",
							duration: 1500,
							mask: true
						})
						this.btnLoading = false;
						return false;
					}
				}
				if(item.isRequired==1 && item.nameEn == 'wechat_num') {
					if(this.wechatType == "微信") {
						if(this.registerParams.wechat_num == "") {
							isRequiredF = false;
							uni.showToast({
								title: "請輸入微信！",
								icon: "none",
								duration: 1500,
								mask: true
							})
							this.btnLoading = false;
							return false;
						}
						this.registerParams.whatsapp_num = "";
					} else {
						if(this.registerParams.wechat_num == "") {
							isRequiredF = false;
							uni.showToast({
								title: "請輸入WhatsApp！",
								icon: "none",
								duration: 1500,
								mask: true
							})
							this.btnLoading = false;
							return false;
						}
						this.registerParams.whatsapp_num = this.registerParams.wechat_num;
						this.registerParams.wechat_num = "";
					}
				}

				if(item.nameEn == 'state') {
					if(parseFloat(this.stateType) == 1) {
						this.registerParams.state = "是";
						if(this.registerParams.xq == "" && item.isRequired==1) {
							isRequiredF = false;
							uni.showToast({
								title: "請輸入您所登記選區！",
								icon: "none",
								duration: 1500,
								mask: true
							})
							this.btnLoading = false;
							return false;
						}
					} else {
						this.registerParams.state = "否";
						this.registerParams.xq = "";
					}
				}
				if(item.nameEn == 'is_sector') {
					if(parseFloat(this.isSectorType) == 1) {
						this.registerParams.is_sector = "是";
						if(this.registerParams.record_sector == "" && item.isRequired==1) {
							isRequiredF = false;
							uni.showToast({
								title: "請輸入您所屬的功能界別！",
								icon: "none",
								duration: 1500,
								mask: true
							})
							this.btnLoading = false;
							return false;
						}
					} else {
						this.registerParams.is_sector = "否";
						this.registerParams.record_sector = "";
					}
				}


				if(item.nextDic.length>0) {
					item.nextDic.forEach((item_)=>{
						if(item_.isRequired==1 && (this.registerParams[item_.nameEn] == undefined || this.registerParams[item_.nameEn] == null || this.registerParams[item_.nameEn] == "")) {
							isRequiredF = false;
							this.$mHelper.toast(item_.nameZh+'不能為空!');
							this.btnLoading = false;
							return false;
						}
					});
				}
			});
			for(let i=0;i<this.registerItems.length-1;i++) {
				let nameZh = this.registerItems[i].nameZh;
				let nameEn = this.registerItems[i].nameEn;
				let isRequired = this.registerItems[i].isRequired;
				if(isRequired == 1 && this.registerParams[nameEn] == "" && nameEn != 'mobile' && nameEn != 'wechat_num' && nameEn != 'state' && nameEn != 'is_sector') {
					isRequiredF = false;
					uni.showToast({
						title: nameZh+'不能為空!',
						icon: "none",
						duration: 1500,
						mask: true
					})
					this.btnLoading = false;
					return false;
				}
			}

			if(!isRequiredF) {
				this.btnLoading = false;
				return false;
			}

			if (!this.appAgreementDefaultSelect) {
				uni.showToast({
					title: "請勾選同意註冊協議！",
					icon: "none",
					duration: 1500,
					mask: true
				})
				this.btnLoading = false;
			  return;
			}
			if(!this.isEnd) {
				uni.showToast({
					title: "您還未簽名！",
					icon: "none",
					duration: 1500,
					mask: true
				})
				this.btnLoading = false;
				return;
			}
			if(this.registerOrg_id == 47) {
					if(this.appAgreementDefaultSelect_ && this.registerSt != '香港河北聯誼會') {
						this.registerParams.caluse = 1;
					} else {
						this.registerParams.caluse = 0;
					}

					if(this.registerParams.is_pr == undefined || this.registerParams.is_pr == null || this.registerParams.is_pr == "") {

					} else {
						this.registerParams.is_pr = parseInt(this.registerParams.is_pr);
					}
			}

			if(this.registerParams.mobile == "" || this.registerParams.mobile == null || this.registerParams.mobile == undefined) {
				this.registerParams.mobile = this.userInfo.mobile;
			}

			this.registerParams.service_center_id = this.serviceArr[this.serviceIndex].id;
			this.registerParams.org_id = this.registerOrg_id;
			this.registerParams.wid = this.userInfo.id;

			this.$http
				.post(register,this.registerParams)
				.then((res) => {
					this.$mHelper.toast('註冊成功！請等待社團管理員審批！');
					setTimeout(() => {
						this.$mRouter.push({ route: '/pages/public/login' });
					}, 2000)
					this.btnLoading = false;
				})
				.catch(() => {
					this.btnLoading = false;
				});
				this.$forceUpdate();
		}
	}
};
</script>
<style lang="scss" scoped>

	.registerOrgName{
		display: inline-block;
		width: calc(100% - 280rpx);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		vertical-align: middle;
	}
	.share-bg {
		width: 75%;
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
		image {
			width: 70vw;
			height: 70vw;
		}
	}
	.longCheckbox{
		display: block;
		margin-bottom: 15rpx;
	}
</style>
<style lang="scss">
	.firstCanvas{
		width: 100%;
		height: 350rpx;
		background-color: #ECECEC;
	}

.grace-idcard-main{margin:20upx 30upx;}
.grace-idcard-desc{line-height:2em; background:#FFFFFF; padding:20upx; border-radius:10upx;}
.grace-idcard-text{line-height:2em; margin-top:30upx;}
.grace-idcard-items{background:#FFFFFF; padding:30upx 0; display:flex; margin:30upx 0; border-radius:10upx; align-items: flex-start;}
.grace-idcard-uper-btn{width:276upx; margin:0 60upx; background:#F1F1F1; padding-bottom:10upx; border-radius:10upx; text-align:center;}
.grace-idcard-uper-btn .img{width:100upx; height:100upx; margin:0 auto; margin-top:30upx;}
.grace-idcard-uper-btn .img image{width:100upx; height:100upx;}
.grace-idcard-uper-btn .text{width:100%; margin-top:10upx; text-align:center; line-height:2em;}
.grace-idcard-preview{width:50%; margin:0 30upx;}
.grace-idcard-preview image{width:100%;}


.register {
	padding-top: 0px;
	position: relative;
	width: 100vw;
	overflow: hidden;
	background: #f0f2f2;
	.centerLine{
		background: #f0f2f2;
		height: 20rpx;
	}
	.line10{
		height: 10rpx;
	}
	.wrapper {
		position: relative;
		width: 100vw;
		z-index: 90;
		background: #f0f2f2;
		padding-bottom: 40upx;

		.welcome {
			position: relative;
			font-size: 30upx;
			color: white;
			font-weight: bolder;
			text-shadow: 1px 0px 1px rgba(0, 0, 0, 0.3);
			background: #1aa5fd;
			padding: 20rpx 60rpx;
			margin-bottom: 25rpx;
			view{
				font-size: 30upx;
				margin: 10rpx 0;
			}
			.logo{
				width: 50rpx;
				height: 50rpx;
				border-radius: 50%;
				vertical-align: middle;
				margin: 0 10rpx;
			}
		}
	}
	.collapseBox{
		display: block;
		width: 94%;
		margin-left: 3%;
		.collapseContent{

		}
	}
	.collapseTitle{
		height: 100rpx;line-height: 100rpx;width: 70%;background-image: linear-gradient(to right,#d0e6fd, #ffffff);
		padding-left: 30rpx;
		.collapseIcon{
			width: 46rpx;
			height: 46rpx;
			vertical-align: middle;
			margin-right: 20rpx;
		}
		.collapseText{
			vertical-align: middle;
		}
	}
	.signBox{
		width: calc(100% - 44rpx);
		background-color: white;
		margin-left: 22rpx;
		margin-top: 30rpx;
		padding: 10rpx 22rpx 10rpx;
		.signVlaue{
			font-size: 30rpx;
			margin: 20rpx 0;
			font-weight: bolder;
		}
	}
	.registerForm{
		display: block;
		width: calc(100% - 44rpx);
		padding: 10rpx 22rpx 0;
		margin-top: 30rpx 0;
		view{
			display: block;
			width: 100%;
			padding: 0;
			margin: 0;
		}
		.is-disabled{
			background: none !important;
			background-color: none !important;
		}
		.registerFormItem{
			input{
				border-bottom: 1px solid #dedede;
			}
		}
	}
	.nativeBox{
		view{
			padding: 0;
			margin: 0;
		}
	}
	.back-btn {
		position: absolute;
		left: 40upx;
		z-index: 9999;
		padding-top: var(--status-bar-height);
		top: 0upx;
		font-size: 40upx;
		color: white;
	}

	.left-top-sign {
		font-size: 120upx;
		color: $page-color-base;
		position: relative;
		background-color: #1aa5fd;
	}

	.right-top-sign {
		width: 100vw;
		position: absolute;
		top: 0upx;
		z-index: 95;
		background-color: #1aa5fd;
		&:before,
		&:after {
			display: block;
			content: '';
			height: 120upx;
			background-color: #1aa5fd;
		}
		&:before {
			background-color: #1aa5fd;
		}
		&:after {
			position: absolute;
			right: 0;
			background-color: #1aa5fd;
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
