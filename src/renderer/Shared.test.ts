import { expect, describe, it } from "vitest";
import { DateTime, Settings as LuxonSettings, WeekdayNumbers } from "luxon";
import { friendlyDate } from "./Shared";
import { SettingStore } from "@sleek-types";
import { i18n } from "./Settings/LanguageSelector";

// Mock translation function
// @ts-expect-error We're not gonna get into this...
const mockT: typeof i18n.t = (key) => {
  return key;
};

// @ts-expect-error Ignore this until we have a default SettingStore to test with.
const mockSettings: SettingStore = {
  language: "en",
  weekStart: 1, // Monday
};

describe("friendlyDate", () => {
  // Helper to get dates relative to today
  const getRelativeDate = (daysOffset: number): string => {
    return DateTime.now()
      .plus({ days: daysOffset })
      .startOf("day")
      .toISODate()!;
  };

  describe("Past dates", () => {
    it("should return 'Yesterday' for 1 day ago", () => {
      const yesterday = getRelativeDate(-1);
      const result = friendlyDate(yesterday, "due", mockSettings, mockT);
      expect(result).toContain("drawer.attributes.yesterday");
    });

    it("should return 'Overdue' for dates more than 1 day in the past", () => {
      const twoDaysAgo = getRelativeDate(-2);
      const result = friendlyDate(twoDaysAgo, "due", mockSettings, mockT);
      expect(result).toContain("drawer.attributes.overdue");
    });

    it("should return 'Elapsed' for threshold dates in the past", () => {
      const twoDaysAgo = getRelativeDate(-2);
      const result = friendlyDate(twoDaysAgo, "t", mockSettings, mockT);
      expect(result).toContain("drawer.attributes.elapsed");
    });
  });

  describe("Today and Tomorrow", () => {
    it("should return 'Today' for today", () => {
      const today_str = getRelativeDate(0);
      const result = friendlyDate(today_str, "due", mockSettings, mockT);
      expect(result).toContain("drawer.attributes.today");
      expect(result.length).toBe(1);
    });

    it("should return 'Tomorrow' for tomorrow", () => {
      const tomorrow = getRelativeDate(1);
      const result = friendlyDate(tomorrow, "due", mockSettings, mockT);
      expect(result).toContain("drawer.attributes.tomorrow");
      expect(result.length).toBe(1);
    });
  });

  describe("This week (rest of current calendar week)", () => {
    it("should return 'This week' for dates within current calendar week", () => {
      // Get a date that is in the current week but not today or tomorrow
      LuxonSettings.defaultWeekSettings = {
        firstDay: 1 as WeekdayNumbers,
        minimalDays: 4,
        weekend: [6, 7],
      };
      const now = DateTime.now().startOf("day");
      const endOfThisWeek = now.endOf("week", { useLocaleWeeks: true });
      const daysUntilEndOfWeek = endOfThisWeek.diff(now, "days").days;

      // If there are at least 3 days left in the week, test a middle date
      if (daysUntilEndOfWeek >= 3) {
        const dateInThisWeek = getRelativeDate(2);
        const result = friendlyDate(dateInThisWeek, "due", mockSettings, mockT);
        expect(result).toContain("drawer.attributes.thisWeek");
      }
    });
  });

  describe("This month (rest of current month, after this week)", () => {
    it("should return 'This month' for dates in current month but beyond this week", () => {
      LuxonSettings.defaultWeekSettings = {
        firstDay: 1 as WeekdayNumbers,
        minimalDays: 4,
        weekend: [6, 7],
      };
      const now = DateTime.now().startOf("day");
      const endOfThisWeek = now.endOf("week", { useLocaleWeeks: true });
      const endOfThisMonth = now.endOf("month");

      const daysUntilEndOfWeek = endOfThisWeek.diff(now, "days").days;
      const daysUntilEndOfMonth = endOfThisMonth.diff(now, "days").days;

      // If there's room between end of week and end of month, test a date there
      if (daysUntilEndOfWeek < daysUntilEndOfMonth - 1) {
        const dateInThisMonth = getRelativeDate(
          Math.floor(daysUntilEndOfWeek) + 2,
        );
        const result = friendlyDate(
          dateInThisMonth,
          "due",
          mockSettings,
          mockT,
        );
        expect(result).toContain("drawer.attributes.thisMonth");
        expect(result).not.toContain("drawer.attributes.thisWeek");
      }
    });
  });

  describe("Next month", () => {
    it("should return 'Next month' for dates in the following month", () => {
      const dateInNextMonth = getRelativeDate(35); // ~35 days away will likely be in next month
      const now = DateTime.now().startOf("day");
      const dateObj = DateTime.fromISO(dateInNextMonth);

      // Only test if the date is actually in a different month
      if (dateObj.month !== now.month || dateObj.year !== now.year) {
        const result = friendlyDate(
          dateInNextMonth,
          "due",
          mockSettings,
          mockT,
        );
        expect(result).toContain("drawer.attributes.nextMonth");
      }
    });
  });

  describe("Far future (date string)", () => {
    it("should return date string for dates far in the future", () => {
      const farFuture = getRelativeDate(100); // 100+ days away
      const result = friendlyDate(farFuture, "due", mockSettings, mockT);
      // Should be a date string matching YYYY-MM-DD format
      expect(result[0]).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });

  describe("Result structure", () => {
    it("should return array with single item for all dates", () => {
      const tomorrow = getRelativeDate(1);
      const result = friendlyDate(tomorrow, "due", mockSettings, mockT);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it("should return array with 'Today' label only", () => {
      const today_str = getRelativeDate(0);
      const result = friendlyDate(today_str, "due", mockSettings, mockT);
      expect(result.length).toBe(1);
      expect(result[0]).toBe("drawer.attributes.today");
    });
  });

  describe("Attribute type handling", () => {
    it("should use 'Overdue' for due dates in the past", () => {
      const twoDaysAgo = getRelativeDate(-2);
      const result = friendlyDate(twoDaysAgo, "due", mockSettings, mockT);
      expect(result).toContain("drawer.attributes.overdue");
    });

    it("should use 'Elapsed' for threshold dates in the past", () => {
      const twoDaysAgo = getRelativeDate(-2);
      const result = friendlyDate(twoDaysAgo, "t", mockSettings, mockT);
      expect(result).toContain("drawer.attributes.elapsed");
    });
  });
});
