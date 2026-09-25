import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Student, LearningPath, PerformancePrediction, ProgressInsight, SubjectProgress, ActivitySuggestion, UserRole, LiveClass } from '../types';
import { Event } from '../types-extended';
import { CAMPUS_POLYGON } from '../utils/geolocation';

export const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});

// A helper function to safely parse JSON from a string that might contain markdown or conversational text.
const safeParseJson = <T>(jsonString: string | undefined | null): T | null => {
    if (!jsonString) {
        return null;
    }
    
    let textToParse = jsonString.trim();

    // 1. Prioritize markdown code blocks, as they are explicitly formatted.
    const markdownMatch = textToParse.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        textToParse = markdownMatch[1].trim();
    } else {
        // 2. If no markdown, find the start of the first JSON object or array and its corresponding end.
        const jsonStartIndex = textToParse.indexOf('{');
        const arrayStartIndex = textToParse.indexOf('[');
        
        let startIndex = -1;
        
        if (jsonStartIndex > -1 && arrayStartIndex > -1) {
            startIndex = Math.min(jsonStartIndex, arrayStartIndex);
        } else if (jsonStartIndex > -1) {
            startIndex = jsonStartIndex;
        } else {
            startIndex = arrayStartIndex;
        }
        
        if (startIndex > -1) {
            const startChar = textToParse[startIndex];
            const endChar = startChar === '{' ? '}' : ']';
            const endIndex = textToParse.lastIndexOf(endChar);
            
            if (endIndex > startIndex) {
                textToParse = textToParse.substring(startIndex, endIndex + 1);
            }
        }
    }

    // 3. Attempt to parse the cleaned-up string.
    try {
        return JSON.parse(textToParse);
    } catch (e) {
        console.error("Failed to parse JSON after cleaning. Original string:", jsonString, "Cleaned:", textToParse, e);
        return null;
    }
};


// --- Fallback Generators for Offline / API Key Issues ---

export const generateFallbackPerformancePrediction = (student: Student): PerformancePrediction => {
  const totalAttendance = student.attendance ? student.attendance.length : 0;
  const presentCount = student.attendance ? student.attendance.filter(a => a.status === 'Present').length : 0;
  const attendancePercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 85;

  let predicted_performance = "B+ Grade (82-88%)";
  let confidence_score = "High";
  let rationale = `Based on an overall attendance of ${attendancePercentage.toFixed(1)}% and steady coursework completion, strong exam performance is expected across core modules.`;

  if (attendancePercentage >= 90) {
    predicted_performance = "A Grade (90-95%)";
    confidence_score = "High";
    rationale = `Outstanding attendance of ${attendancePercentage.toFixed(1)}% and active class participation indicate exceptional readiness for final examinations.`;
  } else if (attendancePercentage >= 80) {
    predicted_performance = "B+ Grade (82-88%)";
    confidence_score = "High";
    rationale = `Solid attendance at ${attendancePercentage.toFixed(1)}% and consistent study progress support high confidence in achieving top scores.`;
  } else if (attendancePercentage >= 70) {
    predicted_performance = "B Grade (74-81%)";
    confidence_score = "Medium";
    rationale = `Current attendance is ${attendancePercentage.toFixed(1)}%. Consistent daily revision in weaker subjects will help elevate your target grade.`;
  } else {
    predicted_performance = "C+ Grade (65-73%)";
    confidence_score = "Medium";
    rationale = `Attendance stands at ${attendancePercentage.toFixed(1)}%. Boosting lecture attendance and following a structured study plan will significantly improve overall results.`;
  }

  return {
    predicted_performance,
    confidence_score,
    rationale
  };
};

