interface CalendarInspectRouter {
  back: () => void;
}

export function buildLearningCalendarHref(localDate: string): string {
  return `/record?localDate=${localDate}`;
}

/** 从学习日历检查页退出：pop 回下方的日历页，避免 replace 在栈上叠多层日历。 */
export function exitCalendarInspect(router: CalendarInspectRouter): void {
  router.back();
}
