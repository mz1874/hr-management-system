<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router'; // Import useRouter
import Swal from 'sweetalert2'; // Import SweetAlert

import { searchStaff } from '@/api/staff'; // Use searchStaff API
import {
  getAllEvaluationForms,
  getEvaluationInstances, // Import getEvaluationInstances
  getEvaluationInstanceById, // Import getEvaluationInstanceById
  startEvaluationInstance, // Import the new function
  submitEvaluationAnswers, // Keep submitEvaluationAnswers
  finalizeDepartmentEvaluation, // Import the new function
  sendBackEvaluation // Import sendBackEvaluation
} from '@/api/survey';
import type {
    EvaluationForm, // Use EvaluationForm
    EvaluationAnswerSubmit,
    EvaluationSubmissionPayload,
    EvaluationQuestion, // Keep EvaluationQuestion for nested details
    RowyQuestionOption, // Keep RowyQuestionOption for nested details
    EvaluationInstance // Import EvaluationInstance
    // EvaluationAnswerView // EvaluationAnswerView is part of EvaluationInstance
} from '@/api/survey';
import type { Staff } from '@/interface/UserInterface'; // Import Staff type
import { getCurrentUser } from '@/api/login';

// Define star rating meanings
const starRatingMeanings: Record<number, string> = {
  1: 'Below Expectation',
  2: 'Fair',
  3: 'Meet Expectation',
  4: 'Good',
  5: 'Role Model'
};

// --- Configuration for Predefined Behavioral Questions (Copied from SurveyManagement) ---
// It would be better to move this to a shared utility file if used in more places.
const PREDEFINED_BEHAVIOURAL_QUESTIONS_CONFIG = [
  {
    key: 'be_responsible',
    text_en: 'Be Responsible',
    text_cn: '负责任',
    rating_texts: {
      1: { en: "(a) Failed to complete tasks within the allotted time. (b) Ignoring and displacing responsibility and work. (c) Lack of attention and participation in company affairs.", cn: "(a) 无法在规定的时间内完成工作 (b) 忽视和推卸责任与工作 (c) 对公司事务缺乏关注和参与" },
      3: { en: "(a) Need superior advice and reminder. (b) Need superior follow up and coaching. (c) Acceptable behavior.", cn: "(a) 需要上司劝告和提醒 (b) 需要上司跟进和指导 (c) 表现仍可接受" },
      5: { en: "(a) Automatically and spontaneously completes tasks before deadlines. (b) Have a sense of ownership and be willing to take on the work. (c) Pay attention to, participate in and cooperate with company affairs.", cn: "(a)在期限前自动自发完成任务 (b)有主人翁精神，愿意承担工作 (c)关注，参与和配合公司事务" }
    }
  },
  {
    key: 'striving_for_excellence',
    text_en: 'Striving for Excellence',
    text_cn: '追求卓越',
    rating_texts: {
      1: { en: "(a) Without clear work plans leading to poor quality. (b) Being hastily and carelessly in work. (c) Stagnant, not looking for improvement.", cn: "(a)没有明确的工作计划，结果欠佳 (b)工作草率，马虎 (c)停滞不前，不寻求进步" },
      3: { en: "(a) Need superior advice and reminder. (b) Need superior follow up and coaching. (c) Acceptable behavior.", cn: "(a)需要上司劝告和提醒 (b)需要上司跟进和指导 (c)表现仍可接受" },
      5: { en: "(a) Arrange own schedule and details to be efficient. (b) Produce high level and quality work at all times. (c) Continuously create more efficient ways of working.", cn: "(a)自行安排时间表和细节，效率高 (b)时刻产出高水准和品质的工作 (c)不断创造更有效率的工作方式" }
    }
  },
  {
    key: 'morality_and_talent',
    text_en: 'Morality and Talent',
    text_cn: '道德与才能',
    rating_texts: {
      1: { en: "(a) Spreading rumors to disrupt morale. (b) Cheating, giving false information. (c) Improper conduct, complaining and spreading negative energy.", cn: "(a)散播谣言扰乱军心 (b)欺骗，作假 (c)愁眉苦脸，衣衫不整，言行不正，埋怨，消极，散播负能量" },
      3: { en: "(a) Need superior advice and reminder. (b) Need superior follow up and coaching. (c) Acceptable behavior.", cn: "(a)需要上司劝告和提醒 (b)需要上司跟进和指导 (c)表现仍可接受" },
      5: { en: "(a) Be consistent with own words and deeds, and be kind to others. (b) Possess positive moral character, be polite and humble. (c) Engage in work with full enthusiasm and spirit, and face challenges positively.", cn: "(a)言行一致，向上向善 (b)拥有正面的道德品行，礼貌谦卑 (c)以饱满的热情和精神投入工作，正面应对工作挑战" }
    }
  },
  {
    key: 'discipline',
    text_en: 'Discipline',
    text_cn: '纪律',
    rating_texts: {
      1: { en: "(a) Arriving late and leaving early, absent from work without excuse and in frequent. (b) Disobey superior's instructions and treat work casually. (c) Failed to comply with company regulations and work procedures.", cn: "(a)迟到早退，无故旷工，频繁缺勤 (b)不听从上司指示，随性对待工作 (c)不遵守公司规定和工作流程" },
      3: { en: "(a) Need superior advice and reminder. (b) Need superior follow up and coaching. (c) Acceptable behavior.", cn: "(a)需要上司劝告和提醒 (b)需要上司跟进和指导 (c)表现仍可接受" },
      5: { en: "(a) Arrive on time and have stable attendance. (b) Obey superior's arrangements and take work seriously. (c) Comply with work rules and regulations.", cn: "(a)准时到岗，出勤稳定。 (b)服从管理安排，认真对待工作。 (c)遵守工作规章制度。" }
    }
  },
  {
    key: 'hardworking_and_proactive',
    text_en: 'Hardworking and Proactive',
    text_cn: '勤奋与主动',
    rating_texts: {
      1: { en: "(a) Lazy work attitude, playing on mobile phones, surfing the Internet, chatting etc. during working hours. (b) Delay in completing a task or work, affecting progress. (c) Unwillingness to learn, explore, or improve work methods.", cn: "(a)懒散的工作态度，在工作时间玩手机，上网，聊天等 (b)延迟完成任务或工作，影响进度 (c)不愿意学习，探索或改进工作方法" },
      3: { en: "(a) Need superior advice and reminder. (b) Need superior follow up and coaching. (c) Acceptable behavior.", cn: "(a)需要上司劝告和提醒 (b)需要上司跟进和指导 (c)表现仍可接受" },
      5: { en: "(a) Focused on performing tasks during working hours. (b) Seizing time to complete tasks as quickly as possible. (c) Willing to try new ways of working and techniques.", cn: "(a)办公时间专注于执行任务 (b)把握时间，尽可能快速地完成工作 (c)乐于尝试新的工作方式和技术" }
    }
  }
].map(q => {
  const texts = q.rating_texts;
  const combined_rating_texts: { [key: number]: { en: string, cn: string } } = {
    1: texts[1],
    2: { 
      en: `${texts[1].en} / ${texts[3].en}`, 
      cn: `${texts[1].cn} / ${texts[3].cn}`
    },
    3: texts[3],
    4: { 
      en: `${texts[3].en} / ${texts[5].en}`, 
      cn: `${texts[3].cn} / ${texts[5].cn}`
    },
    5: texts[5]
  };
  return { ...q, rating_texts: combined_rating_texts };
});

