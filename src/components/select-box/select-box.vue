<template>
  <div>
    <div class="check">
      <div>
        <span v-model="text" class="spanstyle">{{text}}</span>
        <img
          @click="showbox"
          class="imgstyle"
          :style="{ width: size + 'px', height: size + 'px' }"
					v-if="fold"
					src="../../arrow/top.png"
        />
				<img
				  @click="showbox"
				  class="imgstyle"
				  :style="{ width: size + 'px', height: size + 'px' }"
				  v-if="!fold"
				  src="../../arrow/bottom.png"
				/>
      </div>
      <div v-show="fold" class="dropbox">
        <span
          @click="check(item)"
          v-for="(item, index) in select"
          :key="index"
          class="select"
          >{{ item }}</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props:['select'],
  data() {
    return {
      text:"+852",
      fold: false,
      border: true,
      size: 18,
    };
  },
  methods: {
    showbox() {
      this.fold = !this.fold;
    },
    check(item) {
        this.text=item
        this.fold = !this.fold;
        this.$emit('selectbox',item)
    },
  },
};
</script>
<style scoped>
.check {
  width: 130rpx;
  height: 60rpx;
  font-size: 12px;
  padding: 2px 5px 6px 0;
  text-align: center;
  border: 1px solid #d9d9d9;
  border-radius: 5px;
}
.imgstyle {
  position: relative;
  top: 5px;
	right: -8rpx;
}
.dropbox {
	width: 130rpx;
  position: relative;
  top: 6px;
  height: 110rpx;
  border: 1px solid #d9d9d9;
  box-shadow:0 4px 3px rgb(0 0 0 / 3%);
  border-radius: 0 0 5px 5px;
  overflow-y: scroll;
	z-index: 10;
	background-color: white;
	text-align: left;
	text-indent: 15rpx;
}
.select {
  display: block;
  width: 100%;
  height: 50rpx;
  line-height: 50rpx;
}
.select:first-child{
		border-bottom: 1px solid #d9d9d9;
	}
.spanstyle{
    display: inline-block;
		font-size: 30rpx;
		padding-left: 10rpx;
}
</style>
