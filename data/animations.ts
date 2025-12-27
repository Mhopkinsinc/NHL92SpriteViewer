import { AnimationData } from '../types';

export const ANIMATION_DATA: AnimationData = {
  "metadata": {
    "game": "NHL Hockey (Sega Genesis)",
    "file": "Sprites.anim",
    "total_frames": 549,
    "total_tiles": 5646,
    "directions": 8,
    "ticks_per_second": 60,
    "notes": {
      "timing": "Positive value = display for N ticks then advance. Negative value = display for |N| ticks then loop/end. -4096 ($1000) = hold indefinitely.",
      "frame_indices": "1-based in source, subtract 1 for 0-based array access",
      "directions": "0=N (back visible), 1=NE, 2=E, 3=SE, 4=S (front visible), 5=SW, 6=W, 7=NW"
    }
  },

  "frame_definitions": {
    "SPFskatewp":    { "start": 1,   "count": 40, "description": "Skating with puck (8 dirs × 5 frames)" },
    "SPFskate":      { "start": 41,  "count": 40, "description": "Skating without puck (8 dirs × 5 frames)" },
    "SPFturnl":      { "start": 81,  "count": 8,  "description": "Turn left (8 directions)" },
    "SPFturnr":      { "start": 89,  "count": 8,  "description": "Turn right (8 directions)" },
    "SPFswing":      { "start": 97,  "count": 48, "description": "Stick swing/shot (8 dirs × 6 frames)" },
    "SPFstop":       { "start": 145, "count": 16, "description": "Stop/brake (8 dirs × 2 frames)" },
    "SPFskateb":     { "start": 161, "count": 24, "description": "Skating backwards (8 dirs × 3 frames)" },
    "SPFcelebrate":  { "start": 185, "count": 16, "description": "Celebration (8 dirs × 2 frames)" },
    "SPFpump":       { "start": 201, "count": 16, "description": "Fist pump (8 dirs × 2 frames)" },
    "SPFcup":        { "start": 217, "count": 8,  "description": "Stanley Cup raise (8 directions)" },
    "SPFhipl":       { "start": 225, "count": 8,  "description": "Hip check left (8 directions)" },
    "SPFhipr":       { "start": 233, "count": 8,  "description": "Hip check right (8 directions)" },
    "SPFshoulderl":  { "start": 241, "count": 8,  "description": "Shoulder check left (8 directions)" },
    "SPFshoulderr":  { "start": 249, "count": 8,  "description": "Shoulder check right (8 directions)" },
    "SPFsweep":      { "start": 257, "count": 16, "description": "Poke check/sweep (8 dirs × 2 frames)" },
    "SPFfallback":   { "start": 273, "count": 32, "description": "Fall backward (8 dirs × 4 frames)" },
    "SPFfallfwd":    { "start": 305, "count": 32, "description": "Fall forward (8 dirs × 4 frames)" },
    "SPFduck":       { "start": 337, "count": 8,  "description": "Duck/crouch (8 directions)" },
    "SPFHold":       { "start": 345, "count": 8,  "description": "Hold position (8 directions)" },
    "SPFgloves":     { "start": 353, "count": 1,  "description": "Gloves (single frame)" },
    "SPFfight":      { "start": 354, "count": 17, "description": "Fighting frames" },
    "SPFPen":        { "start": 371, "count": 7,  "description": "Penalty box animations" },
    "SPFarrow":      { "start": 378, "count": 6,  "description": "Arrow indicator" },
    "SPFpad":        { "start": 384, "count": 3,  "description": "Goalie pad" },
    "SPFpuck":       { "start": 387, "count": 11, "description": "Puck animations" },
    "SPFgoal":       { "start": 398, "count": 2,  "description": "Goal indicator" },
    "SPFGoalie":     { "start": 400, "count": 112,"description": "Goalie animations" },
    "SPFLogos":      { "start": 512, "count": 24, "description": "Team logos" },
    "SPFSiren":      { "start": 536, "count": 14, "description": "Goal siren animation" }
  },

  "animations": {
    "SPAgready": {
      "description": "Goalie ready stance",
      "base_frame": 400,
      "dir_offset": 3,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -8 }
      ]
    },

    "SPAgglover": {
      "description": "Goalie glove save right",
      "base_frame": 401,
      "dir_offset": 3,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -32 }
      ]
    },

    "SPAgglovel": {
      "description": "Goalie glove save left",
      "base_frame": 402,
      "dir_offset": 3,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -32 }
      ]
    },

    "SPAgstickr": {
      "description": "Goalie stick save right",
      "base_frame": 464,
      "dir_offset": 2,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -32 }
      ]
    },

    "SPAgstickl": {
      "description": "Goalie stick save left",
      "base_frame": 465,
      "dir_offset": 2,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -32 }
      ]
    },

    "SPAgstackr": {
      "description": "Goalie stack pads right",
      "base_frame": 440,
      "dir_offset": 2,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": 8 },
        { "frame_offset": 1, "ticks": -32 }
      ]
    },

    "SPAgstackl": {
      "description": "Goalie stack pads left",
      "base_frame": 452,
      "dir_offset": 2,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": 8 },
        { "frame_offset": 1, "ticks": -32 }
      ]
    },

    "SPAgswing": {
      "description": "Goalie pass/clear puck",
      "base_frame": 424,
      "dir_offset": 2,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": 5 },
        { "frame_offset": 1, "ticks": 8 },
        { "frame_offset": 0, "ticks": -16 }
      ]
    },

    "SPAgskate": {
      "description": "Goalie skating",
      "base_frame": 480,
      "dir_offset": 4,
      "looping": true,
      "sequence": [
        { "frame_offset": 0, "ticks": 10 },
        { "frame_offset": 1, "ticks": 10 },
        { "frame_offset": 2, "ticks": 10 },
        { "frame_offset": 3, "ticks": -15 }
      ]
    },

    "SPApflip": {
      "description": "Puck spinning animation",
      "base_frame": 388,
      "dir_offset": 0,
      "looping": true,
      "sequence_by_direction": {
        "0": [
          { "frame_offset": 1, "ticks": 4 },
          { "frame_offset": 2, "ticks": 4 },
          { "frame_offset": 3, "ticks": 4 },
          { "frame_offset": 4, "ticks": 4 },
          { "frame_offset": 5, "ticks": 4 },
          { "frame_offset": 2, "ticks": 4 },
          { "frame_offset": 6, "ticks": 4 },
          { "frame_offset": 0, "ticks": -4 }
        ],
        "1": [
          { "frame_offset": 8, "ticks": 2 },
          { "frame_offset": 0, "ticks": 2 },
          { "frame_offset": 7, "ticks": 2 },
          { "frame_offset": 4, "ticks": 2 },
          { "frame_offset": 9, "ticks": 2 },
          { "frame_offset": 4, "ticks": 2 },
          { "frame_offset": 7, "ticks": 2 },
          { "frame_offset": 0, "ticks": -2 }
        ],
        "2": [
          { "frame_offset": 3, "ticks": 2 },
          { "frame_offset": 2, "ticks": 2 },
          { "frame_offset": 1, "ticks": 2 },
          { "frame_offset": 0, "ticks": 2 },
          { "frame_offset": 6, "ticks": 2 },
          { "frame_offset": 2, "ticks": 2 },
          { "frame_offset": 5, "ticks": 2 },
          { "frame_offset": 4, "ticks": -2 }
        ],
        "3": [
          { "frame_offset": 7, "ticks": 4 },
          { "frame_offset": 0, "ticks": 4 },
          { "frame_offset": 8, "ticks": 4 },
          { "frame_offset": 0, "ticks": 4 },
          { "frame_offset": 7, "ticks": 4 },
          { "frame_offset": 4, "ticks": 4 },
          { "frame_offset": 9, "ticks": 4 },
          { "frame_offset": 4, "ticks": -4 }
        ],
        "4": [ { "frame_offset": 0, "ticks": -4096 } ],
        "5": [ { "frame_offset": 0, "ticks": -4096 } ],
        "6": [ { "frame_offset": 4, "ticks": -4096 } ],
        "7": [ { "frame_offset": 4, "ticks": -4096 } ]
      }
    },

    "SPAglide": {
      "description": "Player gliding with stick down",
      "base_frame": 1,
      "dir_offset": 5,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -8 }
      ]
    },

    "SPAskatewp": {
      "description": "Player skating with puck (stick down)",
      "base_frame": 1,
      "dir_offset": 5,
      "looping": true,
      "sequence": [
        { "frame_offset": 1, "ticks": 10 },
        { "frame_offset": 2, "ticks": 10 },
        { "frame_offset": 3, "ticks": 10 },
        { "frame_offset": 4, "ticks": 10 },
        { "frame_offset": 0, "ticks": -15 }
      ]
    },

    "SPAskate": {
      "description": "Player skating without puck (stick up)",
      "base_frame": 41,
      "dir_offset": 5,
      "looping": true,
      "sequence": [
        { "frame_offset": 1, "ticks": 10 },
        { "frame_offset": 2, "ticks": 10 },
        { "frame_offset": 3, "ticks": 10 },
        { "frame_offset": 4, "ticks": 10 },
        { "frame_offset": 0, "ticks": -15 }
      ]
    },

    "SPAturnl": {
      "description": "Player turning left",
      "base_frame": 81,
      "dir_offset": 1,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -18 }
      ]
    },

    "SPAturnr": {
      "description": "Player turning right",
      "base_frame": 89,
      "dir_offset": 1,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -18 }
      ]
    },

    "SPAstop": {
      "description": "Player stop/brake",
      "base_frame": 145,
      "dir_offset": 2,
      "looping": true,
      "sequence": [
        { "frame_offset": 0, "ticks": 4 },
        { "frame_offset": 1, "ticks": -4 }
      ]
    },

    "SPApassf": {
      "description": "Forehand pass",
      "base_frame": 97,
      "dir_offset": 6,
      "looping": false,
      "sequence": [
        { "frame_offset": 3, "ticks": 4 },
        { "frame_offset": 4, "ticks": 4 },
        { "frame_offset": 5, "ticks": -20 }
      ]
    },

    "SPApassb": {
      "description": "Backhand pass",
      "base_frame": 97,
      "dir_offset": 6,
      "looping": false,
      "sequence": [
        { "frame_offset": 3, "ticks": 2, "frame_source": "duck" }, // Note: original json had sequence, assuming fix here if needed, but sticking to source
        { "frame_offset": 3, "ticks": 4 },
        { "frame_offset": 2, "ticks": 4 },
        { "frame_offset": 1, "ticks": -20 }
      ]
    },

    "SPAshotf": {
      "description": "Forehand shot (slapshot)",
      "base_frame": 97,
      "dir_offset": 6,
      "looping": false,
      "sequence": [
        { "frame_offset": 3, "ticks": 4 },
        { "frame_offset": 2, "ticks": 4 },
        { "frame_offset": 1, "ticks": 4 },
        { "frame_offset": 0, "ticks": 4 },
        { "frame_offset": 1, "ticks": 4 },
        { "frame_offset": 2, "ticks": 4 },
        { "frame_offset": 3, "ticks": 4 },
        { "frame_offset": 4, "ticks": 4 },
        { "frame_offset": 5, "ticks": -20 }
      ]
    },

    "SPAshotb": {
      "description": "Backhand shot",
      "base_frame": 97,
      "dir_offset": 6,
      "looping": false,
      "sequence": [
        { "frame_offset": 3, "ticks": 4 },
        { "frame_offset": 4, "ticks": 4 },
        { "frame_offset": 5, "ticks": 4 },
        { "frame_offset": 5, "ticks": 4 },
        { "frame_offset": 5, "ticks": 4 },
        { "frame_offset": 4, "ticks": 4 },
        { "frame_offset": 3, "ticks": 4 },
        { "frame_offset": 2, "ticks": 4 },
        { "frame_offset": 1, "ticks": -20 }
      ]
    },

    "SPAglideback": {
      "description": "Player gliding backwards",
      "base_frame": 161,
      "dir_offset": 3,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -8 }
      ]
    },

    "SPAskateback": {
      "description": "Player skating backwards",
      "base_frame": 161,
      "dir_offset": 3,
      "looping": true,
      "sequence": [
        { "frame_offset": 0, "ticks": 10 },
        { "frame_offset": 1, "ticks": 10 },
        { "frame_offset": 0, "ticks": 10 },
        { "frame_offset": 2, "ticks": -10 }
      ]
    },

    "SPAsweepchk": {
      "description": "Poke check / sweep check",
      "base_frame": 257,
      "dir_offset": 2,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": 4 },
        { "frame_offset": 1, "ticks": 8 },
        { "frame_offset": 0, "ticks": -4 }
      ]
    },

    "SPAshoulderchkl": {
      "description": "Shoulder check left",
      "base_frame": 241,
      "dir_offset": 1,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -24 }
      ]
    },

    "SPAshoulderchkr": {
      "description": "Shoulder check right",
      "base_frame": 249,
      "dir_offset": 1,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -24 }
      ]
    },

    "SPAhipchkl": {
      "description": "Hip check left",
      "base_frame": 225,
      "dir_offset": 1,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -24 }
      ]
    },

    "SPAhipchkr": {
      "description": "Hip check right",
      "base_frame": 233,
      "dir_offset": 1,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -24 }
      ]
    },

    "SPAburst": {
      "description": "Speed burst (C button)",
      "base_frame": 41,
      "dir_offset": 5,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -24 }
      ]
    },

    "SPAHold": {
      "description": "Player trying to hold",
      "base_frame": 345,
      "dir_offset": 1,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -30 }
      ]
    },

    "SPAHold2": {
      "description": "Player holding opponent",
      "base_frame": 345,
      "dir_offset": 1,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -30 }
      ]
    },

    "SPAflail": {
      "description": "Player being held",
      "base_frame": 41,
      "dir_offset": 5,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": -30 }
      ]
    },

    "SPAfallfwd": {
      "description": "Player falling forward",
      "base_frame": 305,
      "dir_offset": 4,
      "looping": false,
      "duck_frame": 337,
      "sequence": [
        { "frame_offset": 0, "ticks": 6 },
        { "frame_offset": 1, "ticks": 6 },
        { "frame_offset": 2, "ticks": 100 },
        { "frame_offset": 3, "ticks": 8 },
        { "frame_source": "duck", "frame_offset": 0, "ticks": -8 }
      ]
    },

    "SPAfallback": {
      "description": "Player falling backward",
      "base_frame": 273,
      "dir_offset": 4,
      "looping": false,
      "duck_frame": 337,
      "sequence": [
        { "frame_offset": 0, "ticks": 6 },
        { "frame_offset": 1, "ticks": 6 },
        { "frame_offset": 2, "ticks": 100 },
        { "frame_offset": 3, "ticks": 8 },
        { "frame_source": "duck", "frame_offset": 0, "ticks": -8 }
      ]
    },

    "SPAcelebrate": {
      "description": "Goal celebration",
      "base_frame": 185,
      "dir_offset": 2,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": 12 },
        { "frame_offset": 1, "ticks": 40 },
        { "frame_offset": 0, "ticks": -5 }
      ]
    },

    "SPApump": {
      "description": "Fist pump celebration",
      "base_frame": 201,
      "dir_offset": 2,
      "looping": false,
      "sequence": [
        { "frame_offset": 0, "ticks": 8 },
        { "frame_offset": 1, "ticks": 8 },
        { "frame_offset": 0, "ticks": -8 }
      ]
    },

    "SPAfight": {
      "description": "Drop gloves for fight",
      "base_frame": 354,
      "dir_offset": 0,
      "looping": false,
      "directions_used": [2, 7],
      "sequence": [
        { "frame_offset": 0, "ticks": 8 },
        { "frame_offset": 1, "ticks": 8 },
        { "frame_offset": 2, "ticks": 8 },
        { "frame_offset": 3, "ticks": -6 }
      ],
      "note": "Direction 7 uses frame_offset+5 for last frame"
    },

    "SPAfgrab": {
      "description": "Fighter grabbing opponent",
      "base_frame": 357,
      "dir_offset": 5,
      "looping": false,
      "directions_used": [2, 7],
      "sequence": [
        { "frame_offset": 1, "ticks": 28 },
        { "frame_offset": 0, "ticks": -4 }
      ]
    },

    "SPAfheld": {
      "description": "Fighter being held",
      "base_frame": 357,
      "dir_offset": 5,
      "looping": false,
      "directions_used": [2, 7],
      "sequence": [
        { "frame_offset": 1, "ticks": 30 },
        { "frame_offset": 0, "ticks": -4 }
      ]
    },

    "SPAfhigh": {
      "description": "Fighter high punch",
      "base_frame": 357,
      "dir_offset": 5,
      "looping": false,
      "directions_used": [2, 7],
      "sequence": [
        { "frame_offset": 2, "ticks": 6 },
        { "frame_offset": 3, "ticks": 16 },
        { "frame_offset": 2, "ticks": 4 },
        { "frame_offset": 0, "ticks": -16 }
      ]
    },

    "SPAflow": {
      "description": "Fighter low punch",
      "base_frame": 357,
      "dir_offset": 5,
      "looping": false,
      "directions_used": [2, 7],
      "sequence": [
        { "frame_offset": 2, "ticks": 6 },
        { "frame_offset": 4, "ticks": 16 },
        { "frame_offset": 2, "ticks": 4 },
        { "frame_offset": 0, "ticks": -16 }
      ]
    },

    "SPAfhith": {
      "description": "Fighter hit by high punch",
      "base_frame": 357,
      "dir_offset": 5,
      "looping": false,
      "directions_used": [2, 7],
      "sequence": [
        { "frame_absolute": 368, "ticks": 16 },
        { "frame_offset": 0, "ticks": -8 }
      ]
    },

    "SPAfhitl": {
      "description": "Fighter hit by low punch",
      "base_frame": 357,
      "dir_offset": 5,
      "looping": false,
      "directions_used": [2, 7],
      "sequence": [
        { "frame_absolute": 367, "ticks": 16 },
        { "frame_offset": 0, "ticks": -8 }
      ]
    },

    "SPAffall": {
      "description": "Fighter knocked down",
      "base_frame": 368,
      "dir_offset": 0,
      "looping": false,
      "directions_used": [7],
      "sequence": [
        { "frame_offset": 0, "ticks": 8 },
        { "frame_offset": 1, "ticks": 8 },
        { "frame_offset": 2, "ticks": 200 },
        { "frame_offset": 2, "ticks": -2 }
      ]
    },

    "SPAwallright": {
      "description": "Jump over boards (legs right)",
      "base_frame": 371,
      "dir_offset": 0,
      "looping": false,
      "directions_used": [0, 2, 6],
      "sequence_by_direction": {
        "0": [
          { "frame_offset": 4, "ticks": 8 },
          { "frame_offset": 5, "ticks": 8 },
          { "frame_offset": 6, "ticks": -8 }
        ],
        "2": [
          { "frame_offset": 0, "ticks": 8 },
          { "frame_offset": 1, "ticks": 8 },
          { "frame_offset": 2, "ticks": 8 },
          { "frame_offset": 3, "ticks": -8 }
        ],
        "6": [
          { "frame_offset": 3, "ticks": 8 },
          { "frame_offset": 2, "ticks": 8 },
          { "frame_offset": 1, "ticks": 8 },
          { "frame_offset": 0, "ticks": -8 }
        ]
      }
    },

    "SPAwallleft": {
      "description": "Jump over boards (legs left)",
      "base_frame": 371,
      "dir_offset": 0,
      "looping": false,
      "directions_used": [0, 2, 6],
      "sequence_by_direction": {
        "0": [
          { "frame_offset": 6, "ticks": 8 },
          { "frame_offset": 5, "ticks": 8 },
          { "frame_offset": 4, "ticks": -8 }
        ],
        "2": [
          { "frame_offset": 3, "ticks": 8 },
          { "frame_offset": 2, "ticks": 8 },
          { "frame_offset": 1, "ticks": 8 },
          { "frame_offset": 0, "ticks": -8 }
        ],
        "6": [
          { "frame_offset": 0, "ticks": 8 },
          { "frame_offset": 1, "ticks": 8 },
          { "frame_offset": 2, "ticks": 8 },
          { "frame_offset": 3, "ticks": -8 }
        ]
      }
    },

    "SPAfaceoff": {
      "description": "Faceoff stick check",
      "base_frame": 1,
      "dir_offset": 0,
      "looping": false,
      "directions_used": [0, 7],
      "sequence_by_direction": {
        "0": [
          { "frame_absolute": 1, "ticks": 2 },
          { "frame_absolute": 258, "ticks": 10 },
          { "frame_absolute": 257, "ticks": -6 }
        ],
        "7": [
          { "frame_absolute": 21, "ticks": 2 },
          { "frame_absolute": 266, "ticks": 10 },
          { "frame_absolute": 265, "ticks": -6 }
        ]
      }
    },

    "SPAfaceoffr": {
      "description": "Faceoff ready stance",
      "base_frame": 1,
      "dir_offset": 0,
      "looping": false,
      "directions_used": [0, 7],
      "sequence_by_direction": {
        "0": [ { "frame_absolute": 1, "ticks": -5 } ],
        "7": [ { "frame_absolute": 21, "ticks": -5 } ]
      }
    },

    "SPAsiren": {
      "description": "Goal siren light",
      "base_frame": 536,
      "dir_offset": 0,
      "looping": true,
      "directions_used": [7],
      "sequence": [
        { "frame_offset": 0, "ticks": 3 },
        { "frame_offset": 1, "ticks": 3 },
        { "frame_offset": 2, "ticks": 3 },
        { "frame_offset": 3, "ticks": 3 },
        { "frame_offset": 4, "ticks": 3 },
        { "frame_offset": 5, "ticks": 3 },
        { "frame_offset": 6, "ticks": 3 },
        { "frame_offset": 7, "ticks": 3 },
        { "frame_offset": 8, "ticks": 3 },
        { "frame_offset": 9, "ticks": 3 },
        { "frame_offset": 10, "ticks": 3 },
        { "frame_offset": 11, "ticks": 3 },
        { "frame_offset": 12, "ticks": 3 },
        { "frame_offset": 13, "ticks": -3 }
      ]
    },

    "SPAstanley": {
      "description": "Skate with Stanley Cup",
      "base_frame": 217,
      "dir_offset": 1,
      "looping": true,
      "sequence": [
        { "frame_offset": 0, "ticks": -30 }
      ]
    }
  },

  "direction_mapping": {
    "0": { "name": "North", "description": "Player facing away (back visible)", "arrow": "↑" },
    "1": { "name": "Northeast", "description": "Diagonal up-right", "arrow": "↗" },
    "2": { "name": "East", "description": "Player facing right", "arrow": "→" },
    "3": { "name": "Southeast", "description": "Diagonal down-right", "arrow": "↘" },
    "4": { "name": "South", "description": "Player facing camera (front visible)", "arrow": "↓" },
    "5": { "name": "Southwest", "description": "Diagonal down-left", "arrow": "↙" },
    "6": { "name": "West", "description": "Player facing left", "arrow": "←" },
    "7": { "name": "Northwest", "description": "Diagonal up-left", "arrow": "↖" }
  },

  "usage_example": {
    "description": "To play SPAskatewp animation for direction 2 (East):",
    "steps": [
      "1. Get animation: animations['SPAskatewp']",
      "2. Calculate base frame for direction: base_frame + (direction * dir_offset) = 1 + (2 * 5) = 11",
      "3. For each step in sequence, actual_frame = base_for_dir + frame_offset",
      "4. Step 0: frame 11+1=12, display for 10 ticks",
      "5. Step 1: frame 11+2=13, display for 10 ticks",
      "6. Step 2: frame 11+3=14, display for 10 ticks", 
      "7. Step 3: frame 11+4=15, display for 10 ticks",
      "8. Step 4: frame 11+0=11, display for 15 ticks (negative = end/loop)",
      "9. Loop back to step 0"
    ]
  }
};
