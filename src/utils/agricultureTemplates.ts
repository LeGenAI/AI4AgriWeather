// Agricultural Knowledge Entry Templates for Tanzania Smart Farm Assistant

export interface KnowledgeTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  icon: string;
  color: string;
  tags: string[];
  difficulty_level: string;
  knowledge_type: string;
  season?: string;
  template_content: string;
  example_questions: string[];
  crop_types?: string[];
  region_specific?: boolean;
  target_regions?: string[];
}

export const AGRICULTURAL_CATEGORIES = {
  weather_climate: {
    name: "Weather & Climate",
    icon: "🌤️",
    color: "bg-blue-100",
    subcategories: ["weather_forecast", "climate_adaptation", "seasonal_planning", "drought_management", "flood_preparedness"]
  },
  crop_management: {
    name: "Crop Management",
    icon: "🌾",
    color: "bg-green-100",
    subcategories: ["planting", "fertilization", "harvesting", "crop_rotation", "yield_optimization"]
  },
  pest_disease: {
    name: "Pest & Disease",
    icon: "🐛",
    color: "bg-red-100",
    subcategories: ["identification", "prevention", "treatment", "integrated_pest_management", "biological_control"]
  },
  market_information: {
    name: "Market Information",
    icon: "📈",
    color: "bg-purple-100",
    subcategories: ["pricing", "market_access", "supply_chain", "value_addition", "export_opportunities"]
  },
  soil_management: {
    name: "Soil Management",
    icon: "🌱",
    color: "bg-amber-100",
    subcategories: ["soil_testing", "fertility", "conservation", "erosion_control", "organic_matter"]
  },
  irrigation: {
    name: "Irrigation",
    icon: "💧",
    color: "bg-cyan-100",
    subcategories: ["water_management", "irrigation_systems", "efficiency", "scheduling", "rainwater_harvesting"]
  },
  general_farming: {
    name: "General Farming",
    icon: "🚜",
    color: "bg-gray-100",
    subcategories: ["farm_planning", "record_keeping", "financial_management", "equipment", "storage"]
  }
};

