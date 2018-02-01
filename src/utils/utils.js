import moment from 'moment';

//把后台传来的如下的数据，转换成Tree，Menu所需的树状格式。
/*
var data=[  
  {_id:1,belongTo:0,title:'A'},  //belongTo, 父节点的_id
  {_id:2,belongTo:4,title:"E[父C]"},  
  {_id:3,belongTo:7,title:"G[父F]"},  
  {_id:4,belongTo:1,title:"C[父A]"},  
  {_id:5,belongTo:6,title:"D[父B]"},  
  {_id:6,belongTo:0,title:'B'},  
  {_id:7,belongTo:4,title:"F[父C]"}  
  ];  
*/
//关键变量pos，用于保存每个已添加到tree中的节点在tree中位置信息，
//比如上面测试数据父节点A添加到tree后，那么pos中增加一条数据，pos={”1“:[0]}，
// 1就是父节点A的_id，这样写便于查找，[0]表示父节点A在tree的第一个元素，即tree[0]，
//如果某个位置信息为[1,2,3]，那么表示这个节点在tree[1].children[2].children[3]，
export function toTreeData(data){  
  var pos={};  //关键辅助变量
  var tree=[];  //构建的树
  var i=0;  
  while(data.length!=0){  
      if(data[i].belongTo == undefined || null){ //这是顶级节点 
          tree.push({  //把顶级节点放入tree中
              key:data[i]._id,  
              title:data[i].username,  
              children:[],
              //data: data[i], //原始数据保存
          });  
          pos[data[i]._id]=[tree.length-1]; //设置当前节点在tree中位置信息     
          data.splice(i,1); //从data中删除该节点
          i--;  
      }else{  // 当前节点是子节点
          var posArr=pos[data[i].belongTo];  //posArr = GET 当前节点的父节点在tree中位置信息，形如[0,3]
          if(posArr!=undefined){  //if 父节点已经在tree中，
                
              var obj=tree[posArr[0]];  //得到父节点所属的顶级节点
              for(var j=1;j<posArr.length;j++){  
                  obj=obj.children[posArr[j]];  //得到当前节点的父节点
              }  

              obj.children.push({  //把当前节点挂在tree中其父节点的children中
                  key: data[i]._id,  
                  title: data[i].username,  
                  children:[],
                  //data: data[i], //原始数据保存
              });  
              pos[data[i]._id]=posArr.concat([obj.children.length-1]); //SET 当前节点点在tree中位置信息，形如[0,3,1]
              data.splice(i,1); //从data中删除该节点
              i--;  
          }  
      }  
      i++;  
      if(i>data.length-1){  
          i=0;  
      }  
  }  
  return tree;  
}  

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - (day * oneDay);

    return [moment(beginTime), moment(beginTime + ((7 * oneDay) - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`), moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000)];
  }

  if (type === 'year') {
    const year = now.getFullYear();

    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach((node) => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(num * 10 * (10 ** index)) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
}


function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!');  // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  } else if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    let isAdd = false;
    // 是否包含
    isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(routePath =>
    routePath.indexOf(path) === 0 && routePath !== path);
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map((item) => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
      exact,
    };
  });
  return renderRoutes;
}


/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g;

export function isUrl(path) {
  return reg.test(path);
}