// --- Configuration for Executive Rating Questions ---
const EXECUTIVE_RATING_CONFIG = [
  {
    key: 'be_responsible_executive', // Unique key
    text_en: 'Be Responsible (Executive)', // Differentiating text if needed, though not directly used for matching
    text_cn: '负责任 (行政)',
    rating_texts: {
      1: { en: "(a) Failed to complete tasks within the allotted time. (b) Ignoring and displacing responsibility and work. (c) Lack of attention and participation in company affairs.", cn: "(a) 无法在规定的时间内完成工作 (b) 忽视和推卸责任与工作 (c) 对公司事务缺乏关注和参与" },
      3: { en: "(a) Need superior advice and reminder. (b) Need superior follow up and coaching. (c) Acceptable behavior.", cn: "(a) 需要上司劝告和提醒 (b) 需要上司跟进和指导 (c) 表现仍可接受" },
      5: { en: "(a) Automatically and spontaneously completes tasks before deadlines. (b) Have a sense of ownership and be willing to take on the work. (c) Pay attention to, participate in and cooperate with company affairs.", cn: "(a) 在期间前自动自发完成任务 (b) 有主人翁精神，愿意承担工作 (c) 关注，参与和配合公司事务" }
    }
  },
  {
    key: 'striving_for_excellence_executive',
    text_en: 'Striving for Excellence (Executive)',
    text_cn: '追求卓越 (行政)',
    rating_texts: {
      1: { en: "(a) Without clear work plans leading to poor quality. (b) Being hastily and carelessly in work. (c) Stagnant, not looking for improvement.", cn: "(a) 没有明确的工作计划，结果欠佳 (b) 工作草率，马虎 (c) 停滞不前，不寻求进步" },
      3: { en: "(a) Need superior advice and reminder. (b) Need superior follow up and coaching. (c) Acceptable behavior.", cn: "(a) 需要上司劝告和提醒 (b) 需要上司跟进和指导 (c) 表现仍可接受" },
      5: { en: "(a) Arrange own schedule and details to be efficient. (b) Produce high level and quality work at all times. (c) Continuously create more efficient ways of working.", cn: "(a) 自行安排时间表和细节，效率高 (b) 时刻产出高水准和品质的工作 (c) 不断创造更有效率的工作方式" }
    }
  },
  {
    key: 'morality_and_talent_executive',
    text_en: 'Morality and Talent (Executive)',
    text_cn: '道德与才能 (行政)',
    rating_texts: {
      1: { en: "(a) Spreading rumors to disrupt morale. (b) Cheating, giving false information. (c) Improper conduct, complaining and spreading negative energy.", cn: "(a) 散播谣言扰乱军心 (b) 欺骗，作假 (c) 愁眉苦脸，衣衫不整，言行不正，埋怨，消极，散播负能量" },
      3: { en: "(a) Need superior advice and reminder. (b) Need superior follow up and coaching. (c) Acceptable behavior.", cn: "(a) 需要上司劝告和提醒 (b) 需要上司跟进和指导 (c) 表现仍可接受" },
      5: { en: "(a) Be consistent with own words and deeds, and be kind to others. (b) Possess positive moral character, be polite and humble. (c) Engage in work with full enthusiasm and spirit, and face challenges positively.", cn: "(a) 言行一致，向上向善 (b) 拥有正面的道德品行，礼貌谦卑 (c) 以饱满的热情和精神投入工作，正面应对工作挑战" }
    }
  },
  {
    key: 'problem_solving_skill_executive',
    text_en: 'Problem Solving Skill (Executive)',
    text_cn: '解决问题能力 (行政)',
    rating_texts: {
      1: { en: "(a) Turn a blind eye to or avoid problems. (b) Failure to provide timely feedback on problems that arise at work and do not proactively look for solutions. (c) Making the same mistakes over and over again.", cn: "(a) 对问题视而不见或逃避问题 (b) 没有及时反馈工作中出现的问题，也没有主动寻找解决方案 (c) 反复犯同样的错误" },
      3: { en: "(a) Need superior advice and reminder. (b) Need superior follow up and coaching. (c) Acceptable behavior.", cn: "(a) 需要上司劝告和提醒 (b) 需要上司跟进和指导 (c) 表现仍可接受" },
      5: { en: "(a) Have the courage to face up to problems and be willing to try to solve them. (b) Solve problems in a timely manner, provide preventive measures and share with others as a reference. (c) Able to implement solution and evaluate the results.", cn: "(a) 勇于正视问题，愿意尝试解决问题 (b) 及时解决问题，给予预防措施并分享给大家作为借鉴 (c) 有能力落实具体措施，并对结果进行评估和反思" }
    }
  },
  {
    key: 'critical_thinking_executive',
    text_en: 'Critical Thinking (Executive)',
    text_cn: '批判性思维 (行政)',
    rating_texts: {
      1: { en: "(a) Blindly listening to others without considering the authenticity of the information. (b) Unable to analyze problems and evaluate the pros and cons. (c) Lack of ability to challenge conventional practices.", cn: "(a) 盲目听信他人，不考虑信息的真实性 (b) 无法分析问题，不能评估事情的利与弊 (c) 缺乏挑战现状和常规做法的能力" },
      3: { en: "(a) Need superior advice and reminder. (b) Need superior follow up and coaching. (c) Acceptable behavior.", cn: "(a) 需要上司劝告和提醒 (b) 需要上司跟进和指导 (c) 表现仍可接受" },
      5: { en: "(a) Analyze and collect required information and evaluate its authenticity. (b) Able to weigh the pro and cons based on analysis and evaluation. (c) Able to propose innovative, feasible, and constructive suggestions.", cn: "(a) 分析及收集所需信息，并评估其真实性 (b) 基于分析和评估，可以权衡事情的利与弊 (c) 能够提出创新性，可行性，有建设性的提议" }
    }
  },
  {
    key: 'flexibility_executive',
    text_en: 'Flexibility (Executive)',
    text_cn: '灵活性 (行政)',
    rating_texts: {
      1: { en: "(a) Unable to accept innovations and suggestions. (b) Unable to manage own emotions in response to challenges and stress. (c) Feeling overwhelmed when multitasking.", cn: "(a) 无法接受创新和建议，一成不变 (b) 无法管理自己的情绪以应对挑战和压力 (c) 在处理多项任务时手忙脚乱，无法应付" },
      3: { en: "(a) Need superior advice and reminder. (b) Need superior follow up and coaching. (c) Acceptable behavior.", cn: "(a) 需要上司劝告和提醒 (b) 需要上司跟进和指导 (c) 表现仍可接受" },
      5: { en: "(a) Accept change and adapt quickly. (b) Stay calm and optimistic under pressure and challenges. (c) Able to handle multiple tasks effectively and switch flexibly.", cn: "(a) 接受变化并迅速适应 (b) 在压力和挑战下保持冷静和乐观 (c) 能够有效地处理多项任务和项目，灵活切换" }
    }
  }
].map(q => {
  const texts = q.rating_texts;
  const combined_rating_texts: { [key: number]: { en: string, cn: string } } = {
    1: texts[1],
    2: {
      en: `${texts[1].en} / ${texts[3].en}`,
      cn: `${texts[1].cn} / ${texts[3].cn}`
    },
    3: texts[3],
    4: {
      en: `${texts[3].en} / ${texts[5].en}`,
      cn: `${texts[3].cn} / ${texts[5].cn}`
    },
    5: texts[5]
  };
  return { ...q, rating_texts: combined_rating_texts };
});

// Interface for forms in the list
interface DisplayEvaluationForm extends EvaluationForm {
  user_instance_status: 'PUBLISHED' | 'SUBMITTED' | 'PENDING' | 'REVIEWED' | 'NOT_STARTED' | null;      // For overall status, similar to SurveyManagement
  completed_staff_count?: number; // For Progress X/Y (from backend annotation)
  total_staff_count?: number;     // For Progress X/Y (from backend annotation)
}

