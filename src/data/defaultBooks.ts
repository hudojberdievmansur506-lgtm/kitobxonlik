import { LiteratureBook } from '../types';

export const DEFAULT_BOOKS: LiteratureBook[] = [
  {
    id: 'b1',
    nom: 'O‘tkan kunlar (Abdulla Qodiriy)',
    yaratilganVaqt: new Date().toISOString(),
    savollar: [
      {
        id: 'q1-1',
        savol: '“O‘tkan kunlar” romanida Otabekning birinchi xotini kim?',
        togriJavob: 'Kumush',
        javoblar: ['Kumush', 'Zaynab', 'Oftob eshon', 'Hanifa']
      },
      {
        id: 'q1-2',
        savol: 'Otabekning yaqin do‘sti va maslahatgo‘yi kim edi?',
        togriJavob: 'Hasanali',
        javoblar: ['Hasanali', 'Homid', 'Ziyo shohichi', 'Rahmat']
      },
      {
        id: 'q1-3',
        savol: '“O‘tkan kunlar” romani qaysi shahardagi voqealar bilan boshlanadi?',
        togriJavob: 'Marg‘ilon',
        javoblar: ['Marg‘ilon', 'Toshkent', 'Qo‘qon', 'Andijon']
      }
    ]
  },
  {
    id: 'b2',
    nom: 'Mehrobdan chayon (Abdulla Qodiriy)',
    yaratilganVaqt: new Date().toISOString(),
    savollar: [
      {
        id: 'q2-1',
        savol: '“Mehrobdan chayon” romanidagi bosh qahramon yigit kim?',
        togriJavob: 'Anvar',
        javoblar: ['Anvar', 'Soliq', 'Rano', 'Nasim']
      },
      {
        id: 'q2-2',
        savol: 'Anvarni kim o‘z tarbiyasiga olib, xat-savodli qiladi?',
        togriJavob: 'Soliq mahsum',
        javoblar: ['Soliq mahsum', 'Abdurahmon', 'Safsar', 'Xon']
      },
      {
        id: 'q2-3',
        savol: '“Mehrobdan chayon” romanida fitna va hasad ramzi bo‘lgan obraz kim?',
        togriJavob: 'Kalondor shoh',
        javoblar: ['Kalondor shoh', 'Mirzaboshi', 'Anvar', 'Soliq mahsum']
      }
    ]
  },
  {
    id: 'b3',
    nom: 'Kecha va kunduz (Abdulhamid Cho‘lpon)',
    yaratilganVaqt: new Date().toISOString(),
    savollar: [
      {
        id: 'q3-1',
        savol: '“Kecha va kunduz” romanining bosh qahramoni kim?',
        togriJavob: 'Zebi',
        javoblar: ['Zebi', 'Saltanat', 'Poshshaxon', 'Xadicha']
      },
      {
        id: 'q3-2',
        savol: 'Zebining otasining ismi nima edi?',
        togriJavob: 'Razzoq so‘fi',
        javoblar: ['Razzoq so‘fi', 'Eshon', 'Miryoqub', ' اکبرxon']
      },
      {
        id: 'q3-3',
        savol: 'Zebi qaysi ayblov bilan surgunga hukm qilinadi?',
        togriJavob: 'Erini zaharlaganlikda',
        javoblar: ['Erini zaharlaganlikda', 'O‘g‘rilikda', 'Dindan qaytishda', 'Surgundan qochishda']
      }
    ]
  },
  {
    id: 'b4',
    nom: 'Yulduzli tunlar (Pirimqul Qodirov)',
    yaratilganVaqt: new Date().toISOString(),
    savollar: [
      {
        id: 'q4-1',
        savol: '“Yulduzli tunlar” romani kimning hayotiga bag‘ishlangan?',
        togriJavob: 'Zahiriddin Muhammad Bobur',
        javoblar: ['Zahiriddin Muhammad Bobur', 'Amir Temur', 'Mirzo Ulug‘bek', 'Alisher Navoiy']
      },
      {
        id: 'q4-2',
        savol: 'Boburning singlisi, akasining taqdiri uchun fidoiylik ko‘rsatgan ayol kim?',
        togriJavob: 'Xonzodabegim',
        javoblar: ['Xonzodabegim', 'Qutlug‘ Nigor xonim', 'Ayshabegim', 'Mehrbonu']
      },
      {
        id: 'q4-3',
        savol: 'Bobur qaysi jangdan so‘ng o‘z vatanini butunlay tark etishga majbur bo‘ladi?',
        togriJavob: 'Saripul jangi',
        javoblar: ['Saripul jangi', 'Taroz jangi', 'Panipat jangi', 'Andijon mudofaasi']
      }
    ]
  },
  {
    id: 'b5',
    nom: 'Dunyoning ishlari (O‘tkir Hoshimov)',
    yaratilganVaqt: new Date().toISOString(),
    savollar: [
      {
        id: 'q5-1',
        savol: '“Dunyoning ishlari” asaridagi barcha qissalar kimga bag‘ishlangan?',
        togriJavob: 'Onaga',
        javoblar: ['Onaga', 'Yurtga', 'Do‘stga', 'Tabiatga']
      },
      {
        id: 'q5-2',
        savol: 'Asardagi qaysi hikoyada onaning o‘g‘lining soch tolasini saqlashi tasvirlangan?',
        togriJavob: '“Oq tasmali daftar”',
        javoblar: ['“Oq tasmali daftar”', '“Imtihon”', '“Gilam paypoq”', '“Oltin baldoq”']
      },
      {
        id: 'q5-3',
        savol: '“Dunyoning ishlari” qissasida muallif oilasining eng yaqin qo‘shnisi kim edi?',
        togriJavob: 'Poshsha xola',
        javoblar: ['Poshsha xola', 'Zuhra opaning onasi', 'Hamida xola', 'Salima opa']
      }
    ]
  },
  {
    id: 'b6',
    nom: 'Sariq devni minib (Xudoyberdi To‘xtaboyev)',
    yaratilganVaqt: new Date().toISOString(),
    savollar: [
      {
        id: 'q6-1',
        savol: 'Asarning bosh qahramoni Hoshimjonning “Sariq dev”i aslida nima edi?',
        togriJavob: 'Sehrli sariq portfel',
        javoblar: ['Sehrli sariq portfel', 'Sariq mototsikl', 'Sariq eshak', 'Sariq qalam']
      },
      {
        id: 'q6-2',
        savol: 'Hoshimjon sehrli jism orqali birinchi bo‘lib qaysi kasb egasi bo‘lmoqchi bo‘ladi?',
        togriJavob: 'Shifokor',
        javoblar: ['Shifokor', 'O’qituvchi', 'Politsiyachi', 'Agronom']
      },
      {
        id: 'q6-3',
        savol: 'Hoshimjonning yaqin do‘sti va uning sirlaridan xabardor qiz kim?',
        togriJavob: 'Oysha',
        javoblar: ['Oysha', 'Zuhra', 'Malika', 'Dilorom']
      }
    ]
  },
  {
    id: 'b7',
    nom: 'Ufq (Said Ahmad)',
    yaratilganVaqt: new Date().toISOString(),
    savollar: [
      {
        id: 'q7-1',
        savol: '“Ufq” trilogiyasida urushdan qochib, qidiruvda yurgan obraz kim?',
        togriJavob: 'Tursunboy',
        javoblar: ['Tursunboy', 'Ikromjon', 'Nizomjon', 'Asror']
      },
      {
        id: 'q7-2',
        savol: 'Tursunboyning onasi, o‘g‘lining xiyonatidan azob chekkan ayol kim?',
        togriJavob: 'Jannat xola',
        javoblar: ['Jannat xola', 'Oymomo', 'Hanifa', 'Zebiniso']
      },
      {
        id: 'q7-3',
        savol: 'Asarda Ikromjon qanday vazifada ishlaydi va odamlar unga qanday qarashadi?',
        togriJavob: 'Rais, hurmatga sazovor va qattiqqo‘l',
        javoblar: [
          'Rais, hurmatga sazovor va qattiqqo‘l',
          'Surgun qilingan dehqon',
          'Front orqasidagi shifokor',
          'Maktab direktori'
        ]
      }
    ]
  },
  {
    id: 'b8',
    nom: 'Ikki eshik orasi (O‘tkir Hoshimov)',
    yaratilganVaqt: new Date().toISOString(),
    savollar: [
      {
        id: 'q8-1',
        savol: '“Ikki eshik orasi” asaridagi urush yillarida o‘z qishlog‘ida mehnat qilgan qiz kim?',
        togriJavob: 'Ra’no',
        javoblar: ['Ra’no', 'Kimsan', 'Robiyaxon', 'Shirin']
      },
      {
        id: 'q8-2',
        savol: 'Asarda urushga ketib, undan qahramon bo‘lib qaytgan, lekin keyin qamoqqa olingan yigit kim?',
        togriJavob: 'Kimsan',
        javoblar: ['Kimsan', 'Muzaffar', 'Shomurod', 'Umar zakat']
      },
      {
        id: 'q8-3',
        savol: '“Ikki eshik orasi” sarlavhasidagi ikki eshik nimani anglatadi?',
        togriJavob: 'Tug‘ilish va O‘lim',
        javoblar: ['Tug‘ilish va O‘lim', 'Urush va Tinchlik', 'Yoshlik va Qarilik', 'Boylik va Kambag‘allik']
      }
    ]
  },
  {
    id: 'b9',
    nom: 'Qutlug‘ qon (Musa Toshmuhammad o‘g‘li Oybek)',
    yaratilganVaqt: new Date().toISOString(),
    savollar: [
      {
        id: 'q9-1',
        savol: '“Qutlug‘ qon” romanining bosh qahramoni kim?',
        togriJavob: 'Yo‘lchi',
        javoblar: ['Yo‘lchi', 'Mirzakarimboy', 'Shokir ota', 'Salimboy']
      },
      {
        id: 'q9-2',
        savol: 'Yo‘lchining sevgilisi, fojiali taqdirga mahkum bo‘lgan qiz kim?',
        togriJavob: 'Gulnor',
        javoblar: ['Gulnor', 'Unsin', 'Xadicha', 'Jamila']
      },
      {
        id: 'q9-3',
        savol: 'Yo‘lchining asboki bo‘lib ishlagan boy amakisi kim edi?',
        togriJavob: 'Mirzakarimboy',
        javoblar: ['Mirzakarimboy', 'Tantaboy', 'Shokir ota', 'Yoqubboy']
      }
    ]
  },
  {
    id: 'b10',
    nom: 'Shum bola (G‘afur G‘ulom)',
    yaratilganVaqt: new Date().toISOString(),
    savollar: [
      {
        id: 'q10-1',
        savol: '“Shum bola” asarining bosh qahramoni uydan nimani o‘g‘irlagani sababli qochib ketadi?',
        togriJavob: 'Oposining sarpasidan tilla buyum/pul',
        javoblar: [
          'Oposining sarpasidan tilla buyum/pul',
          'Otining egarini',
          'Sariq xonadon tovuqlarini',
          'Qo‘shnining sigirini'
        ]
      },
      {
        id: 'q10-2',
        savol: 'Shum bolaning doimiy sarguzashtdosh o‘rtog‘i bo‘lgan yigitcha kim?',
        togriJavob: 'Qoravoy',
        javoblar: ['Qoravoy', 'Omon', 'Soli', 'Eshon']
      },
      {
        id: 'q10-3',
        savol: 'Shum bola qaysi asir dehqonni o‘g‘irlikda aldab, uning qovunlarini eydi?',
        togriJavob: 'Sariq boyning bog‘bonini',
        javoblar: ['Sariq boyning bog‘bonini', 'Eshon dadasining cho‘ponini', 'Tantiboyni', 'Hoji akacha']
      }
    ]
  }
];
