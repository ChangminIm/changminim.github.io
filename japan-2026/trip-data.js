/* Public itinerary data. Reservation numbers and private booking links are intentionally omitted. */
window.TRIP = {
  checked: '2026-11-13',
  timingNote: '시각은 추천 일정입니다. 항공편 시간과 교통편은 출발 전 확정하고, 예약 완료 표시는 실제로 예약한 항공·숙소에만 사용합니다.',
  foodNote: '식비는 주문량을 고려한 1인 예산이며 확정 견적이 아닙니다. 연말 특별 영업·휴무는 방문 직전에 다시 확인하세요.',
  days: [
    {
      date: '2026-12-25', day: '금', num: '25', city: '오사카',
      title: '도톤보리의 불빛으로 시작',
      subtitle: '짐을 내려놓고, 따뜻한 우동과 강변 산책. 첫날은 천천히.',
      stay: '쿠로몬 크리스탈 호텔', color: 'osaka', walk: '가볍게 걷는 날',
      events: [
        { time: '항공편 확인 후', title: '에어서울로 간사이공항 도착', type: 'move', status: '시간 확인 필요', note: '항공권 두 명 예약 완료. 실제 편명과 출도착 시각은 아직 전달받지 않아 고정하지 않았어요. 입국·짐 찾기 후 첫 이동을 시작합니다.', query: 'Kansai International Airport' },
        { time: '입국 후', title: '난카이 전철로 난바까지', type: 'move', status: '추천', note: '간사이공항 → 난카이 난바. 가성비는 공항급행, 지정석과 짐 공간이 우선이면 라피트. 공항급행은 약 45분을 잡고, 대기·호텔까지 걷는 시간을 더해요.', query: 'Nankai Kansai Airport Station', directions: { from: 'Kansai Airport Station', to: 'Nankai Namba Station', mode: 'transit' }, source: 'https://www.nankai.co.jp/traffic/kix.html' },
        { time: '도착 후', title: '쿠로몬 크리스탈에 짐 내려놓기', type: 'stay', status: '예약 완료', note: '12/25–27 두 명 2박, 총 290,000원. 난카이 난바에서 도보 약 10–15분을 여유 있게 잡아요. 객실·체크인 조건은 예약 내역 기준입니다.', query: 'Kuromon Crystal Hotel Osaka', directions: { from: 'Nankai Namba Station', to: 'Kuromon Crystal Hotel Osaka', mode: 'walking' } },
        { time: '저녁', title: '도톤보리 이마이에서 따뜻한 한 끼', type: 'food', status: '추천', note: '첫 끼는 기쓰네 우동이나 오야코동. 늦게 도착하면 식당 영업을 먼저 확인하고, 호텔 근처에서 가볍게 먹는 일정으로 바꿔요.', query: '道頓堀 今井 本店', directions: { from: 'Kuromon Crystal Hotel Osaka', to: '道頓堀 今井 本店', mode: 'walking' }, source: 'https://www.d-imai.com/shops/honten/' },
        { time: '식사 후', title: '에비스바시 · 도톤보리 산책', type: 'sight', status: '추천', note: '글리코 간판 앞에서 사진을 찍고 강변을 한 바퀴. 체력이 남으면 호젠지 골목까지, 피곤하면 숙소로 돌아가요.', query: 'Ebisu Bridge Dotonbori', directions: { from: '道頓堀 今井 本店', to: 'Ebisu Bridge Osaka', mode: 'walking' } }
      ],
      food: [
        { meal: '저녁', name: '도톤보리 이마이 본점', note: '기쓰네 우동·오야코동. 공식 통상 영업 11:30–21:30, 마지막 주문 21:00. 수요일 휴무이며 연말 변경은 별도 확인.', price: '1인 예산 ¥1,000–2,000', query: '道頓堀 今井 本店', url: 'https://www.d-imai.com/shops/honten/' },
        { meal: '간식 · 선택', name: '와나카 센니치마에 본점', note: '호텔로 돌아가는 길에 타코야키 한 팩을 둘이 나눠 먹기. 줄이 길면 다음 날로 미뤄도 좋아요.', price: '두 명 간식 예산 ¥800–1,200', query: 'たこ焼道楽 わなか 千日前本店', url: 'https://www.takoyaki-wanaka.com/' }
      ],
      tip: '비행기가 늦거나 비가 오면 도톤보리 산책을 짧게 줄여요. 쿠로몬시장은 밤보다 다음 날 아침에 보는 편이 자연스러워요.'
    },
    {
      date: '2026-12-26', day: '토', num: '26', city: '오사카',
      title: '성에서 골목으로, 오사카 한 바퀴',
      subtitle: '오사카성의 큰 풍경과 신세카이의 작은 맛집. 스모는 선택으로.',
      stay: '쿠로몬 크리스탈 호텔', color: 'osaka', walk: '많이 걷는 날',
      events: [
        { time: '08:30 추천', title: '가벼운 아침 · 쿠로몬시장', type: 'food', status: '추천', note: '호텔 근처에서 아침을 먹고 시장을 짧게 둘러봐요. 점포마다 문 여는 시간이 달라 아침에는 열린 가게 위주로, 점심을 위해 과식은 피하기.', query: 'Kuromon Ichiba Market', directions: { from: 'Kuromon Crystal Hotel Osaka', to: 'Kuromon Ichiba Market Osaka', mode: 'walking' }, source: 'https://kuromon.com/' },
        { time: '10:00 추천', title: '오사카성 공원 · 천수각', type: 'sight', status: '추천', note: '니폰바시에서 지하철로 다니마치욘초메 방면 이동 후 공원을 걸어요. 천수각은 성인 ¥1,200, 통상 09:00–18:00. 12/28–1/1 휴관이라 오늘 방문하는 구성이 좋아요.', query: 'Osaka Castle Museum', directions: { from: 'Nippombashi Station Osaka', to: 'Tanimachi 4-chome Station Osaka', mode: 'transit' }, source: 'https://www.manabi.city.osaka.lg.jp/yoyaku/shisetsuInfoDetailInfo.html?kubunno=112&searchmode=2&shisetsu_code=283' },
        { time: '13:00 추천', title: '신세카이에서 쿠시카츠 점심', type: 'food', status: '추천', note: '성에서 남쪽으로 이동해 꼬치튀김을 나눠 먹어요. 다루마 총본점이 붐비면 같은 지역의 잔잔점·도부쓰엔마에점을 대안으로 비교합니다.', query: '串かつだるま 新世界総本店', directions: { from: 'Osaka Castle Museum', to: '串かつだるま 新世界総本店', mode: 'transit' }, source: 'https://www.kushikatu-daruma.com/location/' },
        { time: '14:30 추천', title: '쓰텐카쿠 아래 골목 산책', type: 'sight', status: '추천', note: '신세카이 간판 거리와 잔잔요코초를 천천히 걸어요. 전망대는 현장에서 대기와 체력을 보고 선택하고, 카페에서 한 번 쉬어갑니다.', query: 'Tsutenkaku Shinsekai Osaka', directions: { from: '串かつだるま 新世界総本店', to: 'Tsutenkaku Osaka', mode: 'walking' } },
        { time: '오후 · 저녁 선택', title: '스모 체험 또는 난바 자유시간', type: 'sight', status: '선택', note: 'OSAKA SUMO SHINSEKAI는 약 1시간 쇼·체험 상품. 아직 미예약이며 12/26 회차와 가격 확인이 필요해요. 선택하면 신세카이에서 쉬다가 관람, 생략하면 난바로 일찍 돌아가 쇼핑·휴식합니다.', query: 'OSAKA SUMO SHINSEKAI 3-3-26 Ebisunishi', source: 'https://www.osaka-sumo-shinsekai.com/' },
        { time: '저녁', title: '난바에서 오코노미야키', type: 'food', status: '추천', note: '미예약 후보는 아지노야 본점. 스모를 선택하면 공연 이후, 생략하면 이른 저녁으로 배치해요. 긴 대기는 피하고 가까운 식당으로 바꿀 수 있게 시간을 비워둡니다.', query: '味乃家 本店 大阪', directions: { from: 'Shinsekai Osaka', to: '味乃家 本店 大阪', mode: 'transit' }, source: 'https://ajinoya-okonomiyaki.com/top/' }
      ],
      food: [
        { meal: '점심', name: '쿠시카츠 다루마 신세카이 총본점', note: '꼬치 세트에 필요한 만큼 추가. 총본점은 예약 불가, 공식 주말 통상 영업 10:30–22:30. 줄이 길면 잔잔점·도부쓰엔마에점 비교.', price: '1인 예산 ¥2,000–3,000', query: '串かつだるま 新世界総本店', url: 'https://www.kushikatu-daruma.com/location/' },
        { meal: '저녁', name: '아지노야 본점', note: '오코노미야키와 야키소바를 나눠 먹는 구성. 공식 월요일 휴무. 대기가 길면 도톤보리 이마이로 바꾸고 다음 날 이동을 위해 일찍 쉬어요.', price: '1인 예산 ¥2,000–3,500', query: '味乃家 本店 大阪', url: 'https://ajinoya-okonomiyaki.com/top/' }
      ],
      tip: '비가 오면 성 공원 산책을 줄이고 천수각 실내 관람에 집중해요. 신세카이 이후에는 난바에서 쉬어도 충분한 하루예요.'
    },
    {
      date: '2026-12-27', day: '일', num: '27', city: '교토',
      title: '돌담 길 끝에, 교토의 저녁',
      subtitle: '짐을 맡기고 기요미즈데라에서 기온까지 한 방향으로 걸어요.',
      stay: '와카 교토 가와라마치', color: 'kyoto', walk: '언덕과 골목을 걷는 날',
      events: [
        { time: '09:00 추천', title: '체크아웃 · 게이한으로 교토 이동', type: 'move', status: '추천', note: '니폰바시 → 사카이스지선 기타하마 → 게이한 기온시조. 호텔 사이 이동은 환승·도보를 포함해 약 1시간 20분–1시간 40분을 여유 있게 잡아요. 기타하마–기온시조 일반 승차권은 현재 ¥490, 유료 지정석은 별도입니다.', query: 'Gion-Shijo Station Kyoto', directions: { from: 'Nippombashi Station Osaka', to: 'Gion-Shijo Station Kyoto', mode: 'transit' }, source: 'https://www.keihan.co.jp/traffic/station/assets/pdf/fare/162.pdf' },
        { time: '11:00 추천', title: '와카 호텔에 짐 보관 요청', type: 'stay', status: '예약 완료', note: '12/27–28 두 명 1박 96,000원. 기온시조역 1번 출구에서 도보 약 5분. 정식 체크인은 15시부터이며, 도착 전 짐 보관 가능 여부는 호텔에 확인해요.', query: 'Waka Kyoto Kawaramachi Hotel', directions: { from: 'Gion-Shijo Station Kyoto', to: 'Waka Kyoto Kawaramachi Hotel', mode: 'walking' }, source: 'https://waka-hotels.com/kawaramachi/' },
        { time: '11:30 추천', title: '폰토초에서 이른 점심', type: 'food', status: '추천', note: '오멘의 우동으로 점심을 먹고 동쪽으로 이동해요. 점심 대기가 길면 근처 식당에서 간단히 먹고 기요미즈데라 방문 시간을 우선합니다.', query: 'おめん 四条先斗町店', source: 'https://omen.co.jp/pages/shops' },
        { time: '13:00 추천', title: '기요미즈데라', type: 'sight', status: '추천', note: '청수의 무대와 경내를 60–90분 정도 둘러봐요. 12월 공식 개방은 06:00–18:00. 경내는 기요미즈자카 또는 차완자카의 정식 진입로를 이용합니다.', query: 'Kiyomizu-dera Kyoto', directions: { from: 'おめん 四条先斗町店', to: 'Kiyomizu-dera Kyoto', mode: 'walking' }, source: 'https://www.kiyomizudera.or.jp/access.php' },
        { time: '14:30 추천', title: '산넨자카 · 니넨자카 · 야사카', type: 'sight', status: '추천', note: '기요미즈데라에서 내려오며 오래된 골목과 작은 상점을 구경해요. 중간에 카페 휴식을 넣고, 야사카신사를 지나 기온으로 이어갑니다.', query: 'Ninenzaka Kyoto', directions: { from: 'Kiyomizu-dera Kyoto', to: 'Yasaka Shrine Kyoto', mode: 'walking' } },
        { time: '17:00 추천', title: '기온 산책 후 저녁 · 호텔 체크인', type: 'food', status: '추천', note: '기온과 가모가와를 짧게 보고 저녁은 산조의 회전초밥을 후보로. 많이 걸었다면 가와라마치 근처에서 식사하고 호텔로 바로 돌아가요.', query: '寿しのむさし 三条本店', directions: { from: 'Yasaka Shrine Kyoto', to: '寿しのむさし 三条本店', mode: 'walking' }, source: 'https://sushinomusashi.com/shop/' }
      ],
      food: [
        { meal: '점심', name: '오멘 시조폰토초점', note: '채소와 함께 먹는 우동. 공식 통상 점심 11:00–16:00, 마지막 주문 15:00. 이 지점은 예약을 받지 않아요.', price: '1인 예산 ¥1,500–2,500', query: 'おめん 四条先斗町店', url: 'https://omen.co.jp/pages/shops' },
        { meal: '저녁', name: '스시노 무사시 산조본점', note: '접시 수로 예산을 조절하기 좋은 회전초밥. 공식 통상 영업 11:00–21:45, 최종 입장 21:20. 피곤하면 가와라마치의 가까운 식당으로 대체.', price: '1인 예산 ¥2,000–3,500', query: '寿しのむさし 三条本店', url: 'https://sushinomusashi.com/shop/' }
      ],
      tip: '기요미즈데라까지는 오르막이 있어요. 비가 오거나 짐 보관이 늦어지면 택시로 고조자카 방면까지 이동하고, 카페 한 곳을 빼서 여유를 확보해요.'
    },
    {
      date: '2026-12-28', day: '월', num: '28', city: '아라시야마 · 유노하나',
      title: '대나무 숲을 지나 온천으로',
      subtitle: '오전은 아라시야마, 오후는 온전히 료칸. 오늘의 기준은 14:55 셔틀.',
      stay: '스미야 기호안', color: 'onsen', walk: '오전에 걷고 오후에는 쉬는 날',
      events: [
        { time: '08:30 추천', title: '체크아웃 · 아라시야마로 이동', type: 'move', status: '추천', note: '짐을 모두 가지고 출발해요. 한큐 가와라마치 → 가쓰라 환승 → 한큐 아라시야마. JR 사가아라시야마역 쪽 보관함을 먼저 확인하면 오후 이동이 편해요. 보관은 미예약이며 빈칸을 보장할 수 없습니다.', query: 'Saga-Arashiyama Station coin lockers', directions: { from: 'Kyoto-Kawaramachi Station', to: 'Hankyu Arashiyama Station', mode: 'transit' }, source: 'https://www.hankyu.co.jp/station/kawaramachi.html' },
        { time: '10:00 추천', title: '대나무 숲 · 덴류지 정원', type: 'sight', status: '추천', note: '짐을 맡긴 뒤 대나무 숲과 덴류지 정원만 집중해서 봐요. 정원은 통상 08:30–17:00, 성인 ¥500. 오늘은 월요일이라 운룡도 특별 관람을 기본 일정에 넣지 않았어요.', query: 'Tenryu-ji Temple Kyoto', directions: { from: 'Arashiyama Bamboo Grove', to: 'Tenryu-ji Temple Kyoto', mode: 'walking' }, source: 'https://www.tenryuji.com/visit/' },
        { time: '11:45 추천', title: '가벼운 점심 · 도게츠교', type: 'food', status: '추천', note: '저녁 가이세키를 위해 점심은 적당히. 요시야에서 우동이나 유바 요리를 먹고 도게츠교를 짧게 봐요. 13시대에는 짐을 찾아 역으로 향합니다.', query: '良彌 京都 嵐山', directions: { from: 'Tenryu-ji Temple Kyoto', to: 'Togetsukyo Bridge Kyoto', mode: 'walking' }, source: 'https://yoshiya-kyoto.jp/' },
        { time: '13:30 이후 추천', title: 'JR 사가아라시야마 → JR 가메오카', type: 'move', status: '추천', note: '사가노선에서 가메오카 방면 열차를 타요. 정확한 열차는 당일 시각표로 선택하고, 14:40까지 가메오카역 남쪽 출구 도착을 목표로 합니다. 트로코 가메오카역과 다른 역이에요.', query: 'JR Kameoka Station South Exit', directions: { from: 'Saga-Arashiyama Station', to: 'Kameoka Station', mode: 'transit' }, source: 'https://www.sumiya.ne.jp/access/' },
        { time: '14:55', title: '스미야 예약제 무료 셔틀', type: 'move', status: '신청됨', note: '이큐 예약 요청에 JR 가메오카역 14:55 편을 기재했어요. 숙소의 최종 수락과 남쪽 출구 승차 위치를 확인해 두세요. 숙소까지 약 20분, 도착 목표는 15:15입니다.', query: 'JR Kameoka Station South Exit', source: 'https://www.sumiya.ne.jp/access/' },
        { time: '15:15 전후', title: '스미야 기호안 체크인 · 온천', type: 'stay', status: '예약 완료', note: '야마노이오리 일반 화실, 두 명 1박 2식 ¥84,480. 코타츠가 있는 방이며 객실 전용 온천은 없어요. 짐을 풀고 공용 온천에서 쉬어갑니다.', query: 'Sumiya Kiho-an Yunohana Onsen', source: 'https://www.sumiya.ne.jp/room/' },
        { time: '16:30 희망', title: '둘만의 숲속 대절 노천탕', type: 'onsen', status: '선택', note: '미예약 선택 항목. 45분 ¥3,300으로 계획하고 가능 시간은 숙소에 확인해요. 16:30이 없다면 저녁 식사와 겹치지 않는 슬롯으로 요청합니다.', query: 'Sumiya Kiho-an Yunohana Onsen', source: 'https://www.sumiya.ne.jp/spa/' },
        { time: '저녁 · 숙소 지정', title: '가이세키와 긴 휴식', type: 'food', status: '예약 완료', note: '석식은 예약 금액에 포함. 시작 시각과 식사 장소는 체크인 때 확정해요. 다음 날 조식·역까지 돌아가는 셔틀도 함께 확인하고 코타츠에서 쉬어요.', query: 'Sumiya Kiho-an Yunohana Onsen', source: 'https://www.sumiya.ne.jp/cuisine/dining/' }
      ],
      food: [
        { meal: '점심', name: '요시야 아라시야마', note: '우동·유바 요리를 가볍게. 공식 안내 11:00–17:30. 대기가 길면 역으로 가는 길의 간단한 식당을 선택해 셔틀 시간을 지켜요.', price: '1인 예산 ¥1,500–2,500', query: '良彌 京都 嵐山', url: 'https://yoshiya-kyoto.jp/' },
        { meal: '석식 · 포함', name: '스미야 기호안 가이세키', note: '숙박에 포함된 두 명의 저녁. 음료·추가 주문은 별도일 수 있어요. 알레르기나 못 먹는 음식은 미리 숙소에 전달합니다.', price: '예약 금액에 포함', query: 'Sumiya Kiho-an Yunohana Onsen', url: 'https://www.sumiya.ne.jp/cuisine/dining/' }
      ],
      tip: '짐 보관이 어렵거나 비가 강하면 아라시야마 코스를 줄여요. 14:55 셔틀과 료칸 휴식을 우선하고, 큰 짐을 둔 채 와카 호텔로 다시 돌아오는 동선은 피합니다.'
    },
    {
      date: '2026-12-29', day: '화', num: '29', city: '유노하나 → 간사이공항',
      title: '아침 온천, 그리고 집으로',
      subtitle: '귀국편 시각에 맞춰 역산하기. 마지막 날에는 새 관광지를 욕심내지 않아요.',
      stay: '귀국', color: 'onsen', walk: '이동에 여유를 두는 날',
      events: [
        { time: '아침', title: '료칸 조식 · 마지막 온천', type: 'food', status: '예약 완료', note: '조식은 숙박에 포함돼 있어요. 식사 시각을 숙소와 정하고, 출발까지 시간이 남으면 공용 온천을 한 번 더 이용합니다.', query: 'Sumiya Kiho-an Yunohana Onsen', source: 'https://www.sumiya.ne.jp/cuisine/' },
        { time: '항공편에 맞춰 선택', title: '체크아웃 · 가메오카역 셔틀', type: 'move', status: '시간 확인 필요', note: '체크아웃은 11시까지. 공식 역행 셔틀은 09:00 / 10:00 / 11:00이며 예약제예요. 귀국편이 이르면 조식·출발부터 앞당겨야 하므로 편명 확인 후 확정합니다.', query: 'Sumiya Kiho-an Yunohana Onsen', source: 'https://www.sumiya.ne.jp/access/' },
        { time: '셔틀 도착 후', title: 'JR 가메오카 → 교토역', type: 'move', status: '추천', note: 'JR 사가노선으로 교토역 이동. 캐리어를 들고 환승하므로 여유를 두고, 하루카 승차권과 출발 플랫폼을 먼저 확인해요.', query: 'Kyoto Station', directions: { from: 'Kameoka Station', to: 'Kyoto Station', mode: 'transit' } },
        { time: '귀국편에서 역산', title: '하루카로 간사이공항', type: 'move', status: '시간 확인 필요', note: '교토역 → 간사이공항은 하루카가 편리해요. 공항 도착 목표는 항공편 출발 약 3시간 전으로 잡고, 실제 열차 시각과 체크인 마감은 항공편 확인 후 결정합니다.', query: 'Kansai Airport Station', directions: { from: 'Kyoto Station', to: 'Kansai Airport Station', mode: 'transit' }, source: 'https://www.westjr.co.jp/travel-information/en/tickets-passes/oneway/haruka/' },
        { time: '공항에서', title: '점심 · 기념품 · 귀국', type: 'food', status: '추천', note: '점심은 교토역에서 오래 줄 서기보다 공항에서 해결하는 편으로 계획해요. 항공사 터미널과 탑승구를 먼저 확인하고 남는 시간에 기념품을 봅니다.', query: 'Kansai International Airport restaurants', source: 'https://www.kansai-airport.or.jp/shop-and-dine/dine' }
      ],
      food: [
        { meal: '조식 · 포함', name: '스미야 기호안 조식', note: '예약에 포함된 두 명의 아침. 조식·출발 시간을 전날 숙소와 맞춰요.', price: '예약 금액에 포함', query: 'Sumiya Kiho-an Yunohana Onsen', url: 'https://www.sumiya.ne.jp/cuisine/' },
        { meal: '점심', name: '간사이공항 식당', note: '이용 터미널과 보안검색 전후 위치를 보고 선택. 식사를 위해 공항 도착 시간을 늦추지 않아요.', price: '1인 예산 ¥1,500–2,500', query: 'Kansai International Airport restaurants', url: 'https://www.kansai-airport.or.jp/shop-and-dine/dine' }
      ],
      tip: '귀국편 시각이 확정되기 전에는 교토역 쇼핑이나 추가 관광을 넣지 않아요. 열차 지연에 대비해 식사·쇼핑보다 공항 이동을 먼저 확보합니다.'
    }
  ],
  sources: [
    { title: '난카이 · 간사이공항 접근', url: 'https://www.nankai.co.jp/traffic/kix.html', note: '공항–난바 전철과 라피트 안내. 실제 탑승 열차는 입국 후 선택.', checked: '2026-11-13' },
    { title: '오사카시 · 오사카성 천수각', url: 'https://www.manabi.city.osaka.lg.jp/yoyaku/shisetsuInfoDetailInfo.html?kubunno=112&searchmode=2&shisetsu_code=283', note: '09:00–18:00, 성인 ¥1,200, 12/28–1/1 휴관 확인.', checked: '2026-11-13' },
    { title: '기요미즈데라 · 2026 관람 안내', url: 'https://www.kiyomizudera.or.jp/access.php', note: '12월 06:00–18:00 및 정식 진입로 확인.', checked: '2026-11-13' },
    { title: '덴류지 · 관람 안내', url: 'https://www.tenryuji.com/visit/', note: '정원 08:30–17:00, 성인 ¥500. 운룡도는 통상 주말·공휴일 공개.', checked: '2026-11-13' },
    { title: '와카 가와라마치 · 공식 안내', url: 'https://waka-hotels.com/kawaramachi/', note: '체크인 15시·체크아웃 11시, 역에서 도보 접근. 짐 보관은 별도 확인.', checked: '2026-11-13' },
    { title: '스미야 기호안 · 교통', url: 'https://www.sumiya.ne.jp/access/', note: '예약제 무료 셔틀, JR 가메오카에서 약 20분. 귀환 09/10/11시.', checked: '2026-11-13' },
    { title: '스미야 기호안 · 온천', url: 'https://www.sumiya.ne.jp/spa/', note: '대절 노천탕 45분 ¥3,000 세전, 예약 필요. 표시 예산은 세금 포함 ¥3,300.', checked: '2026-11-13' },
    { title: 'JR 서일본 · 하루카', url: 'https://www.westjr.co.jp/travel-information/en/tickets-passes/oneway/haruka/', note: '교토–간사이공항 이동 및 외국인용 편도 상품 조건 확인용.', checked: '2026-11-13' },
    { title: '도톤보리 이마이 · 본점', url: 'https://www.d-imai.com/shops/honten/', note: '메뉴·통상 영업시간·정기휴무 확인.', checked: '2026-11-13' },
    { title: '쿠시카츠 다루마 · 지점 안내', url: 'https://www.kushikatu-daruma.com/location/', note: '신세카이 점포의 영업시간과 예약 가능 여부 확인.', checked: '2026-11-13' },
    { title: '아지노야 · 공식 안내', url: 'https://ajinoya-okonomiyaki.com/top/', note: '난바 본점과 정기휴무 확인. 연말 임시 변경은 방문 전 재확인.', checked: '2026-11-13' },
    { title: '오멘 · 시조폰토초점', url: 'https://omen.co.jp/pages/shops', note: '영업시간·예약 불가·연말 휴무 안내 확인.', checked: '2026-11-13' },
    { title: '스시노 무사시 · 산조본점', url: 'https://sushinomusashi.com/shop/', note: '영업시간·최종 입장·정기휴무 확인.', checked: '2026-11-13' },
    { title: '요시야 · 아라시야마', url: 'https://yoshiya-kyoto.jp/', note: '메뉴 성격·위치·통상 영업시간 확인.', checked: '2026-11-13' },
    { title: 'OSAKA SUMO SHINSEKAI', url: 'https://www.osaka-sumo-shinsekai.com/', note: '쇼·체험 구성과 위치. 12/26 회차·결제 가격은 미확인, 미예약.', checked: '2026-11-13' }
  ]
};
