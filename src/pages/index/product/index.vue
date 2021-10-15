<template>
	<view class="mainView" @touchstart="refreshStart" @touchmove="refreshMove" @touchend="refreshEnd">
		<!--导航栏-->
		<view class="navbar">
			<view
				v-for="(item, index) in navList"
				:key="index"
				class="nav-item"
				:class="tabCurrentIndex == item.state ? 'attrActive current' : ''"
				@tap="tabClick(item.state)"
			>
				{{ item.text }}
			</view>
		</view>
		<refresh ref="refresh" @isRefresh='isRefresh'></refresh>
				<!--订单列表-->
				<swiper
					class="swiper-box"
					duration="300"
					:style="{top: rTop+'px'}"
					style="position: relative;"
					:current="tabCurrentIndex"
					@change="changeTab"
				>
					<swiper-item
						class="tab-content"
						v-for="(tabItem, tabIndex) in navList"
						:key="tabIndex"
					>
						<scroll-view style="height: 100%;" scroll-y="true" @scrolltolower="getMoreList" scroll-with-animation :scroll-into-view="toView">
								<rf-product-list :bottom="0" :dataType="tabCurrentIndex" :list="dataList[tabCurrentIndex]" :isList="isList" style="padding-top: 10rpx;"></rf-product-list>
								<rf-load-more :status="loadingType" v-if="dataList[tabCurrentIndex].length > 0"></rf-load-more>
								<rf-empty :isRecommendShow="false" :info="errorInfo || '暫無數據'" v-if="dataList[tabCurrentIndex].length === 0 && !loading" ></rf-empty>
						</scroll-view>
					</swiper-item>
				</swiper>
	</view>
</template>
<script>
import refresh from '@/components/xlsx/refresh.vue';

import rfLoadMore from '@/components/rf-load-more/rf-load-more';
import moment from '@/common/moment';
import rfProductList from '@/components/rf-product-list';
import {productList} from '@/api/product';
import {activityList,articleList} from '@/api/activity';

