import { CurriculumTopic } from '@/types/curriculum';

export const geometryTopics: CurriculumTopic[] = [
  {
    id: 'area-perimeter',
    subject: 'geometry',
    title: 'Area & Perimeter',
    description: 'Measure and compute the size of 2D shapes — how much fence you need and how much space you have.',
    grades: [6],
    standards: ['CCSS.MATH.6.G.A.1'],
    icon: '▭',
    color: 'amber',
    prerequisiteTopicIds: [],
    lessons: [
      {
        id: 'area-perimeter-rectangles',
        topicId: 'area-perimeter',
        title: 'Rectangles',
        estimatedMinutes: 12,
        narrative: {
          setting: 'You are designing a skate park for your city. The city council needs two numbers before they can approve your plan: how much fence to buy and how much concrete to pour.',
          character: 'Maya the Park Designer',
          problemStatement: 'Design a rectangular skate park. Find its perimeter (fence needed) and area (concrete needed).',
          realWorldConnection: 'Architects, landscapers, and builders calculate area and perimeter every day to estimate materials and cost.',
        },
        phases: [
          {
            phase: 'concrete',
            instructionText: 'Drag the corners of the skate park to size it how you like. Each square on the grid = 1 meter. Count how many meters of fence you would need to go all the way around.',
            canvasComponent: 'RectangleCanvas',
            canvasInitialState: { width: 4, height: 3 },
            formativeCheck: {
              prompt: 'How many meters of fence does your park need? (Count all 4 sides)',
              type: 'numeric',
              tolerance: 10,
            },
            hint: 'Walk around the outside of the park — count every edge.',
          },
          {
            phase: 'visual',
            instructionText: 'Now watch what happens to the fence and concrete numbers as you resize the park. Can you spot a pattern in how the numbers change?',
            canvasComponent: 'RectangleCanvas',
            canvasInitialState: { width: 4, height: 3 },
            formativeCheck: {
              prompt: 'If length = 6m and width = 4m, what is the perimeter?',
              type: 'numeric',
              correctAnswer: 20,
              tolerance: 5,
            },
            hint: 'You need to add all 4 sides. Two sides have the same length. Two sides have the same width.',
          },
          {
            phase: 'abstract',
            instructionText: 'The pattern you found has a name: P = 2l + 2w and A = l × w. Type any length and width — the formula fills in automatically.',
            canvasComponent: 'RectangleCanvas',
            canvasInitialState: { width: 5, height: 4 },
            formativeCheck: {
              prompt: 'A garden is 8m long and 3m wide. A bag of fertilizer covers 6 m². How many bags do you need?',
              type: 'numeric',
              correctAnswer: 4,
              tolerance: 0,
            },
            hint: 'First find the area of the garden. Then divide by how much one bag covers.',
          },
        ],
      },
      {
        id: 'area-perimeter-composite',
        topicId: 'area-perimeter',
        title: 'Composite Shapes',
        estimatedMinutes: 15,
        narrative: {
          setting: 'The skate park is getting an upgrade — an L-shaped section for advanced skaters is being added.',
          problemStatement: 'Find the area and perimeter of L-shaped and other composite figures by breaking them into rectangles.',
          realWorldConnection: 'Most real floors, rooms, and plots of land are not perfect rectangles. Builders split them into simpler parts.',
        },
        phases: [
          {
            phase: 'concrete',
            instructionText: 'Drag the dividing line to split the L-shape into two rectangles. Count the grid squares in each piece.',
            canvasComponent: 'CompositeShapeCanvas',
            canvasInitialState: { shape: 'L', splitAt: 3 },
            formativeCheck: {
              prompt: 'What is the total area of the L-shape? (Add both pieces)',
              type: 'numeric',
              tolerance: 10,
            },
          },
          {
            phase: 'visual',
            instructionText: 'Watch the two rectangles highlight as you move the split. Their individual areas and the total update live.',
            canvasComponent: 'CompositeShapeCanvas',
            canvasInitialState: { shape: 'L', splitAt: 3 },
            formativeCheck: {
              prompt: 'If the two pieces have areas 12 m² and 8 m², what is the total area?',
              type: 'numeric',
              correctAnswer: 20,
              tolerance: 0,
            },
          },
          {
            phase: 'abstract',
            instructionText: 'A = A₁ + A₂. Composite area = sum of its parts.',
            canvasComponent: 'CompositeShapeCanvas',
            canvasInitialState: { shape: 'L', splitAt: 3 },
            formativeCheck: {
              prompt: 'An L-shaped room is made of a 5×4 rectangle and a 3×2 rectangle. What is the total area?',
              type: 'numeric',
              correctAnswer: 26,
              tolerance: 0,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'angles',
    subject: 'geometry',
    title: 'Angles',
    description: 'Measure, classify, and find missing angles using angle relationships.',
    grades: [6, 7],
    standards: ['CCSS.MATH.7.G.B.5'],
    icon: '∠',
    color: 'amber',
    prerequisiteTopicIds: [],
    lessons: [
      {
        id: 'angles-types',
        topicId: 'angles',
        title: 'Types of Angles',
        estimatedMinutes: 10,
        narrative: {
          setting: 'You are a drone photographer planning camera angles for a film shoot.',
          problemStatement: 'Identify and measure acute, right, obtuse, and straight angles.',
          realWorldConnection: 'Cameras, telescopes, solar panels, and satellite dishes are all positioned using precise angle measurements.',
        },
        phases: [
          {
            phase: 'concrete',
            instructionText: 'Drag the arm of the angle to rotate it. Notice how the shape changes as you cross 90° and 180°.',
            canvasComponent: 'AngleCanvas',
            canvasInitialState: { angleDeg: 45 },
            formativeCheck: {
              prompt: 'Set the angle to exactly 90°. What is it called?',
              type: 'multiple-choice',
              choices: [
                { label: 'Acute', correct: false },
                { label: 'Right', correct: true },
                { label: 'Obtuse', correct: false },
                { label: 'Straight', correct: false },
              ],
            },
          },
          {
            phase: 'visual',
            instructionText: 'The protractor overlay shows exact degrees. Try to match the target angles shown.',
            canvasComponent: 'AngleCanvas',
            canvasInitialState: { angleDeg: 45, showProtractor: true },
            formativeCheck: {
              prompt: 'Is 135° an acute, right, or obtuse angle?',
              type: 'multiple-choice',
              choices: [
                { label: 'Acute (less than 90°)', correct: false },
                { label: 'Right (exactly 90°)', correct: false },
                { label: 'Obtuse (between 90° and 180°)', correct: true },
              ],
            },
          },
          {
            phase: 'abstract',
            instructionText: 'Complementary angles add to 90°. Supplementary angles add to 180°.',
            canvasComponent: 'AngleCanvas',
            canvasInitialState: { angleDeg: 55, showProtractor: true, showComplement: true },
            formativeCheck: {
              prompt: 'Angle A = 65°. A and B are supplementary. What is angle B?',
              type: 'numeric',
              correctAnswer: 115,
              tolerance: 0,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'transformations',
    subject: 'geometry',
    title: 'Transformations',
    description: 'Translate, rotate, reflect, and dilate shapes on a coordinate plane.',
    grades: [7, 8],
    standards: ['CCSS.MATH.8.G.A.1', 'CCSS.MATH.8.G.A.2', 'CCSS.MATH.8.G.A.3'],
    icon: '⟳',
    color: 'amber',
    prerequisiteTopicIds: ['area-perimeter'],
    lessons: [
      {
        id: 'transformations-translation',
        topicId: 'transformations',
        title: 'Translation (Sliding)',
        estimatedMinutes: 12,
        narrative: {
          setting: 'You are animating a video game character. Movement on screen is a translation.',
          problemStatement: 'Translate shapes on a coordinate grid using vectors.',
          realWorldConnection: 'Every pixel movement in a video game, animation, or map navigation uses translation math.',
        },
        phases: [
          {
            phase: 'concrete',
            instructionText: 'Drag the character to move it across the grid. Count how many squares right and how many squares up you moved it.',
            canvasComponent: 'TransformCanvas',
            canvasInitialState: { mode: 'translation', shape: 'arrow', tx: 0, ty: 0 },
            formativeCheck: {
              prompt: 'You moved the character 3 squares right and 2 squares up. What is the translation vector?',
              type: 'multiple-choice',
              choices: [
                { label: '(2, 3)', correct: false },
                { label: '(3, 2)', correct: true },
                { label: '(3, -2)', correct: false },
              ],
            },
          },
          {
            phase: 'visual',
            instructionText: 'The original position (ghost) and new position both show. The arrow shows the vector (how far and in which direction).',
            canvasComponent: 'TransformCanvas',
            canvasInitialState: { mode: 'translation', shape: 'arrow', tx: 3, ty: 2, showGhost: true, showVector: true },
            formativeCheck: {
              prompt: 'Point A is at (1, 2). It is translated by vector (4, -1). Where does it end up?',
              type: 'multiple-choice',
              choices: [
                { label: '(5, 1)', correct: true },
                { label: '(5, 3)', correct: false },
                { label: '(3, 3)', correct: false },
              ],
            },
          },
          {
            phase: 'abstract',
            instructionText: "Translation rule: (x, y) → (x + a, y + b) where (a, b) is the vector.",
            canvasComponent: 'TransformCanvas',
            canvasInitialState: { mode: 'translation', shape: 'triangle', tx: 0, ty: 0, showFormula: true },
            formativeCheck: {
              prompt: 'Triangle has vertices at (0,0), (2,0), (1,2). After translation (3, -4), what are the new vertices?',
              type: 'multiple-choice',
              choices: [
                { label: '(3,-4), (5,-4), (4,-2)', correct: true },
                { label: '(3,4), (5,4), (4,6)', correct: false },
                { label: '(0,3), (2,3), (1,5)', correct: false },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'pythagorean-theorem',
    subject: 'geometry',
    title: 'Pythagorean Theorem',
    description: 'Discover why a² + b² = c² and use it to find missing side lengths.',
    grades: [8],
    standards: ['CCSS.MATH.8.G.B.7', 'CCSS.MATH.8.G.B.8'],
    icon: '△',
    color: 'amber',
    prerequisiteTopicIds: ['area-perimeter'],
    lessons: [
      {
        id: 'pythagorean-proof',
        topicId: 'pythagorean-theorem',
        title: 'Why a² + b² = c²',
        estimatedMinutes: 15,
        narrative: {
          setting: 'A rescue team needs to reach a stranded hiker. There is a direct diagonal path through a flooded field — but how long is it?',
          problemStatement: 'Discover the Pythagorean theorem by visualizing squares on each side of a right triangle.',
          realWorldConnection: 'GPS, construction, navigation, and computer graphics all rely on the Pythagorean theorem hundreds of times per second.',
        },
        phases: [
          {
            phase: 'concrete',
            instructionText: 'Drag the legs of the right triangle. Count the squares in each colored square (one on each side). What do you notice?',
            canvasComponent: 'PythagoreanCanvas',
            canvasInitialState: { a: 3, b: 4, showSquares: true },
            formativeCheck: {
              prompt: 'For a triangle with legs 3 and 4: how many squares are on the longest side (hypotenuse)?',
              type: 'numeric',
              correctAnswer: 25,
              tolerance: 0,
            },
            hint: 'Count the orange squares. How does that number relate to the 9 red squares and 16 blue squares?',
          },
          {
            phase: 'visual',
            instructionText: 'Watch: the area of the square on leg a + area of square on leg b = area of square on the hypotenuse. Every time.',
            canvasComponent: 'PythagoreanCanvas',
            canvasInitialState: { a: 3, b: 4, showSquares: true, showLabels: true },
            formativeCheck: {
              prompt: 'Legs are 5 and 12. What is the area of the square on the hypotenuse?',
              type: 'numeric',
              correctAnswer: 169,
              tolerance: 0,
            },
          },
          {
            phase: 'abstract',
            instructionText: 'a² + b² = c². Enter any two sides — the third is calculated.',
            canvasComponent: 'PythagoreanCanvas',
            canvasInitialState: { a: 6, b: 8, showFormula: true },
            formativeCheck: {
              prompt: 'A ladder leans against a wall. The ladder is 10m long. Its base is 6m from the wall. How high does it reach?',
              type: 'numeric',
              correctAnswer: 8,
              tolerance: 5,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'coordinate-geometry',
    subject: 'geometry',
    title: 'Coordinate Geometry',
    description: 'Plot points, find distances, locate midpoints, and measure slope on a coordinate plane.',
    grades: [6, 7, 8],
    standards: ['CCSS.MATH.6.G.A.3', 'CCSS.MATH.8.G.B.8'],
    icon: '⊕',
    color: 'amber',
    prerequisiteTopicIds: [],
    lessons: [
      {
        id: 'coordinate-geometry-distance',
        topicId: 'coordinate-geometry',
        title: 'Distance Between Two Points',
        estimatedMinutes: 13,
        narrative: {
          setting: 'You are a city planner placing two new bus stops on a grid map. Before construction starts, the engineer needs to know the exact straight-line distance between them.',
          character: 'Alex the City Planner',
          problemStatement: 'Find the straight-line distance between two points on a coordinate grid.',
          realWorldConnection: 'GPS apps calculate the distance between every pair of coordinates using this exact formula — millions of times per second.',
        },
        phases: [
          {
            phase: 'concrete',
            instructionText: 'Drag bus stop A and bus stop B anywhere on the grid. Count the horizontal squares (run) and vertical squares (rise) between them. Can you find the straight-line distance?',
            canvasComponent: 'CoordinateGeometryCanvas',
            canvasInitialState: { mode: 'distance', pointA: { x: 0, y: 0 }, pointB: { x: 3, y: 4 } },
            guidedExample: {
              intro: "Distance between two points can be tricky. Let's work through one example together on the canvas before you try it yourself.",
              steps: [
                {
                  instruction: 'Drag point A to (0, 0) — the centre of the grid where the axes cross.',
                  explanation: 'We always start by identifying the two points. (0, 0) is called the origin — it is where x = 0 and y = 0.',
                },
                {
                  instruction: 'Now drag point B to (3, 4) — 3 squares right, 4 squares up.',
                  explanation: 'The first number in a coordinate is always how far right (x), the second is how far up (y). So (3, 4) means: go 3 right, then 4 up.',
                },
                {
                  instruction: 'Count the blue dashed squares going right from A to B. That is the "run" = 3.',
                  explanation: 'The "run" is the horizontal distance — how far left or right you travel. Counting grid squares is the most reliable way to find it.',
                },
                {
                  instruction: 'Now count the red dashed squares going up. That is the "rise" = 4.',
                  explanation: 'The "rise" is the vertical distance — how far up or down you travel. Together, run and rise describe the two legs of a right triangle.',
                },
                {
                  instruction: 'The straight-line distance is the hypotenuse of that triangle. Use a² + b² = c²: 3² + 4² = 9 + 16 = 25. So the distance = √25 = 5.',
                  explanation: 'This is the Pythagorean theorem — the run and rise form the two legs of a right triangle, and the straight-line distance is always the hypotenuse.',
                },
              ],
              completionMessage: 'You found it! A(0,0) to B(3,4) is a distance of 5 units — a classic 3-4-5 right triangle.',
            },
            formativeCheck: {
              prompt: 'Now you try: move A to (0, 0) and B to (3, 4). What is the straight-line distance?',
              type: 'numeric',
              correctAnswer: 5,
              tolerance: 5,
            },
            hints: [
              'You are looking for the straight-line distance — the shortest path directly from A to B, not going around the edges.',
              'Count the run (horizontal squares) and rise (vertical squares) between the points. Then use the Pythagorean theorem: distance = √(run² + rise²).',
              'run = 3, rise = 4. distance = √(3² + 4²) = √(9 + 16) = √25 = 5.',
            ],
          },
          {
            phase: 'visual',
            instructionText: 'The dashed lines now show the hidden right triangle. Watch how run, rise, and distance update as you drag the points.',
            canvasComponent: 'CoordinateGeometryCanvas',
            canvasInitialState: { mode: 'distance', pointA: { x: -3, y: -2 }, pointB: { x: 4, y: 3 } },
            formativeCheck: {
              prompt: 'Drag A to (1, 1) and B to (4, 5). What is the distance?',
              type: 'numeric',
              correctAnswer: 5,
              tolerance: 5,
            },
            hints: [
              'Look at the dashed lines — they show you the run (horizontal) and rise (vertical) automatically.',
              'Read the run and rise labels on the canvas, then apply: distance = √(run² + rise²).',
              'run = 3, rise = 4. distance = √(9 + 16) = √25 = 5.',
            ],
          },
          {
            phase: 'abstract',
            instructionText: 'd = √((x₂−x₁)² + (y₂−y₁)²). Drag the points — watch the formula fill in with real numbers.',
            canvasComponent: 'CoordinateGeometryCanvas',
            canvasInitialState: { mode: 'distance', pointA: { x: -4, y: 1 }, pointB: { x: 2, y: -3 } },
            formativeCheck: {
              prompt: 'Two fire stations are at (−3, 1) and (1, 4). What is the distance between them?',
              type: 'numeric',
              correctAnswer: 5,
              tolerance: 5,
            },
            hints: [
              'You need the straight-line distance between (−3, 1) and (1, 4). Use the distance formula.',
              'run = x₂ − x₁ = 1 − (−3) = 4. rise = y₂ − y₁ = 4 − 1 = 3. Apply d = √(run² + rise²).',
              'd = √(4² + 3²) = √(16 + 9) = √25 = 5.',
            ],
          },
        ],
      },
      {
        id: 'coordinate-geometry-midpoint',
        topicId: 'coordinate-geometry',
        title: 'Midpoint of a Segment',
        estimatedMinutes: 11,
        narrative: {
          setting: 'Two friends live on opposite sides of town. They want to meet exactly halfway. Where should they meet?',
          problemStatement: 'Find the midpoint between two coordinates — the exact halfway point on a segment.',
          realWorldConnection: 'Midpoints are used in computer graphics to split lines, in engineering to find centres of beams, and in mapping to place labels at the middle of roads.',
        },
        phases: [
          {
            phase: 'concrete',
            instructionText: 'Drag points A and B. The halfway point is exactly in the middle — count squares from each end to find it.',
            canvasComponent: 'CoordinateGeometryCanvas',
            canvasInitialState: { mode: 'midpoint', pointA: { x: -4, y: -2 }, pointB: { x: 4, y: 2 } },
            guidedExample: {
              intro: "Finding the halfway point between two coordinates is easier than it looks. Let's walk through it together.",
              steps: [
                {
                  instruction: 'Drag A to (−4, 0) and B to (4, 0) — both on the x-axis.',
                  explanation: 'Starting with points on the same line makes it easy to see what "halfway" means visually.',
                },
                {
                  instruction: 'Count the total squares from A to B along the x-axis. You should count 8 squares.',
                  explanation: 'The total distance between the points tells us how far apart they are. We need to split this distance in half.',
                },
                {
                  instruction: 'Half of 8 is 4. Count 4 squares from A — you land on (0, 0). That is the midpoint.',
                  explanation: 'The midpoint is always exactly half the distance from each endpoint. (−4 + 4) ÷ 2 = 0.',
                },
                {
                  instruction: 'Now drag B up to (4, 4). Where do you think the midpoint moves?',
                  explanation: 'When one point moves up, the midpoint moves up too — but only half as much. The midpoint tracks the average position of both points.',
                },
                {
                  instruction: 'The midpoint is now (0, 2). Check: average of x-values = (−4+4)÷2 = 0. Average of y-values = (0+4)÷2 = 2.',
                  explanation: 'The midpoint formula just averages the two x-coordinates and the two y-coordinates separately. Average = add them, divide by 2.',
                },
              ],
              completionMessage: 'The midpoint is always the average of the two x-values and the average of the two y-values.',
            },
            formativeCheck: {
              prompt: 'A is at (0, 0) and B is at (6, 4). What are the coordinates of the halfway point?',
              type: 'multiple-choice',
              choices: [
                { label: '(3, 2)', correct: true },
                { label: '(6, 4)', correct: false },
                { label: '(2, 3)', correct: false },
              ],
            },
            hints: [
              'You are looking for the point that is exactly halfway between A(0,0) and B(6,4) — equal distance from both.',
              'Average the x-coordinates: (0 + 6) ÷ 2. Then average the y-coordinates: (0 + 4) ÷ 2. Those two results are your answer.',
              'x: (0 + 6) ÷ 2 = 3. y: (0 + 4) ÷ 2 = 2. Midpoint = (3, 2).',
            ],
          },
          {
            phase: 'visual',
            instructionText: 'The green dot shows the midpoint automatically. Drag A and B and watch it stay exactly halfway.',
            canvasComponent: 'CoordinateGeometryCanvas',
            canvasInitialState: { mode: 'midpoint', pointA: { x: -3, y: 1 }, pointB: { x: 5, y: -3 } },
            formativeCheck: {
              prompt: 'A(−2, 4) and B(6, 0). What is the midpoint?',
              type: 'multiple-choice',
              choices: [
                { label: '(2, 2)', correct: true },
                { label: '(4, 4)', correct: false },
                { label: '(−2, 2)', correct: false },
              ],
            },
            hints: [
              'You need the point exactly halfway between (−2, 4) and (6, 0).',
              'Average the x-values: (−2 + 6) ÷ 2. Average the y-values: (4 + 0) ÷ 2.',
              'x: (−2 + 6) ÷ 2 = 4 ÷ 2 = 2. y: (4 + 0) ÷ 2 = 2. Midpoint = (2, 2).',
            ],
          },
          {
            phase: 'abstract',
            instructionText: 'M = ((x₁+x₂)/2, (y₁+y₂)/2). Average the x-coordinates, average the y-coordinates.',
            canvasComponent: 'CoordinateGeometryCanvas',
            canvasInitialState: { mode: 'midpoint', pointA: { x: -5, y: 3 }, pointB: { x: 3, y: -1 } },
            formativeCheck: {
              prompt: 'A bridge spans from (−4, 1) to (4, 5). Where is the midpoint of the bridge?',
              type: 'multiple-choice',
              choices: [
                { label: '(0, 3)', correct: true },
                { label: '(2, 3)', correct: false },
                { label: '(0, 4)', correct: false },
              ],
            },
            hints: [
              'You need the midpoint of a segment from (−4, 1) to (4, 5). Use M = ((x₁+x₂)/2, (y₁+y₂)/2).',
              'x: (−4 + 4) ÷ 2 = ? y: (1 + 5) ÷ 2 = ?',
              'x: (−4 + 4) ÷ 2 = 0 ÷ 2 = 0. y: (1 + 5) ÷ 2 = 6 ÷ 2 = 3. Midpoint = (0, 3).',
            ],
          },
        ],
      },
      {
        id: 'coordinate-geometry-slope',
        topicId: 'coordinate-geometry',
        title: 'Slope — Rise Over Run',
        estimatedMinutes: 14,
        narrative: {
          setting: 'A trail builder is designing a hiking path up a hill. The steepness of the path — how much it rises for every metre forward — is its slope.',
          problemStatement: 'Calculate and interpret the slope of a line using rise over run.',
          realWorldConnection: 'Road grade signs (6% slope), wheelchair ramp regulations, ski run difficulty ratings, and linear equations in algebra all depend on slope.',
        },
        phases: [
          {
            phase: 'concrete',
            instructionText: 'Drag points A and B to set the trail path. Count the squares up (rise) and right (run). Slope = rise ÷ run.',
            canvasComponent: 'CoordinateGeometryCanvas',
            canvasInitialState: { mode: 'slope', pointA: { x: 0, y: 0 }, pointB: { x: 4, y: 2 } },
            guidedExample: {
              intro: "Slope measures steepness — how much a line rises for every step it moves right. Let's build that idea from scratch.",
              steps: [
                {
                  instruction: 'Drag A to (0, 0) and B to (4, 0). This is a completely flat path.',
                  explanation: 'A flat line has no rise at all. No matter how far you go right, you stay at the same height. Rise = 0, so slope = 0 ÷ anything = 0.',
                },
                {
                  instruction: 'Now drag B up to (4, 2). The path now climbs. Count: how many squares right? How many squares up?',
                  explanation: 'You moved B 4 squares right and 2 squares up. Every time you go 4 right, you go 2 up. That pattern is the slope.',
                },
                {
                  instruction: 'Slope = rise ÷ run = 2 ÷ 4 = 0.5. For every 1 square right, the path rises 0.5 squares.',
                  explanation: 'Slope is always rise divided by run. A slope of 0.5 means "for every metre forward, you go up half a metre" — a gentle hill.',
                },
                {
                  instruction: 'Drag B to (4, 4). Now rise = 4, run = 4. What is the slope?',
                  explanation: 'Slope = 4 ÷ 4 = 1. A slope of 1 means the path rises exactly 1 unit for every 1 unit forward — a 45° angle. Steeper than before.',
                },
                {
                  instruction: 'Now drag B down to (4, −2). The path goes downhill. Rise is now negative: −2.',
                  explanation: 'When a line goes downward from left to right, the rise is negative. Slope = −2 ÷ 4 = −0.5. Negative slope = going downhill.',
                },
              ],
              completionMessage: 'Slope = rise ÷ run. Positive = uphill, negative = downhill, zero = flat. The bigger the number, the steeper the line.',
            },
            formativeCheck: {
              prompt: 'A(0, 0) to B(4, 2): rise = 2, run = 4. What is the slope?',
              type: 'numeric',
              correctAnswer: 0.5,
              tolerance: 10,
            },
            hints: [
              'Slope tells you how steep the line is — how many squares it goes up for every square it goes right.',
              'Count the rise (squares up from A to B) and the run (squares right from A to B). Slope = rise ÷ run.',
              'rise = 2 (B is 2 squares above A), run = 4 (B is 4 squares right of A). Slope = 2 ÷ 4 = 0.5.',
            ],
          },
          {
            phase: 'visual',
            instructionText: 'The dashed line extends the path beyond A and B. Watch how the slope label changes — including going negative when the line points downward.',
            canvasComponent: 'CoordinateGeometryCanvas',
            canvasInitialState: { mode: 'slope', pointA: { x: -4, y: 2 }, pointB: { x: 2, y: -1 } },
            formativeCheck: {
              prompt: 'A line goes from (0, 4) down to (4, 0). What is the slope?',
              type: 'numeric',
              correctAnswer: -1,
              tolerance: 5,
            },
            hints: [
              'The line is going downhill — B is lower than A — so the slope will be negative.',
              'rise = y₂ − y₁ = 0 − 4 = −4. run = x₂ − x₁ = 4 − 0 = 4. Slope = rise ÷ run.',
              'Slope = −4 ÷ 4 = −1. A slope of −1 means the line drops 1 unit for every 1 unit to the right.',
            ],
          },
          {
            phase: 'abstract',
            instructionText: 'm = (y₂−y₁) / (x₂−x₁). Drag the points — watch the formula fill in with real numbers.',
            canvasComponent: 'CoordinateGeometryCanvas',
            canvasInitialState: { mode: 'slope', pointA: { x: -3, y: -1 }, pointB: { x: 3, y: 3 } },
            formativeCheck: {
              prompt: 'A ramp starts at (0, 0) and ends at (6, 2). Building code says ramps must have slope ≤ 1/2. Does this ramp comply?',
              type: 'multiple-choice',
              choices: [
                { label: 'Yes — slope = 1/3, which is less than 1/2', correct: true },
                { label: 'No — slope = 1/3, which is greater than 1/2', correct: false },
                { label: 'Yes — slope = 2/6 = 1/2, exactly at the limit', correct: false },
              ],
            },
            hints: [
              'First calculate the slope of the ramp from (0,0) to (6,2). Then compare it to 1/2.',
              'Slope = (y₂−y₁)/(x₂−x₁) = (2−0)/(6−0) = 2/6. Simplify 2/6. Is it ≤ 1/2?',
              'Slope = 2/6 = 1/3. Is 1/3 ≤ 1/2? Yes — 1/3 is smaller than 1/2, so the ramp complies.',
            ],
          },
        ],
      },
    ],
  },
];
