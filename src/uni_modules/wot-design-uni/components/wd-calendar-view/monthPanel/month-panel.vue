<template>
  <Panel :weeks="weeks" :swiper-height="410" :beforeYearSwitch="changeDateYear" @swiperChange="swiperChange">
    <template #title>{{ title }}</template>
    <template #swiperA>
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
    </template>
    <template #swiperB>
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
    </template>
    <template #swiperC>
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
    </template>
  </Panel>
</template>

<script setup lang="ts">
import Panel from '../panel/panel.vue'
import { monthPanelProps, type MonthPanelTimeType } from './types'
import { formatMonthTitle, getWeekLabel } from '../utils'
import { computed, watch } from 'vue'
import { useMonthPanel } from './monthPanel'
import Month from '../month/month.vue'
import { ref } from 'vue'
import { debounce, isArray, isEqual, isNumber } from '../../common/util'

const props = defineProps(monthPanelProps)

const emit = defineEmits(['change', 'pickstart', 'pickend'])

// 周标题
const weeks = computed(() => {
  return Array(7)
    .fill(0)
    .map((_, index) => {
      return getWeekLabel(index + props.firstDayOfWeek)
    })
})

const activeTime = computed(() => {
  let activeTime: number | null = 0
  if (isArray(props.value)) {
    // 对数组按时间排序,取第一个值
    const sortedValue = [...props.value].sort((a, b) => (a || 0) - (b || 0))
    activeTime = sortedValue[0]
  } else if (isNumber(props.value)) {
    activeTime = props.value
  }
  if (!activeTime) {
    activeTime = Date.now()
  }
  return activeTime
})
const { dateA, dateB, dateC, setDates, nowDate, changeDateYear } = useMonthPanel(activeTime.value)

function swiperChange(current: number) {
  setDates(current as 0 | 1 | 2)
}

const innerValue = ref<string | number | (number | null)[]>('') // 内部保存一个值，用于判断新老值，避免监听器触发
const timeValue = ref<number[]>([]) // 当前选中的时分秒
const timeType = ref<MonthPanelTimeType>('') // 当前时间类型，是开始还是结束

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

// 标题
const title = computed(() => {
  return formatMonthTitle(nowDate.value.getTime())
})

const handleChange = debounce((value) => {
  emit('change', { value })
}, 50)

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
</script>

<script lang="ts">
export default {
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: 'shared'
  }
}
</script>
