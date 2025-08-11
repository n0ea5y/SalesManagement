export const SHEET_NAME = ['売上合計', '原価', '外板集計', '人件費'];
export const MEDIA_FIELDS = ['組数', '人数', '合計金額'];


export const MEDIA_LIST = [
  {title: 'hotpepper', kye: 'c4VML7BH7RWwhb48dajk'},
  {title: 'フリー', kye: 'YQjFVyBTxo42zc2a7LtA'},
  {title: 'SNS', kye: 'CmB51Dj7WUckwoggeyKv'},
  {title: '外販', kye: 'SiBHolMYOW9dzytgYzPW'},
]

// てんぷれーとよう
  export const MEDIA_ID = {
		'c4VML7BH7RWwhb48dajk': 'C', //ほっとぺっぱー
		'YQjFVyBTxo42zc2a7LtA': 'O', //ふりー
		'CmB51Dj7WUckwoggeyKv': 'R', //SNS
		'SiBHolMYOW9dzytgYzPW': 'U', //がいはん
	}

// てんぷれーとよう
  export const wholesalers = {
		'jun3zSbuaDVBVnghS2ln': 'B', //にしはら
		'87cnvelPG7LZmk6Lhw62': 'C', //くによし
		'J8ClCnf1uwcfybw6pAiL': 'D', //じゃぱんふーど
		'VGKD1CbQ6wsjCaaBNq0M': 'E', //やべ
		'T90Jwy4TGl5V2ET5Lz5t': 'F', //ふーどげんきん
		'538Xcz6ogqgxj0jFXdLQ': 'G', //かくやす
		'fwcBQ6HFqPnKnjiraQ3J': 'H', //どりんくげんきん
		'UV8poYUDW0XJSMNX44Ai': 'I', //しょうもうひん
		'V7KtEVlkdacIT2YzLtbg': 'J', //びひん
		'3aH9ukMbeOpqsCKjQand': 'K', //そのた
	}

  export const paymentMethods = [
    {title: '現金', key: 'cash'},
    {title: 'クレジットカード', key: 'card'},
    {title: 'ポイント+現金', key: 'point'},
  ]

  export const paymentMethodsCell = {
    'cash': 'AF',
    'card': 'AG',
    'point': 'AH',
  }

  // すたっふ（てんない）
  export const staffcell = {
    'ZoK1kS7ZkL2cFQ5CKtB2': 'C',//けんご
    '5Ip7aPutqyFm9dldACox': 'D', //けんと
    'SGAWUrpqsaCLZrQOKdMj': 'E', //しょうた
    'US3nsRkjCzz2btXskAiV': 'F', //そうすけ
    'WzJmoFaErzOoENksOK7d': 'G', //ゆな
    'cZEqvYKtTUupJF681ca7': 'H', //さな
    'gDX82yWIxhvWqlr8siIW': 'I', //はると
    'o0QdPC4iNp08p2Cr7jpB': 'J', //ゆずは
    'slQicr3xk2GC9O1Ux3Q9': 'K', //とうご
    't1nHdx9Py692rhRf4fHl': 'L', //たかやす
    'yycbco2CvnKWwCVYXLiw': 'M', //みん
    'A4XVBnJMXjOMHzQ3tF4I': 'AE', //おーなー１
    'mT16rmjAOIO0VmcTsheN': 'AD' //りゅうや
  }

  // がいはん
  export const staffid= {
    'VncUni6fFPSGlj8fqc6Y': 'F', //りひと
    'ZoK1kS7ZkL2cFQ5CKtB2': 'I', //けんご
    'AU4nBZdULIrblgfBamk5': 'L', //みゆ
    'cnXSfZuX1PqNwJ5OrVE0': 'O', //はこ
    '08rSkH7y7LOTDyLmzVdE': 'R', //ひな
    'WzJmoFaErzOoENksOK7d': 'U', //ゆな
    'SGAWUrpqsaCLZrQOKdMj': 'X', //しょうた
    'US3nsRkjCzz2btXskAiV': 'AA', //そうすけ
    '5Ip7aPutqyFm9dldACox': 'AD', //けんと
    'bxVQwlpd6eqXmEijSQzq': 'AG', //酔うちゃん
    'cZEqvYKtTUupJF681ca7': 'AJ', //さな
    'gDX82yWIxhvWqlr8siIW': 'AM', //はると
    'o0QdPC4iNp08p2Cr7jpB': 'AP', //ゆずは
    'slQicr3xk2GC9O1Ux3Q9': 'AS', //とうご
    't1nHdx9Py692rhRf4fHl': 'AV', //たかやす
    'yycbco2CvnKWwCVYXLiw': 'AY', //みん
    'DwnHZxQ8ns1cjXW9o4cq': 'BI', //おーな２２
    'A4XVBnJMXjOMHzQ3tF4I': 'BF', //おーなー１
    'mT16rmjAOIO0VmcTsheN': 'BL' //りゅうや
  }
export const GAIHAN_ID = 'SiBHolMYOW9dzytgYzPW';

// 卓番
export const TABLE_NUMBER = [
  { prefix: 'A', count: 10 },
  { prefix: 'B', count: 10 },
  { prefix: 'C', count: 3 },
].flatMap(({ prefix, count }) =>
  Array.from({ length: count }, (_, i) => {
    const number = `${prefix}${i + 1}`;
    return { title: number, key: number };
  })
);

export const YES_NO_OPTIONS = [
  {title: 'あり', key: 'あり'},
  {title: 'なし', key: 'なし'},
]

// プラン
export const PLANS = [
  {title: '飲み放題', key: '飲み放題'},
  {title: 'せんべろ', key: 'せんべろ'},
]
//指定の数の配列
export const GET_NUMBER = (num) => {
  return Array.from({ length: num }, (_, i) => ({
    title: i + 1,
    key: i + 1
  }));
};