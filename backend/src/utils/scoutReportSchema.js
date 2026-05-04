/**
 * ScoutTree Report JSON Schema
 * Defines the structure for opponent scouting reports
 */

const Joi = require('joi');

// Confidence levels
const confidenceLevel = Joi.string().valid('high', 'medium', 'low');

// Opening tree node schema
const openingNodeSchema = Joi.object({
  move: Joi.string().required().description('Move in SAN notation'),
  fen: Joi.string().required().description('FEN position after the move'),
  frequency: Joi.number().integer().min(0).required().description('Number of times played'),
  frequency_pct: Joi.number().min(0).max(100).required().description('Percentage of times played'),
  white_wins: Joi.number().integer().min(0).required(),
  draws: Joi.number().integer().min(0).required(),
  black_wins: Joi.number().integer().min(0).required(),
  white_win_pct: Joi.number().min(0).max(100).required(),
  draw_pct: Joi.number().min(0).max(100).required(),
  black_win_pct: Joi.number().min(0).max(100).required(),
  avg_eval: Joi.number().allow(null).description('Average evaluation from engine'),
  children: Joi.array().items(Joi.link('#openingNode')).default([]),
}).id('openingNode');

// Weakness schema
const weaknessSchema = Joi.object({
  category: Joi.string().required().description('Type of weakness: tactical, positional, endgame, time_management, opening'),
  description: Joi.string().required().description('Human-readable weakness description'),
  confidence: confidenceLevel.required(),
  severity: Joi.string().valid('critical', 'high', 'medium', 'low').required(),
  evidence: Joi.array().items(
    Joi.object({
      game_url: Joi.string().uri().required(),
      move_number: Joi.number().integer().min(1).allow(null),
      position_fen: Joi.string().allow(null),
      description: Joi.string().required(),
    })
  ).required(),
  occurrence_rate: Joi.number().min(0).max(100).description('Percentage of games where this weakness appears'),
  sample_size: Joi.number().integer().min(0).required(),
});

// Recommended line schema
const recommendedLineSchema = Joi.object({
  name: Joi.string().required().description('Name of the recommended line'),
  type: Joi.string().valid('exploitation', 'surprise', 'solid').required(),
  moves: Joi.string().required().description('Line in SAN notation'),
  pgn: Joi.string().required().description('Full PGN of the line'),
  explanation: Joi.string().required().description('Why this line is recommended'),
  success_rate: Joi.number().min(0).max(100).allow(null).description('Historical success rate'),
  follow_up_plan: Joi.string().required().description('What to do after the opening'),
  confidence: confidenceLevel.required(),
  key_positions: Joi.array().items(
    Joi.object({
      fen: Joi.string().required(),
      move_number: Joi.number().integer().min(1).required(),
      comment: Joi.string().required(),
    })
  ).default([]),
});

// Training drill position schema
const trainingPositionSchema = Joi.object({
  fen: Joi.string().required(),
  color_to_move: Joi.string().valid('white', 'black').required(),
  question: Joi.string().required(),
  answer: Joi.string().required().description('Best move or plan'),
  source_game_url: Joi.string().uri().allow(null),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
});

// Time control statistics
const timeControlStatsSchema = Joi.object({
  time_control: Joi.string().required().description('bullet, blitz, rapid, classical, correspondence'),
  games_played: Joi.number().integer().min(0).required(),
  avg_time_per_move: Joi.number().min(0).allow(null).description('Average seconds per move'),
  time_trouble_frequency: Joi.number().min(0).max(100).allow(null).description('Percentage of games in time trouble'),
  blunder_rate_in_time_trouble: Joi.number().min(0).max(100).allow(null),
  performance_rating: Joi.number().integer().min(0).allow(null),
});