// --- State ---
const router = useRouter(); // Initialize router instance

const availableForms = ref<DisplayEvaluationForm[]>([]) // Forms available to the manager
const totalForms = ref(0) // For pagination
const isLoadingForms = ref(false)
const isLoadingDetails = ref(false) // Keep for potential future use loading form questions if separated
const finishedCount = ref(0); // TODO: Revisit if this count is needed and how to calculate it

const showFormModal = ref(false)
// Holds the full details of the EvaluationForm selected
const currentForm = ref<EvaluationForm | null>(null)
// Holds answers keyed by questionId for the currently selected staff member
const currentAnswers = ref<Record<number, Partial<EvaluationAnswerSubmit>>>({})
const hoverRatings = ref<Record<number, number | null>>({}); // Stores questionId: hoveredStarCount

// New state for staff selection
const departmentStaff = ref<Staff[]>([]);
const selectedStaffForEvaluation = ref<Staff | null>(null);
const isLoadingStaff = ref(false); // Loading state for staff list in modal
const staffCompletionStatus = ref<Map<number, string>>(new Map()); // Map staff ID to their evaluation status (e.g., 'SUBMITTED', 'PENDING')
const completedStaffCount = ref(0); // Count of completed evaluations for the current form
const isLoadingStatuses = ref(false); // Loading state for statuses

// State for viewing/editing individual submissions
const staffInstanceDataMap = ref<Map<number, EvaluationInstance>>(new Map());
const viewingInstance = ref<EvaluationInstance | null>(null);
const showViewAnswersModal = ref(false);

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10) // Keep for API call, but hide display

// Filter state
const searchName = ref(''); // Add state for search input
const evaluationStatusesForDropdown = ['PUBLISHED', 'SUBMITTED']; // Statuses for the dropdown
const selectedStatus = ref<string | null>('PUBLISHED'); // Default to PUBLISHED, allow null for 'All' (Backend handles filtering)

// Results Modal State
const showResultsModal = ref(false);
const currentSubmissionData = ref<DisplayEvaluationForm | null>(null); // Store form data for results modal
const isLoadingSubmissionDetails = ref(false); // Loading state for results modal
// const detailedSubmissionAnswers = ref<EvaluationAnswerView[]>([]); // State for actual answers (TODO)

// State for the new Rating Description Modal
const showRatingDescriptionModal = ref(false);
const ratingForDescriptionModal = ref<number | null>(null);
const questionTextForDescriptionModal = ref<string | null>(null); // To pass question context if needed, though current logic uses all categories

// --- Computed Properties ---
const totalPages = computed(() => Math.ceil(totalForms.value / itemsPerPage.value))

// Computed property returns the forms fetched from the backend
// We might filter out forms the manager can't act on later if needed
const displayForms = computed(() => {
  // Filter out DRAFT forms as they shouldn't be evaluated
  return availableForms.value.filter(form => form.status !== 'DRAFT');
});


// --- Methods ---

// Methods for Rating Description Modal
const openRatingDescriptionModal = (rating: number, questionText?: string) => {
  ratingForDescriptionModal.value = rating;
  questionTextForDescriptionModal.value = questionText || null; // Optional: if specific question context is ever needed
  showRatingDescriptionModal.value = true;
};

const closeRatingDescriptionModal = () => {
  showRatingDescriptionModal.value = false;
  ratingForDescriptionModal.value = null;
  questionTextForDescriptionModal.value = null;
};

// Star hover methods
const setHoverRating = (questionId: number, starIndex: number) => {
  hoverRatings.value[questionId] = starIndex;
};

const clearHoverRating = (questionId: number) => {
  hoverRatings.value[questionId] = null;
};

// Helper to check if a question is a predefined behavioral question
// This function is now less relevant for the new combined display logic,
// but kept for potential specific uses or if individual predefined question checks are still needed.
const getPredefinedConfigByText = (questionText: string | undefined, configSource: any[]) => {
  if (!questionText) return null;
  // This matching logic might need adjustment if question.text is not guaranteed to match a config's text_en
  return configSource.find(c => c.text_en === questionText); 
};

// Helper to get combined rating description for a given rating and language from a config source
const getCombinedRatingDescriptionForStar = (rating: number | undefined | null, lang: 'en' | 'cn', configSource: any[]) => {
  if (rating === undefined || rating === null || rating < 1 || rating > 5) return '';
  let descriptions: string[] = [];
  configSource.forEach(config => {
    // For ratings 2 and 4, the texts are already combined in the config.
    // For ratings 1, 3, 5, they are direct.
    const desc = config.rating_texts[rating]?.[lang];
    if (desc) {
      descriptions.push(desc);
    }
  });
  return descriptions.join('\n\n'); // Join descriptions from all categories with a double newline
};


// Helper function for date formatting (YYYY-MM-DD)
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'; // Changed from 'NOT PUBLISHED' to 'N/A' for consistency
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date'; // Handle invalid date strings
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Date Error';
  }
};

// Helper function to get evaluation status for the main table
const getEvaluationStatus = (form: DisplayEvaluationForm): string => {
  // This logic assumes 'submission_count' from the backend indicates if any department has finalized.
  // Or, it could be based on the form's own 'status' if not yet submitted by anyone.
  // The 'user_instance_status' is more for the manager's interaction with *their* department's part.
  if (form.submission_count && form.submission_count > 0) {
    return 'SUBMITTED'; // Or 'Completed' if that's the desired display text
  }
  // Fallback to the form's general status if no submissions yet
  // (e.g., 'PUBLISHED' if it's available for evaluation but no one has submitted)
  return form.status || 'N/A';
};

// Helper function to get evaluation progress for the main table
const getEvaluationProgress = (form: DisplayEvaluationForm): string => {
  // These counts are expected to be provided by the backend per form for the current manager's context
  const completed = form.completed_staff_count;
  const total = form.total_staff_count;

  if (typeof total === 'number' && total >= 0) {
    return `${completed || 0} / ${total}`;
  }
  return 'N/A'; // If data isn't available
};


// Fetch available published evaluation forms
const fetchAvailableForms = async () => {
  isLoadingForms.value = true;
  try {
    // Use getAllEvaluationForms API call
    // Pass page_size, status, and search parameters
    const params: { page_size: number; status?: string | null; search?: string } = {
        page_size: itemsPerPage.value,
        status: selectedStatus.value, // Pass selected status (can be null)
        search: searchName.value || undefined // Pass search term if not empty
    };
    // When 'All Status' is selected (null), don't send status param to backend.
    // Backend should return all accessible forms (likely PUBLISHED based on typical permissions).
    // We will filter locally in the computed property if 'All Status' is selected.
    if (params.status === null) {
        delete params.status;
    }
    const response = await getAllEvaluationForms(currentPage.value, params);

    // Add checks for response.data and nested data structure
    if (response.data && response.data.data && Array.isArray(response.data.data.results)) {
        // Assign fetched forms (casting might still be needed depending on API definition)
        // Filter DRAFT status here as a safeguard
        availableForms.value = response.data.data.results
            .map((form: any) => form as DisplayEvaluationForm) // Keep cast for safety
            .filter((form: DisplayEvaluationForm) => form.status !== 'DRAFT');

        totalForms.value = response.data.data.count; // Use total count from backend for pagination
        console.log("Fetched forms based on status:", selectedStatus.value, availableForms.value);
    } else {
        console.error("Failed to fetch evaluation forms: Unexpected response format", response);
        availableForms.value = [];
        totalForms.value = 0;
        // TODO: Show a user-friendly error message
    }
  } catch (error) {
    console.error("Failed to fetch available forms:", error);
    availableForms.value = [];
    totalForms.value = 0;
    // TODO: Show error message to user
  } finally {
    isLoadingForms.value = false;
  }
}