export const KNOWLEDGE_TEMPLATES: KnowledgeTemplate[] = [
  // Weather & Climate Templates
  {
    id: "weather_forecast_guide",
    title: "Weekly Weather Forecast Analysis",
    description: "Template for recording and analyzing weekly weather forecasts for farm planning",
    category: "weather_climate",
    subcategory: "weather_forecast",
    icon: "⛅",
    color: "bg-blue-100",
    tags: ["forecast", "planning", "weather"],
    difficulty_level: "beginner",
    knowledge_type: "guide",
    season: "year_round",
    template_content: `# Weekly Weather Forecast Analysis

## Date Range: [Insert dates]

### Current Weather Conditions
- Temperature: [Min/Max temperatures]
- Humidity: [Percentage]
- Rainfall: [Amount in mm]
- Wind: [Speed and direction]

### 7-Day Forecast
| Day | Temperature | Rainfall | Humidity | Wind | Notes |
|-----|-------------|----------|----------|------|-------|
| Mon | | | | | |
| Tue | | | | | |
| Wed | | | | | |
| Thu | | | | | |
| Fri | | | | | |
| Sat | | | | | |
| Sun | | | | | |

### Farming Implications
- **Planting decisions:** [What to plant/avoid planting]
- **Irrigation needs:** [Water requirements based on forecast]
- **Harvesting timing:** [Optimal harvesting windows]
- **Pest/disease risk:** [Weather-related risks to watch]

### Action Items
- [ ] [Specific action based on forecast]
- [ ] [Specific action based on forecast]
- [ ] [Specific action based on forecast]

### Notes
[Additional observations and insights]`,
    example_questions: [
      "What crops should I plant based on this week's forecast?",
      "How much irrigation will my crops need?",
      "When is the best time to harvest this week?"
    ],
    region_specific: false
  },

  {
    id: "drought_management_plan",
    title: "Drought Management Strategy",
    description: "Comprehensive plan for managing farm operations during drought conditions",
    category: "weather_climate",
    subcategory: "drought_management",
    icon: "☀️",
    color: "bg-orange-100",
    tags: ["drought", "water conservation", "crisis management"],
    difficulty_level: "intermediate",
    knowledge_type: "guide",
    season: "dry",
    template_content: `# Drought Management Strategy

## Drought Assessment
- **Severity Level:** [Mild/Moderate/Severe/Extreme]
- **Duration Expected:** [Weeks/Months]
- **Current Water Reserves:** [Amount available]

### Immediate Actions (0-2 weeks)
- [ ] Assess current water storage
- [ ] Prioritize crop watering schedule
- [ ] Implement water conservation measures
- [ ] Review livestock water needs

### Short-term Actions (2-8 weeks)
- [ ] Switch to drought-resistant crop varieties
- [ ] Modify planting schedules
- [ ] Implement mulching strategies
- [ ] Explore alternative water sources

### Long-term Actions (2+ months)
- [ ] Install water-efficient irrigation systems
- [ ] Develop rainwater harvesting infrastructure
- [ ] Plan drought-resistant crop rotations
- [ ] Build community water storage

### Water Conservation Techniques
1. **Mulching:** [Materials and application methods]
2. **Drip Irrigation:** [Setup and maintenance]
3. **Rainwater Harvesting:** [Collection and storage methods]
4. **Soil Management:** [Techniques to retain moisture]

### Crop Management During Drought
- **Priority Crops:** [Which crops to save first]
- **Water Allocation:** [Amount per crop type]
- **Harvest Timing:** [Early harvest considerations]

### Financial Impact Assessment
- **Expected Yield Reduction:** [Percentage]
- **Additional Costs:** [Irrigation, labor, etc.]
- **Insurance Claims:** [If applicable]

### Recovery Planning
- **Post-drought activities:** [Soil rehabilitation, replanting]
- **Lessons learned:** [What worked, what didn't]`,
    example_questions: [
      "How can I conserve water during drought?",
      "Which crops should I prioritize during water shortage?",
      "What are the best drought-resistant crops for my region?"
    ],
    region_specific: true,
    target_regions: ["northern", "central"]
  },

  // Crop Management Templates
  {
    id: "crop_planting_guide",
    title: "Crop Planting Plan",
    description: "Detailed planning template for crop planting activities",
    category: "crop_management",
    subcategory: "planting",
    icon: "🌱",
    color: "bg-green-100",
    tags: ["planting", "scheduling", "crops"],
    difficulty_level: "beginner",
    knowledge_type: "guide",
    season: "planting",
    template_content: `# Crop Planting Plan

## Season: [Wet/Dry Season Year]

### Crop Selection
| Crop | Variety | Area (hectares) | Planting Date | Expected Harvest | Market Price |
|------|---------|-----------------|---------------|------------------|--------------|
| | | | | | |
| | | | | | |
| | | | | | |

### Land Preparation
- **Field preparation started:** [Date]
- **Soil testing completed:** [Date and results]
- **Fertilizer application:** [Type and amount]
- **Field layout:** [Sketch or description]

### Planting Schedule
#### Week 1: [Dates]
- [ ] Plant [Crop name] in [Field section]
- [ ] Apply base fertilizer
- [ ] Set up irrigation if needed

#### Week 2: [Dates]
- [ ] Plant [Crop name] in [Field section]
- [ ] Monitor germination of week 1 plantings
- [ ] Weed control activities

#### Week 3: [Dates]
- [ ] Complete remaining plantings
- [ ] First inspection of all planted areas
- [ ] Adjust irrigation as needed

### Input Requirements
- **Seeds:** [Quantities and sources]
- **Fertilizers:** [Types and application rates]
- **Pesticides:** [If needed, types and rates]
- **Labor:** [Number of workers and days]

### Weather Considerations
- **Optimal conditions:** [Temperature, rainfall requirements]
- **Risk factors:** [Weather conditions to avoid]
- **Contingency plans:** [What to do if weather doesn't cooperate]

### Expected Timeline
- **Germination:** [Expected days]
- **First harvest:** [Expected date]
- **Peak harvest:** [Expected period]
- **Final harvest:** [Expected completion]

### Quality Targets
- **Expected yield:** [Per hectare]
- **Quality standards:** [Market requirements]
- **Post-harvest handling:** [Storage and processing plans]`,
    example_questions: [
      "What's the best time to plant maize in my region?",
      "How much fertilizer should I apply for optimal yield?",
      "What spacing should I use for different crops?"
    ],
    crop_types: ["maize", "rice", "beans", "cassava", "groundnuts"],
    region_specific: true
  },

  {
    id: "harvest_planning",
    title: "Harvest Planning & Management",
    description: "Comprehensive template for planning and managing harvest activities",
    category: "crop_management",
    subcategory: "harvesting",
    icon: "🚜",
    color: "bg-yellow-100",
    tags: ["harvest", "post-harvest", "quality"],
    difficulty_level: "intermediate",
    knowledge_type: "guide",
    season: "harvest",
    template_content: `# Harvest Planning & Management

## Crop: [Crop Name] | Season: [Year/Season]

### Pre-Harvest Assessment
- **Maturity indicators:** [Visual and physical signs]
- **Quality assessment:** [Current condition]
- **Estimated yield:** [Per hectare]
- **Weather forecast:** [Next 2 weeks]

### Harvest Schedule
| Field Section | Area | Maturity Date | Harvest Date | Labor Needed | Equipment |
|---------------|------|---------------|--------------|--------------|-----------|
| | | | | | |
| | | | | | |

### Labor Planning
- **Workers needed:** [Number per day]
- **Skills required:** [Harvesting, sorting, packaging]
- **Daily targets:** [Amount to harvest per day]
- **Payment structure:** [Daily wage or piece rate]

### Equipment & Materials
- [ ] Harvesting tools (sickles, baskets, etc.)
- [ ] Transport vehicles/carts
- [ ] Storage containers/bags
- [ ] Cleaning/washing equipment
- [ ] Weighing scales

### Quality Control
#### Harvest Standards
- **Maturity criteria:** [Specific indicators]
- **Size specifications:** [Market requirements]
- **Damage tolerance:** [Acceptable levels]

#### Grading System
- **Grade A:** [Specifications and expected percentage]
- **Grade B:** [Specifications and expected percentage]
- **Grade C:** [Specifications and expected percentage]
- **Rejects:** [What to do with substandard produce]

### Post-Harvest Handling
#### Immediate Actions (0-24 hours)
- [ ] Clean and sort harvested produce
- [ ] Remove field heat if applicable
- [ ] Package according to market requirements
- [ ] Transport to storage/market

#### Storage Preparation
- **Storage method:** [Fresh, dried, processed]
- **Storage duration:** [Expected time to market]
- **Storage conditions:** [Temperature, humidity requirements]
- **Pest control:** [Prevention measures]

### Market Preparation
- **Target markets:** [Local, regional, export]
- **Current market prices:** [Per unit]
- **Transport arrangements:** [Method and cost]
- **Documentation:** [Certificates, permits needed]

### Financial Tracking
| Item | Quantity | Price/Unit | Total Value |
|------|----------|------------|-------------|
| Grade A | | | |
| Grade B | | | |
| Grade C | | | |
| **Total Revenue** | | | |

### Lessons Learned
- **What went well:** [Successes]
- **Challenges faced:** [Problems encountered]
- **Improvements for next season:** [Action items]`,
    example_questions: [
      "When is the optimal time to harvest my crops?",
      "How can I improve post-harvest quality?",
      "What are the best storage methods for my produce?"
    ],
    crop_types: ["maize", "rice", "beans", "cassava", "vegetables"],
    region_specific: false
  },

  // Pest & Disease Templates
  {
    id: "pest_identification",
    title: "Pest & Disease Identification Guide",
    description: "Template for documenting and managing pest and disease issues",
    category: "pest_disease",
    subcategory: "identification",
    icon: "🔍",
    color: "bg-red-100",
    tags: ["pest control", "disease management", "identification"],
    difficulty_level: "intermediate",
    knowledge_type: "troubleshooting",
    season: "year_round",
    template_content: `# Pest & Disease Identification Guide

## Problem Report
- **Date observed:** [Date]
- **Crop affected:** [Crop name and variety]
- **Growth stage:** [Seedling/Vegetative/Flowering/Fruiting]
- **Weather conditions:** [Recent weather patterns]

### Symptoms Observed
#### Visual Symptoms
- **Leaves:** [Color, spots, holes, wilting, etc.]
- **Stems:** [Discoloration, lesions, rotting, etc.]
- **Fruits/Seeds:** [Spots, deformation, dropping, etc.]
- **Roots:** [If visible - rotting, discoloration]

#### Distribution Pattern
- **Area affected:** [Percentage of field]
- **Pattern:** [Random/Clustered/Edge of field/Whole field]
- **Progression:** [How fast is it spreading]

### Pest Identification
#### Insects Observed
| Pest Type | Size | Color | Location on Plant | Damage Type |
|-----------|------|-------|-------------------|-------------|
| | | | | |
| | | | | |

#### Other Pests
- **Nematodes:** [Root damage signs]
- **Rodents:** [Damage patterns]
- **Birds:** [Damage type and timing]

### Disease Identification
#### Fungal Diseases
- **Symptoms:** [Spots, molds, wilting patterns]
- **Environmental conditions:** [High humidity, poor drainage]
- **Affected parts:** [Leaves, stems, fruits, roots]

#### Bacterial Diseases
- **Symptoms:** [Water-soaked spots, ooze, yellowing]
- **Spread pattern:** [Through wounds, water splash]

#### Viral Diseases
- **Symptoms:** [Mottling, stunting, deformation]
- **Vector presence:** [Aphids, whiteflies, thrips]

### Management Strategy
#### Immediate Actions (0-3 days)
- [ ] Isolate affected plants if possible
- [ ] Remove and destroy severely affected parts
- [ ] Apply emergency treatment if available
- [ ] Document and photograph for reference

#### Short-term Management (1-2 weeks)
- [ ] Apply appropriate pesticide/fungicide
- [ ] Improve cultural practices
- [ ] Monitor treatment effectiveness
- [ ] Adjust irrigation/fertilization

#### Long-term Prevention (Next season)
- [ ] Select resistant varieties
- [ ] Improve field sanitation
- [ ] Plan crop rotation
- [ ] Install monitoring traps

### Treatment Record
| Date | Treatment Applied | Rate | Method | Cost | Effectiveness |
|------|-------------------|------|--------|------|---------------|
| | | | | | |

### Economic Impact
- **Estimated yield loss:** [Percentage]
- **Treatment costs:** [Total amount spent]
- **Prevented losses:** [Estimated value of saved crop]

### Follow-up Monitoring
- **Weekly checks:** [What to look for]
- **Success indicators:** [Signs of recovery]
- **Failure indicators:** [When to change strategy]`,
    example_questions: [
      "What pest is attacking my maize plants?",
      "How can I prevent fungal diseases in humid conditions?",
      "What's the best organic pest control method?"
    ],
    crop_types: ["all"],
    region_specific: false
  },

  // Market Information Templates
  {
    id: "market_price_tracking",
    title: "Market Price Analysis",
    description: "Template for tracking and analyzing market prices and trends",
    category: "market_information",
    subcategory: "pricing",
    icon: "💰",
    color: "bg-green-100",
    tags: ["market prices", "trends", "profit analysis"],
    difficulty_level: "intermediate",
    knowledge_type: "analysis",
    season: "year_round",
    template_content: `# Market Price Analysis

## Period: [Month/Year]

### Current Market Prices
| Crop | Grade | Local Market | Regional Market | Export Market | Last Week | % Change |
|------|-------|--------------|----------------|---------------|-----------|----------|
| | | | | | | |
| | | | | | | |

### Seasonal Trends
#### High Season Prices
- **Period:** [Months when prices are highest]
- **Average price:** [Price range]
- **Demand factors:** [Why prices are high]

#### Low Season Prices
- **Period:** [Months when prices are lowest]
- **Average price:** [Price range]
- **Supply factors:** [Why prices are low]

### Market Analysis
#### Demand Factors
- **Population growth:** [Impact on demand]
- **Economic conditions:** [Purchasing power]
- **Seasonal consumption:** [Festival periods, school terms]
- **Processing industry:** [Industrial demand]

#### Supply Factors
- **Local production:** [Harvest periods and volumes]
- **Import competition:** [Cheaper imports affecting prices]
- **Storage capacity:** [Ability to hold produce]
- **Transport costs:** [Access to markets]

### Price Forecasting
#### Next Month Prediction
- **Expected price range:** [High/Low estimates]
- **Confidence level:** [High/Medium/Low]
- **Key factors:** [What will drive prices]

#### Next Season Outlook
- **Planting recommendations:** [What to plant for best returns]
- **Market opportunities:** [New markets to explore]
- **Risk factors:** [Potential challenges]

### Profit Analysis
#### Production Costs
| Input | Cost per Hectare | Total Cost |
|-------|------------------|------------|
| Seeds | | |
| Fertilizer | | |
| Labor | | |
| Transport | | |
| **Total Cost** | | |

#### Revenue Calculation
| Scenario | Yield (kg/ha) | Price (TSh/kg) | Revenue | Profit | ROI % |
|----------|---------------|----------------|---------|--------|-------|
| Optimistic | | | | | |
| Realistic | | | | | |
| Pessimistic | | | | | |

### Marketing Strategy
#### Target Markets
- **Primary market:** [Local/Regional/Export]
- **Backup markets:** [Alternative options]
- **Direct sales:** [Farm gate, farmer markets]
- **Contract farming:** [Agreements with buyers]

#### Value Addition Opportunities
- **Processing options:** [Drying, milling, packaging]
- **Quality improvements:** [Organic certification, grading]
- **Timing strategies:** [When to sell for best prices]

### Action Items
- [ ] Monitor prices weekly
- [ ] Identify new market opportunities
- [ ] Negotiate better prices with buyers
- [ ] Explore value addition options
- [ ] Plan next season based on market outlook`,
    example_questions: [
      "What are the current market prices for maize?",
      "When is the best time to sell my harvest?",
      "Which crops are most profitable this season?"
    ],
    crop_types: ["maize", "rice", "beans", "cassava", "vegetables"],
    region_specific: true
  }
];