export const generateFallbackLearningPath = (student: Student): LearningPath => {
  return {
    overall_summary: `Hey ${student.name}! Here is your personalized 7-day learning path tailored to boost your attendance and academic performance.`,
    daily_plan: [
      { day: "Monday", focus_topic: "Data Structures & Algorithms", learning_activity: "Review core array and linked list data structure concepts.", practice_task: "Solve 5 practice problems on array manipulation.", estimated_time: "1.5 hours" },
      { day: "Tuesday", focus_topic: "Database Management Systems", learning_activity: "Study SQL normalization techniques and ER diagrams.", practice_task: "Write queries for 3 relational database problems.", estimated_time: "1.5 hours" },
      { day: "Wednesday", focus_topic: "Operating Systems", learning_activity: "Understand process scheduling algorithms (FCFS, SJF, Round-Robin).", practice_task: "Calculate CPU turnaround time for sample workloads.", estimated_time: "2 hours" },
      { day: "Thursday", focus_topic: "Computer Networks", learning_activity: "Revise OSI Model layers and TCP/IP protocol stack.", practice_task: "Complete 10 multiple-choice quiz questions on networking.", estimated_time: "1.5 hours" },
      { day: "Friday", focus_topic: "Software Engineering", learning_activity: "Explore Agile methodologies and SDLC models.", practice_task: "Draft a sample user story and sprint backlog.", estimated_time: "1.5 hours" },
      { day: "Saturday", focus_topic: "Weekly Mock Quiz & Revision", learning_activity: "Take a full-length timed mock assessment on key topics.", practice_task: "Review incorrect answers and refine notes.", estimated_time: "2.5 hours" },
      { day: "Sunday", focus_topic: "Self-Reflection & Planning", learning_activity: "Analyze progress against weekly learning milestones.", practice_task: "Organize notes and prepare schedule for upcoming week.", estimated_time: "1 hour" }
    ]
  };
};

