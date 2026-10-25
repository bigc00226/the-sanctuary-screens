/*
 * 言葉で探すときの文字のそろえ方。
 * 画面の説明とページの名前は、ひらがな・カタカナ・漢字・英字がまざっているため、探す言葉と探される文字の両方を同じ形にそろえてから比べます。
 *   ・全角と半角（ＰＣ → pc、ｶﾙﾃ → かるて）、大文字と小文字
 *   ・カタカナとひらがな（「カルテ」でも「かるて」でも見つかる）
 *   ・記号（・、。「」（）など）は無視する（「メニュー料金」でも「メニュー・料金」が見つかる）
 * 空白（半角・全角）や読点で区切った言葉は、すべてを含む画面だけを表示します。
 */

const KATAKANA = /[ァ-ヶヽヾ]/g;
// NFKC のあとに残る記号（全角の（）：？！ などは NFKC で半角になる）
const IGNORED = /[・、。,.:;!?"'`“”‘’「」『』【】〔〕〈〉《》()[\]{}]/g;
const SEPARATORS = /[\s、,]+/;

/** 比べるための形にそろえる */
export function normalizeText(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(KATAKANA, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    .replace(IGNORED, "");
}

/** 探す言葉を、そろえた形の言葉の一覧にする（空の言葉は除く） */
export function parseQuery(query: string): string[] {
  return query
    .normalize("NFKC")
    .split(SEPARATORS)
    .map(normalizeText)
    .filter((term) => term.length > 0);
}

/** 探される文字（そろえた形）を作る。項目の間は空白で区切り、言葉が項目をまたいで一致しないようにする */
export function buildHaystack(parts: Array<string | undefined>): string {
  return parts
    .filter(Boolean)
    .map((part) => normalizeText(part!))
    .join(" ");
}

/** すべての言葉を含むかどうか */
export function matchesTerms(haystack: string, terms: string[]): boolean {
  for (const term of terms) {
    if (!haystack.includes(term)) return false;
  }
  return true;
}