// Initialize the answer structure for the current form
const initializeAnswers = () => {
  if (!currentForm.value || !currentForm.value.questions) {
    currentAnswers.value = {};
    return;
  }
  const initialAnswers: Record<number, Partial<EvaluationAnswerSubmit>> = {};
  currentForm.value.questions.forEach(question => {
    if (question.id === undefined) return; // Skip questions without ID

    // Initialize based on EvaluationAnswerSubmit structure
    initialAnswers[question.id] = {
      question_id: question.id,
      rating: undefined, // Initialize rating as undefined
      text_answer: '', // Initialize text answer as empty string
      selected_option_id: undefined // Initialize selected option ID as undefined
    };
  });
  currentAnswers.value = initialAnswers;
};

// Open the modal to select staff and then evaluate
const openFormModal = async (formItem: EvaluationForm) => {
  currentForm.value = formItem; // Set the selected form
  selectedStaffForEvaluation.value = null; // Reset selected staff
  departmentStaff.value = []; // Clear previous staff list
  staffCompletionStatus.value.clear(); // Clear previous statuses
  completedStaffCount.value = 0; // Reset count
  currentAnswers.value = {}; // Clear previous answers
  isLoadingStaff.value = true; // Start loading staff
  isLoadingStatuses.value = true; // Start loading statuses
  showFormModal.value = true; // Show the modal

  try {
    const departmentId = 1; // Get manager's department ID
    if (!departmentId) {
      throw new Error("Manager's department ID not found.");
    }
    // Fetch staff for the manager's department using searchStaff
    // Pass empty string for name, department ID, and page 1
    const response = await searchStaff('', departmentId, 1);
    if (response.data && response.data.data && Array.isArray(response.data.data.results)) {
      // Assuming searchStaff returns paginated results, store only results for now
      // TODO: Handle pagination if needed for staff list within modal
      departmentStaff.value = response.data.data.results; // Assign staff if fetch is successful

      // --- Fetch Evaluation Statuses for these staff (Moved outside the else block) ---
      if (departmentStaff.value.length > 0 && currentForm.value?.id !== undefined) {
        try {
          // Fetch instances for the current form, backend should filter by evaluator implicitly
          // Or add evaluator_id if backend requires it
          const statusResponse = await getEvaluationInstances(1, { formId: currentForm.value.id });
          console.log("Fetched evaluation instances for status check:", statusResponse.data);

          // Adjusting path to the results array based on observed console log
          if (statusResponse.data && statusResponse.data.data && statusResponse.data.data.results && Array.isArray(statusResponse.data.data.results.results)) {
            const instances = statusResponse.data.data.results.results; // Access the correctly nested array
            const statusMap = new Map<number, string>();
            const instanceDataMap = new Map<number, EvaluationInstance>();
            let completedCount = 0;

            // Create a map of staff ID -> status from the fetched instances
            instances.forEach((instance: EvaluationInstance) => {
              console.log(`Processing instance for employee ID: ${instance.employee?.id}, Status: ${instance.status}`);
              if (instance.answers && instance.answers.length > 0) {
                console.log(`Instance for ${instance.employee?.id} has ${instance.answers.length} answer(s).`);
                const firstAnswer = instance.answers[0];
                console.log(`First answer details: question.text: ${firstAnswer.question?.text}, selected_option:`, firstAnswer.selected_option);
              } else {
                console.log(`Instance for ${instance.employee?.id} has no answers or answers array is empty.`);
              }

              if (instance.employee?.id && instance.status) {
                instanceDataMap.set(instance.employee.id, instance); // Store full instance data
                if (instance.status === 'SUBMITTED' || instance.status === 'REVIEWED') {
                  statusMap.set(instance.employee.id, 'Completed');
                  completedCount++;
                } else if (instance.status === 'PENDING') {
                  // Display 'PENDING' from API as 'Not Started' initially.
                  // 'In Progress' will be set explicitly by handleEdit after a 'Send Back'.
                  statusMap.set(instance.employee.id, 'Not Started');
                }
                // If there are other statuses or no status, it will default to "Not Started" in the template logic
                // (because the template checks for 'Completed' and 'PENDING' specifically, else 'Not Started')
              }
            });

            staffCompletionStatus.value = statusMap;
            staffInstanceDataMap.value = instanceDataMap; // Populate the new map
            completedStaffCount.value = completedCount;
            console.log("Staff completion status map:", staffCompletionStatus.value);
            console.log("Staff instance data map (populated with instances from API):", staffInstanceDataMap.value);
            console.log("Completed count:", completedStaffCount.value);
          } else {
            console.warn("No evaluation instances found or unexpected format for status check. API response.data.data.results was not an array or was empty.");
          }
        } catch (statusError) {
          console.error("Failed to fetch evaluation statuses:", statusError);
          // Don't block the modal, just show staff without status info
          Swal.fire('Warning', 'Could not load evaluation completion statuses for staff.', 'warning');
        } finally {
          isLoadingStatuses.value = false; // Stop loading statuses
        }
      } else {
        isLoadingStatuses.value = false; // No staff or form ID, stop loading statuses
      }
      // --- End Fetch Evaluation Statuses ---

    } else { // This else block now only handles the error case for fetching staff
      throw new Error("Failed to fetch department staff or unexpected format.");
    }
  } catch (error) { // This catch handles errors from both fetching staff and fetching statuses
    console.error("Failed to fetch department staff or statuses:", error);
    Swal.fire('Error', 'Could not load staff list or their evaluation statuses.', 'error');
    // Optionally close the modal or show error within it
    // showFormModal.value = false;
  } finally {
    isLoadingStaff.value = false; // Stop loading staff
    // isLoadingStatuses is handled within its own try/catch/finally
  }
}

const closeFormModal = () => {
  showFormModal.value = false;
  currentForm.value = null;
  selectedStaffForEvaluation.value = null; // Reset staff selection on close
  departmentStaff.value = [];
  currentAnswers.value = {};
  viewingInstance.value = null; // Clear viewing instance when main modal closes
  showViewAnswersModal.value = false; // Ensure view answers modal is also closed
}

// New method to handle staff selection within the modal
const selectStaffForEvaluation = (staff: Staff) => {
  selectedStaffForEvaluation.value = staff;
  initializeAnswers(); // Initialize/reset answers for the selected staff and form
  console.log(`Evaluating staff: ${staff.username} with form: ${currentForm.value?.name}`);
}

// Method to open the view answers modal
const openViewModal = (staff: Staff) => {
  const instance = staffInstanceDataMap.value.get(staff.id);
  if (instance) {
    viewingInstance.value = instance;
    showViewAnswersModal.value = true;
  } else {
    Swal.fire('Error', 'Could not find evaluation details for this staff member.', 'error');
  }
}

const closeViewAnswersModal = () => {
  showViewAnswersModal.value = false;
  viewingInstance.value = null;
}

