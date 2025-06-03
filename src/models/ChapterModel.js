import mongoose from 'mongoose';

/*
    mock json data structure provided:-

    {
    "subject": "Mathematics",
    "chapter": "Probability",
    "class": "Class 12",
    "unit": "Algebra",
    "yearWiseQuestionCount": {
      "2019": 4,
      "2020": 6,
      "2021": 2,
      "2022": 4,
      "2023": 5,
      "2024": 9,
      "2025": 5
    },
    "questionSolved": 35,
    "status": "Completed",
    "isWeakChapter": true
    }

*/ 

const yearWiseQuestionCountSchema = new mongoose.Schema({
  '2019': { type: Number, default: 0 },
  '2020': { type: Number, default: 0 },
  '2021': { type: Number, default: 0 },
  '2022': { type: Number, default: 0 },
  '2023': { type: Number, default: 0 },
  '2024': { type: Number, default: 0 },
  '2025': { type: Number, default: 0 },
  
}, { _id: false }); 

const chapterSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  chapter: {
    type: String,
    required: [true, 'Chapter name is required'],
    trim: true,
    unique: true, 
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true,
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
  },
  yearWiseQuestionCount: {
    type: yearWiseQuestionCountSchema,
    default: () => ({}), 
  },
  questionSolved: {
    type: Number,
    default: 0,
    min: [0, 'Question solved cannot be negative'],
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'], 
    default: 'Not Started',
  },
  isWeakChapter: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true, 
});


chapterSchema.index({ subject: 1 });
chapterSchema.index({ class: 1 });
chapterSchema.index({ unit: 1 });
chapterSchema.index({ status: 1 });
chapterSchema.index({ isWeakChapter: 1 });


const Chapter = mongoose.model('Chapter', chapterSchema);

export default Chapter;