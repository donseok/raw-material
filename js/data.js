// ===== Default Data Definitions =====

const STORAGE_KEYS = Object.freeze({
  plan: 'planData',
  alloc: 'allocData',
  orders: 'ordersData',
  suppliers: 'suppliersData',
  imports: 'importsData'
});

const defaultPlanData = [
  {plan:225000,dom:180000,imp:45000,actual:218400},
  {plan:220000,dom:176000,imp:44000,actual:205700},
  {plan:225000,dom:180000,imp:45000,actual:212100},
  {plan:230000,dom:184000,imp:46000,actual:null},
  {plan:225000,dom:180000,imp:45000,actual:null},
  {plan:220000,dom:176000,imp:44000,actual:null},
  {plan:225000,dom:180000,imp:45000,actual:null},
  {plan:215000,dom:172000,imp:43000,actual:null},
  {plan:225000,dom:180000,imp:45000,actual:null},
  {plan:230000,dom:184000,imp:46000,actual:null},
  {plan:225000,dom:180000,imp:45000,actual:null},
  {plan:235000,dom:188000,imp:47000,actual:null},
];

const defaultAllocData = [
  {ic:135000,ia:131200,pc:90000,pa:87200},
  {ic:132000,ia:124800,pc:88000,pa:80900},
  {ic:135000,ia:128400,pc:90000,pa:83700},
];

// ===== Active Data (mutable) =====
let planData = cloneData(defaultPlanData);
let allocData = cloneData(defaultAllocData);

// ===== Orders =====
const defaultOrders = [
  {no:'PO-2026-0341',sup:'현대스크랩',grade:'중량',qty:5000,price:395000,plant:'인천',date:'2026-03-08',status:'완료'},
  {no:'PO-2026-0342',sup:'삼영금속',grade:'생철',qty:3500,price:410000,plant:'인천',date:'2026-03-10',status:'완료'},
  {no:'PO-2026-0343',sup:'대한자원',grade:'경량',qty:4200,price:365000,plant:'포항',date:'2026-03-11',status:'완료'},
  {no:'PO-2026-0344',sup:'포스코리사이클링',grade:'길로틴',qty:6000,price:385000,plant:'인천',date:'2026-03-12',status:'진행'},
  {no:'PO-2026-0345',sup:'한국메탈',grade:'압축',qty:2800,price:350000,plant:'포항',date:'2026-03-14',status:'진행'},
  {no:'PO-2026-0346',sup:'동부스크랩',grade:'선반',qty:1500,price:420000,plant:'인천',date:'2026-03-15',status:'진행'},
  {no:'PO-2026-0347',sup:'현대스크랩',grade:'중량',qty:4500,price:393000,plant:'포항',date:'2026-03-18',status:'대기'},
  {no:'PO-2026-0348',sup:'삼영금속',grade:'생철',qty:3000,price:412000,plant:'인천',date:'2026-03-20',status:'대기'},
  {no:'PO-2026-0349',sup:'영남자원',grade:'경량',qty:3800,price:362000,plant:'포항',date:'2026-03-22',status:'대기'},
  {no:'PO-2026-0350',sup:'대한자원',grade:'길로틴',qty:5500,price:388000,plant:'인천',date:'2026-03-25',status:'대기'},
];
let orders = cloneData(defaultOrders);