// Method to handle editing an evaluation
const handleEdit = async (staff: Staff) => {
  const instanceToEdit = staffInstanceDataMap.value.get(staff.id);
  if (!instanceToEdit) {
    Swal.fire('Error', 'Could not find evaluation instance to edit.', 'error');
    return;
  }

  const result = await Swal.fire({
    title: 'Edit Evaluation?',
    text: `Are you sure you want to edit the evaluation for ${staff.username}? Previous answers will be cleared, and you will need to re-submit.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, edit it!'
  });

  if (result.isConfirmed) {
    try {
      await sendBackEvaluation(instanceToEdit.id);
      Swal.fire('Sent Back!', 'The evaluation has been reset for editing.', 'success');
      
      // Update local status
      staffCompletionStatus.value.set(staff.id, 'PENDING'); 
      staffInstanceDataMap.value.delete(staff.id); 
      
      completedStaffCount.value = Array.from(staffCompletionStatus.value.values()).filter(status => status === 'Completed').length;

      selectStaffForEvaluation(staff); 

    } catch (error: any) {
      console.error("Failed to send back evaluation:", error);
      const errorMessage = error.response?.data?.detail || error.message || "An error occurred.";
      Swal.fire('Error', `Failed to reset evaluation: ${errorMessage}`, 'error');
    }
  }
}


// --- Results Modal Logic (Placeholder - likely needs rework for staff-specific results) ---
const openResultsModal = async (form: EvaluationForm) => {
  console.log("Opening results for form:", form);
  currentSubmissionData.value = form as DisplayEvaluationForm; 
  showResultsModal.value = true;
  isLoadingSubmissionDetails.value = true;

  await new Promise(resolve => setTimeout(resolve, 500));
  isLoadingSubmissionDetails.value = false;
};

const closeResultsModal = () => {
  showResultsModal.value = false;
  currentSubmissionData.value = null;
};


// Submit the evaluation answers for the selected staff member
const submitEvaluation = async () => {
  if (!currentForm.value || !selectedStaffForEvaluation.value) {
      console.error("Submission Error: No form or staff selected.");
      Swal.fire('Error', 'Please select a staff member and ensure a form is loaded.', 'error');
      return;
  }

  const staffId = selectedStaffForEvaluation.value.id;
  const formId = currentForm.value.id;
  let instanceIdToUse: number;

  try {
    const startResponse = await startEvaluationInstance(formId, staffId);
    console.log("DEBUG: Received start_evaluation response:", startResponse);
    instanceIdToUse = startResponse.data.data.instance_id;

    if (!instanceIdToUse) {
        throw new Error("Failed to retrieve evaluation instance ID for the selected staff.");
    }

  const answersArray: EvaluationAnswerSubmit[] = Object.values(currentAnswers.value)
      .filter(ans => ans?.question_id !== undefined) 
      .map(ans => { 
          const finalAns: EvaluationAnswerSubmit = { question_id: ans!.question_id! };
          const question = currentForm.value?.questions.find(q => q.id === ans!.question_id);

          if (question?.question_type === 'RATING') {
              finalAns.rating = ans?.rating !== undefined ? Number(ans.rating) : null; 
              if (finalAns.rating !== null && (finalAns.rating < 1 || finalAns.rating > 5)) {
                  throw new Error(`Invalid rating for question ID ${question.id}. Must be between 1 and 5.`);
              }
          } else if (['TEXT', 'TEXT_INPUT'].includes(question?.question_type)) {
              finalAns.text_answer = ans?.text_answer || null; 
          } else if (question?.question_type === 'OPTIONS') {
              finalAns.selected_option_id = ans?.selected_option_id !== undefined ? ans.selected_option_id : null; 
              if (finalAns.selected_option_id !== null && !question?.options?.some(opt => opt.id === finalAns.selected_option_id)) {
                   throw new Error(`Invalid selected option ID for question ID ${question.id}.`);
              }
          }
          return finalAns;
      });

  const requiredQuestions = currentForm.value.questions;
  const answeredQuestionIds = new Set(answersArray.map(ans => ans.question_id));
  const allRequiredAnswered = requiredQuestions.every(q => answeredQuestionIds.has(q.id!));

  if (!allRequiredAnswered) {
      console.error("Validation failed: Please answer all questions.");
      Swal.fire('Validation Error', 'Please answer all questions before submitting.', 'warning'); 
      return;
  }

  const submissionPayload: EvaluationSubmissionPayload = {
    answers: answersArray,
  };

  let contentValidationPassed = true;
  let validationErrorMessage = '';

  for (const answer of answersArray) {
      const question = currentForm.value?.questions.find(q => q.id === answer.question_id);
      if (!question) {
          contentValidationPassed = false;
          validationErrorMessage = `Validation Error: Could not find question details for ID ${answer.question_id}.`;
          break;
      }

      if (question.question_type === 'RATING' && (answer.rating === null || answer.rating === undefined)) {
          contentValidationPassed = false;
          validationErrorMessage = `Validation Error: Rating is required for question ID ${question.id}.`;
          break;
      } else if (['TEXT', 'TEXT_INPUT'].includes(question.question_type) && (answer.text_answer === null || answer.text_answer.trim() === '')) {
           contentValidationPassed = false;
           validationErrorMessage = `Validation Error: Text answer is required for question ID ${question.id}.`;
           break;
      } else if (question.question_type === 'OPTIONS' && (answer.selected_option_id === null || answer.selected_option_id === undefined)) {
           // Optional: Add validation if an option must be selected
      }
  }

  if (!contentValidationPassed) {
      console.error("Frontend content validation failed:", validationErrorMessage);
      Swal.fire('Validation Error', validationErrorMessage, 'warning');
      return;
  }

    await submitEvaluationAnswers(instanceIdToUse, submissionPayload);

    // After successful submission, fetch the updated instance and update the local map.
    try {
      const updatedInstanceResponse = await getEvaluationInstanceById(instanceIdToUse);
      if (updatedInstanceResponse.data && updatedInstanceResponse.data.data) {
        const newOrUpdatedInstance = updatedInstanceResponse.data.data as EvaluationInstance;
        staffInstanceDataMap.value.set(staffId, newOrUpdatedInstance);
        console.log("Successfully updated staffInstanceDataMap with instance:", newOrUpdatedInstance);
      } else {
        console.warn(`Could not fetch updated instance details for instance ID ${instanceIdToUse} after submission. Map might be stale.`);
      }
    } catch (fetchError) {
      console.error(`Error fetching instance details (ID: ${instanceIdToUse}) after submission:`, fetchError);
    }

    const currentStaffId = selectedStaffForEvaluation.value.id;
    staffCompletionStatus.value.set(currentStaffId, 'Completed');
    completedStaffCount.value = Array.from(staffCompletionStatus.value.values()).filter(status => status === 'Completed').length;

    Swal.fire('Saved', `Evaluation saved successfully for ${selectedStaffForEvaluation.value.username}.`, 'success');
    selectedStaffForEvaluation.value = null;

  } catch (error: any) {
    console.error("Failed to submit evaluation:", error);
    let errorMessage = "An error occurred during submission.";

    if (error.response && error.response.data) {
      if (error.response.data.detail) {
        errorMessage = `Validation Error: ${error.response.data.detail}`;
      } else if (typeof error.response.data === 'object') {
        errorMessage = "Validation Errors:<br>";
        for (const field in error.response.data) {
          if (Array.isArray(error.response.data[field])) {
            errorMessage += `<strong>${field}:</strong> ${error.response.data[field].join(', ')}<br>`;
          } else {
             errorMessage += `<strong>${field}:</strong> ${error.response.data[field]}<br>`;
          }
        }
      } else {
        errorMessage = `Backend Error: ${error.response.data}`;
      }
    } else {
      errorMessage = `Request Error: ${error.message}`;
    }
    Swal.fire('Error', `Failed to submit evaluation: ${errorMessage}`, 'error');
  }
}

// Handle the final submission of all department evaluations for a form
const handleFinalSubmit = async () => {
  if (!currentForm.value || currentForm.value.id === undefined) {
    console.error("Final Submission Error: No form selected.");
    Swal.fire('Error', 'No evaluation form selected for final submission.', 'error');
    return;
  }

  if (completedStaffCount.value !== departmentStaff.value.length) {
      console.warn("Attempted final submit before all staff evaluations are completed.");
      Swal.fire('Warning', 'Please complete all staff evaluations before submitting the department evaluation.', 'warning');
      return;
  }

  isLoadingForms.value = true; 
  try {
    await finalizeDepartmentEvaluation(currentForm.value.id);
    Swal.fire('Success', 'Department evaluation finalized successfully.', 'success');

    // Redirect to SurveyManagement view with query parameters
    if (currentForm.value && currentForm.value.id !== undefined && currentForm.value.name) {
      router.push({ 
        name: 'SurveyManagement', // Ensure this route name is correct in your router config
        query: { 
          viewResultsFormId: currentForm.value.id.toString(),
          formName: currentForm.value.name 
        } 
      });
    }
    closeFormModal(); // Still close the modal after initiating navigation

  } catch (error) {
    console.error("Failed to finalize department evaluation:", error);
    const errorMessage = (error as any).response?.data?.detail || (error as any).message || "An error occurred during finalization.";
    Swal.fire('Error', `Failed to finalize department evaluation: ${errorMessage}`, 'error');
  } finally {
    isLoadingForms.value = false; 
  }
}


// Pagination Navigation
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
  currentPage.value = page
}
}

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchAvailableForms(); // Fetch forms on mount
});

// Refetch data when page changes
watch(currentPage, fetchAvailableForms);

// Refetch data when status filter changes
watch(selectedStatus, () => {
  currentPage.value = 1; // Reset to first page on filter change
  fetchAvailableForms();
});

// Refetch data when search name changes
watch(searchName, () => {
  currentPage.value = 1; // Reset to first page on search change
  fetchAvailableForms();
});
</script>

<template>
  <div class="main-content container-fluid px-3 px-md-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="h3">Department Evaluations</h2> <!-- Reverted Title -->
    </div>

    <!-- Filter Row - Matching SurveyManagement layout -->
    <div class="filter-container announcement-toolbar d-flex flex-wrap align-items-center gap-3 mb-4">
        <!-- Search Input -->
        <div class="search-container flex-grow-1"> <!-- Re-added flex-grow-1 -->
          <i class="fas fa-search search-icon"></i>
          <input
            v-model="searchName"
            type="text"
            class="search-input"
            placeholder="Search Evaluation Name"
          />
        </div>

       <!-- Status Filter Dropdown -->
       <div class="status-filter-container">
         <!-- Removed label, relying on default option text -->
         <select id="statusFilter" v-model="selectedStatus" class="form-select status-filter-select">
           <option :value="null">All Status</option> <!-- Added All Status option -->
           <option v-for="status in evaluationStatusesForDropdown" :key="status" :value="status">
             {{ status }}
           </option>
         </select>
       </div>
       <!-- Add other filters here if needed -->
    </div>


    <!-- Table -->
    <div class="table-card">
      <table class="table">
        <thead>
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Evaluation Name</th>
        <th scope="col">Published Date</th>
        <th scope="col">Status</th>
        <th scope="col">Progress</th>
        <th scope="col">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="isLoadingForms">
            <td colspan="6" class="text-center">Loading evaluation forms...</td>
        </tr>
        <tr v-else-if="displayForms.length === 0">
            <td colspan="6" class="text-center">No evaluation forms found matching the criteria.</td>
        </tr>
        <!-- Iterate over computed displayForms -->
        <tr v-else v-for="form in displayForms" :key="form.id">
          <td>{{ form.id }}</td>
          <td>{{ form.name || 'N/A' }}</td>
          <td>{{ formatDate(form.publish_time) }}</td>
          <td>
            <span :class="['badge', getEvaluationStatus(form) === 'SUBMITTED' ? 'bg-success' : getEvaluationStatus(form) === 'PUBLISHED' ? 'bg-primary' : 'bg-secondary']">
              {{ getEvaluationStatus(form) }}
            </span>
          </td>
          <td>{{ getEvaluationProgress(form) }}</td>
          <td>
            <!-- Action Button - Always show "Evaluate Staff" -->
            <button type="button" class="btn btn-primary btn-action" @click="openFormModal(form)">
                Evaluate Staff
            </button>
            <!-- TODO: Add a way to view results later, maybe another button or link -->
            <!-- <button type="button" class="btn btn-info btn-action ms-2" @click="openResultsModal(form)">
                View Results
            </button> -->
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  </div>

  <!-- Evaluation Form Modal -->
  <div class="modal fade" :class="{ show: showFormModal }" style="display: block" v-if="showFormModal">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <!-- Dynamically set title based on whether staff is selected -->
          <h3 class="modal-title">
            <span v-if="!selectedStaffForEvaluation">Select Staff for Evaluation: {{ currentForm?.name }}</span>
            <span v-else>Evaluating: {{ selectedStaffForEvaluation?.username }} - Form: {{ currentForm?.name }}</span>
          </h3>
          <button type="button" class="btn-close" @click="closeFormModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Show staff list if no staff is selected -->
          <div v-if="!selectedStaffForEvaluation">
            <h5>Select Staff Member from Your Department</h5>
             <!-- Loading Indicator for Staff and Statuses -->
             <div v-if="isLoadingStaff || isLoadingStatuses" class="text-center my-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading staff & statuses...</span>
              </div>
            </div>
             <!-- Staff List Display -->
             <div v-else-if="departmentStaff.length > 0">
               <!-- Completion Count -->
               <p class="text-muted mb-2">
                 Completed: {{ completedStaffCount }} / {{ departmentStaff.length }}
               </p>
               <div class="list-group">
                 <!-- Iterate over department staff -->
                 <div v-for="staff in departmentStaff" :key="staff.id"
                      class="list-group-item d-flex justify-content-between align-items-center">
                   
                   <!-- Staff Name and Status Badge -->
                   <div>
                     {{ staff.username }}
                     <span v-if="staffCompletionStatus.get(staff.id) === 'Completed'" class="badge bg-success ms-2">Completed</span>
                     <span v-else-if="staffCompletionStatus.get(staff.id) === 'PENDING'" class="badge bg-warning text-dark ms-2">In Progress</span>
                     <span v-else class="badge bg-secondary ms-2">Not Started</span>
                   </div>

                   <!-- Action Buttons -->
                   <div>
                     <button v-if="staffCompletionStatus.get(staff.id) === 'Completed'"
                             type="button" class="btn btn-sm btn-outline-info me-2"
                             @click="openViewModal(staff)">
                       <i class="fas fa-eye me-1"></i> View
                     </button>
                     <button v-if="staffCompletionStatus.get(staff.id) === 'Completed'"
                             type="button" class="btn btn-sm btn-outline-warning"
                             @click="handleEdit(staff)">
                       <i class="fas fa-edit me-1"></i> Edit
                     </button>
                     <button v-if="staffCompletionStatus.get(staff.id) !== 'Completed'"
                             type="button" class="btn btn-sm btn-primary"
                             @click="selectStaffForEvaluation(staff)">
                       <i class="fas fa-play me-1"></i> Evaluate
                     </button>
                   </div>
                 </div>
               </div>
             </div>
             <div v-else class="alert alert-warning">
              No staff members found in your department or failed to load staff list.
            </div>
          </div>

          <!-- Show evaluation questions if staff is selected -->
          <div v-else>
             <!-- Button to go back to staff selection -->
             <button type="button" class="btn btn-outline-secondary btn-sm mb-3" @click="selectedStaffForEvaluation = null">
               <i class="fas fa-arrow-left me-1"></i> Back to Staff List
             </button>

             <!-- Existing Question Display Logic -->
             <div v-if="currentForm && currentForm.questions && currentAnswers">
               <div class="mb-4 mt-2"> <!-- Adjusted margin -->
                 <div class="mb-4 text-center">
                   <h4 class="form-label">Evaluation Questions for {{ selectedStaffForEvaluation.username }}</h4>
                </div>
                <div v-for="(question, index) in currentForm.questions" :key="question.id" class="mb-3 border p-3 rounded">
                  <div class="d-flex justify-content-between align-items-center">
                        <!-- Display based on backend question_type -->
                        <h6>{{ index + 1 }}. {{ question.question_type === 'RATING' ? 'Rating Question' : question.question_type === 'TEXT' ? 'Text Question' : question.question_type === 'OPTIONS' ? 'Option Question' : 'Text Input Question' }}</h6>
                  </div>
                      <!-- Use backend 'text' field -->
                      <p class="form-control mb-2 bg-light">{{ question.text }}</p>

                  <!-- RATING question type -->
                  <div v-if="question.question_type === 'RATING' && question.id !== undefined" class="form-group">
                    <label class="form-label">Rating (1-5 stars):</label>
                    <div class="d-flex align-items-center">
                      <div class="star-rating" style="position: relative;">
                        <span
                          v-for="starIndex in 5"
                          :key="starIndex"
                          class="star"
                          :class="{
                            'hover-active': hoverRatings[question.id!] !== null && starIndex <= hoverRatings[question.id!]!,
                            'filled': (hoverRatings[question.id!] === null || hoverRatings[question.id!] === undefined) && currentAnswers[question.id!]?.rating !== undefined && starIndex <= currentAnswers[question.id!]!.rating!
                          }"
                          @mouseenter="setHoverRating(question.id!, starIndex)"
                          @mouseleave="clearHoverRating(question.id!)"
                          @click="currentAnswers[question.id!].rating = starIndex; clearHoverRating(question.id!)"
                        >
                          <i class="fas fa-star"></i>
                        </span>
                      </div>
                      <button 
                        v-if="currentAnswers[question.id!]?.rating" 
                        type="button" 
                        class="btn btn-outline-secondary btn-sm ms-2" 
                        @click="openRatingDescriptionModal(currentAnswers[question.id!]!.rating!, question.text)"
                        title="View Rating Descriptions"
                        style="padding: 0.25rem 0.5rem; line-height: 1;">
                        <i class="bi bi-file-earmark-text"></i>
                      </button>
                    </div>
                    <!-- Display meaning of selected rating -->
                    <p v-if="currentAnswers[question.id!]?.rating" class="text-muted mt-1 mb-0 small">
                      Selected: {{ currentAnswers[question.id!]?.rating }} Star(s) - {{ starRatingMeanings[currentAnswers[question.id!]!.rating!] }}
                    </p>
                    <!-- Removed direct description display from here -->
                  </div>

                  <!-- TEXT question type -->
                  <div v-if="question.question_type === 'TEXT' && question.id !== undefined" class="form-group">
                    <label class="form-label">Response:</label>
                        <!-- Bind to currentAnswers[question.id].text_answer -->
                        <textarea class="form-control auto-resize" v-model="currentAnswers[question.id].text_answer"></textarea>
                      </div>
                  
                  <!-- TEXT_INPUT question type -->
                  <div v-if="question.question_type === 'TEXT_INPUT' && question.id !== undefined" class="form-group">
                    <label class="form-label">Response:</label>
                        <!-- Bind to currentAnswers[question.id].text_answer -->
                        <input type="text" class="form-control" v-model="currentAnswers[question.id].text_answer">
                      </div>

                  <!-- OPTIONS question type -->
                  <div v-if="question.question_type === 'OPTIONS' && question.id !== undefined && question.options && question.options.length > 0" class="form-group">
                      <label class="form-label">Select Option:</label>
                      <div v-for="option in question.options" :key="option.id" class="form-check">
                          <!-- Bind to currentAnswers[question.id].selected_option_id -->
                          <input
                              class="form-check-input"
                              type="radio"
                              :name="'question_' + question.id"
                              :id="'option_' + option.id"
                              :value="option.id"
                              v-model="currentAnswers[question.id].selected_option_id"
                          >
                          <label class="form-check-label" :for="'option_' + option.id">
                              {{ option.option_text }}
                          </label>
                      </div>
                  </div>
                    </div>
                     <div v-if="!currentForm.questions || currentForm.questions.length === 0" class="text-muted text-center">
                        This evaluation has no questions.
                     </div>
                  </div>
                </div>
              <div v-else class="text-center text-danger">
                    Failed to load form details.
              </div>
            </div>
            <div class="modal-footer justify-content-between">
               <!-- Left side: Back to list / Cancel -->
               <div>
                 <button 
                   v-if="selectedStaffForEvaluation" 
                   type="button" 
                   class="btn btn-outline-secondary me-2" 
                   @click="selectedStaffForEvaluation = null"
                 >
                   <i class="fas fa-arrow-left me-1"></i> Back to Staff List
                 </button>
                 <button type="button" class="btn btn-secondary" @click="closeFormModal">Cancel</button>
               </div>
               <!-- Right side: Submit individual / Final Submit -->
               <div>
                 <button
                   v-if="selectedStaffForEvaluation"
                   type="button"
                   class="btn btn-primary"
                   @click="submitEvaluation"
                   :disabled="isLoadingStaff || isLoadingStatuses"
                 >
                   Save Evaluation for {{ selectedStaffForEvaluation?.username }}
                 </button>
                 <!-- New Final Submit Button -->
                 <button
                   v-if="!selectedStaffForEvaluation" 
                   type="button"
                   class="btn btn-success"
                   @click="handleFinalSubmit"
                   :disabled="completedStaffCount !== departmentStaff.length || departmentStaff.length === 0"
                 >
                   Submit Department Evaluation
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>
      

      <!-- Pagination - Matching SurveyManagement layout -->
      
  </div> <!-- Close main-content -->

  <!-- View Answers Modal -->
  <div class="modal fade" :class="{ show: showViewAnswersModal }" style="display: block;" v-if="showViewAnswersModal" tabindex="-1" aria-labelledby="viewAnswersModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="viewAnswersModalLabel">
            Evaluation Answers for {{ viewingInstance?.employee?.username }}
          </h5>
          <button type="button" class="btn-close" @click="closeViewAnswersModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="viewingInstance">
            <h6>Form: {{ viewingInstance.form?.name }}</h6>
            <hr>
            <div v-if="viewingInstance.answers && viewingInstance.answers.length > 0">
              <div v-for="(answer, index) in viewingInstance.answers" :key="answer.id || index" class="mb-4 border-bottom pb-3">
                <p><strong>{{ index + 1 }}. {{ answer.question?.text }}</strong></p>
                
                <!-- Display Rating -->
                <div v-if="answer.question?.question_type === 'RATING'">
                  <p class="mb-1">Answer:</p>
                  <div v-if="answer.rating !== null && answer.rating !== undefined" class="star-rating mb-1">
                     <span v-for="star in 5" :key="star" class="star" :class="{ 'filled': star <= answer.rating }">
                       <i class="fas fa-star"></i>
                     </span>
                     <span class="ms-2 text-muted">({{ answer.rating }} - {{ starRatingMeanings[answer.rating] || '' }})</span>
                     <button 
                        v-if="answer.rating !== null && answer.rating !== undefined"
                        type="button" 
                        class="btn btn-outline-secondary btn-sm ms-2" 
                        @click="openRatingDescriptionModal(answer.rating!, answer.question?.text)"
                        title="View Rating Descriptions"
                        style="padding: 0.25rem 0.5rem; line-height: 1;">
                        <i class="bi bi-file-earmark-text"></i>
                      </button>
                  </div>
                   <p v-else class="text-muted fst-italic">No rating provided.</p>
                </div>

                <!-- Display Text/Text Input -->
                <div v-else-if="['TEXT', 'TEXT_INPUT'].includes(answer.question?.question_type)">
                   <p class="mb-1">Answer:</p>
                   <p v-if="answer.text_answer" class="form-control bg-light" style="white-space: pre-wrap;">{{ answer.text_answer }}</p>
                   <p v-else class="text-muted fst-italic">No text answer provided.</p>
                </div>

                <!-- Display Options -->
                 <div v-else-if="answer.question?.question_type === 'OPTIONS'">
                   <p class="mb-1">Answer:</p>
                   <p v-if="answer.selected_option" class="fw-bold">{{ answer.selected_option.option_text }}</p>
                   <p v-else class="text-muted fst-italic">No option selected.</p>
                 </div>

                 <div v-else>
                    <p class="text-muted fst-italic">Unknown question type or no answer recorded.</p>
                 </div>
              </div>
            </div>
            <div v-else class="alert alert-info">
              No answers found for this evaluation instance.
            </div>
          </div>
          <div v-else class="text-center">
            Loading evaluation details...
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeViewAnswersModal">Close</button>
        </div>
      </div>
    </div>
  </div>
  <!-- End View Answers Modal -->

  <!-- Rating Description Modal -->
  <div class="modal fade" :class="{ show: showRatingDescriptionModal }" style="display: block;" v-if="showRatingDescriptionModal" tabindex="-1" aria-labelledby="ratingDescriptionModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="ratingDescriptionModalLabel">
            Rating Descriptions for {{ ratingForDescriptionModal }} Star(s)
          </h5>
          <button type="button" class="btn-close" @click="closeRatingDescriptionModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="ratingForDescriptionModal !== null">
            <!-- Non-Executive Descriptions -->
            <div class="mb-4">
              <h6>Non-Executive Staff Descriptions:</h6>
              <div class="p-2 border rounded bg-light-subtle">
                <p class="mb-1"><strong>EN:</strong></p>
                <pre class="description-text">{{ getCombinedRatingDescriptionForStar(ratingForDescriptionModal, 'en', PREDEFINED_BEHAVIOURAL_QUESTIONS_CONFIG) || 'N/A' }}</pre>
                <hr>
                <p class="mb-1"><strong>CN:</strong></p>
                <pre class="description-text">{{ getCombinedRatingDescriptionForStar(ratingForDescriptionModal, 'cn', PREDEFINED_BEHAVIOURAL_QUESTIONS_CONFIG) || 'N/A' }}</pre>
              </div>
            </div>

            <!-- Executive Descriptions -->
            <div>
              <h6>Executive Staff Descriptions:</h6>
              <div class="p-2 border rounded bg-light-subtle">
                <p class="mb-1"><strong>EN:</strong></p>
                <pre class="description-text">{{ getCombinedRatingDescriptionForStar(ratingForDescriptionModal, 'en', EXECUTIVE_RATING_CONFIG) || 'N/A' }}</pre>
                <hr>
                <p class="mb-1"><strong>CN:</strong></p>
                <pre class="description-text">{{ getCombinedRatingDescriptionForStar(ratingForDescriptionModal, 'cn', EXECUTIVE_RATING_CONFIG) || 'N/A' }}</pre>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-muted">
            No rating selected to display descriptions.
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeRatingDescriptionModal">Close</button>
        </div>
      </div>
    </div>
  </div>
  <!-- End Rating Description Modal -->

</template>

<style scoped>
/* Import relevant styles from SurveyManagement if needed, or define here */

/* Search Container Styling - Ensure it matches SurveyManagement */
.search-container {
  display: flex;
  align-items: center;
  border: 1px solid #6c757d; /* Adjusted border color */
  border-radius: 0.25rem; /* Adjusted border radius */
  padding: 0.375rem 0.75rem; /* Adjusted padding */
  /* min-width: 250px; */ /* Removed min-width */
  height: 38px; /* Adjusted height to match typical form control */
  flex-grow: 1; /* Keep flex-grow */
  background-color: #fff; /* Added background color */
  max-width: 350px; /* Optional: Set a max-width if needed */
}

.search-icon {
  color: #6c757d;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.search-input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 1rem;
  padding: 0;
}


/* Filter Container - Ensure alignment and background */
.filter-container {
  padding: 1rem 1.5rem;
  /* background-color: #f8f9fa; */ /* Removed background */
  border-radius: 0.5rem;
  /* border: 1px solid #dee2e6; */ /* Removed border */
}

.status-filter-container {
  display: flex;
  align-items: center;
}

.status-filter-select {
  min-width: 150px; /* Adjust as needed */
  height: 38px;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #6c757d;
}

/* Pagination Styling (ensure consistency) */
.pagination {
  display: flex;
  padding-left: 0;
  list-style: none;
  border-radius: 0.25rem;
}

.page-item {
  margin: 0 0.15rem;
}

.page-item .page-link {
  position: relative;
  display: block;
  padding: 0.5rem 0.75rem;
  /* Use high-contrast colors from SurveyManagement if different */
  color: #0d6efd; /* Example blue */
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  text-decoration: none;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

.page-item.active .page-link {
  z-index: 1;
  color: #fff;
  /* Use active color from SurveyManagement */
  background-color: #198754; /* Example green */
  border-color: #198754; /* Example green */
}


/* Keep existing relevant styles, remove styles specific to old modals/elements if desired */

    /* Keep existing relevant styles, remove styles specific to old modals/elements if desired */
    /* Add styles for loading indicators or new elements if needed */

    /* Ensure existing styles for form-group, form-label, table, modal, pagination etc. are suitable */
    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      font-weight: bold;
      display: block;
      margin-bottom: 0.5rem;
    }

    .modal {
      display: none;
    }

    .modal.show {
      display: block;
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1040;
    }
    .table-card {
      border: 1px solid #707070;
      padding: 2rem;
      margin-bottom: 1rem;
      border-radius: 20px;
    }

    .table th, .table td {
      padding: 1rem;
      vertical-align: middle;
      border-bottom: 1px solid #707070;
    }

    .btn-action {
      padding: 0.25rem 1rem;
      margin-left: 0.5rem;
    }

    .modal-content {
      padding: 15px;
    }

    .form-control {
      border-color: #000000;
    }

    /* Style for option questions */
    .option-container {
        padding-left: 1rem;
    }

    .auto-resize {
      resize: none;
      overflow: hidden;
    }

    .pagination {
      display: flex;
      justify-content: center;
      margin-top: 15px;
    }

    .page-link {
      border: 1px solid #cccccc;
    }

    .page-item .page-link {
      color: #0d6efd;
    }

    .page-item.active .page-link {
      color: #fff;
      background-color: #0d6efd;
      border-color: #0d6efd;
    }

    /* Added style for disabled pagination */
    .page-item.disabled .page-link {
        color: #6c757d;
        pointer-events: none;
        background-color: #fff;
        border-color: #dee2e6;
    }

    /* Ensure question text is readable */
    .bg-light {
        background-color: #f8f9fa !important;
        border: 1px solid #dee2e6;
        padding: 0.5rem 0.75rem;
        white-space: pre-wrap; /* Allow text wrapping */
    word-wrap: break-word; /* Break long words */
    }

    /* Star Rating Styles */
    .star-rating {
      display: inline-block; /* Or flex */
      font-size: 1.5rem; /* Adjust size as needed */
      color: #ccc; /* Default star color */
    }

    .star {
      cursor: pointer;
      padding: 0 0.1em; /* Spacing between stars */
      transition: color 0.2s;
    }

    .star.filled {
      color: #ffc107; /* Filled star color (e.g., gold) */
    }

    .star:hover,
    .star.hover-active { /* Apply hover to current and preceding stars */
       color: #ffdd7a;
    }

    .description-text {
      white-space: pre-wrap; /* Ensures newlines are respected */
      font-family: inherit; /* Inherit font from parent */
      margin: 0; /* Remove default pre margins */
    }

    </style>
