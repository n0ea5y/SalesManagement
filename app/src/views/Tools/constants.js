export const SHEET_NAME = ['売上合計', '原価', '外板集計', '人件費'];
export const MEDIA_FIELDS = ['組数', '人数', '合計金額'];


export const MEDIA_LIST = [
  {title: 'Ratty', kye: 'ratty'},
  {title: 'hotpepper', kye: 'hotpepper'},
  {title: '食べログ', kye: 'taberogu'},
  {title: 'ぐるなび', kye: 'gurunabi'},
  {title: 'フリー', kye: 'free'},
  {title: 'SNS', kye: 'sns'},
  {title: '外販', kye: 'gaihan'},
]

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