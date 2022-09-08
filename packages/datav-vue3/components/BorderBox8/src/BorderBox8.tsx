import type { ExtractPropTypes } from 'vue'
import { defineComponent, renderSlot } from 'vue'
import { borderBoxProps } from 'packages/datav-vue3/types/BorderProps'
import autoResize from 'packages/datav-vue3/utils/autoResize'
import { deepClone, deepMerge, uuid } from 'packages/datav-vue3/utils'
import './index.less'

const borderBox8Props = {
  ...borderBoxProps,
  reverse: {
    type: Boolean,
    default: false,
  },
  dur: {
    type: Number,
    default: 3,
  },
}

export type BorderBox8Props = ExtractPropTypes<typeof borderBox8Props>

export default defineComponent({
  props: borderBox8Props,
  setup(props: BorderBox8Props) {
    const id = uuid()
    const borderBox8 = ref<HTMLElement | null>(null)

    const state = reactive({
      ref: 'border-box-8',
      path: `border-box-8-path-${id}`,
      gradient: `border-box-8-gradient-${id}`,
      mask: `border-box-8-mask-${id}`,

      defaultColor: ['#235fa7', '#4fd2dd'],

      mergedColor: [],
    })

    const { width, height, initWH } = autoResize(borderBox8)

    const length = computed(() => {
      return (width.value + height.value - 5) * 2
    })

    const pathD = computed(() => {
      if (props.reverse)
        return `M 2.5, 2.5 L 2.5, ${height.value - 2.5} L ${width.value - 2.5}, ${height.value - 2.5} L ${width.value - 2.5}, 2.5 L 2.5, 2.5`

      return `M2.5, 2.5 L${width.value - 2.5}, 2.5 L${width.value - 2.5}, ${height.value - 2.5} L2.5, ${height.value - 2.5} L2.5, 2.5`
    })

    watch(() => props.color, () => {
      mergeColor()
    })

    onMounted(() => {
      mergeColor()
    })

    function mergeColor() {
      state.mergedColor = deepMerge(deepClone(state.defaultColor, true), props.color || [])
    }

    return {
      width,
      height,
      initWH,
      state,
      pathD,
      length,
      borderBox8,
    }
  },
  render() {
    const { $slots, width, height, state, pathD, length, backgroundColor, dur } = this
    return (
      <div ref="borderBox8" class="dv-border-box-8">
        <svg class="dv-border-svg-container" width={width} height={height}>
          <defs>
            <path
              id={state.path}
              d={pathD}
              fill="transparent"
            />
            <radialGradient
              id={state.gradient}
              cx="50%" cy="50%" r="50%"
            >
              <stop
                offset="0%" stop-color="#fff"
                stop-opacity="1"
              />
              <stop
                offset="100%" stop-color="#fff"
                stop-opacity="0"
              />
            </radialGradient>

            <mask id={state.mask}>
              <circle cx="0" cy="0" r="150" fill={`url(#${state.gradient})`}>
                <animateMotion
                  dur={`${dur}s`}
                  path={pathD}
                  rotate="auto"
                  repeatCount="indefinite"
                />
              </circle>
            </mask>
          </defs>

          <polygon fill={backgroundColor} points={`5, 5 ${width - 5}, 5 ${width - 5} ${height - 5} 5, ${height - 5}`} />

          <use
            stroke={state.mergedColor[0]}
            stroke-width="1"
            xlinkHref={`#${state.path}`}
          />

          <use
            stroke={state.mergedColor[1]}
            stroke-width="3"
            xlinkHref={`#${state.path}`}
            mask={`url(#${state.mask})`}
          >
            <animate
              attributeName="stroke-dasharray"
              from={`0, ${length}`}
              to={`${length}, 0`}
              dur={`${dur}s`}
              repeatCount="indefinite"
            />
          </use>
        </svg>

        <div class="border-box-content">
          {renderSlot($slots, 'default')}
        </div>
      </div>
    )
  },
})