export const COMMON_CROPS_TANZANIA = [
  "maize", "rice", "cassava", "beans", "groundnuts", "sesame", "sorghum", "millet",
  "sweet_potato", "irish_potato", "banana", "plantain", "tomato", "onion", "cabbage",
  "cotton", "coffee", "tea", "cashew", "coconut", "sunflower", "sugarcane"
];

export const TANZANIA_REGIONS = [
  "arusha", "dar_es_salaam", "dodoma", "geita", "iringa", "kagera", "katavi",
  "kigoma", "kilimanjaro", "lindi", "manyara", "mara", "mbeya", "morogoro",
  "mtwara", "mwanza", "njombe", "pemba_north", "pemba_south", "pwani", "rukwa",
  "ruvuma", "shinyanga", "simiyu", "singida", "songwe", "tabora", "tanga",
  "unguja_north", "unguja_south"
];

// Helper functions
export const getCategoryIcon = (category: string): string => {
  return AGRICULTURAL_CATEGORIES[category]?.icon || "📝";
};

export const getCategoryColor = (category: string): string => {
  return AGRICULTURAL_CATEGORIES[category]?.color || "bg-gray-100";
};

export const getCategoryName = (category: string): string => {
  return AGRICULTURAL_CATEGORIES[category]?.name || category;
};

export const getTemplatesByCategory = (category: string): KnowledgeTemplate[] => {
  return KNOWLEDGE_TEMPLATES.filter(template => template.category === category);
};

export const searchTemplates = (query: string): KnowledgeTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return KNOWLEDGE_TEMPLATES.filter(template => 
    template.title.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};