export type SymbolEntry = {
  value: string;
  name: string;
  shortName?: string;
  englishName?: string;
  aliases?: string[];
};

// 代表的な東証プライム銘柄をピックアップ。必要に応じて随時追加可能。
export const SYMBOL_DIRECTORY: SymbolEntry[] = [
  { value: '1301.T', name: '極洋', englishName: 'KYOKUYO', aliases: ['極洋株式会社'] },
  { value: '1605.T', name: 'INPEX', englishName: 'INPEX', aliases: ['国際石油開発帝石'] },
  { value: '1801.T', name: '大成建設', englishName: 'TAISEI', aliases: ['大成', 'TAISEI CORPORATION'] },
  { value: '1802.T', name: '大林組', englishName: 'OBAYASHI', aliases: ['大林', 'OBAYASHI CORPORATION'] },
  { value: '1803.T', name: '清水建設', englishName: 'SHIMIZU', aliases: ['清水', 'SHIMIZU CORPORATION'] },
  { value: '1925.T', name: '大和ハウス', englishName: 'DAIWA HOUSE', aliases: ['大和ハウス工業'] },
  { value: '2501.T', name: 'サッポロHD', englishName: 'SAPPORO', aliases: ['サッポロホールディングス'] },
  { value: '2502.T', name: 'アサヒGHD', englishName: 'ASAHI GROUP', aliases: ['アサヒグループ', 'アサヒグループホールディングス'] },
  { value: '2503.T', name: 'キリンHD', englishName: 'KIRIN', aliases: ['キリンホールディングス'] },
  { value: '2914.T', name: 'JT', englishName: 'JAPAN TOBACCO', aliases: ['日本たばこ産業'] },
  { value: '3382.T', name: 'セブン&アイHD', englishName: 'SEVEN & I', aliases: ['セブンアンドアイ', 'セブンイレブン'] },
  { value: '4063.T', name: '信越化学工業', englishName: 'SHIN-ETSU', aliases: ['信越化学'] },
  { value: '4188.T', name: '三菱ケミカルG', englishName: 'MITSUBISHI CHEMICAL', aliases: ['三菱ケミカル', '三菱ケミカルグループ'] },
  { value: '4502.T', name: '武田薬品工業', englishName: 'TAKEDA', aliases: ['タケダ', 'TAKEDA PHARMACEUTICAL'] },
  { value: '4503.T', name: 'アステラス製薬', englishName: 'ASTELLAS', aliases: ['アステラス'] },
  { value: '4568.T', name: '第一三共', englishName: 'DAIICHI SANKYO', aliases: ['第一三共株式会社'] },
  { value: '4901.T', name: '富士フイルム', englishName: 'FUJIFILM', aliases: ['富士フイルムHD'] },
  { value: '6501.T', name: '日立製作所', englishName: 'HITACHI', aliases: ['日立'] },
  { value: '6503.T', name: '三菱電機', englishName: 'MITSUBISHI ELECTRIC' },
  { value: '6594.T', name: 'ニデック', englishName: 'NIDEC', aliases: ['日本電産'] },
  { value: '6702.T', name: '富士通', englishName: 'FUJITSU' },
  { value: '6752.T', name: 'パナソニックHD', englishName: 'PANASONIC', aliases: ['パナソニックホールディングス'] },
  { value: '6758.T', name: 'ソニーグループ', englishName: 'SONY', aliases: ['ソニー', 'SONY GROUP'] },
  { value: '6861.T', name: 'キーエンス', englishName: 'KEYENCE' },
  { value: '6954.T', name: 'ファナック', englishName: 'FANUC' },
  { value: '6971.T', name: '京セラ', englishName: 'KYOCERA' },
  { value: '6981.T', name: '村田製作所', englishName: 'MURATA', aliases: ['ムラタ'] },
  { value: '7201.T', name: '日産自動車', englishName: 'NISSAN' },
  { value: '7203.T', name: 'トヨタ自動車', englishName: 'TOYOTA', aliases: ['トヨタ'] },
  { value: '7267.T', name: 'ホンダ', englishName: 'HONDA', aliases: ['本田技研工業', 'HONDA MOTOR'] },
  { value: '7270.T', name: 'SUBARU', englishName: 'SUBARU', aliases: ['スバル'] },
  { value: '7272.T', name: 'ヤマハ発動機', englishName: 'YAMAHA MOTOR' },
  { value: '7733.T', name: 'オリンパス', englishName: 'OLYMPUS' },
  { value: '7741.T', name: 'HOYA', englishName: 'HOYA' },
  { value: '7751.T', name: 'キヤノン', englishName: 'CANON', aliases: ['キャノン'] },
  { value: '7974.T', name: '任天堂', englishName: 'NINTENDO' },
  { value: '8001.T', name: '伊藤忠商事', englishName: 'ITOCHU' },
  { value: '8002.T', name: '丸紅', englishName: 'MARUBENI' },
  { value: '8031.T', name: '三井物産', englishName: 'MITSUI & CO', aliases: ['みつい物産'] },
  { value: '8035.T', name: '東京エレクトロン', englishName: 'TOKYO ELECTRON', aliases: ['東エレ'] },
  { value: '8053.T', name: '住友商事', englishName: 'SUMITOMO CORPORATION' },
  { value: '8058.T', name: '三菱商事', englishName: 'MITSUBISHI CORPORATION' },
  { value: '8306.T', name: '三菱UFJ FG', englishName: 'MUFG', aliases: ['三菱UFJフィナンシャルグループ'] },
  { value: '8316.T', name: '三井住友FG', englishName: 'SMFG', aliases: ['三井住友フィナンシャルグループ'] },
  { value: '8411.T', name: 'みずほFG', englishName: 'MIZUHO', aliases: ['みずほフィナンシャルグループ'] },
  { value: '8591.T', name: 'オリックス', englishName: 'ORIX' },
  { value: '8766.T', name: '東京海上HD', englishName: 'TOKIO MARINE', aliases: ['東京海上ホールディングス'] },
  { value: '9020.T', name: 'JR東日本', englishName: 'JR EAST', aliases: ['東日本旅客鉄道'] },
  { value: '9022.T', name: 'JR東海', englishName: 'JR CENTRAL', aliases: ['東海旅客鉄道'] },
  { value: '9024.T', name: 'JR西日本', englishName: 'JR WEST', aliases: ['西日本旅客鉄道'] },
  { value: '9101.T', name: '日本郵船', englishName: 'NYK LINE', aliases: ['郵船'] },
  { value: '9104.T', name: '商船三井', englishName: 'MOL', aliases: ['三井OSKライン'] },
  { value: '9202.T', name: 'ANAHD', englishName: 'ANA HOLDINGS', aliases: ['ANA', '全日本空輸'] },
  { value: '9432.T', name: 'NTT', englishName: 'NIPPON TELEGRAPH AND TELEPHONE', aliases: ['日本電信電話'] },
  { value: '9433.T', name: 'KDDI', englishName: 'KDDI', aliases: ['au'] },
  { value: '9434.T', name: 'ソフトバンク', englishName: 'SOFTBANK', aliases: ['SoftBank Corp.'] },
  { value: '9983.T', name: 'ファーストリテイリング', englishName: 'FAST RETAILING', aliases: ['ユニクロ'] },
  { value: '9984.T', name: 'ソフトバンクグループ', englishName: 'SOFTBANK GROUP' },
];

export function findSymbolEntry(keyword: string): SymbolEntry | undefined {
  const target = sanitise(keyword);
  if (!target) {
    return undefined;
  }
  return SYMBOL_DIRECTORY.find((entry) => {
    const tokens = [entry.value, entry.name, entry.shortName, entry.englishName, ...(entry.aliases ?? [])].filter(
      (token): token is string => Boolean(token),
    );
    return tokens.some((token) => {
      const sanitized = sanitise(token);
      return sanitized === target || sanitized.includes(target) || target.includes(sanitized);
    });
  });
}

export function sanitise(value: string): string {
  return toHalfWidth(value).replace(/\s+/g, '').toUpperCase();
}

export function toHalfWidth(value: string): string {
  return value.replace(/[Ａ-Ｚａ-ｚ０-９．]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0));
}
