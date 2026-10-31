import type Quiz from "../../types/quiz";

const quizzes: Quiz[] = [
  {
    id: "quiz-soil-health-final",
    courseId: "course-soil-health-fundamentals",
    lessonId: "les-5",
    title: "Soil Health Fundamentals — Module Quiz",
    description:
      "Six questions on texture, laboratory reports, and amendment strategy. You need 70% to pass, and you may retake the quiz up to three times.",
    passScorePercent: 70,
    timeLimitMinutes: 15,
    maxAttempts: 3,
    questions: [
      {
        id: "q-1",
        prompt:
          "Which mineral particle holds the largest share of a soil's plant-available nutrients?",
        type: "single",
        points: 1,
        options: [
          { id: "q-1-a", text: "Sand" },
          { id: "q-1-b", text: "Silt" },
          { id: "q-1-c", text: "Clay" },
          { id: "q-1-d", text: "Gravel" },
        ],
        correctOptionIds: ["q-1-c"],
        explanation:
          "Clay particles are under 0.002 mm, so a handful carries an enormous charged surface area. That surface is what holds exchangeable nutrients against leaching.",
      },
      {
        id: "q-2",
        prompt:
          "In the ribbon test, a moist soil sample forms a ribbon about 2 cm long before breaking. What is the texture class?",
        type: "single",
        points: 1,
        options: [
          { id: "q-2-a", text: "Sand" },
          { id: "q-2-b", text: "Loam" },
          { id: "q-2-c", text: "Clay" },
          { id: "q-2-d", text: "The test is inconclusive" },
        ],
        correctOptionIds: ["q-2-b"],
        explanation:
          "A ribbon shorter than 2.5 cm indicates loam. No ribbon at all means sand; 5 cm or more means clay.",
      },
      {
        id: "q-3",
        prompt: "Which statements about cover crops are correct?",
        type: "multiple",
        points: 2,
        options: [
          {
            id: "q-3-a",
            text: "Legume cover crops fix atmospheric nitrogen for the following crop.",
          },
          {
            id: "q-3-b",
            text: "Cover crops should be terminated after they set seed.",
          },
          {
            id: "q-3-c",
            text: "Winter rye germinates at temperatures as low as 3°C.",
          },
          {
            id: "q-3-d",
            text: "Bare soil over winter builds more organic matter than a cover crop.",
          },
        ],
        correctOptionIds: ["q-3-a", "q-3-c"],
        explanation:
          "Terminate at flowering, before seed set, or the cover crop volunteers as a weed. Bare winter soil loses organic matter and topsoil during the spring melt.",
      },
      {
        id: "q-4",
        prompt:
          "Fresh manure may be applied to a plot the same week a root crop is harvested.",
        type: "true_false",
        points: 1,
        options: [
          { id: "q-4-a", text: "True" },
          { id: "q-4-b", text: "False" },
        ],
        correctOptionIds: ["q-4-b"],
        explanation:
          "Fresh manure is kept at least 120 days away from the harvest of a crop whose edible part contacts the soil.",
      },
      {
        id: "q-5",
        prompt:
          "A compost pile must hold which temperature for three consecutive days to reliably kill weed seed and pathogens?",
        type: "single",
        points: 1,
        options: [
          { id: "q-5-a", text: "35°C" },
          { id: "q-5-b", text: "45°C" },
          { id: "q-5-c", text: "55°C" },
          { id: "q-5-d", text: "75°C" },
        ],
        correctOptionIds: ["q-5-c"],
        explanation:
          "55°C held for three days is the standard thermophilic threshold. Above 70°C the microbial population that drives decomposition begins to die off.",
      },
      {
        id: "q-6",
        prompt:
          "Which two figures on a laboratory report drive the decision to add organic matter?",
        type: "multiple",
        points: 2,
        options: [
          { id: "q-6-a", text: "Humus percentage" },
          { id: "q-6-b", text: "Soil colour code" },
          { id: "q-6-c", text: "Cation exchange capacity" },
          { id: "q-6-d", text: "Sample depth" },
        ],
        correctOptionIds: ["q-6-a", "q-6-c"],
        explanation:
          "Humus percentage tells you how much organic matter is present; cation exchange capacity tells you how much nutrition the soil can hold once you add it.",
      },
    ],
  },
];

export const findQuizById = (id: string) => quizzes.find((q) => q.id === id);

export default quizzes;