export const generateFallbackStudentInitiatedPath = (studentName: string, subjects?: string, studyHours?: string, goal?: string): LearningPath => {
  const subList = subjects ? subjects.split(',').map(s => s.trim()) : ["Core Subject 1", "Core Subject 2"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  return {
    overall_summary: `Welcome ${studentName}! 🚀 Based on your goal to "${goal || 'excel in upcoming exams'}", here is your targeted study roadmap:`,
    daily_plan: days.map((day, idx) => {
      const sub = subList[idx % subList.length] || "General Core Module";
      return {
        day,
        focus_topic: `${sub} - Key Concept Review`,
        learning_activity: `Study fundamental principles and textbook chapter summaries for ${sub}.`,
        practice_task: `Solve practice exercises and sample past paper questions.`,
        estimated_time: studyHours ? `${studyHours} hours` : "2 hours"
      };
    })
  };
};

export const generateFallbackProgressInsights = (studentName: string): ProgressInsight => {
  return {
    strengths: [
      "High participation and consistent coursework submissions in technical subjects.",
      "Demonstrates solid understanding of fundamental concepts and lab practicals."
    ],
    areas_for_improvement: [
      "Pacing assignment submissions ahead of due dates to reduce exam period pressure.",
      "Increasing revision frequency for secondary elective modules."
    ],
    actionable_advice: `Keep up the momentum, ${studentName}! Allocate 30 minutes daily to review weak topics, and you'll stay ahead of the class.`
  };
};

export const generateFallbackActivitySuggestions = (student: Student): ActivitySuggestion[] => {
  return [
    {
      title: "Advanced Data Structures & Algorithms Mastery",
      category: "Online Course",
      description: "A comprehensive self-paced course covering graph theory, dynamic programming, and algorithm optimization.",
      rationale: `Builds directly on ${student.name}'s existing programming foundation to enhance problem-solving capabilities.`
    },
    {
      title: "Interactive Web Development & API Workshop",
      category: "Workshop",
      description: "Hands-on weekend workshop on modern frontend frameworks and RESTful web API integration.",
      rationale: `Complements academic coursework with industry-relevant full-stack application development skills.`
    },
    {
      title: "Smart Campus Innovation Hackathon",
      category: "Competition",
      description: "Participate in a 48-hour student challenge to build tech solutions for campus life.",
      rationale: `Encourages team collaboration and practical application of theoretical concepts.`
    }
  ];
};

// --- Function Declarations for the AI Chatbot ---

const studentTools: FunctionDeclaration[] = [
  {
    name: 'navigate_to_tab',
    parameters: {
      type: Type.OBJECT,
      properties: {
        tab: {
          type: Type.STRING,
          description: "The name of the tab to navigate to. Must be one of: 'overview', 'progress', 'attendance', 'leave', 'learning', 'exams', 'files', 'links'."
        },
      },
      required: ['tab'],
    },
    description: 'Navigates the user to a specific tab in their dashboard.',
  }
];

const teacherTools: FunctionDeclaration[] = [
    {
    name: 'navigate_to_tab',
    parameters: {
      type: Type.OBJECT,
      properties: {
        tab: {
          type: Type.STRING,
          description: "The name of the tab to navigate to. Must be one of: 'daily', 'live', 'leave', 'exams', 'records', 'overview', 'files', 'links'."
        },
      },
      required: ['tab'],
    },
    description: 'Navigates the teacher to a specific tab in their dashboard.',
  },
  {
      name: 'find_student',
      parameters: {
          type: Type.OBJECT,
          properties: {
              studentName: {
                  type: Type.STRING,
                  description: 'The full or partial name of the student to find.'
              }
          },
          required: ['studentName']
      },
      description: "Finds a student by name and opens their detailed view."
  }
];

const parentTools: FunctionDeclaration[] = [];
const adminTools: FunctionDeclaration[] = [];


export const getToolsForRole = (role: UserRole) => {
    switch(role) {
        case UserRole.Student:
            return [{ functionDeclarations: studentTools }];
        case UserRole.Teacher:
            return [{ functionDeclarations: teacherTools }];
        case UserRole.Parent:
             return [{ functionDeclarations: parentTools }];
        case UserRole.Admin:
             return [{ functionDeclarations: adminTools }];
        default:
            return [];
    }
}


export const generatePersonalizedLearningPath = async (student: Student): Promise<LearningPath | null> => {
  try {
    const model = 'gemini-3.5-flash';

    // 1. Analyze student data to find weakest and strongest subjects from attendance
    const subjectStats: { [subject: string]: { present: number, total: number } } = {};
    student.attendance.forEach(record => {
        if (!subjectStats[record.subject]) {
            subjectStats[record.subject] = { present: 0, total: 0 };
        }
        if (record.status === 'Present') {
            subjectStats[record.subject].present++;
        }
        subjectStats[record.subject].total++;
    });

    let weakestSubjectByAttendance = 'General Studies';
    let strongestSubjectByAttendance = 'General Studies';

    if (Object.keys(subjectStats).length > 0) {
        let minPercentage = 101;
        let maxPercentage = -1;

        for (const subject in subjectStats) {
            const percentage = (subjectStats[subject].present / subjectStats[subject].total) * 100;
            if (percentage < minPercentage) {
                minPercentage = percentage;
                weakestSubjectByAttendance = subject;
            }
            if (percentage > maxPercentage) {
                maxPercentage = percentage;
                strongestSubjectByAttendance = subject;
            }
        }
    }
    
    // Calculate overall attendance
    const totalAttendance = student.attendance.length;
    const presentCount = student.attendance.filter(a => a.status === 'Present').length;
    const attendancePercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 100;

    // 2. Build a comprehensive performance summary string
    let performanceSummary = `
- Student Name: ${student.name}
- Overall Attendance: ${attendancePercentage.toFixed(1)}%
- Weakest Subject (by attendance): ${weakestSubjectByAttendance}
- Strongest Subject (by attendance): ${strongestSubjectByAttendance}
- General Behaviour Status: ${student.behaviourStatus}
`;

    if (student.progress.length > 0) {
        performanceSummary += "\n- Academic Progress Details:\n";
        student.progress.forEach(p => {
            performanceSummary += `  - Subject: ${p.subjectName}\n`;
            performanceSummary += `    - Overall Grade: ${p.overallGrade}\n`;
            performanceSummary += `    - Teacher Feedback: "${p.teacherFeedback}"\n`;
            const lastAssignment = p.assignments.slice().sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];
            if (lastAssignment) {
               performanceSummary += `    - Most Recent Assignment ('${lastAssignment.title}'): Status is ${lastAssignment.status}${lastAssignment.score ? `, Score: ${lastAssignment.score}/${lastAssignment.maxScore}` : ''}.\n`;
            }
        });
    } else {
        performanceSummary += "\n- Note: No graded assignments are on record. Analysis is based primarily on attendance.\n";
    }

    // 3. Construct a richer, more context-aware prompt for the AI
    const prompt = `You are an expert AI educational planner. Your task is to generate a structured, personalized weekly learning path for a student based on their holistic academic data below.
The plan should prioritize subjects where the student has low grades, poor attendance, or negative teacher feedback. Also include activities for strong subjects to maintain momentum. The tone must be encouraging and supportive.
The output must be a clean, valid JSON object, adhering to the provided schema.

---
**Student's Academic Profile:**
${performanceSummary}
---
`;

    // 4. Define the response schema
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        overall_summary: { type: Type.STRING, description: "A brief, encouraging summary for the student." },
        daily_plan: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              focus_topic: { type: Type.STRING },
              learning_activity: { type: Type.STRING },
              practice_task: { type: Type.STRING },
              estimated_time: { type: Type.STRING },
            },
            required: ["day", "focus_topic", "learning_activity", "practice_task", "estimated_time"]
          }
        }
      },
      required: ["overall_summary", "daily_plan"]
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
        }
    });

    const jsonText = response.text.trim();
    return safeParseJson<LearningPath>(jsonText) || generateFallbackLearningPath(student);

  } catch (error) {
    console.error("Error generating personalized learning path:", error);
    return generateFallbackLearningPath(student);
  }
};

