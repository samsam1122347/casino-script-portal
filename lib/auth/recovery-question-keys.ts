/** Must match `config/recovery_questions.php` keys. */
export const RECOVERY_QUESTION_KEYS = [
  "birth_city",
  "mother_maiden",
  "first_pet",
  "favorite_teacher",
  "childhood_nickname",
  "first_car",
] as const;

export type RecoveryQuestionKey = (typeof RECOVERY_QUESTION_KEYS)[number];
