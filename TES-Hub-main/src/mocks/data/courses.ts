import type Course from "../../types/course";

const courses: Course[] = [
  {
    id: "course-drip-irrigation-basics",
    type: "course",
    category: "Irrigation",
    slug: "drip-irrigation-basics",
    title: "Drip Irrigation Basics",
    authorId: "user-spac-consultant-1",
    status: "draft",
    visibility: "hidden",
    language: "en",
    topicTags: ["irrigation", "water-management"],
    region: { oblast: "Issyk-Kul" },
    coverImage: "/img/homepage/course-soil.jpg",
    createdAt: "2026-06-20T10:00:00.000Z",
    updatedAt: "2026-06-30T15:00:00.000Z",
    stats: { views: 0, likes: 0, comments: 0, saves: 0 },
    shortDescription:
      "Set up an affordable drip irrigation system for small plots.",
    longDescription:
      "Draft outline covering drip line sizing, emitter spacing, filtration, and seasonal maintenance for smallholder plots under 2 hectares.",
    level: "beginner",
    estimatedDurationHours: 3,
    sections: [
      {
        id: "sec-1",
        title: "Why Drip Irrigation",
        order: 1,
        lessons: [
          {
            id: "les-1",
            title: "Water Savings Overview",
            order: 1,
            type: "article",
            durationMinutes: 8,
            isFreePreview: true,
            summary: "Where the water actually goes on a furrow-irrigated plot.",
            content: {
              kind: "article",
              body: `
                <p>Furrow irrigation delivers roughly 45–60% of the water you pump to the root zone. The rest is lost to deep percolation below the roots, to evaporation off the wetted surface, and to tail-water running off the end of the row.</p>
                <p>A correctly sized drip system delivers 85–95%. On a one-hectare plot in Issyk-Kul that is the difference between 6,000 and 2,400 cubic metres over a season — and it arrives at the plant slowly enough that the soil never saturates.</p>
                <h3>What you gain besides water</h3>
                <ul>
                  <li>Fertiliser goes through the same line, exactly where the roots are.</li>
                  <li>The area between rows stays dry, so weed pressure drops sharply.</li>
                  <li>Leaves stay dry, which cuts fungal disease on tomato and cucumber.</li>
                </ul>
              `,
            },
          },
        ],
      },
    ],
    enrollmentCount: 0,
    rating: 0,
    reviewCount: 0,
    pricing: {
      model: "free",
      currency: "KGS",
      hasDiscount: false,
      isRefundable: false,
    },
    completionThresholdPercent: 80,
    surface: "academy",
  },
  {
    id: "course-livestock-vaccination-schedules",
    type: "course",
    category: "Livestock",
    slug: "livestock-vaccination-schedules",
    title: "Livestock Vaccination Schedules",
    authorId: "user-spac-consultant-1",
    status: "pending_review",
    visibility: "unlisted",
    language: "ru",
    topicTags: ["livestock"],
    region: { oblast: "Talas" },
    coverImage: "/img/homepage/course-soil.jpg",
    createdAt: "2026-05-02T09:00:00.000Z",
    updatedAt: "2026-06-25T12:00:00.000Z",
    stats: { views: 0, likes: 0, comments: 0, saves: 0 },
    shortDescription:
      "Vaccination timing and dosage for cattle, sheep, and goats.",
    longDescription:
      "Covers a full annual vaccination calendar for cattle, sheep, and goats, including cold-chain handling and record keeping. Submitted for editorial review.",
    level: "intermediate",
    estimatedDurationHours: 5,
    sections: [
      {
        id: "sec-1",
        title: "Annual Vaccination Calendar",
        order: 1,
        lessons: [
          {
            id: "les-1",
            title: "Cattle Schedule",
            order: 1,
            type: "article",
            durationMinutes: 12,
            isFreePreview: true,
            summary: "The twelve-month calendar for a mixed dairy-beef herd.",
            content: {
              kind: "article",
              body: `
                <p>Календарь строится вокруг двух опорных точек: весенний выгон на пастбище и осенний возврат в стойло. Всё остальное привязывается к ним.</p>
                <h3>Ключевые сроки</h3>
                <ul>
                  <li><strong>За 4 недели до выгона</strong> — сибирская язва, эмфизематозный карбункул.</li>
                  <li><strong>Телята 3–4 месяца</strong> — первая вакцинация против пастереллёза, ревакцинация через 21 день.</li>
                  <li><strong>Сухостойный период</strong> — вакцинация стельных коров для передачи антител с молозивом.</li>
                </ul>
                <p>Каждую процедуру записывайте в журнал: дата, серия препарата, срок годности, исполнитель.</p>
              `,
            },
          },
          {
            id: "les-2",
            title: "Sheep & Goat Schedule",
            order: 2,
            type: "article",
            durationMinutes: 10,
            isFreePreview: false,
            summary: "Adapting the herd calendar to small ruminants.",
            content: {
              kind: "article",
              body: `
                <p>Мелкий рогатый скот вакцинируют по тем же принципам, но дозы и интервалы отличаются, а отара движется на джайлоо раньше крупного скота.</p>
                <ul>
                  <li><strong>Энтеротоксемия</strong> — за 3 недели до окота, затем ягнятам в 2 месяца.</li>
                  <li><strong>Оспа овец</strong> — ежегодно, до перегона на летние пастбища.</li>
                  <li><strong>Бруцеллёз</strong> — только по предписанию районной ветслужбы.</li>
                </ul>
              `,
            },
          },
        ],
      },
      {
        id: "sec-2",
        title: "Cold Chain Handling",
        order: 2,
        lessons: [
          {
            id: "les-3",
            title: "Storage & Transport",
            order: 1,
            type: "video",
            durationMinutes: 15,
            isFreePreview: false,
            summary: "Holding +2…+8 °C from the district store to the pasture.",
            content: {
              kind: "video",
              url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
              poster: "/img/homepage/course-soil.jpg",
              transcript:
                "Вакцина, побывавшая выше +8 °C, считается непригодной, даже если флакон выглядит нормально. В термоконтейнер укладывают охлаждённые, а не замороженные хладоэлементы, термометр кладут рядом с флаконами, а не у стенки.",
            },
          },
        ],
      },
    ],
    enrollmentCount: 0,
    rating: 0,
    reviewCount: 0,
    pricing: {
      model: "one_time",
      amount: 250,
      currency: "KGS",
      hasDiscount: false,
      isRefundable: true,
      refundDays: 7,
    },
    completionThresholdPercent: 80,
    surface: "academy",
  },
  {
    id: "course-soil-health-fundamentals",
    type: "course",
    category: "Soil Health",
    slug: "soil-health-fundamentals",
    title: "Soil Health Fundamentals",
    authorId: "user-tes-author-1",
    status: "published",
    visibility: "public",
    language: "en",
    topicTags: ["soil-health", "organic-farming"],
    region: { oblast: "Chui" },
    coverImage: "/img/homepage/course-soil.jpg",
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-02-14T09:00:00.000Z",
    publishedAt: "2026-02-14T09:00:00.000Z",
    stats: { views: 5230, likes: 412, comments: 38, saves: 190 },
    shortDescription:
      "Understand soil composition, testing, and organic amendment strategy.",
    longDescription:
      "A complete introduction to soil texture, pH, organic matter, and nutrient cycling, with a hands-on soil testing module and a certificate on completion.",
    level: "beginner",
    estimatedDurationHours: 6,
    sections: [
      {
        id: "sec-1",
        title: "Soil Composition",
        order: 1,
        lessons: [
          {
            id: "les-1",
            title: "Sand, Silt, and Clay",
            order: 1,
            type: "article",
            durationMinutes: 10,
            isFreePreview: true,
            summary:
              "How particle size decides drainage, workability, and nutrient holding.",
            content: {
              kind: "article",
              body: `
                <p>Every soil is a mixture of three mineral particles — <strong>sand</strong>, <strong>silt</strong>, and <strong>clay</strong>. The proportion between them is called <em>soil texture</em>, and it is the single property you cannot change by management. Everything else — organic matter, pH, structure — is built on top of it.</p>
                <h3>The three particles</h3>
                <ul>
                  <li><strong>Sand (0.05–2 mm)</strong> — gritty to the touch. Large pores drain fast, warm up early in spring, and hold very little nutrition.</li>
                  <li><strong>Silt (0.002–0.05 mm)</strong> — smooth, like dry flour. Holds water well and is the most erodible fraction.</li>
                  <li><strong>Clay (&lt; 0.002 mm)</strong> — sticky when wet, hard when dry. Enormous surface area, so it stores most of the soil's nutrients.</li>
                </ul>
                <h3>The ribbon test</h3>
                <p>You do not need a laboratory to estimate texture. Take a walnut-sized ball of moist soil and press it between thumb and forefinger into a ribbon:</p>
                <ul>
                  <li>No ribbon forms — <strong>sandy</strong> soil.</li>
                  <li>Ribbon breaks under 2.5 cm — <strong>loam</strong>.</li>
                  <li>Ribbon reaches 5 cm or more — <strong>clay</strong>.</li>
                </ul>
                <blockquote>Loam — roughly 40% sand, 40% silt, 20% clay — is the target most Chui valley growers are managing toward. It drains without drying out and holds nutrients without waterlogging.</blockquote>
                <h3>Why it matters in practice</h3>
                <p>Texture sets your irrigation interval, your tillage window, and how much of an amendment you must apply. A sandy plot in Issyk-Kul may need water every second day; a clay plot two valleys over may need it once a week and will smear into a hardpan if you work it wet.</p>
                <p>In the next lesson you will read an actual laboratory report and connect these numbers to a fertiliser decision.</p>
              `,
            },
            resources: [
              {
                id: "res-les-1-texture-triangle",
                label: "USDA soil texture triangle (printable)",
                url: "/resources/soil-texture-triangle.pdf",
                sizeKb: 480,
              },
            ],
          },
          {
            id: "les-2",
            title: "Reading a Soil Test Report",
            order: 2,
            type: "pdf",
            durationMinutes: 12,
            isFreePreview: true,
            summary:
              "A worked example of a Kyrgyz laboratory report, line by line.",
            content: {
              kind: "pdf",
              url: "/resources/soil-test-report-walkthrough.pdf",
              fileName: "soil-test-report-walkthrough.pdf",
              sizeKb: 1840,
              summary:
                "An annotated report from the Bishkek agrochemical laboratory: pH, humus percentage, mobile phosphorus and exchangeable potassium, with the recommended action beside each row.",
            },
            resources: [
              {
                id: "res-les-2-sampling",
                label: "Field sampling checklist",
                url: "/resources/soil-sampling-checklist.pdf",
                sizeKb: 220,
              },
            ],
          },
        ],
      },
      {
        id: "sec-2",
        title: "Organic Amendments",
        order: 2,
        lessons: [
          {
            id: "les-3",
            title: "Compost & Manure",
            order: 1,
            type: "video",
            durationMinutes: 18,
            isFreePreview: false,
            summary:
              "Building a thermophilic pile and knowing when manure is safe to apply.",
            content: {
              kind: "video",
              url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
              poster: "/img/homepage/course-soil.jpg",
              transcript:
                "A finished compost pile smells of forest floor, not of ammonia. In this lesson we build a 1.5 metre pile at a 25:1 carbon-to-nitrogen ratio, turn it on days 4, 8 and 14, and hold 55°C for three consecutive days to kill weed seed and pathogens. Fresh manure is never applied within 120 days of a harvested root crop.",
            },
            resources: [
              {
                id: "res-les-3-cn-table",
                label: "Carbon-to-nitrogen ratio table",
                url: "/resources/compost-cn-ratios.pdf",
                sizeKb: 310,
              },
            ],
          },
          {
            id: "les-4",
            title: "Cover Cropping",
            order: 2,
            type: "article",
            durationMinutes: 9,
            isFreePreview: false,
            summary:
              "Choosing a cover crop for the short Kyrgyz shoulder season.",
            content: {
              kind: "article",
              body: `
                <p>A cover crop is a crop you grow for the soil rather than for the market. It protects the surface from wind and water erosion, feeds soil biology with living roots, and — in the case of legumes — fixes atmospheric nitrogen into a form the next crop can use.</p>
                <h3>Matching the crop to the gap</h3>
                <ul>
                  <li><strong>Winter rye</strong> — germinates down to 3°C, the safest choice after a late October harvest.</li>
                  <li><strong>Hairy vetch</strong> — fixes 60–100 kg of nitrogen per hectare, but needs six weeks of growth before hard frost.</li>
                  <li><strong>Oilseed radish</strong> — a deep taproot that breaks tillage pan, then winter-kills and needs no termination pass.</li>
                  <li><strong>Buckwheat</strong> — a 35-day summer gap filler that smothers weeds and pulls phosphorus into the topsoil.</li>
                </ul>
                <h3>Termination</h3>
                <p>Terminate two to three weeks before planting the cash crop. Roll or mow at flowering — before seed set — otherwise this year's cover crop becomes next year's weed problem.</p>
                <blockquote>Rule of thumb: never leave soil bare over winter. Even a thin rye stand returns more organic matter than an empty field, and holds the topsoil through the spring melt.</blockquote>
              `,
            },
          },
          {
            id: "les-5",
            title: "Module Quiz",
            order: 3,
            type: "quiz",
            durationMinutes: 10,
            isFreePreview: false,
            summary:
              "Six questions covering texture, testing, and amendment strategy.",
            content: { kind: "quiz", quizId: "quiz-soil-health-final" },
          },
          {
            id: "les-6",
            title: "FAO Soil Portal",
            order: 4,
            type: "external_link",
            durationMinutes: 5,
            isFreePreview: false,
            summary:
              "Optional reading: global soil maps and the Central Asian dataset.",
            content: {
              kind: "external_link",
              url: "https://www.fao.org/soils-portal/en/",
              summary:
                "The FAO Soils Portal hosts the Harmonized World Soil Database. Open the Central Asia layer and locate your own oblast before returning here.",
            },
          },
        ],
      },
    ],
    enrollmentCount: 1840,
    rating: 4.7,
    reviewCount: 203,
    certificateTemplate: "cert-template-soil-health",
    completionThresholdPercent: 80,
    pricing: {
      model: "free",
      currency: "KGS",
      hasDiscount: false,
      isRefundable: false,
    },
    surface: "academy",
  },
  {
    id: "course-crypto-farming-riches",
    type: "course",
    category: "Agribusiness",
    slug: "crypto-farming-riches",
    title: "Get Rich Quick With Crypto Farming",
    authorId: "user-spac-consultant-1",
    status: "published",
    visibility: "hidden",
    language: "ru",
    topicTags: ["technology"],
    createdAt: "2026-04-01T09:00:00.000Z",
    coverImage: "/img/homepage/course-soil.jpg",
    updatedAt: "2026-04-05T09:00:00.000Z",
    rejectionReason:
      "Off-topic for TES Academy and makes unverifiable financial claims. Please resubmit with agronomy-focused content.",
    stats: { views: 12, likes: 0, comments: 0, saves: 0 },
    shortDescription:
      "Unrelated financial content, rejected by editorial review.",
    longDescription:
      "Rejected submission kept for author reference on required revisions.",
    level: "beginner",
    estimatedDurationHours: 1,
    sections: [],
    enrollmentCount: 0,
    rating: 3.6,
    reviewCount: 0,
    pricing: {
      model: "one_time",
      amount: 500,
      currency: "USD",
      hasDiscount: false,
      isRefundable: false,
    },
    completionThresholdPercent: 80,
    surface: "academy",
  },
  {
    id: "course-greenhouse-tomato-2023",
    type: "course",
    category: "Crop Production",
    slug: "greenhouse-tomato-production-2023",
    title: "Greenhouse Tomato Production (2023 Edition)",
    authorId: "user-tes-author-1",
    status: "archived",
    visibility: "unlisted",
    language: "en",
    topicTags: ["greenhouse"],
    region: { oblast: "Chui" },
    coverImage: "/img/homepage/course-soil.jpg",
    createdAt: "2023-03-01T09:00:00.000Z",
    updatedAt: "2026-01-05T09:00:00.000Z",
    publishedAt: "2023-03-15T09:00:00.000Z",
    stats: { views: 9800, likes: 640, comments: 71, saves: 300 },
    shortDescription:
      "Superseded by the 2026 edition; kept read-only for past graduates.",
    longDescription:
      "Original greenhouse tomato course. Archived after the 2026 edition replaced it with updated pest-resistant variety guidance.",
    level: "intermediate",
    estimatedDurationHours: 8,
    sections: [
      {
        id: "sec-1",
        title: "Greenhouse Setup",
        order: 1,
        lessons: [
          {
            id: "les-1",
            title: "Structure & Ventilation",
            order: 1,
            type: "article",
            durationMinutes: 14,
            isFreePreview: true,
            summary: "Ridge vents, side rollers, and the 20% opening rule.",
            content: {
              kind: "article",
              body: `
                <p>A tomato house that cannot vent 20% of its floor area will sit above 32°C on a clear July afternoon, and pollen becomes sterile above that point. Ventilation is not a comfort question — it is a yield question.</p>
                <h3>Superseded content</h3>
                <p>This edition is kept read-only for past graduates. The 2026 edition covers pest-resistant varieties and updated ridge-vent sizing.</p>
              `,
            },
          },
        ],
      },
    ],
    enrollmentCount: 2400,
    rating: 4.3,
    reviewCount: 288,
    certificateTemplate: "cert-template-greenhouse-2023",
    completionThresholdPercent: 80,
    pricing: {
      model: "one_time",
      amount: 300,
      currency: "KGS",
      hasDiscount: true,
      discountPercent: 20,
      isRefundable: false,
    },
    surface: "academy",
  },
];

export default courses;