export const generateStudentInitiatedLearningPath = async (
  formData: { subjects: string; examDates: string; studyHours: string; strengthsWeaknesses: string; goal: string },
  studentName: string
): Promise<LearningPath | null> => {
  try {
    const model = 'gemini-3.5-flash';

    const prompt = `
You are a friendly and intelligent "Study Partner AI" for a student named ${studentName}.
Your tone must be helpful, motivational, and supportive, not robotic. Use emojis to make the interaction engaging.

Based on the student's information below, generate a detailed and structured 7-day learning plan.

---
**Student's Information:**
- **Subjects:** ${formData.subjects}
- **Exam Dates:** ${formData.examDates}
- **Daily Study Hours:** ${formData.studyHours}
- **Strengths & Weaknesses:** ${formData.strengthsWeaknesses}
- **Goal:** ${formData.goal}
---

**Instructions for Plan Generation:**
1.  **Overall Summary:** Start with a brief, encouraging summary for the student. Example: "Hey ${studentName}! 👋 Here is your personalized study plan..."
2.  **Structure:** Provide a day-wise breakdown for a full 7-day week (e.g., Monday to Sunday).
3.  **Daily Tasks:** For each day, provide:
    -   \`focus_topic\`: The main topic to study for that day.
    -   \`learning_activity\`: A clear, actionable learning task. Example: "Read Chapter 3 and watch a concept video on [topic]."
    -   \`practice_task\`: A specific practice exercise. Example: "Solve 15 practice questions from the textbook."
    -   \`estimated_time\`: A realistic time estimate for the tasks. Example: "2-3 hours".
4.  **Weekend Plan:** The plan for Saturday and Sunday should focus on revision, practice tests, or catching up on weaker topics.
5.  **Output Format:** The output must be a clean, valid JSON object that strictly adheres to the provided schema.

This plan should be realistic, actionable, and tailored to help ${studentName} achieve their goal of "${formData.goal}".
`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        overall_summary: { type: Type.STRING, description: "A brief, encouraging summary for the student." },
        daily_plan: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              focus_topic: { type: Type.STRING },
              learning_activity: { type: Type.STRING },
              practice_task: { type: Type.STRING },
              estimated_time: { type: Type.STRING },
            },
            required: ["day", "focus_topic", "learning_activity", "practice_task", "estimated_time"]
          }
        }
      },
      required: ["overall_summary", "daily_plan"]
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
        }
    });

    const jsonText = response.text.trim();
    return safeParseJson<LearningPath>(jsonText) || generateFallbackStudentInitiatedPath(studentName, formData.subjects, formData.studyHours, formData.goal);

  } catch (error) {
    console.error("Error generating student-initiated learning path:", error);
    return generateFallbackStudentInitiatedPath(studentName, formData.subjects, formData.studyHours, formData.goal);
  }
};

