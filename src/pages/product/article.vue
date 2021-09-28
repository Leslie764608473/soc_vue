<template>
	<view class="articleDetail">
		<rf-article-detail @product="getArticleDetail" :userInfo="userInfo" :url="currentUrl" :product="articleDetail"></rf-article-detail>
    <!--回到顶部-->
		<rf-back-top :scrollTop="scrollTop"></rf-back-top>
		<!-- 404页面 -->
		<view v-if="!articleDetail.title && !loading">
			<rf-no-data :custom="true">
				<view class="no-data-title">
					{{ errorInfo || '暫無數據' }}
				</view>
				<view
					@tap="getArticleDetail(articleDetail.id)"
					slot="refresh"
					class="spec-color"
					>重新加載</view
				>
			</rf-no-data>
		</view>
		<rfLoading isFullScreen :active="loading"></rfLoading></view>
</template>
<script>

import {articleDetail} from '@/api/activity';
import { getMessage } from '@/api/userInfo';
import rfArticleDetail from '@/components/article-detail';
import rfBackTop from '@/components/rf-back-top';
import rfNoData from '@/components/rf-no-data';
export default {
	components: {
		rfBackTop,
		rfNoData,
		rfArticleDetail
	},
	data() {
		return {
			articleDetail: {},
			loading: true,
			errorInfo: '',
			userInfo: {},
			scrollTop: 0,
			currentUrl: '',
			navDetailShow: false,
			appName: this.$mSettingConfig.appName,
			get_receive_status: 0,
			articleId: null,
			orgId: this.$mStore.getters.orgId,
			hasLogin: false,
			hasLoginOrg: false,
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
	onShareAppMessage() {
		return {
		 title: 'soc連心',
		 path: '/pages/product/article?orgId=' + this.$mStore.getters.orgId+"&id="+this.articleId,
		}
	},
	async onLoad(options) {
		let orgId = options.orgId;
		if(orgId) {
			this.$mStore.commit('setOrgId',orgId);
			this.initMessage(orgId);
		}
		this.articleId = options.id;
		this.userInfo = uni.getStorageSync('userInfo') || {};
		await this.initData();
	},
	methods: {
		// 数据初始化
		async initData() {
      //this.currentUrl = `${this.$mConfig.hostUrl}/pages/product/article?orgId=${this.orgId}&id=${this.articleId}`;
			await this.getArticleDetail();
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
		// 获取产品详情
		async getArticleDetail() {
			await this.$http
				.post(`${articleDetail}`,{},{params:{id: this.articleId}})
				.then(async r => {
					this.loading = false;
					this.articleDetail = r.data;
					this.$forceUpdate();
					uni.setNavigationBarTitle({ title: "" });
					//await this.$mHelper.handleWxH5Share(this.appName, r.data.title, this.currentUrl, r.data.coverPic);
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
