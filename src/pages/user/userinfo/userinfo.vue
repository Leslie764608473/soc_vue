<template>
	<view class="userinfo">

		<view style="padding: 25rpx;">
			<view class="list-cell b-b" style="border-radius: 20rpx 20rpx 0 0;">
				<view class="cell-tit">頭像</view>
				<view class="cell-tip">
					<view class="portrait-box" style="position: relative;z-index: 999;">
						<avatar
							canRotate="false"
							selWidth="200px"
							selHeight="400upx"
							@upload="handleUploadFile"
							:avatarSrc="profileInfo.icon || headImg"
							avatarStyle="width: 100rpx; height: 100rpx; border-radius: 15rpx; border: 6upx solid #fff;"
						>
						</avatar>
					</view>
				</view>
				<view class="cell-more iconfont iconyou" style="align-self: center;"></view>
			</view>
			<view class="list-cell b-b" v-if="profileInfo.orgId == 46">
				<text class="cell-tit">會員編號</text>
				<view class="cell-tip">
					<input
						type="text"
						disabled="disabled"
						style="text-align: right;"
						v-model="profileInfo.memberNum"
					/>
				</view>
				<text class="cell-more iconfont iconyou"></text>
			</view>
			<view class="list-cell b-b">
				<text class="cell-tit">暱稱</text>
				<view class="cell-tip">
					<input
						type="text"
						style="text-align: right;"
						v-model="profileInfo.nickname"
						placeholder="請輸入您的暱稱"
					/>
				</view>
				<text class="cell-more iconfont iconyou"></text>
			</view>
			<view class="list-cell b-b">
				<text class="cell-tit">姓名</text>
				<view class="cell-tip">
					<input
						type="text"
						style="text-align: right;"
						v-model="profileInfo.nameZh"
						placeholder="請輸入您的姓名"
					/>
				</view>
				<text class="cell-more iconfont iconyou"></text>
			</view>
			<view class="list-cell b-b">
				<text class="cell-tit">性別</text>
				<view class="cell-tip">
					<picker @change="bindPickerChange" :value="genderName" rangeKey="name" :range="genders">
						<view class="date" style="background: none;">{{
							profileInfo.gender || '請選擇性別'
						}}</view>
					</picker>
				</view>
				<text class="cell-more iconfont iconyou"></text>
			</view>
			<view class="list-cell b-b" style="border-radius: 0 0 20rpx 20rpx;">
				<text class="cell-tit">生日</text>
				<view class="cell-tip">
					<picker mode="date" v-model="date" @change="bindDateChange">
						<view class="date" style="background: none;">{{
							date || '請選擇日期'
						}}</view>
					</picker>
				</view>
				<text class="cell-more iconfont iconyou"></text>
			</view>
		</view>

		<view :loading="btnLoading" @tap="toUpdateInfo" class="list-cell b-b" style="border-radius:20rpx; width: calc(100% - 50rpx);margin-left: 25rpx;">
			<text style="color:#0081ff;word-spacing: 50rpx;font-weight: 500;">確   定</text>
		</view>

		<!--加载动画-->
		<rfLoading isFullScreen :active="loading"></rfLoading>

		<!--进度条加载-->
		<rf-load-progress
			:height="CustomBar"
			:progress="loadProgress"
		></rf-load-progress>
	</view>
</template>

<script>
/**
 * @des 修改用户信息
 *
 * @author stav stavyan@qq.com
 * @date 2020-01-10 14:28
 * @copyright 2019
 */
import { memberInfo, memberUpdate, uploadImage,updateNickName,uploadIcon,uploadFileUrl,uploadImgFile } from '@/api/userInfo';
import avatar from '@/components/rf-avatar/rf-avatar';
import moment from '@/common/moment';