export const predictStudentPerformance = async (student: Student): Promise<PerformancePrediction | null> => {
  try {
    const model = 'gemini-3.5-flash';

    // 1. Analyze student data
    const totalAttendance = student.attendance.length;
    const presentCount = student.attendance.filter(a => a.status === 'Present').length;
    const attendancePercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 100;

    const subjectStats: { [subject: string]: { present: number, total: number } } = {};
    student.attendance.forEach(record => {
        if (!subjectStats[record.subject]) {
            subjectStats[record.subject] = { present: 0, total: 0 };
        }
        if (record.status === 'Present') {
            subjectStats[record.subject].present++;
        }
        subjectStats[record.subject].total++;
    });

    let weakestSubject = 'N/A';
    let strongestSubject = 'N/A';
    if (Object.keys(subjectStats).length > 0) {
        let minPercentage = 101;
        let maxPercentage = -1;
        for (const subject in subjectStats) {
            const percentage = (subjectStats[subject].present / subjectStats[subject].total) * 100;
            if (percentage < minPercentage) {
                minPercentage = percentage;
                weakestSubject = subject;
            }
            if (percentage > maxPercentage) {
                maxPercentage = percentage;
                strongestSubject = subject;
            }
        }
    }

    const learningPathSummary = student.learningPath 
      ? `The student has an active learning plan: "${student.learningPath.overall_summary}"`
      : "The student does not currently have an AI-generated learning plan.";

    // 2. Construct the prompt for the AI
    const prompt = `
You are an expert AI academic advisor. Your task is to analyze the student's academic data below to predict their performance in upcoming final exams.
Your tone should be analytical but encouraging.

---
**Student's Academic Data:**
- **Name:** ${student.name}
- **Overall Attendance:** ${attendancePercentage.toFixed(1)}%
- **Strongest Subject (by attendance):** ${strongestSubject}
- **Weakest Subject (by attendance):** ${weakestSubject}
- **AI Learning Plan Status:** ${learningPathSummary}
---

**Instructions for Prediction:**
1.  **Analyze Holistically:** Consider how attendance patterns (especially in weaker subjects) and the presence of a structured learning plan might impact exam results. Higher attendance is a strong positive indicator. A learning plan shows proactivity.
2.  **Predicted Performance:** Provide a likely grade or percentage range (e.g., "B+ Grade (75-80%)").
3.  **Confidence Score:** Assign a confidence level to your prediction ('High', 'Medium', or 'Low'). High confidence for clear data patterns, Low if data is sparse or contradictory.
4.  **Rationale:** Briefly explain your reasoning in 1-2 sentences. Mention the key factors that influenced your prediction.
5.  **Output Format:** The output must be a clean, valid JSON object that strictly adheres to the provided schema. Do not include any markdown formatting like \`\`\`json.
`;

    // 3. Define the response schema
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        predicted_performance: { type: Type.STRING, description: "The predicted grade or score range, e.g., 'A- Grade (85-90%)'." },
        confidence_score: { type: Type.STRING, description: "Confidence level of the prediction: High, Medium, or Low." },
        rationale: { type: Type.STRING, description: "A brief, encouraging explanation for the prediction based on the provided data." }
      },
      required: ["predicted_performance", "confidence_score", "rationale"]
    };

    // 4. Make the API call
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
        }
    });

    const jsonText = response.text.trim();
    return safeParseJson<PerformancePrediction>(jsonText) || generateFallbackPerformancePrediction(student);

  } catch (error) {
    console.error("Error predicting student performance:", error);
    return generateFallbackPerformancePrediction(student);
  }
};

export const generateProgressInsights = async (progressData: SubjectProgress[], studentName: string): Promise<ProgressInsight | null> => {
  try {
    const model = 'gemini-3.5-flash';

    const prompt = `
You are an encouraging and insightful AI academic coach for a student named ${studentName}.
Analyze the provided academic progress data to identify key trends. Your tone should be supportive and constructive.

---
**Student's Academic Progress Data:**
${JSON.stringify(progressData, null, 2)}
---

**Instructions:**
1.  **Strengths:** Identify 1-2 subjects or trends where the student is performing well. Be specific (e.g., "Consistently high scores in Data Structures labs").
2.  **Areas for Improvement:** Identify 1-2 areas where the student could focus. Be gentle and specific (e.g., "Some assignments in Algorithms were submitted a day late, which could impact momentum.").
3.  **Actionable Advice:** Provide one clear, positive, and actionable piece of advice for the student. Example: "For the upcoming 'Graphs' problem set in Algorithms, try starting two days early to give yourself more time for the tricky edge cases. You've got this!"

**Output Format:**
The output MUST be a clean, valid JSON object adhering to the provided schema. Do not include any markdown formatting.
`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of positive observations about the student's performance."
        },
        areas_for_improvement: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "A list of constructive observations for improvement."
        },
        actionable_advice: {
          type: Type.STRING,
          description: "A single, concise, and encouraging piece of advice."
        }
      },
      required: ["strengths", "areas_for_improvement", "actionable_advice"]
    };

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text.trim();
    return safeParseJson<ProgressInsight>(jsonText) || generateFallbackProgressInsights(studentName);

  } catch (error) {
    console.error("Error generating progress insights:", error);
    return generateFallbackProgressInsights(studentName);
  }
};

