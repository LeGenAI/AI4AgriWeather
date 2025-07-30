import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClassificationResult {
  category: string;
  subcategory?: string;
  crops: string[];
  seasons: string[];
  activities: string[];
  regions: string[];
  confidence: number;
  keywords: string[];
  language: string;
}

// 탄자니아 주요 작물
const TANZANIAN_CROPS = {
  en: {
    // 곡물류
    maize: ['maize', 'corn', 'mahindi'],
    rice: ['rice', 'mchele', 'paddy'],
    sorghum: ['sorghum', 'mtama'],
    millet: ['millet', 'ulezi', 'finger millet'],
    wheat: ['wheat', 'ngano'],
    
    // 콩류
    beans: ['beans', 'maharage', 'common beans', 'kidney beans'],
    pigeon_peas: ['pigeon peas', 'mbaazi'],
    cowpeas: ['cowpeas', 'kunde'],
    chickpeas: ['chickpeas', 'dengu'],
    groundnuts: ['groundnuts', 'karanga', 'peanuts'],
    
    // 뿌리작물
    cassava: ['cassava', 'muhogo', 'manioc'],
    sweet_potato: ['sweet potato', 'viazi vitamu', 'batata'],
    irish_potato: ['irish potato', 'viazi vya kizungu', 'potato'],
    yam: ['yam', 'kiazi kikuu'],
    
    // 환금작물
    coffee: ['coffee', 'kahawa', 'arabica', 'robusta'],
    tea: ['tea', 'chai'],
    cotton: ['cotton', 'pamba'],
    tobacco: ['tobacco', 'tumbaku'],
    cashew: ['cashew', 'korosho', 'cashew nuts'],
    sisal: ['sisal', 'katani'],
    
    // 과일류
    banana: ['banana', 'ndizi', 'plantain'],
    mango: ['mango', 'maembe'],
    avocado: ['avocado', 'parachichi'],
    orange: ['orange', 'machungwa', 'citrus'],
    pineapple: ['pineapple', 'nanasi'],
    coconut: ['coconut', 'nazi'],
    
    // 채소류
    tomato: ['tomato', 'nyanya'],
    onion: ['onion', 'vitunguu'],
    cabbage: ['cabbage', 'kabichi'],
    spinach: ['spinach', 'mchicha'],
    okra: ['okra', 'bamia']
  },
  sw: {
    // 스와힐리어 작물명
    mahindi: 'maize',
    mchele: 'rice',
    mtama: 'sorghum',
    ulezi: 'millet',
    ngano: 'wheat',
    maharage: 'beans',
    mbaazi: 'pigeon_peas',
    kunde: 'cowpeas',
    dengu: 'chickpeas',
    karanga: 'groundnuts',
    muhogo: 'cassava',
    'viazi vitamu': 'sweet_potato',
    'viazi vya kizungu': 'irish_potato',
    kahawa: 'coffee',
    chai: 'tea',
    pamba: 'cotton',
    tumbaku: 'tobacco',
    korosho: 'cashew',
    katani: 'sisal',
    ndizi: 'banana',
    maembe: 'mango',
    parachichi: 'avocado',
    machungwa: 'orange',
    nanasi: 'pineapple',
    nazi: 'coconut',
    nyanya: 'tomato',
    vitunguu: 'onion',
    kabichi: 'cabbage',
    mchicha: 'spinach',
    bamia: 'okra'
  }
};

// 탄자니아 농업 계절
const TANZANIAN_SEASONS = {
  masika: {
    name: 'Masika (Long Rains)',
    months: [3, 4, 5],
    keywords: ['masika', 'long rains', 'mvua za masika', 'march', 'april', 'may']
  },
  vuli: {
    name: 'Vuli (Short Rains)',
    months: [10, 11, 12],
    keywords: ['vuli', 'short rains', 'mvua za vuli', 'october', 'november', 'december']
  },
  kiangazi: {
    name: 'Kiangazi (Dry Season)',
    months: [6, 7, 8, 9],
    keywords: ['kiangazi', 'dry season', 'kipindi cha kiangazi', 'june', 'july', 'august', 'september']
  },
  kipupwe: {
    name: 'Kipupwe (Cold Dry)',
    months: [6, 7],
    keywords: ['kipupwe', 'cold season', 'baridi']
  }
};

// 농업 활동
const FARMING_ACTIVITIES = {
  en: {
    planting: ['planting', 'sowing', 'seeding', 'transplanting', 'kupanda'],
    harvesting: ['harvesting', 'harvest', 'picking', 'kuvuna'],
    weeding: ['weeding', 'weed control', 'kupalilia'],
    fertilizing: ['fertilizing', 'fertilizer', 'manure', 'mbolea', 'fertilization'],
    irrigation: ['irrigation', 'watering', 'umwagiliaji', 'drip irrigation', 'sprinkler'],
    pest_control: ['pest control', 'pesticide', 'spraying', 'dawa', 'pest management'],
    disease_control: ['disease control', 'fungicide', 'disease management', 'magonjwa'],
    land_preparation: ['land preparation', 'plowing', 'tilling', 'kulima', 'harrowing'],
    storage: ['storage', 'post-harvest', 'kuhifadhi', 'warehouse', 'ghala'],
    marketing: ['marketing', 'market', 'soko', 'selling', 'kuuza', 'price', 'bei'],
    processing: ['processing', 'value addition', 'usindikaji', 'milling', 'kusaga']
  },
  sw: {
    kupanda: 'planting',
    kuvuna: 'harvesting',
    kupalilia: 'weeding',
    mbolea: 'fertilizing',
    umwagiliaji: 'irrigation',
    dawa: 'pest_control',
    magonjwa: 'disease_control',
    kulima: 'land_preparation',
    kuhifadhi: 'storage',
    soko: 'marketing',
    usindikaji: 'processing'
  }
};