// Main scout report schema
const scoutReportSchema = Joi.object({
  report_id: Joi.string().uuid().required(),
  generated_at: Joi.date().iso().required(),
  version: Joi.string().default('1.0.0'),

  // Player profile
  player_profile: Joi.object({
    username: Joi.string().required(),
    platform: Joi.string().valid('lichess', 'chess.com', 'multiple').required(),
    rating: Joi.number().integer().min(0).allow(null),
    title: Joi.string().allow(null).description('GM, IM, FM, etc.'),
    country: Joi.string().allow(null),
    total_games_analyzed: Joi.number().integer().min(0).required(),
    date_range: Joi.object({
      from: Joi.date().iso().allow(null),
      to: Joi.date().iso().allow(null),
    }).required(),
  }).required(),

  // Time control summary
  time_controls_summary: Joi.array().items(timeControlStatsSchema).required(),

  // Opening tree (nested structure)
  opening_tree: Joi.object({
    color: Joi.string().valid('white', 'black', 'both').required(),
    total_games: Joi.number().integer().min(0).required(),
    max_ply: Joi.number().integer().min(0).default(10).description('Depth of analysis in plies'),
    root_positions: Joi.array().items(openingNodeSchema).required(),
  }).required(),

  // Weaknesses with confidence scoring
  weaknesses: Joi.array().items(weaknessSchema).required(),

  // Recommended preparation lines
  recommended_lines: Joi.array().items(recommendedLineSchema).required(),

  // 60-90 second pregame checklist
  pregame_checklist: Joi.object({
    summary: Joi.string().required().description('60-90 second human summary'),
    key_points: Joi.array().items(Joi.string()).min(3).max(7).required(),
    avoid_list: Joi.array().items(Joi.string()).required().description('What NOT to do'),
    priority_prep: Joi.string().required().description('The single most important thing to prepare'),
  }).required(),

  // 30-second training drill
  training_drill: Joi.object({
    title: Joi.string().default('Pre-game warm-up'),
    description: Joi.string().required(),
    positions: Joi.array().items(trainingPositionSchema).length(3).required(),
    time_limit_seconds: Joi.number().integer().default(30),
  }).required(),

  // Metadata
  metadata: Joi.object({
    request_params: Joi.object({
      username: Joi.string().required(),
      platform: Joi.string().required(),
      color: Joi.string().valid('white', 'black', 'both').required(),
      time_control: Joi.string().allow(null),
      max_games: Joi.number().integer().min(1).required(),
      include_engine_analysis: Joi.boolean().default(true),
    }).required(),
    processing_time_ms: Joi.number().integer().min(0).required(),
    cache_hit: Joi.boolean().default(false),
    engine_nodes_analyzed: Joi.number().integer().min(0).default(0),
  }).required(),

  // Data limitations and confidence notes
  data_limitations: Joi.object({
    notes: Joi.array().items(Joi.string()).default([]),
    fuzzy_match_used: Joi.boolean().default(false),
    fuzzy_match_confidence: Joi.number().min(0).max(100).allow(null),
    platforms_unavailable: Joi.array().items(Joi.string()).default([]),
    games_filtered_count: Joi.number().integer().min(0).default(0),
    warnings: Joi.array().items(Joi.string()).default([]),
  }).required(),
});