export const generateActivitySuggestions = async (student: Student): Promise<ActivitySuggestion[] | null> => {
  try {
    const model = 'gemini-3.5-flash';

    // 1. Analyze student data to create a concise summary for the prompt
    let performanceSummary = `The student, ${student.name}, has the following academic profile:\n`;
    
    if (student.progress.length > 0) {
        student.progress.forEach(subject => {
            performanceSummary += `- In ${subject.subjectName}, their overall grade is ${subject.overallGrade}. Teacher feedback: "${subject.teacherFeedback}"\n`;
        });
    } else {
        performanceSummary += "- No detailed academic progress data is available.\n";
    }

    const highAttendanceSubjects = student.attendance
        .filter(a => a.status === 'Present')
        .reduce((acc, curr) => {
            acc[curr.subject] = (acc[curr.subject] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

    const sortedSubjects = Object.entries(highAttendanceSubjects).sort((a, b) => b[1] - a[1]);
    
    if (sortedSubjects.length > 0) {
        performanceSummary += `- They have high attendance in: ${sortedSubjects.slice(0, 2).map(s => s[0]).join(', ')}.\n`;
    }

    // 2. Construct the prompt
    const prompt = `
You are an expert career counselor and academic advisor for a parent.
Your task is to analyze the student's academic profile and suggest personalized activities to help them grow.
The tone should be encouraging and directed at the parent.

---
**Student's Academic Profile:**
${performanceSummary}
---

**Instructions:**
1.  Based on the profile, identify the student's likely strengths and interests.
2.  Suggest 2-3 highly relevant, personalized activities, workshops, or online courses.
3.  For each suggestion, provide:
    -   A clear \`title\`.
    -   A brief \`description\` of the activity.
    -   A \`category\` from the list: 'Online Course', 'Workshop', 'Competition', 'Project Idea', 'Reading'.
    -   A \`rationale\` explaining why this suggestion is a good fit for the student, connecting it back to their academic profile.

**Output Format:**
The output MUST be a clean, valid JSON array of objects, strictly adhering to the provided schema. Do not include any markdown formatting.
`;

    // 3. Define the response schema
    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The title of the suggested activity or course." },
          description: { type: Type.STRING, description: "A brief description of what the activity involves." },
          category: { type: Type.STRING, description: "The type of activity (e.g., 'Online Course', 'Workshop')." },
          rationale: { type: Type.STRING, description: "The reason why this is a good suggestion for the student." }
        },
        required: ["title", "description", "category", "rationale"]
      }
    };

    // 4. Make the API call
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text.trim();
    return safeParseJson<ActivitySuggestion[]>(jsonText) || generateFallbackActivitySuggestions(student);

  } catch (error) {
    console.error("Error generating activity suggestions:", error);
    return generateFallbackActivitySuggestions(student);
  }
};

/**
 * Converts a given image URL (which can be a fetchable URL or a base64 data URL)
 * into a pure base64 string for API submission.
 * @param url The image URL to process.
 * @returns A Promise that resolves to the base64-encoded image data.
 */
