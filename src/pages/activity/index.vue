<template>
	<view class="mainView">
				<scroll-view
					style="height: 100%;"
					scroll-y
					@scrolltolower="getMoreList()"
				>
						<rf-product-list :bottom="0" :showType="1" :dataType="2" :list="dataList" :isList="isList" style="padding-top: 10rpx;"></rf-product-list>

						<rf-load-more :status="loadingType" v-if="dataList.length > 0"></rf-load-more>

						<rf-empty :isRecommendShow="false" :info="errorInfo || '暫無數據'" v-if="dataList.length === 0 && !loading" ></rf-empty>

						<!--页面加载动画-->
						<rfLoading isFullScreen :active="loading"></rfLoading>
				</scroll-view>
	</view>
</template>
<script>

import rfLoadMore from '@/components/rf-load-more/rf-load-more';
import moment from '@/common/moment';
import rfProductList from '@/components/rf-product-list';
import {productList} from '@/api/product';
import {getmemberSignUpActivityList} from '@/api/activity';

export default {
	components: {
		rfLoadMore,
		rfProductList
	},
	data() {
		return {
			width: 200,
			height: 350,
			errorInfo: "",
			isList: true,
			loading: false,
			dataList: [],
			dataListZX: [],
			dataListFL: [],
			dataListHD: [],
			dataParams: {
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

	},
	onLoad(options) {
		this.initList();
	},
	onPullDownRefresh() {
		this.dataParams.pageNum = 1;
		this.dataList = [];
		this.initList("refresh");
	},
	onReachBottom() {
		if(this.loadingType = "nomore") return;
		this.dataParams.pageNum++;
		this.initList();
	},
	methods: {
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
		  if (this.loadingType === 'nomore' || this.orderList.length === 0) return;
			this.dataParams.pageNum++;
			this.initList();
		},
		initList(type) {
			this.getActivityList(type);
		},
		async getActivityList(type) {
			this.loading = true;
			await this.$http
				.get(`${getmemberSignUpActivityList}`,this.dataParams)
				.then(async r => {
					this.loading = false;
					if (type === 'refresh') {
						uni.stopPullDownRefresh();
					}
					r.data.data.forEach((item)=>{
						if((item.cover_pic == "" || item.cover_pic == null) && item.welfareDisplay && item.welfareDisplay.indexOf('src="') != -1) {
							item.cover_pic = item.welfareDisplay.split('src="')[1].split('" />')[0];
						}
					});
					this.dataList = [...this.dataList, ...r.data.data];
					this.loadingType = r.data.total === this.dataList.length ? 'nomore' : 'more';
				})
				.catch(err => {
					this.errorInfo = err;
					this.loading = false;
					if (type === 'refresh') {
						uni.stopPullDownRefresh();
					}
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
