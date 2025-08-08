<template>
  <view class="wd-month-panel">
    <view v-if="showPanelTitle" class="wd-month-panel__title">
      {{ title }}
    </view>
    <view class="wd-month-panel__weeks">
      <view v-for="item in 7" :key="item" class="wd-month-panel__week">{{ weekLabel(item + firstDayOfWeek) }}</view>
    </view>
    <swiper :vertical="false" :circular="true" :style="{ height: scrollHeight + 'px' }" @change="swiperChange">
      <swiper-item item-id="0">
        <month
          :type="type"
          :date="dateA"
          :value="value"
          :first-day-of-week="firstDayOfWeek"
          :formatter="formatter"
          :max-range="maxRange"
          :range-prompt="rangePrompt"
          :allow-same-day="allowSameDay"
          :default-time="defaultTime"
          :showTitle="true"
          @change="handleDateChange"
        />
      </swiper-item>
      <swiper-item item-id="1">
        <month
          :type="type"
          :date="dateB"
          :value="value"
          :first-day-of-week="firstDayOfWeek"
          :formatter="formatter"
          :max-range="maxRange"
          :range-prompt="rangePrompt"
          :allow-same-day="allowSameDay"
          :default-time="defaultTime"
          :showTitle="true"
          @change="handleDateChange"
        />
      </swiper-item>
      <swiper-item item-id="2">
        <month
          :type="type"
          :date="dateC"
          :value="value"
          :first-day-of-week="firstDayOfWeek"
          :formatter="formatter"
          :max-range="maxRange"
          :range-prompt="rangePrompt"
          :allow-same-day="allowSameDay"
          :default-time="defaultTime"
          :showTitle="true"
          @change="handleDateChange"
        />
      </swiper-item>
    </swiper>
    <view v-if="timeType" class="wd-month-panel__time">
      <view v-if="type === 'datetimerange'" class="wd-month-panel__time-label">
        <view class="wd-month-panel__time-text">{{ timeType === 'start' ? translate('startTime') : translate('endTime') }}</view>
      </view>
      <view class="wd-month-panel__time-picker">
        <wd-picker-view
          v-if="timeData.length"
          v-model="timeValue"
          :columns="timeData"
          :columns-height="125"
          :immediate-change="immediateChange"
          @change="handleTimeChange"
          @pickstart="handlePickStart"
          @pickend="handlePickEnd"
        />
      </view>
    </view>
  </view>
</template>

<script lang="ts">
export default {
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: 'shared'
  }
}
</script>

<script lang="ts" setup>
import wdPickerView from '../../wd-picker-view/wd-picker-view.vue'
import { computed, ref, watch, onMounted } from 'vue'
import { debounce, isArray, isEqual, isNumber, pause } from '../../common/util'
import { compareMonth, formatMonthTitle, getMonthEndDay, getMonths, getTimeData, getWeekLabel } from '../utils'
import Month from '../month/month.vue'
import { monthPanelProps, type MonthInfo, type MonthPanelTimeType, type MonthPanelExpose } from './types'
import { useTranslate } from '../../composables/useTranslate'
import type { CalendarItem } from '../types'
import { useMonthPanel } from './monthPanel'

const props = defineProps(monthPanelProps)
const emit = defineEmits(['change', 'pickstart', 'pickend'])

const { translate } = useTranslate('calendar-view')

const scrollTop = ref<number>(0) // 滚动位置
const scrollIndex = ref<number>(0) // 当前显示的月份索引
const timeValue = ref<number[]>([]) // 当前选中的时分秒

const timeType = ref<MonthPanelTimeType>('') // 当前时间类型，是开始还是结束
const innerValue = ref<string | number | (number | null)[]>('') // 内部保存一个值，用于判断新老值，避免监听器触发

const handleChange = debounce((value) => {
  emit('change', {
    value
  })
}, 50)

// 时间picker的列数据
const timeData = computed<Array<CalendarItem[]>>(() => {
  let timeColumns: Array<CalendarItem[]> = []
  if (props.type === 'datetime' && isNumber(props.value)) {
    const date = new Date(props.value)
    date.setHours(timeValue.value[0])
    date.setMinutes(timeValue.value[1])
    date.setSeconds(props.hideSecond ? 0 : timeValue.value[2])
    const dateTime = date.getTime()
  } else if (isArray(props.value) && props.type === 'datetimerange') {
    const [start, end] = props.value!
    const dataValue = timeType.value === 'start' ? start : end
    const date = new Date(dataValue || '')
    date.setHours(timeValue.value[0])
    date.setMinutes(timeValue.value[1])
    date.setSeconds(props.hideSecond ? 0 : timeValue.value[2])
    const dateTime = date.getTime()
    const finalValue = [start, end]
    if (timeType.value === 'start') {
      finalValue[0] = dateTime
    } else {
      finalValue[1] = dateTime
    }
  }
  return timeColumns
})

