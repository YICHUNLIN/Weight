
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
        segment: 'today',
        icon: <TimelineIcon />,
        title: '本日資料',
        pattern: 'today/:date'
      },
      {
        segment: 'history',
        icon: <TimelineIcon />,
        title: '歷史資料'
      },
      {
        segment: 'deleted',
        icon: <TimelineIcon />,
        title: '被刪除的資料',
        allow: "SCALE_MAMAGE_DELETE"
      }
    ],
  },
  {
    segment: 'setting',
    title: '設定',
    icon: <TimelineIcon />,
    allow: "SCALE_SETTING_CONFIG",
    children:[
      {
        segment: 'items',
        title: '貨物種類',
        icon: <TimelineIcon />,
      },
    ]
  },
];
/**
 * 根據使用者權限遞迴過濾選單陣列
 *
 * @param {Array} menuItems - 原始的選單項目陣列
 * @param {Set<string>} userPermissions - 使用者擁有的權限 (使用 Set 效能較好)
 * @returns {Array} - 過濾後的選單項目陣列
 */
function filterMenuByPermissions(menuItems, userPermissions) {

  // 檢查 menuItems 是否為陣列，若不是或為空，直接返回空陣列
  if (!Array.isArray(menuItems) || menuItems.length === 0) {
    return [];
  }

  return menuItems.reduce((allowedItems, item) => {
    // 1. 檢查目前項目的權限
    // 允許的條件：
    //    a. 項目沒有 'allow' 屬性 (預設允許)
    //    b. 項目有 'allow' 屬性，且 userPermissions 包含該權限
    const isAllowed = !item.allow || userPermissions.includes(item.allow);

    // 2. 如果項目本身就不允許，直接跳過 (和它的所有子項目)
    if (!isAllowed) {
      return allowedItems; // 返回目前為止累積的允許項目
    }

    // 3. 如果項目被允許，我們需要處理它的子項目
    
    // 建立一個新物件，避免修改到原始陣列
    const newItem = { ...item };

    // 4. 遞迴檢查子項目
    if (newItem.children) {
      // 將過濾後的子項目陣列 C 
      newItem.children = filterMenuByPermissions(newItem.children, userPermissions);
    }

    // 5. 將允許的項目 (可能帶有過濾後的子項目) 加入到結果陣列中
    allowedItems.push(newItem);
    return allowedItems;

  }, []); // 初始值為一個空陣列
}



export default (userPMS) => filterMenuByPermissions(NAVIGATION, userPMS)
