<template>
  <view class="wd-month-panel">
    <view class="wd-month-panel__header">
      <wd-icon
        custom-class="wd-month-panel__header-button wd-month-panel__header-button-year"
        name="a-chevron-leftdouble"
        size="22px"
        @click="prevYear"
      />
      <wd-icon custom-class="wd-month-panel__header-button wd-month-panel__header-button-month" name="chevron-left" size="22px" @click="prev" />
      <view class="wd-month-panel__header-title">
        <slot name="title"></slot>
      </view>
      <wd-icon custom-class="wd-month-panel__header-button wd-month-panel__header-button-month" name="chevron-right" size="22px" @click="next" />
      <wd-icon
        custom-class="wd-month-panel__header-button wd-month-panel__header-button-year"
        name="a-chevron-rightdouble"
        size="22px"
        @click="nextYear"
      />
    </view>
    <view class="wd-month-panel__weeks">
      <view v-for="item in weeks" :key="item" class="wd-month-panel__week">{{ item }}</view>
    </view>
    <swiper
      :vertical="false"
      :circular="true"
      :style="{ height: swiperHeight + 'px' }"
      :current="swiperCurrent"
      class="wd-month-panel__swiper"
      @change="swiperChange"
    >
      <swiper-item item-id="A">
        <slot name="swiperA" />
      </swiper-item>
      <swiper-item item-id="B">
        <slot name="swiperB" />
      </swiper-item>
      <swiper-item item-id="C">
        <slot name="swiperC" />
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import wdIcon from '../../wd-icon/wd-icon.vue'
import { panelProps } from './type'

const props = defineProps(panelProps)

const emits = defineEmits<{
  (e: 'swiperChange', current: number): void
}>()

function swiperChange(event: { detail: { current: number } }) {
  emits('swiperChange', event.detail.current)
}

const swiperCurrent = ref(0)
function prev() {
  if (swiperCurrent.value === 0) {
    swiperCurrent.value = 2
  } else {
    swiperCurrent.value--
  }
}

function next() {
  if (swiperCurrent.value === 2) {
    swiperCurrent.value = 0
  } else {
    swiperCurrent.value++
  }
}

function prevYear() {
  props.beforeYearSwitch && props.beforeYearSwitch(swiperCurrent.value, 'prev')
  prev()
}

function nextYear() {
  props.beforeYearSwitch && props.beforeYearSwitch(swiperCurrent.value, 'next')
  next()
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>

<script lang="ts">
export default {
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: 'shared'
  }
}
</script>