// 문서 카테고리
const DOCUMENT_CATEGORIES = {
  crop_guide: {
    name: 'Crop Production Guide',
    keywords: ['guide', 'manual', 'how to grow', 'cultivation', 'production', 'mwongozo']
  },
  weather_advisory: {
    name: 'Weather Advisory',
    keywords: ['weather', 'forecast', 'climate', 'rainfall', 'temperature', 'hali ya hewa']
  },
  market_info: {
    name: 'Market Information',
    keywords: ['market', 'price', 'demand', 'supply', 'trade', 'soko', 'bei']
  },
  pest_disease: {
    name: 'Pest & Disease Management',
    keywords: ['pest', 'disease', 'control', 'management', 'infestation', 'wadudu', 'magonjwa']
  },
  soil_fertility: {
    name: 'Soil & Fertility',
    keywords: ['soil', 'fertility', 'nutrient', 'ph', 'organic matter', 'udongo', 'rutuba']
  },
  farming_technique: {
    name: 'Farming Techniques',
    keywords: ['technique', 'method', 'practice', 'technology', 'innovation', 'mbinu']
  },
  policy_regulation: {
    name: 'Policy & Regulations',
    keywords: ['policy', 'regulation', 'law', 'government', 'subsidy', 'sera', 'sheria']
  },
  research_report: {
    name: 'Research & Reports',
    keywords: ['research', 'study', 'report', 'analysis', 'findings', 'utafiti', 'ripoti']
  }
};

// 탄자니아 주요 농업 지역
const TANZANIAN_REGIONS = {
  northern: ['arusha', 'kilimanjaro', 'manyara', 'tanga'],
  central: ['dodoma', 'singida', 'tabora'],
  southern: ['iringa', 'mbeya', 'njombe', 'ruvuma', 'songwe'],
  southern_highlands: ['mbeya', 'iringa', 'njombe', 'ruvuma'],
  eastern: ['dar es salaam', 'morogoro', 'pwani', 'coast'],
  western: ['kigoma', 'katavi', 'rukwa'],
  lake_zone: ['mwanza', 'mara', 'kagera', 'geita', 'simiyu', 'shinyanga'],
  zanzibar: ['zanzibar', 'pemba', 'unguja']
};

// 언어 감지
function detectLanguage(text: string): string {
  const swahiliWords = ['na', 'ya', 'wa', 'kwa', 'ni', 'au', 'la', 'za', 'cha', 'vya', 'mwa'];
  const koreanPattern = /[가-힣]/;
  
  const words = text.toLowerCase().split(/\s+/);
  let swahiliCount = 0;
  
  for (const word of words) {
    if (swahiliWords.includes(word)) {
      swahiliCount++;
    }
  }
  
  if (koreanPattern.test(text)) {
    return 'ko';
  } else if (swahiliCount > words.length * 0.1) {
    return 'sw';
  }
  
  return 'en';
}

// 작물 추출
function extractCrops(text: string): string[] {
  const crops = new Set<string>();
  const lowerText = text.toLowerCase();
  
  // 영어 작물명 검색
  for (const [cropKey, variations] of Object.entries(TANZANIAN_CROPS.en)) {
    for (const variation of variations) {
      if (lowerText.includes(variation.toLowerCase())) {
        crops.add(cropKey);
      }
    }
  }
  
  // 스와힐리어 작물명 검색
  for (const [swahiliName, cropKey] of Object.entries(TANZANIAN_CROPS.sw)) {
    if (lowerText.includes(swahiliName.toLowerCase())) {
      crops.add(cropKey);
    }
  }
  
  return Array.from(crops);
}

// 계절 추출
function extractSeasons(text: string): string[] {
  const seasons = new Set<string>();
  const lowerText = text.toLowerCase();
  const currentMonth = new Date().getMonth() + 1;
  
  for (const [seasonKey, seasonData] of Object.entries(TANZANIAN_SEASONS)) {
    for (const keyword of seasonData.keywords) {
      if (lowerText.includes(keyword)) {
        seasons.add(seasonData.name);
      }
    }
  }
  
  // 현재 월에 해당하는 계절 추가 (관련성이 있을 수 있음)
  for (const [seasonKey, seasonData] of Object.entries(TANZANIAN_SEASONS)) {
    if (seasonData.months.includes(currentMonth)) {
      seasons.add(seasonData.name);
    }
  }
  
  return Array.from(seasons);
}

