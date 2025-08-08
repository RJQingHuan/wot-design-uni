import { ref } from 'vue'

/**
 *
 * @param activeDate 当前显示日期
 */
export function useMonthPanel(activeDate: number) {
  const nowDate = ref(new Date(activeDate))

  nowDate.value.setDate(1)
  const dateA = ref<number>(nowDate.value.getTime())

  const tmpDate = new Date(nowDate.value)
  tmpDate.setMonth(tmpDate.getMonth() + 1)
  const dateB = ref<number>(tmpDate.getTime())

  tmpDate.setMonth(tmpDate.getMonth() - 2)
  const dateC = ref<number>(tmpDate.getTime())

  function setDates(activeIndex: 0 | 1 | 2) {
    const dates = [dateA, dateB, dateC]
    nowDate.value = new Date(dates[activeIndex].value)
    nowDate.value.setDate(1)

    const tmpDate = new Date(nowDate.value)
    const nextIndex = activeIndex + 1 > 2 ? 0 : activeIndex + 1
    tmpDate.setMonth(tmpDate.getMonth() + 1)
    dates[nextIndex].value = tmpDate.getTime()

    const prevIndex = activeIndex - 1 < 0 ? 2 : activeIndex - 1
    tmpDate.setMonth(tmpDate.getMonth() - 2)
    dates[prevIndex].value = tmpDate.getTime()
  }

  function changeDateYear(current: number, type: 'prev' | 'next') {
    const dates = [dateA, dateB, dateC]
    let activeIndex: number
    if (type === 'prev') {
      activeIndex = current - 1 < 0 ? 2 : current - 1
    } else {
      activeIndex = current + 1 > 2 ? 0 : current + 1
    }

    const tmpDate = new Date(nowDate.value)
    tmpDate.setFullYear(tmpDate.getFullYear() + (type === 'prev' ? -1 : 1))
    dates[activeIndex].value = tmpDate.getTime()
  }

  return {
    dateA,
    dateB,
    dateC,
    nowDate,
    setDates,
    changeDateYear
  }
}
