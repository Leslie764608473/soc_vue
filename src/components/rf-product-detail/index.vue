<template>
  <view class="rf-product-detail">
		<!--顶部返回按钮-->
		<!--#ifdef MP-WEIXIN-->
		<text class="back-btn iconfont iconzuo" @tap="navBack"></text>
		<!--#endif-->
		<!--header-->
		<view class="detail" v-if="product.name">
			<!--顶部商品轮播图-->
			<view class="carousel">
				<swiper indicator-dots circular="true" duration="400" controls touchable>
					<!--#ifdef APP-PLUS-->
					<swiper-item class="swiper-item" v-if="product.video_url">
						<video muted :poster="product.covers[0]" object-fit="contain" :src="product.video_url"></video>
					</swiper-item>
					<!--#endif-->
					<swiper-item
						class="swiper-item"
						v-for="(item, index) in product.covers"
						:key="index"
					>
						<view class="image-wrapper">
							<view class="imgBox" :style="{'background-image':'url('+item+')'}" ></view>
							<!-- <image :src="item" class="loaded" mode="aspectFill"></image> -->
						</view>
						<uni-tag class="content" circle size="small" :text="`${index + 1}  / ${product.covers.length}`"></uni-tag>
					</swiper-item>
				</swiper>
			</view>
			<!--商品信息-->
			<view class="introduce-section">
				<view class="introduce-first-line">
					<view class="price-box">
						<view class="price-first-line">
							<!-- <image
								class="member-level"
								mode="aspectFit"
								:src="vipPrice">
							</image> -->
							<text class="price" :class="'text-' + themeColor.name">{{ currentProductPrice }}</text>
						</view>
					</view>
					<!-- <view class="collect" @tap="toFavorite">
						<view class="iconfont" :class="[ favorite ? `text-${themeColor.name} iconshixin1` : 'iconguanzhu']"></view>
						<text>收藏</text>
					</view> -->
				</view>
				<view class="introduce-second-line">
					<view class="title">
						<text>{{ product.name }}</text>
					</view>
					<view class="share" style="position: relative;top: -50rpx;">
						<rf-tag
							type="gray"
							size="small"
							tui-tag-class="tui-tag-share tui-size"
							shape="circleLeft"
						>
							<button class="share-btn" open-type="share" :class="'text-' + themeColor.name" @tap.stop="share()">
								<text class="iconfont iconfenxiang"></text>
								<text class="tui-share-text tui-gray">分享</text>
							</button>
						</rf-tag>
					</view>
				</view>
			</view>
			<!--购买类型-->
			<rf-item-popup
				title="購買數量"
				@hide="hideService"
				:specClass="specClass"
				@show="toggleSpec"
				v-if="product.cartItemStatus == 1"
			>
				<view slot="content" style="text-align: right;">
					<text class="selected-text">每人限購數量：{{product.promotionPerLimit}}</text>
				</view>
				<view slot="right"><text style="margin-left: 30rpx;" class="iconfont iconyou"></text></view>
				<view slot="popup" @click.stop="stopPrevent">
					<rf-attr-content
						:type="type"
						:product="product"
						:minNum="0"
						:maxNum="product.promotionPerLimit"
						@toggle="toggleSpec"
						></rf-attr-content>
				</view>
			</rf-item-popup>
			<!-- 评价 -->
			<!-- <view class="eva-section" @tap="toEvaluateList">
				<view class="e-header">
					<text class="tit">評價({{ product.comment_num || 0 }})</text>
					<text class="tip" v-if="product.match_ratio"
						>好評率 {{ product.match_ratio }}%</text
					>
					<text class="tip" v-else>暫無評價信息</text>
					<i class="iconfont iconyou"></i>
				</view>
				<view
					class="eva-box"
					v-if="product.evaluate && product.evaluate.length > 0"
				>
					<image
						class="portrait"
						:src="
							(product.evaluate &&
								product.evaluate[0] &&
								product.evaluate[0].member_head_portrait) ||
								headImg
						"
						mode="aspectFill"
					></image>
					<view class="right">
						<view class="name">
							<text>
								{{
									(product.evaluate &&
										product.evaluate[0] &&
										product.evaluate[0].member_nickname) ||
										'匿名用户'
								}}
							</text>
							<rf-rate
								v-if="evaluateList.length > 0"
								size="16"
								disabled="true"
								:value="evaluateList[0].scores"
								:active-color="themeColor.color"
							/>
						</view>
						<text class="con in2line">{{
							(product.evaluate &&
								product.evaluate[0] &&
								product.evaluate[0].content) ||
								'这个人很懒，什么都没留下~'
						}}</text>
						<view class="bot">
							<text class="attr"
								>购买类型：{{
									(product.evaluate &&
										product.evaluate[0] &&
										product.evaluate[0].sku_name) ||
										singleSkuText
								}}</text>
							<text class="time">{{
								product.evaluate &&
									product.evaluate[0] &&
									product.evaluate[0].created_at | time
							}}</text>
						</view>
					</view>
				</view>
			</view>
			 --><!--底部商品详情-->
			<view class="detail-desc" style="padding: 0 35rpx 40rpx;">
				<view class="d-header">
					<text>商品詳情</text>
				</view>
				<!-- <view>商品詳情</view> -->
				<mp-html v-if="product.detailDesc" class="productContent" container-style="color:#333333;font-size: 32rpx" :content="product.detailDesc.trim()" />
				<!-- <view>福利展示</view> -->
				<mp-html v-if="product.detailMobileHtml" style="display: block;margin: 50rpx 0;" class="productContent" container-style="color:#333333;font-size: 32rpx" :content="product.detailMobileHtml.trim()" />
				<!-- <view>條款及細則</view> -->
				<mp-html v-if="product.note" class="productContent" container-style="color:#333333;font-size: 32rpx" :content="product.note.trim()" />
			</view>
			<!-- 底部操作菜单 -->
			<view class="page-bottom">
				<view class="page-bottom-bth-wrapper" style="width: 21vw;">
					<!-- <navigator
						url="/pages/index/index"
						open-type="switchTab"
						class="p-b-btn"
					>
						<i class="iconfont iconzhuyedefuben"></i>
						<text>首頁</text>
					</navigator> -->
					<!-- <navigator
						url="/pages/cart/cart"
						class="p-b-btn cart"
					>
						<i class="iconfont icongouwuche2"></i>
						<text>購物車</text>
					</navigator> -->
				</view>
				<view class="action-btn-group" v-if="product.cartItemStatus != 0 && product.receiveStatus == 1 && product.receiveType != 1">
					<!-- 領用券 -->
					<button v-if="parseInt(get_receive_status) == 0" class="action-btn" :class="'bg-' + themeColor.name"  @tap="add_lyq('1')" >立即領取</button>
					<button v-if="parseInt(get_receive_status) == 1" class="action-btn" disabled="disabled" :class="'bg-' + themeColor.name" @tap="add_lyq('0')">已領取</button>
				</view>
				<view class="action-btn-group" v-else-if="product.cartItemStatus == 1">
					<!-- 商品 -->
					<!-- <button class="action-btn" :class="'bg-' + themeColor.name" @tap="addCart('buy')" >立即購買</button>
					<button class="action-btn" :class="'bg-' + themeColor.name" @tap="addCart('cart')">加入購物車</button> -->
				</view>
				<view class="action-btn-group" v-else-if="product.cartItemStatus == 2">
					<!-- 優惠券 -->
					<button v-if="product.get_status == 0" class="action-btn" :class="'bg-' + themeColor.name" @tap="add_yhq('1')" >立即領取</button>
					<button v-if="product.get_status == 1" class="action-btn" :class="'bg-' + themeColor.name" @tap="add_yhq('0')">已領取</button>
				</view>
			</view>
		</view>
		<!-- 分享引导 -->
		<view
			class="popup spec show"
			v-if="shareClass === 'show'"
			@touchmove.stop.prevent="stopPrevent"
			@tap="hideShareSpec"
		>
			<!-- 遮罩层 -->
			<view class="mask" @tap="hideShareSpec"></view>
			<view class="share-bg">
				<image :src="shareBg"></image>
			</view>
		</view>
		<view class="hideCanvasView" v-if="canvasShow">
			<canvas class="hideCanvas" canvas-id="default_PosterCanvasId" :style="{width: (poster.width||10) + 'px', height: (poster.height||10) + 'px'}"></canvas>
		</view>
		<!--回到顶部-->
		<rf-live v-if="product.name"></rf-live>
		<!--#ifdef MP-->
    <rf-nav></rf-nav>
		<!--#endif-->
		<view
			class="popup spec show"
			v-if="kefuShow"
			@touchmove.stop.prevent="stopPrevent"
			@tap="hide"
		>
			<!-- 遮罩层 -->
			<view class="mask" @tap="hide"></view>
			<view class="kefu-bg">
				<image :src="appServiceQr"></image>
			</view>
		</view>

		<!-- 領用券 領用詳情 -->
		<lyq-popup ref="lyqPopupREF" :product="product" :disabledArr="disabledArr" :serviceArr="serviceArr" :serviceNameArr="serviceNameArr" v-if="isLyqPopupShow"></lyq-popup>

	</view>
