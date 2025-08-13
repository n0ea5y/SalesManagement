// ゼロパディング：値,何桁にするのか
	export function zeroPadding(NUM, LEN){
		return ( Array(LEN).join('0') + NUM ).slice( -LEN );
	}

  // 金額のフォーマット
  export function formatNumber(num) {
    if (num == null || num === '') return ''
    return '￥' + Number(num).toLocaleString()
  }

    // 金額のフォーマット
  export function formatNumberNonYen(num) {
    if (num == null || num === '') return ''
    return '￥' + Number(num).toLocaleString()
  }