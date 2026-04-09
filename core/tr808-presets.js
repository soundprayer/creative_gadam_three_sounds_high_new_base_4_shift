/**
 * Wzorce rytmiczne inspirowane klasycznymi ustawieniami Roland TR-808.
 * Wiersze 1–4 = kick (BD), snare (SD), zamknięty hat (CH), open / rim / akcent (OH).
 * To są wzorce na jednym taktu 16×16 — brzmienie to nadal syntezatory p5, nie sample 808.
 */
const TR808_PRESETS = [
    {
        label: '808 · disco 4/4',
        bpm: 118,
        hint: 'Kick co ćwierćnutę, snary 2 i 4, haty ósemkami',
        rows: [
            '1000100010001000',
            '0000100000001000',
            '1010101010101010',
            '0000000000000001'
        ]
    },
    {
        label: '808 · hip-hop',
        bpm: 92,
        hint: 'Syncopowany kick (styl boom bap), snary na 2 i 4',
        rows: [
            '1000000100101000',
            '0000100000001000',
            '0010001000100010',
            '0000000010000000'
        ]
    },
    {
        label: '808 · techno',
        bpm: 130,
        hint: 'Gęste haty 1/16, akcent na „trójce”',
        rows: [
            '1000100010001000',
            '0000100000001000',
            '1111111111111111',
            '0000000010000000'
        ]
    },
    {
        label: '808 · electro',
        bpm: 125,
        hint: 'Gęsty kick na ósemki (klimat electro / Planet Rock)',
        rows: [
            '1010101010101010',
            '0000100000001000',
            '0101010101010101',
            '0010001000100010'
        ]
    },
    {
        label: '808 · miami',
        bpm: 110,
        hint: 'Kick z naciskiem tresillo, rim na wierszu 4',
        rows: [
            '1001001001001000',
            '0000100000001000',
            '1010101010101010',
            '0010000010000010'
        ]
    },
    {
        label: '808 · minimal',
        bpm: 124,
        hint: 'Bez snare — tylko stopa, gęste haty, lekki rim',
        rows: [
            '1000100010001000',
            '0000000000000000',
            '1010101010101010',
            '0001000000010000'
        ]
    }
];