// 标题
const title = computed(() => {
  return formatMonthTitle(dateA.value)
})

// 周标题
const weekLabel = computed(() => {
  return (index: number) => {
    return getWeekLabel(index - 1)
  }
})

// 滚动区域的高度
const scrollHeight = computed(() => {
  const scrollHeight: number = timeType.value ? props.panelHeight - 125 : props.panelHeight
  return scrollHeight
})

const { dateA, dateB, dateC, setDates } = useMonthPanel(new Date(2025, 0, 20).getTime())

function swiperChange(event: { detail: { current: number } }) {
  setDates(event.detail.current as 0 | 1 | 2)
}

watch(
  () => props.type,
  (val) => {
    if (
      (val === 'datetime' && props.value) ||
      (val === 'datetimerange' && isArray(props.value) && props.value && props.value.length > 0 && props.value[0])
    ) {
      setTime(props.value, 'start')
    }
  },
  {
    deep: true,
    immediate: true
  }
)

watch(
  () => props.value,
  (val) => {
    if (isEqual(val, innerValue.value)) return

    if ((props.type === 'datetime' && val) || (props.type === 'datetimerange' && val && isArray(val) && val.length > 0 && val[0])) {
      setTime(val, 'start')
    }
  },
  {
    deep: true,
    immediate: true
  }
)

/**
 * 获取 date 的时分秒
 * @param {timestamp} date 时间
 * @param {string} type 类型，是开始还是结束
 */
function getTimeValue(date: number | (number | null)[], type: MonthPanelTimeType) {
  let dateValue: Date = new Date()
  if (props.type === 'datetime') {
    dateValue = new Date(date as number)
  } else if (isArray(date)) {
    if (type === 'start') {
      dateValue = new Date(date[0] || '')
    } else {
      dateValue = new Date(date[1] || '')
    }
  }

  const hour = dateValue.getHours()
  const minute = dateValue.getMinutes()
  const second = dateValue.getSeconds()
  return props.hideSecond ? [hour, minute] : [hour, minute, second]
}

function setTime(value: number | (number | null)[], type?: MonthPanelTimeType) {
  if (isArray(value) && value[0] && value[1] && type === 'start' && timeType.value === 'start') {
    type = 'end'
  }
  timeType.value = type || ''
  timeValue.value = getTimeValue(value, type || '')
}
function handleDateChange({ value, type }: { value: number | (number | null)[]; type?: MonthPanelTimeType }) {
  if (!isEqual(value, props.value)) {
    // 内部保存一个值，用于判断新老值，避免监听器触发
    innerValue.value = value
    handleChange(value)
  }
  // datetime 和 datetimerange 类型，需要计算 timeData 并做展示
  if (props.type.indexOf('time') > -1) {
    setTime(value, type)
  }
}
function handleTimeChange({ value }: { value: any[] }) {
  if (!props.value) {
    return
  }
  if (props.type === 'datetime' && isNumber(props.value)) {
    const date = new Date(props.value)
    date.setHours(value[0])
    date.setMinutes(value[1])
    date.setSeconds(props.hideSecond ? 0 : value[2])
    const dateTime = date.getTime()
    handleChange(dateTime)
  } else if (isArray(props.value) && props.type === 'datetimerange') {
    const [start, end] = props.value!
    const dataValue = timeType.value === 'start' ? start : end
    const date = new Date(dataValue || '')
    date.setHours(value[0])
    date.setMinutes(value[1])
    date.setSeconds(props.hideSecond ? 0 : value[2])
    const dateTime = date.getTime()

    if (dateTime === dataValue) return

    const finalValue = [start, end]
    if (timeType.value === 'start') {
      finalValue[0] = dateTime
    } else {
      finalValue[1] = dateTime
    }
    innerValue.value = finalValue // 内部保存一个值，用于判断新老值，避免监听器触发
    handleChange(finalValue)
  }
}
function handlePickStart() {
  emit('pickstart')
}
function handlePickEnd() {
  emit('pickend')
}
</script>

<style lang="scss" scoped>
@import './index.scss';
</style>
