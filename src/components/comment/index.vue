<template>
	<view>
		<view class="newComment">
			最新評論{{productId}}
		</view>
		<view class="uni-article__comment">
			<view class="uni-article__comment-box" v-for="(comment,index) in commentData" :key="comment.id" v-show="index < pageNum*3">
				<view class="article-meta">
					<view class="article-header-image">
						<image v-if="comment.author.icon" class="image" :src="comment.author.icon" mode="widthFix"></image>
						<image v-else class="image" src="../../static/missing-face.png" mode="widthFix"></image>
					</view>
					<view class="article-header-content">
						<view class="article-header-title">
							<text>{{comment.author.nickname}}</text>
							<!-- 點讚 -->
							<!-- <text>
								<text>111</text>
								<text class="iconfont icon-zhihuishetuanico_dianzan-19"></text>
							</text> -->
						</view>

						<view class="" >
							<text style="color: #333;">{{comment.content}}</text>
						</view>
						<view class="article-header-info">
							<text>{{comment.pubDate||''}}</text>
							<text @tap.stop="replyComment(comment.id)" class="reply">回復</text>
						</view>
					</view>
				</view>
				<view class="uni-article__comment-centent">
					<user-reply v-if="comment.record.length > 0" :digest="comment.record"></user-reply>
					<!-- {{comment.content}} -->
				</view>
			</view>
			<ygc-comment ref="ygcComment"
			        :placeholder="'发布评论'"
			        @pubComment="pubComment"></ygc-comment>
			<!-- 查看更多 -->
			<!-- <button @tap="toggleMask(type)">发布评论</button> -->
			<!-- 發佈評論 -->
			<view class="publishComment savepadding">
				<view class="content">
					<view class="touxiang">
						<image v-if="userInfo.icon" class="image" :src="userInfo.icon" mode="widthFix"></image>
						<image v-else class="image" src="../../static/missing-face.png" mode="widthFix"></image>
					</view>
					<view class="inputView" @tap.stop="toggleMask">
						inputView
					</view>
					<view class="goodNum">
						<text class="iconfont icon-zhihuishetuanico_dianzan-19"></text>
						<text>1111</text>
					</view>
					<view class="share">
						<text class="iconfont icon-zhihuishetuanico_dianzan-19"></text>
						<text>share</text>
					</view>
				</view>
			</view>
			<view class="checkMore" @tap.stop="loadMore" v-if="commentData.length > pageNum*3">
				<!-- 查看全部評論 -->
				展開更多評論
			</view>
		</view>
	</view>
</template>
<script>
	import userReply from '@/components/reply/reply.vue'
	import ygcComment from '@/components/ygc-comment/ygc-comment.vue';
	// import commentData from './comment.js'
	console.log(2222222)
	export default {
		components: {
			userReply,
			ygcComment
		},
		data() {
			return {
				pageNum:1,
				commentData:[],
				refCircleId:'',
				userInfo:{}
			}
		},
		props:{
			commentDataNew: {
			  type: Array,
			  default: []
			},
			productId:{
				type: String,
				default: ''
			}
		},

		mounted(event) {
			// debugger
			this.userInfo = uni.getStorageSync('user');
			console.log(this.commentDataNew)
			// this.getComment();
			var $this = this;
			setTimeout(function() {
				$this.getComment();
			}, 1000);
		},
		methods: {
			replyComment(id){
				this.refCircleId = id;
				this.toggleMask();
			},
			pubComment(e){
				var $this = this;
				var ref_member_id = uni.getStorageSync('user').id;

				debugger
				if(this.refCircleId){
					var data = {
						type:1,
						ref_member_id,
						ref_interact_id:this.refCircleId,
						detail:e
					}
				}else{
					var data = {
						type:1,
						ref_member_id,
						ref_circle_id:this.productId,
						detail:e
					}
				}

				this.$http
					.post(`${$this.refCircleId?'/member/circle/publishSocCommentRecord':'/member/circle/publishSocComment'}`,{},{params:{data:JSON.stringify(data)}})
			},
			toggleMask(){
				this.$refs.ygcComment.toggleMask('show')
			},
			loadMore(){
				this.pageNum = this.pageNum + 1;
			},
			getComment() {
				// this.commentData = commentData.items;
				// debugger
				var $this = this;
				this.$http
					.post('/member/circle/getSocLikeAndCommentCount',{},{params:{type:1,id:$this.productId}})
					.then(res => {
						debugger
						$this.commentData = res.data;
					})
			}
		}
	}
</script>

<style scoped>
	.publishComment{
		width:calc(100% - 60rpx);
		padding:0 30rpx;
		height:100rpx;
		background:rgb(255,255,255);
		position: fixed;
		bottom: 0;
		left: 0;
		display: flex;
		align-items: center;
		border-top:1rpx solid rgb(236,236,236)
	}
	.savepadding{
	    padding-bottom: constant(safe-area-inset-bottom);
	    padding-bottom: env(safe-area-inset-bottom);
	    box-sizing: content-box;
	}
	.publishComment .content{
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.publishComment .content .touxiang{
		line-height:1
	}
	.publishComment .content .touxiang .image{
		width:60rpx;
		border-radius: 10rpx;
	}
	.publishComment .content .inputView{
		width:270rpx;
		height:60rpx;
		background:rgb(240,242,242);
		margin-left: 30rpx;
		border-radius: 10rpx;
		line-height: 60rpx;
    padding-left: 20rpx;
		color:rgb(179,179,179)
	}
	.publishComment .content .goodNum{
		margin-left: 50rpx;
	}
	.publishComment .content .share{
		margin-left: 50rpx;
	}
	.checkMore{
		text-align: center;
		color: rgb(15,125,247);
		font-size: 30rpx;
		padding: 30rpx 0;
	}
	.newComment{
		font-size: 32rpx;
		font-weight: 600;
		padding-left: 30rpx;
	}
	.article-meta {
		padding: 20rpx 30rpx;
		display: flex;
		/* align-items: center; */
		flex-direction: row;
		justify-content: flex-start;
		color: #999;
	}

	.article-header-image {
		width: 60rpx;
		height: 60rpx;
		flex-shrink: 0;
		margin-top: 10rpx;
		border-radius: 10rpx;
		overflow: hidden;
	}

	.article-header-image .image {
		width: 100%;
		height: 100%;
	}

	.article-header-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-left: 10px;
		font-size: 24rpx;
		line-height: 1;
		width: 100%;
		/* height: 60rpx; */
	}

	.article-header-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 26rpx;
		line-height: 2;
		color: #999;
	}

	.article-header-info {
		font-size: 24rpx;
		line-height: 2;
	}
	.article-header-info .reply{
		padding-left: 40rpx;
		color: rgb(15,125,247);
	}

	.article-top {
		display: flex;
		align-items: flex-end;
		font-size: 26rpx;
		line-height: 1;
		color: #999;
	}

	.article-top .image {
		width: 30rpx;
		margin-left: 5rpx;
	}

	.uni-article__comment-title {
		width: 100%;
		line-height: 3;
		font-size: 28rpx;
		color: #666;
		background: #f5f5f5;
		padding-left: 20rpx;
	}

	.uni-article__comment-centent {
		border-bottom: 1px #eee solid;
		padding: 0 30rpx;
		padding-left: 95rpx;
		padding-bottom: 20rpx;
		font-size: 14px;
		color: #333;
	}
</style>