</template>
<script>
	/**
	 *@des 封装商品详情
	 *@author stav stavyan@qq.com
	 *@blog https://stavtop.club
	 *@date 2020/05/15 16:22:24
	 */
	import rfItemPopup from '@/components/rf-item-popup';
	import moment from '@/common/moment';
	import rfAttrContent from '@/components/rf-attr-content';
	import rfRate from '@/components/rf-rate/rf-rate';
	import rfBadge from '@/components/rf-badge/rf-badge';
	import uniTag from '@/components/uni-tag/uni-tag';
	import rfNav from '@/components/rf-nav';
	import lyqPopup from '@/components/soc-popup/lyq.vue';
	import { cartItemCount, cartItemCreate, addCoupon,getServiceByMid,addCart } from '@/api/product';
	import { collectCreate, collectDel, pickupPointIndex, transmitCreate } from '@/api/basic';
  import { couponReceive, addressList } from '@/api/userInfo';
	import {verifyAccessToken,login,loginNot,getOrgList} from '@/api/login.js';
	import { mapMutations } from 'vuex';
  export default {
    name: 'rfProductDetail',
    props: {
			get_receive_status: {
				type: String,
				default: ''
			},
			otherOrg: {
				type: Boolean,
				default: false,
			},
			isShare: {
				type: Boolean,
				default: false,
			},
			shareOrgId: {
				type: String,
				default: ''
			},
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
			rfNav,
			rfItemPopup,
			rfBadge,
			rfRate,
			uniTag,
			rfAttrContent,
			lyqPopup
		},
		data() {
			return {
				orgList: this.$mStore.getters.orgList,
        appServiceQr: this.$mSettingConfig.appServiceQr,
				kefuShow: false,
				addressClass: 'none',
				canvasShow: true,
				logo: this.$mSettingConfig.appLogo,
				vipPrice: this.$mAssetsPath.vipPrice,
				posterShow: false,
				serviceClass: 'none', // 服务弹窗
				ladderPreferentialClass: 'none', // 阶梯优惠弹窗
				attributeValueClass: 'none', // 商品参数弹窗
				specClass: 'none', // 商品参数弹窗
				couponClass: 'none', // 优惠券弹窗
				shareClass: 'none', // 分享引导弹窗
				isLyqPopupShow: false,
				fullGiveClass: 'none', // 满减送弹窗
				cartType: null, // 下单类型
				couponList: [], // 优惠券列表
				currentStock: null,
				currentSkuPrice: null,
				currentSkuName: null,
				currentCartCount: 1,
				evaluateList: [],
				hasLoginOrg: this.$mStore.getters.hasLoginOrg,
				hasLogin: this.$mStore.getters.hasLogin,
				orgUserInfo: this.$mStore.getters.orgUserInfo,
				cartNum: uni.getStorageSync('cartNum'),
				addressTypeList: this.$mConstDataConfig.addressTypeList,
				tabCurrentIndex: 0,
				loading: true,
				errorInfo: '',
				headImg: this.$mAssetsPath.headImg,
				isPointExchange: false,
				shareBg: this.$mAssetsPath.shareBg,
				appServiceType: this.$mSettingConfig.appServiceType,
				productPosterQrType: this.$mSettingConfig.productPosterQrType,
				appName: this.$mSettingConfig.appName,
				shareFrom: '',
				poster: {},
				promoCode: '',
				addressList: [],
        moneySymbol: this.moneySymbol,
				state: 1,
        singleSkuText: this.singleSkuText,
				thirdPartyQrCodeImg: '',
				serviceNameArr: [],
				serviceArr: [],
				disabledArr: [],
				userInfoU: this.$mStore.getters.userObj,
			};
		},
		async onShareAppMessage () {
      // #ifdef MP
      /* await this.$http.post(`${transmitCreate}`, {
        topic_type: 'product',
        topic_id: this.productId
      }).then(() => {
        return {
          title: this.productDetail.name,
          path: `/pages/product/product?id=${this.productId}`
        };
      }); */
      // #endif
		},
		filters: {
			time(val) {
				return moment(val * 1000).format('YYYY-MM-DD HH:mm');
			},
			pointExchangeTypeFilter(val) {
				const type = [
					'',
					'非积分兑换',
					'积分加现金',
					'积分兑换或直接购买',
					'只支持积分兑换'
				];
				return type[parseInt(val, 10)];
			},
			integralGiveTypeFilter(val) {
				const type = ['固定积分', '百分比'];
				return type[parseInt(val, 10)];
			},
			givePointFilter(val) {
				return val.integral_give_type === '1'
					? Math.round((parseInt(val.give_point, 10) / 100) * parseInt(val.minSkuPrice, 10))
					: parseInt(val.give_point, 10);
			}
		},
		computed: {
      type() {
				return 'buy_now';
      },
			// 购买按钮禁用
			buyBtnDisabled() {
				return parseInt(this.currentStock || this.product.stock, 10) === 0;
			},
			// 添加购物车按钮禁用
			addCartBtnDisabled() {
				return (
					this.product.point_exchange_type === '2' ||
					this.product.point_exchange_type === '4' ||
					parseInt(this.currentStock || this.product.stock, 10) === 0 ||
					this.product.is_virtual === '1'
				);
			},
			// 最小购买数量
			minNum() {
				return 1;
			},
			// 最小购买数量
			maxNum() {
				let maxNum = 0;
				return maxNum;
			},
			favorite () {
				return !!this.product.myCollect;
			},
			// 计算倒计时时间
			second() {
				return function(val) {
					return Math.floor(val - new Date() / 1000);
				};
			},
			currentProductPrice () {
        let price;
				if(this.product.price == 0) {
					price = "免費"
				} else {
					price = this.moneySymbol + "" +this.product.price
				}
        return price;
			}
		},
		created() {
		},
    methods: {
      ...mapMutations(['setCartNum']),
			// 返回上一页
			navBack() {
				if(!this.hasLogin) {
					this.$mRouter.reLaunch({ route: '/pages/index/welcome/index'});
					return false;
				}
				if(this.isShare) {
					this.$mRouter.reLaunch({route: '/pages/index/index?backType=1&orgId='+this.shareOrgId});
				} else {
					this.$mRouter.back();
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
									this.orgUserInfo = r.msg;
									uni.showLoading();
									setTimeout(()=>{
										uni.hideLoading();
										if(type == 1) {
											this.$http.post(addCoupon,{},{params:{
												member_id : this.orgUserInfo.memberId,
												product_id : this.product.id
											}})
											.then(res => {
												this.$mHelper.toast(res.data);
												this.product.get_status = 1;
											}).catch((err) => {
												this.$mHelper.toast(err);
											});
										} else {
											this.isLyqPopupShow = true;
											this.getServeArr(this.orgUserInfo.memberId,this.product.id);
										}
									},1000);

							})
						}
					}).catch(() => {

					});
			},
			orgLogin(orgId,type) {
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
										this.toLogin(orgId,type);
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
							this.toLogin(orgId,type);
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
			add_yhq(type) {
				if(!this.hasLogin) {
					this.$mRouter.reLaunch({ route: '/pages/index/welcome/index?orgId='+this.shareOrgId+'&type=1&id='+this.product.id});
					return false;
				} else {
					if(!this.hasLoginOrg) {
						this.orgLogin(this.shareOrgId,1);
						return false;
					} else {
						if(this.otherOrg) {
							this.orgLogin(this.shareOrgId,1);
							return false;
						}
					}
				}
				if(parseInt(type) == 1) {
					this.$http
						.post(addCoupon,{},{params:{
							member_id : this.orgUserInfo.memberId,
							product_id : this.product.id
						}})
						.then(res => {
							this.$mHelper.toast(res.data);
							this.product.get_status = 1;
						}).catch((err) => {
							this.$mHelper.toast(err);
						});
				} else {
					this.$mHelper.toast("您已領取該券");
				}
			},
			getServeArr(mid,pid) {
				this.$http.post(getServiceByMid,{},{
					params: {
						mid : mid,
						pid : pid
					}
				}).then((res)=>{
					this.serviceArr = res.data;
					this.serviceNameArr = [];
					res.data.forEach((item)=>{
						let name = item.name;
						if(item.stock==0) {
							name += "（預約已滿）";
						}
						if(item.status==0) {
							name += "（非本機構）";
						}
						if(item.status==0) {
							this.disabledArr.push(name);
						}
						this.serviceNameArr.push({
							name : name
						});
					})
					this.$forceUpdate();
				});
			},
			add_lyq(type) {
				if(!this.hasLogin) {
					this.$mRouter.reLaunch({ route: '/pages/index/welcome/index?orgId='+this.shareOrgId+'&type=1&id='+this.product.id});
					return false;
				} else {
					if(!this.hasLoginOrg) {
						this.orgLogin(this.shareOrgId,2);
						return false;
					} else {
						if(this.otherOrg) {
							this.orgLogin(this.shareOrgId,2);
							return false;
						}
					}
				}
				if(parseInt(type) == 1) {
					this.isLyqPopupShow = true;
					this.getServeArr(this.orgUserInfo.memberId,this.product.id);
				} else {
					this.$mHelper.toast("您已領取該券");
				}
			},
      hide() {
        this.kefuShow = false;
      },
      // 分享商品
      share() {
        // #ifdef H5
        if (this.$mPayment.isWechat()) {
          this.shareClass = 'show';
        } else {
          this.$mHelper.h5Copy(this.url);
        }
        // #endif
        // #ifdef APP-PLUS
				this.$mHelper.handleAppShare(this.url, this.appName, this.product.name, this.product.picture);
				// #endif
			},
			// 通用跳转
			navTo(route) {
				if (this.appServiceType === '1' && route === '/pages/product/service/index') {
					this.kefuShow = true;
					return;
				}
				if (!this.hasLogin) {
					this.$mHelper.backToLogin();
				} else {
					if (this.appServiceType === '0') {
						this.$mHelper.toast('暂不提供客服功能');
					} else {
						this.$mRouter.push({ route });
					}
				}
			},
			// 弹窗显示
			showPopupService(type, list) {
				if (list.length === 0) return;
				this[type] = 'show';
			},
			// 关闭服务弹窗
			hideService() {
				this.specClass = 'none';
				this.couponClass = 'none';
				this.serviceClass = 'none';
				this.ladderPreferentialClass = 'none';
				this.attributeValueClass = 'none';
				this.fullGiveClass = 'none';
			},
			// 获取优惠券
			async getCoupon(item) {
				if (!this.hasLogin) {
					await this.$mHelper.backToLogin();
					return;
				}
				await this.$http
					.post(`${couponReceive}`, {
						id: item.id
					})
					.then(() => {
						this.$mHelper.toast('领取成功');
					});
			},
			// 跳转至评价列表
			toEvaluateList() {
				if (!this.product.evaluateStat || parseInt(this.product.comment_num, 10) === 0) return;
				this.$mRouter.push({
					route: `/pages/order/evaluation/list?comment_num=${
						this.product.comment_num
					}&evaluateStat=${JSON.stringify(this.product.evaluateStat)}`
				});
			},
			// 顶部tab点击
			tabClick(index, state) {
				this.page = 1;
				this.addressList.length = 0;
				this.tabCurrentIndex = index;
				this.state = state;
				const api = (this.state === 1 ? addressList : pickupPointIndex);
				this.getAddressList(api);
			},	// 获取收货地址列表
			async getAddressList(api) {
				await this.$http
					.get(api, {
					})
					.then(r => {
						this.addressList = r.data;
					});
			},
			// 规格弹窗开关
			toggleSpec(row) {
				if (!this.product.id) return;
				if (this.specClass === 'show') {
					this.currentCartCount = row.cartCount;
					if (this.cartType === 'cart') {
						this.handleCartItemCreate();
					} else if (this.cartType === 'buy') {
						this.buy();
					}
					this.cartType = null;
					this.specClass = 'hide';
					setTimeout(() => {
						this.specClass = 'none';
					}, 250);
				} else if (this.specClass === 'none') {
					this.specClass = 'show';
				}
			},
			// 海报弹窗开关
			async openPoster() {
				this.$mHelper.toast('该版本不支持生成海报');
			},
			hideSpec() {
				this.specClass = 'hide';
				setTimeout(() => {
					this.specClass = 'none';
				}, 250);
			},
			hideShareSpec() {
				this.shareClass = 'hide';
				setTimeout(() => {
					this.shareClass = 'none';
				}, 250);
			},
			hideLYQSpec() {
				this.lyqClass = 'hide';
				setTimeout(() => {
					this.lyqClass = 'none';
				}, 250);
			},
			// 添加商品至购物车
			async handleCartItemCreate() {
				var params = {
							productId : this.product.id,
							quantity: this.currentCartCount,
							productPic: this.product.pic,
							productName: this.product.name,
							productSubTitle: this.product.detailTitle,
							price: this.product.price,
						};
				 this.$http
					.post(`${addCart}`,params)
					.then((r) => {
						if(r.code == 200) {
							this.$mHelper.toast('添加購物車成功！');
						} else {
							this.$mHelper.toast(r.message);
						}
					});
			},
			// 收藏
			async toFavorite() {
				if (!this.product.id) return;
				if (!this.hasLogin) {
					this.specClass = 'none';
					await this.$mHelper.backToLogin();
				} else {
					this.favorite ? this.handleCollectDel() : this.handleCollectCreate();
				}
			},
			// 收藏商品
			async handleCollectCreate() {
				await this.$http
					.post(`${collectCreate}`, {
						topic_id: this.product.id,
						topic_type: 'product'
					})
					.then(() => {
						this.$mHelper.toast('收藏成功');
						this.$emit('product');
					});
			},
			// 取消收藏商品
			async handleCollectDel() {
				await this.$http
					.delete(`${collectDel}?id=${this.product.myCollect.id}`)
					.then(() => {
						this.$mHelper.toast('取消收藏成功');
						this.$emit('product');
					});
			},
			async buy() {
        const params = {};
				params.type = 'cartNo';
				params.data = this.product.id;
				params.state = 0;
				params.quantity = this.currentCartCount
				this.$mRouter.push({
					route: `/pages/order/create/order?data=${JSON.stringify(params)}`
				});
			},
			addCart(type, isPointExchange) {
				if (!this.product.id) return;
				if (!this.hasLogin) {
					this.$mHelper.backToLogin();
					return;
				}
				this.specClass = 'show';
				this.cartType = type;
				this.isPointExchange = isPointExchange;
			},
			stopPrevent() {}
    }
  };