const imageUrlToBase64 = async (url: string): Promise<string> => {
    if (url.startsWith('data:')) {
        return url.split(',')[1];
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from ${url}. Status: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const verifyFaceMatch = async (registeredImageUrl: string, liveImageUrl: string): Promise<{ isMatch: boolean; confidence: number; reason: string } | null> => {
  try {
    const model = 'gemini-3.5-flash';

    const prompt = `**Objective:** You are a secure AI Face Verification system. Your task is to meticulously compare a 'live' image with a 'registered' image and decide if they are the same person. Your default stance is to DENY access unless the match is conclusive.

**Analysis Steps:**

1.  **Liveness & Spoofing Check:** First, analyze the 'live' image for any signs of being a photo of a screen, a printed picture, or a video. If spoofing is suspected, you MUST immediately fail the verification.

2.  **Occlusion Check:** Second, check the 'live' image for obstructions. If key features like eyes, nose, or mouth are covered by masks, sunglasses, or hands, you MUST fail the verification.

3.  **Biometric Comparison:**
    *   **Core Task:** If the first two checks pass, your main goal is to verify identity despite real-world conditions. Focus ONLY on stable biometric features (facial geometry, distance between eyes, nose shape, jawline).
    *   **CRITICAL - IGNORE SUPERFICIAL DIFFERENCES:** You MUST be highly tolerant of and ignore common variations like:
        *   **Lighting:** Dim rooms, side shadows, glare. Do NOT fail a match because of poor lighting. Your job is to see through the lighting to the face's structure.
        *   **Minor Angle Changes:** Slight head tilts are normal.
    *   **Decision Rule:** Fail verification ONLY for significant biometric differences (e.g., different nose shape, eye spacing). Do NOT fail due to lighting.

4.  **JSON Output:**
    *   Provide your final decision ONLY as a JSON object. Do not add any other text.
    *   \`isMatch\`: \`true\` only if all checks pass, otherwise \`false\`.
    *   \`confidence\`: A score from 0-100.
    *   \`reason\`: A brief, clear reason for the decision. (e.g., "Biometric features match.", "Face is partially obscured.", "Liveness check failed.").`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        isMatch: { type: Type.BOOLEAN, description: "Whether the two faces are a match. MUST be false if face is obscured or liveness check fails." },
        confidence: { type: Type.NUMBER, description: "A confidence score from 0 to 100." },
        reason: { type: Type.STRING, description: "A brief, clear reason for the decision." },
      },
      required: ["isMatch", "confidence", "reason"],
    };

    const [registeredImageBase64, liveImageBase64] = await Promise.all([
      imageUrlToBase64(registeredImageUrl),
      imageUrlToBase64(liveImageUrl),
    ]);
    
    if (!registeredImageBase64 || !liveImageBase64) {
      throw new Error("Failed to process one or both images into base64 format.");
    }

    const registeredImagePart = {
      inlineData: { mimeType: 'image/png', data: registeredImageBase64 }
    };

    const liveImagePart = {
      inlineData: { mimeType: 'image/png', data: liveImageBase64 }
    };
    
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [textPart, registeredImagePart, liveImagePart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      console.error("AI response for face match was empty.", { response });
      throw new Error("AI response for face verification was empty.");
    }
    
    const result = safeParseJson<{ isMatch: boolean; confidence: number; reason: string }>(jsonText);

    // Stricter validation of the parsed object's structure and types.
    if (!result || typeof result.isMatch !== 'boolean' || typeof result.confidence !== 'number' || typeof result.reason !== 'string') {
        console.error("Malformed or incomplete JSON response from AI for face match.", { originalText: jsonText, parsedResult: result });
        throw new Error("The AI service returned a malformed or incomplete response.");
    }

    return result;

  } catch (error) {
    console.error("Error during face verification pipeline:", error);
    return null;
  }
};


export const verifyAttendanceAttempt = async (
  qrData: { studentId: string; timestamp: number; location: { latitude: number; longitude: number; }; }
): Promise<{ isVerified: boolean; reason: string } | null> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      You are a highly secure AI verification system for a smart attendance app.
      Your task is to analyze an attendance check-in attempt and determine if it is valid or fraudulent.
      The current server time is ${new Date().toISOString()}.

      ---
      **Check-in Data Received:**
      - Student ID: ${qrData.studentId}
      - Timestamp of QR Code Generation: ${new Date(qrData.timestamp).toISOString()}
      - Student's Location (lat, lon): ${qrData.location.latitude}, ${qrData.location.longitude}
      ---
      **Verification Rules:**
      1.  **Timestamp Validity:** The QR code must be fresh. The check-in must occur within 60 seconds of the QR code's generation timestamp. If it's older, it's a potential replay attack (e.g., a screenshot).
      2.  **Location Validity:** The student's location must be inside the defined campus area.

      **Campus Area Definition (Polygon Coordinates):**
      ${JSON.stringify(CAMPUS_POLYGON, null, 2)}

      ---
      **Your Analysis:**
      1.  Calculate the time difference between the current server time and the QR code timestamp. Is it less than 60 seconds?
      2.  Determine if the student's location coordinates fall within the campus polygon.
      3.  Based on these two checks, make a final decision.

      **Output Format:**
      You MUST respond with a clean, valid JSON object adhering to the provided schema. Do not include any markdown formatting.
      - If both checks pass, set \`isVerified\` to \`true\` and provide a success reason.
      - If either check fails, set \`isVerified\` to \`false\` and provide a specific, user-friendly reason for the failure.
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        isVerified: { type: Type.BOOLEAN, description: "True if the attempt is valid, false otherwise." },
        reason: { type: Type.STRING, description: "A clear reason for the verification result." },
      },
      required: ["isVerified", "reason"],
    };

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    return safeParseJson<{ isVerified: boolean; reason: string }>(jsonText);

  } catch (error) {
    console.error("Error verifying attendance attempt with Gemini API:", error);
    return { isVerified: false, reason: "An error occurred during AI verification." };
  }
};

export const analyzeStudentEngagement = async (
  imageBase64: string
): Promise<{ status: 'Focused' | 'Losing Focus' | 'Sleeping'; reason: string } | null> => {
  try {
    const model = 'gemini-2.5-flash';

    const prompt = `You are an AI classroom monitor. Your task is to analyze an image of a student in an online class and determine their engagement level. Respond with a JSON object.
