<template>
  <!--加载动画-->
  <view class="cu-load load-modal">
    <image src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGZpbGw9IiMwRTdERjciIGN4PSI2IiBjeT0iNTAiIHI9IjYiPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgZHVyPSIxcyIgdHlwZT0idHJhbnNsYXRlIiB2YWx1ZXM9IjAgMTUgOyAwIC0xNTsgMCAxNSIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGJlZ2luPSIuMSIvPjwvY2lyY2xlPjxjaXJjbGUgZmlsbD0iIzBFN0RGNyIgY3g9IjMwIiBjeT0iNTAiIHI9IjYiPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgZHVyPSIxcyIgdHlwZT0idHJhbnNsYXRlIiB2YWx1ZXM9IjAgMTAgOyAwIC0xMDsgMCAxMCIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGJlZ2luPSIuMiIvPjwvY2lyY2xlPjxjaXJjbGUgZmlsbD0iIzBFN0RGNyIgY3g9IjU0IiBjeT0iNTAiIHI9IjYiPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgZHVyPSIxcyIgdHlwZT0idHJhbnNsYXRlIiB2YWx1ZXM9IjAgNSA7IDAgLTU7IDAgNSIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGJlZ2luPSIuMyIvPjwvY2lyY2xlPjwvc3ZnPg==" mode="aspectFit"></image>
    <view class="gray-text">{{ content }}</view>
  </view>
</template>

<script>
  /**
   * @des 页面加载
   *
   * @author stav stavyan@qq.com
   * @date 2020-03-23 11:43
   * @copyright 2019
   */
  import $mAssetsPath from '@/config/assets.config.js'
	export default {
		name: 'rf-loading',
    props: {
      src: {
      	type: String,
        default: $mAssetsPath.logo
      },
      content: {
      	type: String,
        default: '加载中...'
      }
    }
	}
</script>

<style scoped>

</style>
