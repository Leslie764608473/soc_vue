<template>
	<view class="mainView">
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
				<!--订单列表-->
				<swiper
					class="swiper-box"
					duration="300"
					:current="tabCurrentIndex"
					@change="changeTab"
				>
					<swiper-item
						class="tab-content"
						@touchmove.stop="touchmove" @touchstart="touchstart"
						v-for="(tabItem, tabIndex) in navList"
						:key="tabIndex"
					>
						<view style="height: 100%;overflow-y: auto;">
								<rf-product-list :bottom="0" :dataType="tabCurrentIndex" :list="dataList[tabCurrentIndex]" :isList="isList" style="padding-top: 10rpx;"></rf-product-list>

								<rf-load-more :status="loadingType" v-if="dataList[tabCurrentIndex].length > 0"></rf-load-more>

								<rf-empty :isRecommendShow="false" :info="errorInfo || '暫無數據'" v-if="dataList[tabCurrentIndex].length === 0 && !loading" ></rf-empty>

								<!--页面加载动画-->
								<rfLoading isFullScreen :active="loading"></rfLoading>
						</view>
					</swiper-item>
				</swiper>
	</view>
</template>
<script>

import rfLoadMore from '@/components/rf-load-more/rf-load-more';
import moment from '@/common/moment';
import rfProductList from '@/components/rf-product-list';
import {productList} from '@/api/product';
import {activityList,articleList} from '@/api/activity';

export default {
	components: {
		rfLoadMore,
		rfProductList
	},
	data() {
		return {
			touch:true, //是否允许滑动
			touchStart:0,//第一次滑动的位置
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
	methods: {
		touchstart(res){
			this.touchStart=res.touches[0].clientX
		},
		touchmove(res){
					if(this.tabCurrentIndex==0){
						if(res.touches[0].clientX>this.touchStart) {
							res.stopPropagation();
							res.preventDefault();
							return false;
						} else {

						}
					}else if(this.tabCurrentIndex==this.dataList[this.tabCurrentIndex].length-1){
						//res.touches[0].clientX<this.touchStart?this.touch=true:this.touch=false
					}else{
						return false;
					}
				},
		tabClick(index) {
			this.tabCurrentIndex = index;
		},
		initRresh(type) {
			if(type == "refresh") {
				uni.stopPullDownRefresh();
			}
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
					this.initRresh(type);
					this.loading = false;
					if(this.tabCurrentIndex != 1) {
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
		height: 100%;
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