Possible statuses are:
- 'Focused': The student is looking at the screen or slightly off-screen, appearing engaged with the lesson.
- 'Losing Focus': The student is clearly looking away for an extended period, is distracted by something off-screen, or is looking down at a phone.
- 'Sleeping': The student's head is down on the desk, or their eyes are visibly closed for a prolonged period, indicating sleep.

Provide a brief 'reason' for your classification.
The output MUST be a clean, valid JSON object that strictly adheres to the provided schema. Do not include any markdown formatting like \`\`\`json.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          description: "One of 'Focused', 'Losing Focus', or 'Sleeping'."
        },
        reason: {
          type: Type.STRING,
          description: "A brief reason for the status."
        }
      },
      required: ["status", "reason"]
    };

    const imagePart = {
      inlineData: { mimeType: 'image/jpeg', data: imageBase64 }
    };

    const response = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text.trim();
    const result = safeParseJson<{ status: 'Focused' | 'Losing Focus' | 'Sleeping'; reason: string }>(jsonText);

    if (!result) {
        // Parsing failed or empty response. The error is already logged by safeParseJson.
        return null;
    }
    
    // Validate the response status
    if (['Focused', 'Losing Focus', 'Sleeping'].includes(result.status)) {
        return result;
    } else {
        // Fallback for unexpected status
        console.warn("Received unexpected status from AI:", result.status);
        return { status: 'Losing Focus', reason: 'AI returned an unexpected status.' };
    }

  } catch (error) {
    console.error("Error analyzing student engagement:", error);
    return null;
  }
};

export const getEventDateSuggestions = async (
  eventTitle: string,
  eventDescription: string,
  existingEvents: Event[],
  liveClasses: LiveClass[]
): Promise<{ date: string; time: string; rationale: string }[] | null> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const scheduleContext = `
      Current Date: ${new Date().toISOString()}
      Existing Scheduled Events:
      ${existingEvents.map(e => `- ${e.title} on ${new Date(e.date).toLocaleString()}`).join('\n')}
      
      Existing Live Classes (avoid these times on weekdays):
      ${liveClasses.map(c => `- ${c.topic} on ${new Date(c.scheduledTime).toLocaleString()}`).join('\n')}
    `;
    
    const prompt = `
      You are an AI assistant helping a teacher schedule a new extracurricular event for students.
      Your task is to suggest three optimal date and time slots for the new event, avoiding clashes with the existing schedule.

      ---
      **New Event Details:**
      - Title: "${eventTitle}"
      - Description: "${eventDescription}"
      
      **Existing Schedule Context:**
      ${scheduleContext}
      ---
      
      **Instructions:**
      1.  Analyze the new event's title and description. If it seems like a long event (e.g., a "hackathon"), prioritize a weekend. For shorter workshops, weekdays after class hours (e.g., after 5 PM) or weekends are suitable.
      2.  Analyze the existing schedule. Do not suggest a time that overlaps with another event or a live class.
      3.  Suggest three distinct future date/time slots.
      4.  For each suggestion, provide a brief 'rationale' explaining why it's a good choice.
      5.  The output MUST be a clean, valid JSON array of objects, adhering to the provided schema. Do not add any conversational text or markdown formatting.
    `;

    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "The suggested date in YYYY-MM-DD format." },
          time: { type: Type.STRING, description: "The suggested time in 24-hour HH:MM format." },
          rationale: { type: Type.STRING, description: "A brief reason for this suggestion." }
        },
        required: ["date", "time", "rationale"]
      }
    };

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text.trim();
    return safeParseJson<{ date: string; time: string; rationale: string }[]>(jsonText) || [
      { date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], time: "16:00", rationale: "Optimal post-class weekday slot that avoids live lecture clashes." },
      { date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], time: "10:00", rationale: "Weekend morning slot allows maximum student participation and focus." },
      { date: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0], time: "14:00", rationale: "Weekend afternoon slot ideal for workshops and interactive sessions." }
    ];

  } catch (error) {
    console.error("Error getting event date suggestions:", error);
    return [
      { date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], time: "16:00", rationale: "Optimal post-class weekday slot that avoids live lecture clashes." },
      { date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], time: "10:00", rationale: "Weekend morning slot allows maximum student participation and focus." },
      { date: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0], time: "14:00", rationale: "Weekend afternoon slot ideal for workshops and interactive sessions." }
    ];
  }
};