export default {
	components: {
		rfLoadMore,
		rfProductList,
		refresh
	},
	data() {
		return {
			startTop: 0,
			rTop:0,
			toView:'',//回到顶部id
			width: 200,
			height: 350,
			errorInfo: "",
			isList: true,
			loading: false,
			dataList: [[],[],[]],
			dataListZX: [],
			dataListFL: [],
			dataListHD: [],
			dataParams: {
				orgId : this.$mStore.getters.orgId,
				pageNum: 1,
				pageSize: 10
			},
			tabCurrentIndex: 0,
			loadingType: 'more',
			navList: [
				{
					state: 0,
					text: "資訊"
				},
				{
					state: 1,
					text: "福利"
				},
				{
					state: 2,
					text: "活動"
				},
			]
		};
	},
	filters: {
		time(val) {
			return moment(val * 1000).format('YYYY-MM-DD HH:mm:ss');
		},
	},
	onShow() {
		this.initData();
	},
	onLoad(options) {
		this.tabCurrentIndex = 0;
	},
	created() {
		setTimeout(()=>{
			this.dataParams.orgId = this.$mStore.getters.orgId;
		},500);
	},
	methods: {
		toTop(){
			this.toView = ''
			setTimeout(()=>{
				this.toView = 'top' + this.tabCurrentIndex
			},10)
		},
		// 刷新touch监听
		refreshStart(e) {
			this.startTop = e.touches[0].clientY - e.currentTarget.offsetTop;
			this.$refs.refresh.refreshStart(e);
		},
		refreshMove(e){
			let moveTop = e.touches[0].clientY - e.currentTarget.offsetTop;
			if(this.startTop < moveTop) {
				this.rTop += 0.77;
			} else {
				this.rTop -= 0.77;
			}
			if(this.rTop>=50) {
				this.rTop = 50;
			}
			if(this.rTop<=0) {
				this.rTop = 0;
			}
			this.$refs.refresh.refreshMove(e);
		},
		refreshEnd(e) {
			this.rTop = null;
			this.$refs.refresh.refreshEnd(e);
		},
		isRefresh(){
			this.dataParams.pageNum = 1;
			this.dataList[this.tabCurrentIndex] = [];
			this.initList("refresh");
		},
		tabClick(index) {
			this.tabCurrentIndex = index;
		},
		initRresh(type) {
			if(type == "refresh") {
				uni.stopPullDownRefresh();
			}
			this.$refs.refresh.endAfter();
		},
		noDataInit() {
			if(this.dataList[this.tabCurrentIndex].length == 0) {
				this.dataParams.pageNum = 1;
				this.initList("refresh");
			}
		},
		changeTab(obj) {
			this.tabCurrentIndex = obj.target.current;
			this.noDataInit();
		},
		getMoreList() {
		  if (this.loadingType === 'nomore' || this.dataList[this.tabCurrentIndex] === 0) return;
			this.dataParams.pageNum++;
			this.initList();
		},
		initList(type) {
			if(type == "refresh") {
				this.loading = true;
			}
			if(this.tabCurrentIndex == 0) {
				// 新聞
				this.getArticleList(type);
			} else if (this.tabCurrentIndex == 1) {
				// 福利
				this.getProductList(type);
			} else if (this.tabCurrentIndex == 2) {
				// 活動
				this.getActivityList(type);
			}
		},
		async getProductList(type) {
			await this.$http
				.post(`${productList}`,{},{params: this.dataParams})
				.then(async r => {
					if(!r.data.list) {
						r.data.list = [];
					}
					this.initRresh(type);
					this.loading = false;
					if(this.tabCurrentIndex != 1) {
						return false;
					}

					try{
						r.data.list.forEach((item,i)=>{
							let startTime = new Date(item.promotionStartTime).getTime();
							let endTime = new Date(item.promotionEndTime).getTime();
							let nowTime = new Date().getTime();
							if(startTime > nowTime) {
								item.fl_timeFilter = 0;// 未開始
							} else if(endTime < nowTime) {
								item.fl_timeFilter = 1;// 已結束
							} else {
								item.fl_timeFilter = 2;
							}
						});
					}catch(e){
						//TODO handle the exception
					}

					this.dataList[this.tabCurrentIndex] = [...this.dataList[this.tabCurrentIndex], ...r.data.list];
					this.loadingType = r.data.total === this.dataList[this.tabCurrentIndex].length ? 'nomore' : 'more';
					this.$forceUpdate();
				})
				.catch(err => {
					this.errorInfo = err;
					this.loading = false;
					this.initRresh();
				});
		},
		async getActivityList(type) {
			await this.$http
				.get(`${activityList}`,this.dataParams)
				.then(async r => {
					this.loading = false;
					this.initRresh(type);
					if(this.tabCurrentIndex != 2) {
						return false;
					}
					try{
						r.data.data.forEach((item,i)=>{
							let startTime = new Date(item.activity_start_time).getTime();
							let nowTime = new Date().getTime();
							if(startTime>nowTime) {
								item.activity_timeFilter = true;
							} else {
								item.activity_timeFilter = false;
							}
							if((item.cover_pic == "" || item.cover_pic == null) && item.welfareDisplay && item.welfareDisplay.indexOf('src="') != -1) {
								item.cover_pic = item.welfareDisplay.split('src="')[1].split('" />')[0];
							}
						});
					}catch(e){
						//TODO handle the exception
					}

					this.dataList[this.tabCurrentIndex] = [...this.dataList[this.tabCurrentIndex], ...r.data.data];
					this.loadingType = r.data.total === this.dataList[this.tabCurrentIndex].length ? 'nomore' : 'more';
					this.$forceUpdate();
				})
				.catch(err => {
					this.errorInfo = err;
					this.loading = false;
					this.initRresh();
				});
		},
		async getArticleList(type) {
			await this.$http
				.post(`${articleList}`,{},{params: this.dataParams})
				.then(async r => {
					this.loading = false;
					this.initRresh(type);
					if(this.tabCurrentIndex != 0) {
						return false;
					}
					this.dataList[this.tabCurrentIndex] = [...this.dataList[this.tabCurrentIndex], ...r.data.list];
					this.loadingType = r.data.total === this.dataList[this.tabCurrentIndex].length ? 'nomore' : 'more';
					this.$forceUpdate();
				})
				.catch(err => {
					this.errorInfo = err;
					this.loading = false;
					this.initRresh();
				});
		}
	}
};
</script>
<style lang="scss">
	.mainView{
		width: 100%;
		height: 100%;
		overflow: hidden;
		position: relative;
	}
	.swiper-box {
		height: calc(100% - 40px);
	}
	.tab-content{
		padding: 20rpx;
	}
	.list-scroll-content {
		height: 100%;
	}
	.uni-swiper-item {
		height: auto;
	}
	.navbar{
		box-shadow: none;
		z-index: 1000;
		.nav-item {
			font-size: 32rpx;
		}
		.attrActive{
			font-weight: bolder;
		}
		.attrActive::after{
			background-color: #0f7df7 !important;
			width: 40rpx !important;
			border-bottom: 0 !important;
			height: 7rpx !important;
			border-radius: 35rpx;
		}
	}
</style>