// 농업 활동 추출
function extractActivities(text: string): string[] {
  const activities = new Set<string>();
  const lowerText = text.toLowerCase();
  
  // 영어 활동 검색
  for (const [activityKey, keywords] of Object.entries(FARMING_ACTIVITIES.en)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        activities.add(activityKey);
      }
    }
  }
  
  // 스와힐리어 활동 검색
  for (const [swahiliName, activityKey] of Object.entries(FARMING_ACTIVITIES.sw)) {
    if (lowerText.includes(swahiliName.toLowerCase())) {
      activities.add(activityKey);
    }
  }
  
  return Array.from(activities);
}

// 지역 추출
function extractRegions(text: string): string[] {
  const regions = new Set<string>();
  const lowerText = text.toLowerCase();
  
  for (const [zoneKey, regionList] of Object.entries(TANZANIAN_REGIONS)) {
    for (const region of regionList) {
      if (lowerText.includes(region)) {
        regions.add(region);
        regions.add(zoneKey); // 지역대도 추가
      }
    }
  }
  
  return Array.from(regions);
}

// 카테고리 결정
function determineCategory(text: string, title: string): { category: string; confidence: number } {
  const combinedText = `${title} ${text}`.toLowerCase();
  let bestMatch = { category: 'general', confidence: 0 };
  
  for (const [categoryKey, categoryData] of Object.entries(DOCUMENT_CATEGORIES)) {
    let score = 0;
    for (const keyword of categoryData.keywords) {
      if (combinedText.includes(keyword)) {
        score += keyword.length > 5 ? 2 : 1; // 긴 키워드에 더 높은 가중치
      }
    }
    
    if (score > bestMatch.confidence) {
      bestMatch = { category: categoryData.name, confidence: score };
    }
  }
  
  // 신뢰도 정규화 (0-1 범위)
  bestMatch.confidence = Math.min(bestMatch.confidence / 10, 1);
  
  return bestMatch;
}

// 주요 키워드 추출
function extractKeywords(text: string): string[] {
  const keywords = new Set<string>();
  const lowerText = text.toLowerCase();
  
  // 모든 카테고리의 키워드 수집
  const allKeywords = [
    ...Object.values(TANZANIAN_CROPS.en).flat(),
    ...Object.keys(TANZANIAN_CROPS.sw),
    ...Object.values(TANZANIAN_SEASONS).flatMap(s => s.keywords),
    ...Object.values(FARMING_ACTIVITIES.en).flat(),
    ...Object.keys(FARMING_ACTIVITIES.sw),
    ...Object.values(TANZANIAN_REGIONS).flat()
  ];
  
  // 텍스트에서 발견된 키워드 추출
  for (const keyword of allKeywords) {
    if (keyword.length > 3 && lowerText.includes(keyword.toLowerCase())) {
      keywords.add(keyword);
    }
  }
  
  // 상위 10개 키워드만 반환
  return Array.from(keywords).slice(0, 10);
}

// 문서 분류
function classifyDocument(title: string, content: string): ClassificationResult {
  const fullText = `${title} ${content}`;
  
  // 언어 감지
  const language = detectLanguage(fullText);
  
  // 각 요소 추출
  const crops = extractCrops(fullText);
  const seasons = extractSeasons(fullText);
  const activities = extractActivities(fullText);
  const regions = extractRegions(fullText);
  const keywords = extractKeywords(fullText);
  
  // 카테고리 결정
  const { category, confidence } = determineCategory(content, title);
  
  // 세부 카테고리 결정 (작물별)
  let subcategory: string | undefined;
  if (crops.length > 0) {
    const mainCrop = crops[0];
    subcategory = `${mainCrop}_${category.toLowerCase().replace(/\s+/g, '_')}`;
  }
  
  return {
    category,
    subcategory,
    crops,
    seasons,
    activities,
    regions,
    confidence,
    keywords,
    language
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sourceId, title, content, filePath } = await req.json()

    if (!sourceId) {
      throw new Error('Source ID is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get content if not provided
    let documentContent = content
    let documentTitle = title

    if (!documentContent && filePath) {
      // Try to fetch content from the source
      const { data: sourceData, error: sourceError } = await supabase
        .from('sources')
        .select('title, content, summary')
        .eq('id', sourceId)
        .single()

      if (sourceError) {
        console.error('Error fetching source:', sourceError)
      } else {
        documentTitle = sourceData.title || title
        documentContent = sourceData.content || sourceData.summary || ''
      }
    }

    // If still no content, return minimal classification
    if (!documentContent) {
      documentContent = documentTitle || ''
    }

    // Classify the document
    const classification = classifyDocument(documentTitle, documentContent)

    // Update source metadata with classification
    const { error: updateError } = await supabase
      .from('sources')
      .update({
        metadata: {
          classification,
          classified_at: new Date().toISOString(),
          auto_classified: true
        }
      })
      .eq('id', sourceId)

    if (updateError) {
      console.error('Error updating source metadata:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        classification,
        sourceId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in classify-document function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})