</script>
<style lang="scss" scoped>
	.action-btn-group{
		margin: 12rpx 30rpx;
		height: 67rpx;
	}
	.imgBox{
		height: 100%;
		background-position: center;
		background-repeat: no-repeat;
		background-size: contain;
	}
</style>
<style lang="scss">
.rf-product-detail {
	height: 100%;
	min-height: 100vh;
	background-color: white;
	.back-btn {
		position: fixed;
		left: 40upx;
		z-index: 9999;
		padding-top: var(--status-bar-height);
		top: 40upx;
		font-size: 40upx;
		color: $font-color-dark;
	}
	.carousel {
		// height: 722upx;
		height: 75vw;
		position: relative;
		swiper {
			height: 100%;
		}
		.image-wrapper {
			width: 100%;
			height: 100%;
			background-color: white;
		}
		.swiper-item {
			display: flex;
			justify-content: center;
			align-content: center;
			height: 750upx;
			overflow: hidden;
			border-bottom: 1upx solid rgba(0, 0, 0, 0.01);
			image {
				width: 100%;
				height: 100%;
			}
			.content {
				position: absolute;
				right: $spacing-base;
				bottom: $spacing-base;
			}
		}
	}
	.detail {
		padding-bottom: 60upx;
	}
	.service {
		padding: $spacing-base $spacing-lg 0;
		.row {
			font-size: $font-lg;
			margin-bottom: $spacing-sm;
		}
	}
	.selected-text {
		margin-right: 4upx;
	}
	.sub-list {
		margin: 40upx 0 80upx;
		.row {
			width: 100%;
			margin-bottom: $spacing-lg;
		}
	}
	.share-bg {
		image {
			position: fixed;
			z-index: 100;
			width: 70vw;
			height: 45vw;
			right: $spacing-base;
			top: $spacing-base;
		}
	}
	.layer {
		position: fixed;
		z-index: 99;
		bottom: 0;
		width: 100%;
		border-radius: 10upx 10upx 0 0;
		background-color: #fff;
		.rf-list {
			max-height: 60vh;
			padding-bottom: 0;
			margin-bottom: $spacing-sm;
		}
	}
	// 拼团公告
	.rf-swiper-slide {
		margin-top: 20upx;
		.label {
			margin-left: 10upx;
		}
	}
	// 玩法介绍
	.play-way {
		background-color: $color-white;
		padding: 0 20upx;
		margin: 20upx 0;
		font-size: $font-base;
		.title {
			border-bottom: 1px solid #eee;
			padding: $spacing-base 0;
			display: flex;
			justify-content: space-between;
			.iconfont {
				margin-left: 0.13rem;
				font-size: 0.28rem;
				color: #717171;
			}
		}
		.way {
			font-size: $font-base - 2upx;
			padding: 20upx 0;
			display: flex;
			.item {
				flex: 1;
				text-align: center;
				.tip {
					font-size: 0.22rem;
					color: #a5a5a5;
				}
			}
			.arrow {
				width: 40upx;
				.iconfont {
					color: $font-color-light;
					font-weight: 100;
				}
			}
		}
	}
	.assemble {
		background-color: #fff;
		.assemble-item {
			height: 120upx;
			border-bottom: 1px solid #f0f0f0;
			.pictxt {
				display: flex;
				justify-content: space-between;
				.picture {
					display: flex;
					image {
						width: 80upx;
						height: 80upx;
						margin: 20upx 0;
						border-radius: 50%;
					}
					.text {
						line-height: 120upx;
						margin-left: 20upx;
					}
				}
				.right {
					display: flex;
					align-items: center;
					.time-wrapper {
						text-align: right;
						margin-right: 20upx;
						.lack {
							font-size: $font-sm;
							.font-color-red {
								margin: 0 4upx;
							}
						}
						.time {
							font-size: $font-sm;
							color: $font-color-light;
						}
					}
					.spellBnt {
						font-size: $font-sm;
						width: 120upx;
						height: 48upx;
						display: flex;
						justify-content: center;
						align-items: center;
						border-radius: 48upx;
					}
				}
			}
		}
	}
	.c-list {
		font-size: $font-sm + 2upx;
		color: $font-color-base;
		background: #fff;
		.c-row {
			display: flex;
			align-items: center;
			padding: 20upx 30upx;
			position: relative;
		}
		.tit {
			width: 140upx;
		}
		.con {
			flex: 1;
			color: $font-color-dark;
			.selected-text {
				margin-right: 10upx;
			}
		}
		.bz-list {
			height: 40upx;
			font-size: $font-sm + 2upx;
			color: $font-color-dark;
			text {
				display: inline-block;
				margin-right: 30upx;
			}
		}
		.con-list {
			flex: 1;
			display: flex;
			flex-direction: column;
			color: $font-color-dark;
			line-height: 40upx;
			.buy-now {
				color: $uni-color-primary;
			}
		}
		.red {
			color: $uni-color-primary;
		}
	}
	.kefu-bg {
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 98;
		image {
			width: 60vw;
			height: 60vw;
			border-radius: 12upx;
			z-index: 98;
		}
	}
}
</style>
