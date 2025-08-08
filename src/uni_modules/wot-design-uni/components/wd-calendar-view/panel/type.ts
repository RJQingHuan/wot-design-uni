import type { PropType } from 'vue'
import { makeRequiredProp } from '../../common/props'

export const panelProps = {
  weeks: Array as PropType<any[]>,
  swiperHeight: makeRequiredProp(Number as PropType<number>),
  beforeYearSwitch: Function as PropType<(swiperCurrent: number, type: 'prev' | 'next') => void>
}
