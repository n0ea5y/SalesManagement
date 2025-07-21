export const SHEET_NAME = ['売上合計', '原価', '外板集計', '人件費'];
export const MEDIA_FIELDS = ['組数', '人数', '合計金額'];


export const MEDIA_LIST = [
  {title: 'hotpepper', kye: 'c4VML7BH7RWwhb48dajk'},
  {title: 'フリー', kye: 'YQjFVyBTxo42zc2a7LtA'},
  {title: 'SNS', kye: 'CmB51Dj7WUckwoggeyKv'},
  {title: '外販', kye: 'SiBHolMYOW9dzytgYzPW'},
]

// てんぷれーとよう
  export const media = {
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


  export const staffid = {
    'DwnHZxQ8ns1cjXW9o4cq': 'C',
    'mT16rmjAOIO0VmcTsheN': 'F',
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