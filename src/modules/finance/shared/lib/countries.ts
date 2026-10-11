/** ISO-3166-1 alpha-2. El API guarda el código; la UI muestra el nombre. */
const ISO_COUNTRY_CODES =
  "AD AE AF AG AI AL AM AO AR AT AU AW AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CW CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " "
  )

const KNOWN_CODES = new Set(ISO_COUNTRY_CODES)
const DISPLAY_LOCALE = "es"
const regionNames = new Intl.DisplayNames([DISPLAY_LOCALE], { type: "region" })

export type CountryOption = { code: string; name: string }

/** Nombre del país en español. Un código desconocido se devuelve tal cual. */
export function countryName(code: string): string {
  const normalized = code.trim().toUpperCase()
  if (!KNOWN_CODES.has(normalized)) {
    return normalized
  }
  return regionNames.of(normalized) ?? normalized
}

export const COUNTRY_OPTIONS: CountryOption[] = ISO_COUNTRY_CODES.map(
  (code) => ({ code, name: countryName(code) })
).sort((left, right) => left.name.localeCompare(right.name, DISPLAY_LOCALE))
