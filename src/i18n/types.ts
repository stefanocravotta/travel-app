// Struttura di una traduzione ricavata da quella di riferimento (inglese):
// stesse chiavi annidate, ma valori `string` qualsiasi invece dei letterali.
// Le altre lingue usano `satisfies TranslationShape<typeof en…>`, quindi una
// chiave mancante o in più è un errore di compilazione.
export type TranslationShape<T> = {
  [K in keyof T]: T[K] extends string ? string : TranslationShape<T[K]>
}
