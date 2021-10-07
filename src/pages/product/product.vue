<template>
	<view class="product">
		<rf-product-detail @product="getProductDetail" :get_receive_status="get_receive_status" :otherOrg="otherOrg" :userInfo="userInfo" :url="currentUrl" :product="productDetail"></rf-product-detail>
    <!--回到顶部-->
		<rf-back-top :scrollTop="scrollTop"></rf-back-top>
		<!-- 404页面 -->
		<view v-if="!productDetail.name && !loading">
			<rf-no-data :custom="true">
				<view class="no-data-title">
					{{ errorInfo || '暫無數據' }}
				</view>
				<view
					@tap="getProductDetail(productDetail.id)"
					slot="refresh"
					class="spec-color"
					>重新加載</view
				>
			</rf-no-data>
		</view>
		<!--顶部下拉菜单-->
		<rf-nav-detail
			@hide="hideNavDetail"
			:popupShow="navDetailShow"
		>
		</rf-nav-detail>
		<!--页面加载动画-->
		<rfLoading isFullScreen :active="loading"></rfLoading></view>
</template>
<script>
/**
 * @des 商品详情
 *
 * @author stav stavyan@qq.com
 * @date 2020-03-23 15:04
 * @copyright 2019
 */
import { productDetail } from '@/api/product';
import { getMessage } from '@/api/userInfo';
import rfProductDetail from '@/components/rf-product-detail';
import rfBackTop from '@/components/rf-back-top';
import rfNoData from '@/components/rf-no-data';
export default {
	components: {
		rfProductDetail,
		rfBackTop,
		rfNoData
	},
	data() {
		return {
			productDetail: {},
			loading: true,
			errorInfo: '',
			userInfo: {},
			scrollTop: 0,
			currentUrl: '',
			navDetailShow: false,
			appName: this.$mSettingConfig.appName,
			get_receive_status: 0,
			orgId: this.$mStore.getters.orgId,
			otherOrg: false,
		};
	},
	// #ifndef MP
	onNavigationBarButtonTap(e) {
		const index = e.index;
		if (index === 0) {
			this.navDetailShow = true;
		}
	},
	// #endif
	onPageScroll(e) {
		this.scrollTop = e.scrollTop;
	},
	onBackPress(e) {
		console.log(e);
	},
	onShareAppMessage() {
		return {
		 title: 'soc連心',
		 path: '/pages/product/product?orgId=' + this.$mStore.getters.orgId+"&id="+this.productId,
		}
	},
	onLoad(options) {
		let orgId = options.orgId;
		if(orgId && orgId != this.$mStore.getters.orgId) {
			this.$mStore.commit('setOrgId',orgId);
			this.initMessage(orgId);
			this.otherOrg = true;
		}

		this.productId = options.id;
		this.userInfo = uni.getStorageSync('userInfo') || {};
		this.initData();
	},
	methods: {
		// 隐藏顶部导航
		hideNavDetail() {
			this.navDetailShow = false;
		},
		initMessage(orgId) {
			this.$http.post(`${getMessage}`,{},{params: {orgId : orgId}})
			.then( r => {
				this.$mStore.commit('setMessageData',r.data.data[0]);
				this.messageData = r.data.data[0];
				this.$forceUpdate();
			})
			.catch(err => {

			});
		},
		// 数据初始化
		async initData() {
      /* if (this.userInfo.promo_code) {
        this.currentUrl = `${this.$mConfig.hostUrl}/pages/product/product?orgId=${this.orgId}&id=${this.productId}&promo_code=${this.userInfo.promo_code}`;
      } else {
        this.currentUrl = `${this.$mConfig.hostUrl}/pages/product/product?orgId=${this.orgId}&id=${this.productId}`;
      } */
			this.hasLogin = this.$mStore.getters.hasLogin;
			await this.getProductDetail();
		},
		// 获取产品详情
		async getProductDetail() {
			await this.$http
				.post(`${productDetail}`,{},{params:{Id: this.productId}})
				.then(async r => {
					this.loading = false;
					this.productDetail = r.data.list;
					this.get_receive_status = r.data.get_receive_status;
					this.productDetail.get_status = r.data.get_status;
					this.productDetail.covers = [];
					this.productDetail.covers.push(r.data.list.pic);
					let pic_str = r.data.list.albumPics==undefined?"":r.data.list.albumPics;
					if(pic_str == "") {

					} else if(pic_str.indexOf(",") == -1) {
						this.productDetail.covers.push(pic_str)
					} else {
						pic_str.split(",").forEach(function (item) {
							this.productDetail.covers.push($.trim(item))
						});
					}
					this.$forceUpdate();
					//this.productDetail.covers = [this.productDetail.pic,this.productDetail.pic,this.productDetail.pic]
					uni.setNavigationBarTitle({ title: "" });
					//await this.$mHelper.handleWxH5Share(this.appName, r.data.name, this.currentUrl, r.data.list.pic);
				})
				.catch(err => {
					this.loading = false;
					this.errorInfo = err;
				});
		}
	}
};
</script>
<style scoped lang="scss">
page {
	background: $page-color-base;
}
</style>
