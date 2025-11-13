
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
const NAVIGATION = [
  {
    kind: 'header',
    title: '功能列',
  },
  {
    segment: 'scale',
    title: '地磅功能',
    icon: <DashboardIcon />,
    children: [
      {
        segment: 'create',
        icon: <TimelineIcon />,
        title: '新增資料'
      }
    ]
  },
  {
    segment: 'search',
    title: '搜尋',
    icon: <TimelineIcon />,
  },
  {
    segment: 'items',
    title: '設定貨物',
    icon: <TimelineIcon />,
  },
];

export default NAVIGATION