export default {
	components: { avatar },
	data() {
		return {
			loadProgress: 0,
			CustomBar: this.CustomBar,
			profileInfo: {},
			genders: [
				/* {
					value: '0',
					name: '未知'
				}, */
				{
					value: '男',
					name: '男'
				},
				{
					value: '女',
					name: '女'
				}
			],
			genderName: 0,
			date: moment().format('YYYY-MM-DD'),
			token: null,
			loading: true,
			headImg: this.$mAssetsPath.headImg,
			userBg: this.$mAssetsPath.userBg,
			btnLoading: false
		};
	},
	onLoad() {
		this.initData();
	},
	methods: {
		// 上传头像
		uploadImage() {
			// 从相册选择图片
			const _this = this;
			uni.chooseImage({
				count: 1,
				sizeType: ['original', 'compressed'],
				sourceType: ['album'],
				success: function(res) {
					_this.handleUploadFile(res.tempFilePaths);
				}
			});
		},
		bindPickerChange(e) {
			this.genderName = e.target.value;
			this.profileInfo.gender = this.genders[parseFloat(e.target.value)].name;
		},
		// 上传头像
		handleUploadFile(data) {
			const _this = this;
			const filePath = data.path || data[0];
			this.profileInfo.icon = filePath;
			var uploadTask2 = uni.uploadFile({
				url: this.$mConfig.baseUrl+'/imgImport/uploadImgFile',
				filePath: filePath,
				name: 'multipartFile',
				fail:(err)=>{

				},
				header: {
					'Authorization' : uni.getStorageSync('accessToken')
				},
				success:  (fileResTwo)=> {
					_this.$http.post(uploadIcon,{},{
									params: {
										id: this.profileInfo.id,
										pic_path : JSON.parse(fileResTwo.data).url
									}
									})
									.then(r => {
										let obj = _this.$mStore.getters.userObj;
										obj.icon = JSON.parse(fileResTwo.data).url;
										obj.umsMember.icon = JSON.parse(fileResTwo.data).url;
										_this.$mStore.commit('setUserObj',obj);
									});
				}
			 });
		},
		// 监听日期更改
		bindDateChange(e) {
			this.date = e.target.value;
		},
		// 监听性别更改
		handleGenderChange(e) {
			this.profileInfo.gender = e.detail.value;
		},
		// 数据初始化
		initData() {
			this.token = uni.getStorageSync('accessToken') || undefined;
			this.getMemberInfo();
		},
		// 获取用户信息
		async getMemberInfo() {
			await this.$http
				.get(memberInfo)
				.then(r => {
					console.log(r.data);
					this.loading = false;
					this.profileInfo = r.data;

					this.date = this.profileInfo.birthdayStr;
				})
				.catch(() => {
					this.loading = false;
				});
		},
		// 更新用户信息
		async toUpdateInfo() {
			this.handleUpdateInfo();
		},
		// 更新用户信息
		async handleUpdateInfo() {
			this.profileInfo.birthdayStr = this.date;
			this.btnLoading = true;
			this.loadProgress = this.loadProgress + 6;
			const timer = setInterval(() => {
				this.loadProgress = this.loadProgress + 6;
			}, 50);
			await this.$http
				.post(`${updateNickName}?id=${this.profileInfo.id}`,{}, {
					params: {
						nikeName: this.profileInfo.nickname,
						name: this.profileInfo.nameZh,
						mobile: this.profileInfo.mobile,
						gender: this.profileInfo.gender,
						birthday: this.profileInfo.birthdayStr,
						orgId: this.$mStore.getters.orgId
					}
				})
				.then(() => {
					clearInterval(timer);
					this.loadProgress = 0;
					this.$mHelper.toast('恭喜您, 個人資料修改成功!');
					setTimeout(() => {
						this.$mRouter.back();
					}, 1 * 1000);
				})
				.catch(() => {
					this.btnLoading = false;
				});
		}
	}
};
</script>

<style lang="scss" scoped>
page {
	background-color: $color-white;
}
.list-cell{
	align-items: center;
}
.cell-tit{
	color: #333333;
	font-size: 28rpx;
}
.cell-tip{
	font-size: 26rpx;
	color: #999999;
}

.rf-product-image-wrapper{
				width: 250rpx;
				height: 166.667rpx;
				.imgBox{
					width: 100%;
					height: 100%;
					background-position: center;
					background-repeat: no-repeat;
					background-size: cover;
				}
			}
.portrait {
			position: relative;
			width: 200upx;
			height: 200upx;
			border-radius: 50%;
			border: 6upx solid #fff;
		}


.userinfo {
	.user-section {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 320upx;
		padding: 40upx 30upx 0;
		overflow: hidden;
		position: relative;
		.bg {
			position: absolute;
			left: 0;
			top: 0;
			width: 100vw;
			opacity: 0.84;
		}

		.portrait-box {
			clear: both;
			z-index: 2;
		}

		.portrait {
			position: relative;
			width: 200upx;
			height: 200upx;
			border-radius: 50%;
			border: 6upx solid #fff;
		}

		.yticon {
			position: absolute;
			line-height: 1;
			z-index: 5;
			font-size: 48upx;
			color: #fff;
			padding: 4upx 6upx;
			border-radius: 6upx;
			background: rgba(0, 0, 0, 0.4);
		}

		.pt-upload-btn {
			right: 0;
			bottom: 10upx;
		}

		.bg-upload-btn {
			right: 20upx;
			bottom: 16upx;
		}
	}

	.input-content {
		padding: 40upx 60upx;

		.input-item {
			display: flex;
			padding: 0 30upx;
			background: $page-color-light;
			height: 80upx;
			line-height: 80upx;
			border-radius: 4px;
			margin-bottom: 30upx;

			&:last-child {
				margin-bottom: 0;
			}

			.tit {
				width: 100upx;
				font-size: $font-sm + 2upx;
				color: $font-color-base;
			}

			input {
				width: calc(100% - 100upx);
				height: 80upx;
				line-height: 80upx;
				font-size: $font-base + 2upx;
				color: $font-color-dark;
			}

			.date {
				height: 80upx;
				line-height: 80upx;
				font-size: $font-base + 2upx;
				color: $font-color-dark;
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
		}
	}
}
</style>
