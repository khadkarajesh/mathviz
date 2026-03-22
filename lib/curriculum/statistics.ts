import { CurriculumTopic } from '@/types/curriculum';

export const statisticsTopics: CurriculumTopic[] = [
  {
    id: 'mean-median-mode',
    subject: 'statistics',
    title: 'Mean, Median & Mode',
    description: 'Three ways to describe the "center" of a dataset — and why you would choose each one.',
    grades: [6],
    standards: ['CCSS.MATH.6.SP.A.3', 'CCSS.MATH.6.SP.B.5'],
    icon: '⚖',
    color: 'sky',
    prerequisiteTopicIds: [],
    lessons: [
      {
        id: 'mean-balance-point',
        topicId: 'mean-median-mode',
        title: 'Mean as a Balance Point',
        estimatedMinutes: 12,
        narrative: {
          setting: 'Your school is measuring how many books students read per month. You need to summarize the data for the school board — one number that represents the whole class.',
          character: 'Sam the Student Reporter',
          problemStatement: 'Find the mean by thinking of it as the balance point of a number line.',
          realWorldConnection: 'Averages appear in test scores, sports statistics, weather data, stock prices — everywhere a single number needs to represent a group.',
        },
        phases: [
          {
            phase: 'concrete',
            instructionText: 'Each dot is a student\'s book count. Drag the fulcrum (▲) to find the spot where the number line balances perfectly.',
            canvasComponent: 'BalanceCanvas',
            canvasInitialState: {
              data: [2, 4, 4, 5, 8, 7],
              fulcrumAt: 4,
            },
            formativeCheck: {
              prompt: 'Where does the number line balance? (What is the mean of 2, 4, 4, 5, 8, 7?)',
              type: 'numeric',
              correctAnswer: 5,
              tolerance: 5,
            },
            hint: 'Imagine each dot has weight. Move the fulcrum until it feels balanced — neither side is heavier.',
          },
          {
            phase: 'visual',
            instructionText: 'The "tipping" visualization shows how far each dot is from the center. When the total left-pull equals total right-pull, you\'ve found the mean.',
            canvasComponent: 'BalanceCanvas',
            canvasInitialState: {
              data: [3, 5, 7, 9, 1],
              fulcrumAt: 5,
              showResiduals: true,
            },
            formativeCheck: {
              prompt: 'Dataset: 3, 5, 7, 9, 1. What is the mean?',
              type: 'numeric',
              correctAnswer: 5,
              tolerance: 5,
            },
          },
          {
            phase: 'abstract',
            instructionText: 'Mean = (sum of all values) ÷ (number of values). Add them all, divide by how many.',
            canvasComponent: 'BalanceCanvas',
            canvasInitialState: {
              data: [10, 20, 30, 40, 50],
              fulcrumAt: 30,
              showFormula: true,
            },
            formativeCheck: {
              prompt: 'A basketball player scored 18, 24, 15, 21, and 12 points in 5 games. What is their mean score?',
              type: 'numeric',
              correctAnswer: 18,
              tolerance: 5,
            },
          },
        ],
      },
      {
        id: 'median-middle-value',
        topicId: 'mean-median-mode',
        title: 'Median — The Middle Value',
        estimatedMinutes: 10,
        narrative: {
          setting: 'Five houses on a street have very different prices. Which "average" price best describes the neighborhood?',
          problemStatement: 'Find the median by ordering values and finding the middle. Understand when median is more useful than mean.',
          realWorldConnection: 'Real estate agents use median home price (not mean) because one expensive mansion would skew the mean and mislead buyers.',
        },
        phases: [
          {
            phase: 'concrete',
            instructionText: 'Drag the houses to sort them from cheapest to most expensive. The middle house is the median.',
            canvasComponent: 'MedianCanvas',
            canvasInitialState: {
              data: [250, 300, 280, 1200, 260],
              sorted: false,
            },
            formativeCheck: {
              prompt: 'Prices sorted: $250k, $260k, $280k, $300k, $1,200k. What is the median price?',
              type: 'numeric',
              correctAnswer: 280,
              tolerance: 5,
            },
          },
          {
            phase: 'visual',
            instructionText: 'The number line shows all values. The median marker splits the data exactly in half — same number of values on each side.',
            canvasComponent: 'MedianCanvas',
            canvasInitialState: {
              data: [250, 300, 280, 1200, 260],
              sorted: true,
              showMedianLine: true,
            },
            formativeCheck: {
              prompt: 'Why is $280k a better "typical" price than the mean of $458k for this street?',
              type: 'multiple-choice',
              choices: [
                { label: 'The mean is affected by the $1.2M outlier, making it misleadingly high', correct: true },
                { label: 'The median is always bigger than the mean', correct: false },
                { label: 'The mean is harder to calculate', correct: false },
              ],
            },
          },
          {
            phase: 'abstract',
            instructionText: 'Median = middle value (odd count) or average of two middle values (even count), after sorting.',
            canvasComponent: 'MedianCanvas',
            canvasInitialState: {
              data: [4, 8, 6, 2, 10, 12],
              sorted: false,
              showFormula: true,
            },
            formativeCheck: {
              prompt: 'Dataset: 4, 8, 6, 2, 10, 12. What is the median?',
              type: 'numeric',
              correctAnswer: 7,
              tolerance: 5,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'distributions',
    subject: 'statistics',
    title: 'Distributions & Spread',
    description: 'See how data is spread out using dot plots, histograms, and box plots.',
    grades: [6, 7],
    standards: ['CCSS.MATH.6.SP.B.4', 'CCSS.MATH.6.SP.A.2'],
    icon: '▊',
    color: 'sky',
    prerequisiteTopicIds: ['mean-median-mode'],
    lessons: [
      {
        id: 'dot-plot-histogram',
        topicId: 'distributions',
        title: 'Dot Plots & Histograms',
        estimatedMinutes: 14,
        narrative: {
          setting: 'You are analyzing how long students spend on homework each night for a research paper.',
          problemStatement: 'Build a dot plot and histogram from raw data. Describe the shape of the distribution.',
          realWorldConnection: 'Data scientists, doctors, and researchers use distributions to understand what is "normal" in a dataset.',
        },
        phases: [
          {
            phase: 'concrete',
            instructionText: 'Drag each student\'s homework time onto the number line. Stack dots that share the same value.',
            canvasComponent: 'DotPlotCanvas',
            canvasInitialState: {
              data: [30, 45, 60, 45, 30, 90, 45, 60, 75, 30, 60, 45],
              placed: [],
            },
            formativeCheck: {
              prompt: 'How many students spend exactly 45 minutes on homework?',
              type: 'numeric',
              correctAnswer: 4,
              tolerance: 0,
            },
          },
          {
            phase: 'visual',
            instructionText: 'The histogram groups values into bins. Drag the bin width slider — watch how the shape changes. What stays the same?',
            canvasComponent: 'HistogramCanvas',
            canvasInitialState: {
              data: [30, 45, 60, 45, 30, 90, 45, 60, 75, 30, 60, 45],
              binCount: 4,
            },
            formativeCheck: {
              prompt: 'What shape is this distribution?',
              type: 'multiple-choice',
              choices: [
                { label: 'Symmetric (bell-shaped)', correct: false },
                { label: 'Skewed right (tail extends to the right)', correct: true },
                { label: 'Uniform (all bars same height)', correct: false },
              ],
            },
          },
          {
            phase: 'abstract',
            instructionText: 'Describe a distribution by: shape (symmetric/skewed), center (mean/median), and spread (range/IQR).',
            canvasComponent: 'HistogramCanvas',
            canvasInitialState: {
              data: [30, 45, 60, 45, 30, 90, 45, 60, 75, 30, 60, 45],
              binCount: 4,
              showStats: true,
            },
            formativeCheck: {
              prompt: 'If one student spent 200 minutes (an outlier), which measure of center changes more: mean or median?',
              type: 'multiple-choice',
              choices: [
                { label: 'Mean — it is pulled by extreme values', correct: true },
                { label: 'Median — it is always affected by outliers', correct: false },
                { label: 'They both change equally', correct: false },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'scatter-plots',
    subject: 'statistics',
    title: 'Scatter Plots & Trends',
    description: 'Plot two variables together and find the line of best fit to make predictions.',
    grades: [8],
    standards: ['CCSS.MATH.8.SP.A.1', 'CCSS.MATH.8.SP.A.2', 'CCSS.MATH.8.SP.A.3'],
    icon: '⁖',
    color: 'sky',
    prerequisiteTopicIds: ['mean-median-mode'],
    lessons: [
      {
        id: 'scatter-plot-correlation',
        topicId: 'scatter-plots',
        title: 'Correlation & Best-Fit Line',
        estimatedMinutes: 16,
        narrative: {
          setting: 'A sports analyst is looking at whether a basketball player\'s practice hours predict their game score.',
          problemStatement: 'Plot data on a scatter plot, identify the correlation, and draw the line of best fit.',
          realWorldConnection: 'Weather forecasting, medical research, economics, and machine learning all rely on finding patterns between two variables.',
        },
        phases: [
          {
            phase: 'concrete',
            instructionText: 'Drag each player\'s dot onto the scatter plot (x = practice hours, y = game score). Do you see a pattern?',
            canvasComponent: 'ScatterCanvas',
            canvasInitialState: {
              data: [],
              rawData: [
                { x: 2, y: 45 }, { x: 4, y: 55 }, { x: 3, y: 50 },
                { x: 6, y: 70 }, { x: 5, y: 65 }, { x: 7, y: 75 },
                { x: 1, y: 40 }, { x: 8, y: 80 },
              ],
              placed: 0,
            },
            formativeCheck: {
              prompt: 'What pattern do you see: as practice hours increase, game scores...?',
              type: 'multiple-choice',
              choices: [
                { label: 'Increase (positive correlation)', correct: true },
                { label: 'Decrease (negative correlation)', correct: false },
                { label: 'Show no pattern', correct: false },
              ],
            },
          },
          {
            phase: 'visual',
            instructionText: 'Drag the line to minimize the gaps (residuals) between each point and your line. Then see the best-fit line calculated automatically.',
            canvasComponent: 'ScatterCanvas',
            canvasInitialState: {
              data: [
                { x: 2, y: 45 }, { x: 4, y: 55 }, { x: 3, y: 50 },
                { x: 6, y: 70 }, { x: 5, y: 65 }, { x: 7, y: 75 },
                { x: 1, y: 40 }, { x: 8, y: 80 },
              ],
              showResiduals: true,
              showBestFit: false,
              lineSlope: 5,
              lineIntercept: 35,
            },
            formativeCheck: {
              prompt: 'What does the line of best fit help you do?',
              type: 'multiple-choice',
              choices: [
                { label: 'Connect every dot exactly', correct: false },
                { label: 'Predict y values for new x values', correct: true },
                { label: 'Find the median of the y values', correct: false },
              ],
            },
          },
          {
            phase: 'abstract',
            instructionText: 'The line equation is y = mx + b. Use it to predict scores for practice hours not in the dataset.',
            canvasComponent: 'ScatterCanvas',
            canvasInitialState: {
              data: [
                { x: 2, y: 45 }, { x: 4, y: 55 }, { x: 3, y: 50 },
                { x: 6, y: 70 }, { x: 5, y: 65 }, { x: 7, y: 75 },
                { x: 1, y: 40 }, { x: 8, y: 80 },
              ],
              showBestFit: true,
              showFormula: true,
            },
            formativeCheck: {
              prompt: 'The best-fit line is y = 6x + 33. Predict the score for a player who practices 9 hours.',
              type: 'numeric',
              correctAnswer: 87,
              tolerance: 5,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'probability',
    subject: 'statistics',
    title: 'Probability',
    description: 'Measure the likelihood of events — from coin flips to complex real-world chances.',
    grades: [7],
    standards: ['CCSS.MATH.7.SP.C.5', 'CCSS.MATH.7.SP.C.6', 'CCSS.MATH.7.SP.C.7'],
    icon: '🎲',
    color: 'sky',
    prerequisiteTopicIds: [],
    lessons: [
      {
        id: 'probability-experimental',
        topicId: 'probability',
        title: 'Experimental vs Theoretical Probability',
        estimatedMinutes: 14,
        narrative: {
          setting: 'You and a friend are arguing: is a coin really fair? You decide to test it.',
          problemStatement: 'Run experiments to estimate probability. Compare experimental results to theoretical prediction.',
          realWorldConnection: 'Insurance companies, game designers, weather forecasters, and drug researchers all use probability to make decisions under uncertainty.',
        },
        phases: [
          {
            phase: 'concrete',
            instructionText: 'Tap the coin to flip it. Flip it 10 times. Record your results.',
            canvasComponent: 'ProbabilityCanvas',
            canvasInitialState: {
              mode: 'coin',
              flips: [],
              target: 10,
            },
            formativeCheck: {
              prompt: 'After 10 flips, roughly what fraction came up heads?',
              type: 'multiple-choice',
              choices: [
                { label: 'Exactly 1/2 every time', correct: false },
                { label: 'Close to 1/2, but not exact', correct: true },
                { label: 'Always more tails than heads', correct: false },
              ],
            },
          },
          {
            phase: 'visual',
            instructionText: 'Run the simulator 100 times, then 1000 times. Watch the bar chart. What happens to the proportion as flips increase?',
            canvasComponent: 'ProbabilityCanvas',
            canvasInitialState: {
              mode: 'simulator',
              autoFlips: 0,
              showBars: true,
            },
            formativeCheck: {
              prompt: 'As the number of flips increases, the experimental probability gets...',
              type: 'multiple-choice',
              choices: [
                { label: 'Further from 0.5', correct: false },
                { label: 'Closer to 0.5 (the theoretical probability)', correct: true },
                { label: 'Always exactly 0.5', correct: false },
              ],
            },
          },
          {
            phase: 'abstract',
            instructionText: 'Theoretical P(event) = favorable outcomes ÷ total possible outcomes. With enough trials, experimental approaches theoretical.',
            canvasComponent: 'ProbabilityCanvas',
            canvasInitialState: {
              mode: 'dice',
              showFormula: true,
            },
            formativeCheck: {
              prompt: 'A bag has 3 red, 2 blue, and 5 green marbles. What is P(green)?',
              type: 'numeric',
              correctAnswer: 0.5,
              tolerance: 5,
            },
          },
        ],
      },
    ],
  },
];