// Sample report for demo purposes
const sampleScoutReport = {
  report_id: "550e8400-e29b-41d4-a716-446655440000",
  generated_at: new Date().toISOString(),
  version: "1.0.0",

  player_profile: {
    username: "DrNykterstein",
    platform: "lichess",
    rating: 3200,
    title: "GM",
    country: "NO",
    total_games_analyzed: 487,
    date_range: {
      from: "2023-11-01T00:00:00Z",
      to: "2024-11-29T00:00:00Z",
    },
  },

  time_controls_summary: [
    {
      time_control: "blitz",
      games_played: 312,
      avg_time_per_move: 3.2,
      time_trouble_frequency: 12.5,
      blunder_rate_in_time_trouble: 8.3,
      performance_rating: 3215,
    },
    {
      time_control: "rapid",
      games_played: 175,
      avg_time_per_move: 12.8,
      time_trouble_frequency: 4.2,
      blunder_rate_in_time_trouble: 2.1,
      performance_rating: 3180,
    },
  ],

  opening_tree: {
    color: "white",
    total_games: 245,
    max_ply: 10,
    root_positions: [
      {
        move: "e4",
        fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
        frequency: 198,
        frequency_pct: 80.8,
        white_wins: 112,
        draws: 45,
        black_wins: 41,
        white_win_pct: 56.6,
        draw_pct: 22.7,
        black_win_pct: 20.7,
        avg_eval: 0.3,
        children: [
          {
            move: "e5",
            fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
            frequency: 145,
            frequency_pct: 73.2,
            white_wins: 85,
            draws: 32,
            black_wins: 28,
            white_win_pct: 58.6,
            draw_pct: 22.1,
            black_win_pct: 19.3,
            avg_eval: 0.2,
            children: [],
          },
        ],
      },
      {
        move: "d4",
        fen: "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1",
        frequency: 47,
        frequency_pct: 19.2,
        white_wins: 25,
        draws: 12,
        black_wins: 10,
        white_win_pct: 53.2,
        draw_pct: 25.5,
        black_win_pct: 21.3,
        avg_eval: 0.25,
        children: [],
      },
    ],
  },

  weaknesses: [
    {
      category: "tactical",
      description: "Vulnerable to knight forks on f7 square in Italian Game variations",
      confidence: "high",
      severity: "high",
      evidence: [
        {
          game_url: "https://lichess.org/abc123/white",
          move_number: 12,
          position_fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1",
          description: "Missed knight fork allowing Ng5 attacking f7",
        },
      ],
      occurrence_rate: 18.5,
      sample_size: 54,
    },
    {
      category: "time_management",
      description: "Frequently enters time trouble in complex middlegames (under 30 seconds with 15+ moves remaining)",
      confidence: "high",
      severity: "medium",
      evidence: [],
      occurrence_rate: 23.1,
      sample_size: 312,
    },
  ],

  recommended_lines: [
    {
      name: "Italian Game - Aggressive Fried Liver Setup",
      type: "exploitation",
      moves: "1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 6. Nxf7",
      pgn: '[Event "ScoutTree Recommendation"]\n[White "You"]\n[Black "Opponent"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5 5. exd5 Nxd5 6. Nxf7',
      explanation: "Opponent shows tactical weakness around f7. The Fried Liver Attack exploits this directly. In database, opponent struggled in 4/7 games with this pattern.",
      success_rate: 57.1,
      follow_up_plan: "After 6...Kxf7 7. Qf3+ Ke6, continue with 8. Nc3 targeting the exposed king. Memorize lines up to move 12.",
      confidence: "high",
      key_positions: [
        {
          fen: "r1bqkb1r/ppp2ppp/2n5/3np1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 6",
          move_number: 6,
          comment: "Critical position - take on f7 with check",
        },
      ],
    },
    {
      name: "Scotch Game - Mieses Variation",
      type: "solid",
      moves: "1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5",
      pgn: '[Event "ScoutTree Recommendation"]\n[White "You"]\n[Black "Opponent"]\n\n1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Nf6 5. Nxc6 bxc6 6. e5',
      explanation: "A solid positional choice that gives long-term pressure. Opponent has limited experience with this line (only 2 games in database).",
      success_rate: null,
      follow_up_plan: "Develop with Bc4, Qe2, and castle queenside for an attacking setup",
      confidence: "medium",
      key_positions: [],
    },
  ],

  pregame_checklist: {
    summary: "You're facing a 3200-rated GM who excels in sharp tactical positions but shows weakness around the f7 square in Italian Game setups. They occasionally get into time trouble in complex middlegames. Your best bet is the Fried Liver Attack or similar f7 exploitation, keeping the position sharp and tactical. Avoid slow, positional play where their superior technique will grind you down. Be prepared for aggressive counter-play and have your tactics sharp.",
    key_points: [
      "Target f7 square - opponent vulnerable to knight forks and sacrifices here",
      "Keep time control in mind - aim for complex middlegames to induce time pressure",
      "Prepare Italian Game/Fried Liver Attack lines to move 12",
      "Avoid Queen's Gambit - opponent's best opening with 68% win rate",
      "Don't play slow maneuvering - opponent excels in technical endgames",
    ],
    avoid_list: [
      "Queen's Gambit Declined - opponent's specialty",
      "Berlin Defense - leads to endgames where opponent is stronger",
      "Trading queens early - removes tactical opportunities",
    ],
    priority_prep: "Memorize Fried Liver Attack critical lines, especially the Nxf7 sacrifice continuation and ensuing king hunt up to move 12.",
  },

  training_drill: {
    title: "Pre-game warm-up: f7 tactical patterns",
    description: "Practice recognizing f7 weaknesses - the key to your preparation against this opponent",
    positions: [
      {
        fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1",
        color_to_move: "white",
        question: "How does White exploit the f7 weakness?",
        answer: "Ng5 attacking f7, and if ...d5 then exd5 followed by Nxf7 or Qf3",
        source_game_url: "https://lichess.org/sample123",
        difficulty: "medium",
      },
      {
        fen: "r1bqkb1r/ppp2ppp/2n5/3np1N1/2B1P3/8/PPPP1PPP/RNBQK2R w KQkq - 0 6",
        color_to_move: "white",
        question: "What is White's strongest continuation?",
        answer: "Nxf7! Kxf7 Qf3+ Ke6 Nc3 with a devastating attack on the exposed king",
        source_game_url: null,
        difficulty: "easy",
      },
      {
        fen: "r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2PP1N2/PP3PPP/RNBQ1RK1 w - - 0 1",
        color_to_move: "white",
        question: "Is there a tactical blow here?",
        answer: "Not immediately - f7 is well defended. Look for Ng5 after weakening moves like ...h6",
        source_game_url: null,
        difficulty: "hard",
      },
    ],
    time_limit_seconds: 30,
  },

  metadata: {
    request_params: {
      username: "DrNykterstein",
      platform: "lichess",
      color: "white",
      time_control: "blitz",
      max_games: 500,
      include_engine_analysis: true,
    },
    processing_time_ms: 45230,
    cache_hit: false,
    engine_nodes_analyzed: 1247,
  },

  data_limitations: {
    notes: [
      "Analysis limited to publicly available games",
      "Some games may be filtered due to time control mismatches",
      "Engine analysis performed at depth 20 for blitz games",
    ],
    fuzzy_match_used: false,
    fuzzy_match_confidence: null,
    platforms_unavailable: [],
    games_filtered_count: 13,
    warnings: [
      "High-rated player - sample size may be limited for specific variations",
    ],
  },
};

module.exports = {
  scoutReportSchema,
  sampleScoutReport,
  validateScoutReport: (report) => scoutReportSchema.validate(report, { abortEarly: false }),
};