// ===== Suppliers =====
const defaultSuppliers = [
  {code:'S001',name:'현대스크랩',region:'인천',rep:'박정수',tel:'032-812-5500',cap:25000,ytd:58200,grade:'A',rate:97},
  {code:'S002',name:'포스코리사이클링',region:'포항',rep:'이동환',tel:'054-220-3300',cap:20000,ytd:45600,grade:'A',rate:96},
  {code:'S003',name:'삼영금속',region:'경기 안산',rep:'김영호',tel:'031-492-7700',cap:18000,ytd:41300,grade:'A',rate:94},
  {code:'S004',name:'대한자원',region:'충남 당진',rep:'최민기',tel:'041-355-2200',cap:15000,ytd:35800,grade:'B+',rate:91},
  {code:'S005',name:'한국메탈',region:'부산',rep:'정태영',tel:'051-632-4400',cap:12000,ytd:28900,grade:'B+',rate:89},
  {code:'S006',name:'동부스크랩',region:'경기 시흥',rep:'송현우',tel:'031-318-6600',cap:10000,ytd:22100,grade:'B',rate:87},
  {code:'S007',name:'영남자원',region:'경북 경주',rep:'한승규',tel:'054-741-8800',cap:8000,ytd:18400,grade:'B',rate:85},
  {code:'S008',name:'서해금속',region:'인천',rep:'윤석진',tel:'032-765-1100',cap:7000,ytd:15200,grade:'B',rate:84},
];
let suppliers = cloneData(defaultSuppliers);

// ===== Import Contracts =====
const defaultImports = [
  {no:'IMP-2026-001',country:'일본',sup:'Toyota Tsusho',grade:'HMS1',qty:15000,cfr:368,fx:1382,ship:'2026-01-15',eta:'2026-02-02',status:'도착'},
  {no:'IMP-2026-002',country:'일본',sup:'Hanwa Co.',grade:'Shredded',qty:12000,cfr:375,fx:1385,ship:'2026-01-28',eta:'2026-02-15',status:'도착'},
  {no:'IMP-2026-003',country:'러시아',sup:'NLMK Trading',grade:'HMS2',qty:20000,cfr:358,fx:1380,ship:'2026-02-05',eta:'2026-03-01',status:'도착'},
  {no:'IMP-2026-004',country:'일본',sup:'Mitsui & Co.',grade:'HMS1',qty:18000,cfr:372,fx:1388,ship:'2026-02-20',eta:'2026-03-08',status:'운송중'},
  {no:'IMP-2026-005',country:'러시아',sup:'Metalloinvest',grade:'HMS2',qty:22000,cfr:355,fx:1383,ship:'2026-03-01',eta:'2026-03-25',status:'운송중'},
  {no:'IMP-2026-006',country:'일본',sup:'Toyota Tsusho',grade:'Shredded',qty:14000,cfr:380,fx:1390,ship:'2026-03-10',eta:'2026-03-28',status:'선적'},
  {no:'IMP-2026-007',country:'러시아',sup:'Severstal Export',grade:'HMS1',qty:16000,cfr:362,fx:1385,ship:'2026-03-20',eta:'2026-04-12',status:'계약'},
  {no:'IMP-2026-008',country:'일본',sup:'Hanwa Co.',grade:'HMS1',qty:10400,cfr:378,fx:1387,ship:'2026-04-01',eta:'2026-04-18',status:'계약'},
];
let imports = cloneData(defaultImports);

// ===== Inventory =====
const inventory = [
  {plant:'인천',grade:'생철',cur:9800,opt:10000},{plant:'인천',grade:'중량',cur:12500,opt:12000},
  {plant:'인천',grade:'경량',cur:8200,opt:9000},{plant:'인천',grade:'길로틴',cur:7800,opt:7000},
  {plant:'인천',grade:'선반',cur:4200,opt:4000},{plant:'인천',grade:'압축',cur:3300,opt:3000},
  {plant:'포항',grade:'생철',cur:7200,opt:7000},{plant:'포항',grade:'중량',cur:8800,opt:9000},
  {plant:'포항',grade:'경량',cur:5100,opt:6000},{plant:'포항',grade:'길로틴',cur:4500,opt:5000},
  {plant:'포항',grade:'선반',cur:2800,opt:3000},{plant:'포항',grade:'압축',cur:2000,opt:2000},
];

// ===== Stats =====
const statsData = [
  {m:'1월',a:38200,b:52100,c:31400,d:42800,e:8900,f:18200,total:218400,amt:852},
  {m:'2월',a:35600,b:48300,c:29800,d:40100,e:7800,f:17300,total:205700,amt:803},
  {m:'3월',a:37100,b:50800,c:30500,d:41600,e:8200,f:17800,total:212100,amt:826},
];
