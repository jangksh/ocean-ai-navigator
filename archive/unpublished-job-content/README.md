# Unpublished job-content archive

Not loaded by the live site. Excluded from GitHub Pages via `_config.yml`.

On 2026-11-19 the quiz-result lookups stopped using this copy because the
picker IDs did not match the text:

- Picker **06** = IT / Data / AI, but `v2_data.js` / job personas 06 were
  construction and mining (건설 / 채굴).
- Picker **14** = Entrepreneur / Freelancer, but two v2 rows (`14_11111`,
  `14_01001`) and the only two job-14 personas were install / repair
  (설치 / 정비). The other 30 job-14 v2 insights were already entrepreneur
  copy and stayed in `v2_data.js`.

Files:

- `v2-job-06-construction-and-14-install.json`
- `ocean-job-personas-06-construction-and-14-install.json`

Do not put these keys back under `06` / `14` unless the picker labels change
or new matching copy is written. A later construction or trades job should
use a new id, or only reuse these keys after a deliberate remap.

## Update 2026-11-25

New Korean copy now exists for both picker ids, so `06` / `14` are back in
the live data files:

- `v2_data.js`: `06_*` (IT 개발 / 데이터 / AI) and `14_*` (1인 창업 /
  프리랜서), 32 type codes each.
- `ocean-personas.js`: 32 job personas each; `OCEAN_JOB_GROUPS` labels now
  match the picker.

The construction / install copy in this folder is still unpublished and must
not be restored under `06` / `14`.
