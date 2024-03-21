


import * as echarts from 'echarts/core'

import {
    CanvasRenderer
} from 'echarts/renderers';

import {
    RadarChart,
} from 'echarts/charts';

import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
} from "echarts/components";

import { LabelLayout, UniversalTransition } from "echarts/features";

echarts.use([
    RadarChart,
    CanvasRenderer,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LabelLayout, UniversalTransition
]);


export default echarts