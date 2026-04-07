import { expect, beforeEach, describe, it, vi } from "vitest";
import crypto from "crypto";
import { Notification } from "electron";
import {
  MustNotify,
  CreateTitle,
  SuppressNotification,
  CountBadge,
  HandleNotification,
  GetToday,
} from "./Notifications";

const today = GetToday();
const tomorrow = today.plus({ days: 1 });
const inOneWeek = today.plus({ weeks: 1 });
const lastWeek = today.minus({ weeks: 1 });
const inFourDays = today.plus({ days: 4 });
const thresholdDay = today.plus({ days: 5 }); // mirrors the notificationThreshold mock value

vi.mock("./Stores", () => {
  return {
    SettingsStore: {
      get: vi.fn((key) => {
        if (key === "notificationThreshold") {
          return 5;
        }
      }),
    },
    FiltersStore: {
      get: vi.fn((key) => {
        if (key === "search") {
          return [
            {
              label: `due: > ${today.toISODate()} && due: < ${inFourDays.toISODate()}`,
              suppress: true,
            },
          ];
        }
        return null;
      }),
    },
    NotificationsStore: {
      get: vi.fn(() => [
        "80ec2a9b5c90483a077107a7c67b97859c3201f3551aef3e752bfa03f8eb3e6b",
        "d501a7388cde39b1ce79c3457228188b51696a8a8f578147ce83b89ee1d9b15f",
      ]),
      set: vi.fn(),
    },
  };
});

vi.mock("./index.js", () => {
  return {
    mainWindow: {
      webContents: {
        send: vi.fn(),
      },
    },
  };
});

vi.mock(import("./Notifications"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
  };
});

vi.mock("path", () => {
  return {
    default: {
      join: vi.fn(),
    },
  };
});

vi.mock("electron", () => {
  return {
    Notification: vi.fn(function () {
      return {
        show: vi.fn(),
      };
    }),
    app: {
      getPath: vi.fn().mockReturnValue(""),
    },
  };
});

describe("MustNotify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("Successful if date is today", () => {
    expect(MustNotify(today, thresholdDay)).toBe(true);
  });

  it("Successful if date is yesterday (overdue)", () => {
    expect(MustNotify(today.minus({ days: 1 }), thresholdDay)).toBe(true);
  });

  it("Successful if date is on the last day inside the threshold window (day 4)", () => {
    expect(MustNotify(today.plus({ days: 4 }), thresholdDay)).toBe(true);
  });

  it("Fails if date is exactly on the threshold boundary (day 5)", () => {
    expect(MustNotify(today.plus({ days: 5 }), thresholdDay)).toBe(false);
  });

  it("Fails if date is next week", () => {
    expect(MustNotify(inOneWeek, thresholdDay)).toBe(false);
  });
});

describe("CreateTitle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("`Due today` if due date is today", () => {
    expect(CreateTitle(today, today)).toBe("Due today");
  });
  it("`Due tomorrow` if due date is tomorrow", () => {
    expect(CreateTitle(tomorrow, today)).toBe("Due tomorrow");
  });
  it("`Due in 7 days` if due date is in 7 days from today", () => {
    expect(CreateTitle(inOneWeek, today)).toBe("Due in 7 days");
  });
  it("`Due in 4 days` if due date is in 4 days from today", () => {
    expect(CreateTitle(inFourDays, today)).toBe("Due in 4 days");
  });

  it("Empty string if due date is in the past", () => {
    expect(CreateTitle(lastWeek, today)).toBe("");
  });
});

describe("SuppressNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("Suppressed when hash is found in hash list", () => {
    expect(
      SuppressNotification(
        today,
        "",
        "d501a7388cde39b1ce79c3457228188b51696a8a8f578147ce83b89ee1d9b15f",
        today,
        thresholdDay,
      ),
    ).toBe(true);
  });
  it("Not suppressed when hash is not found in hash list", () => {
    expect(
      SuppressNotification(
        today,
        "",
        "21e121097b76efe0af72eb9a050efb20f2b8415c726378edabdc60f131720a16",
        today,
        thresholdDay,
      ),
    ).toBe(false);
  });
  it("Not suppressed when due date is between today and threshold date", () => {
    expect(SuppressNotification(inFourDays, "", "", today, thresholdDay)).toBe(
      false,
    );
  });
  it("Suppressed when due date is after threshold date", () => {
    expect(SuppressNotification(inOneWeek, "", "", today, thresholdDay)).toBe(
      true,
    );
  });
  it("Suppressed when due date is in last week", () => {
    expect(SuppressNotification(lastWeek, "", "", today, thresholdDay)).toBe(
      true,
    );
  });
  it("Suppressed by search filter when due date is matched", () => {
    expect(
      SuppressNotification(
        tomorrow,
        `due:${tomorrow.toISODate()}`,
        "",
        today,
        thresholdDay,
      ),
    ).toBe(true);
  });
  it("Not suppressed by search filter when due date is not matched", () => {
    expect(
      SuppressNotification(
        inFourDays,
        `due:${inFourDays.toISODate()}`,
        "",
        today,
        thresholdDay,
      ),
    ).toBe(false);
  });
});

describe("CountBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Increments badge count when due date is within threshold window", () => {
    const badge = { count: 0 };
    CountBadge(today, badge, thresholdDay);
    expect(badge.count).toBe(1);
  });

  it("Increments badge count when due date is overdue (yesterday)", () => {
    const badge = { count: 0 };
    CountBadge(today.minus({ days: 1 }), badge, thresholdDay);
    expect(badge.count).toBe(1);
  });

  it("Does not increment badge count when due date is at or beyond threshold (day 5)", () => {
    const badge = { count: 0 };
    CountBadge(today.plus({ days: 5 }), badge, thresholdDay);
    expect(badge.count).toBe(0);
  });

  it("Does not increment badge count when due date is next week", () => {
    const badge = { count: 0 };
    CountBadge(inOneWeek, badge, thresholdDay);
    expect(badge.count).toBe(0);
  });

  it("Accumulates correctly across multiple calls", () => {
    const badge = { count: 0 };
    CountBadge(today, badge, thresholdDay);
    CountBadge(today.plus({ days: 2 }), badge, thresholdDay);
    CountBadge(inOneWeek, badge, thresholdDay);
    expect(badge.count).toBe(2);
  });
});

describe("HandleNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Fires notification and persists hash when due date is today and not previously notified", () => {
    const badge = { count: 0 };
    const uniqueBody = "unique-body-never-seen-before-xyz";
    HandleNotification(today.toISODate()!, uniqueBody, badge);

    expect(badge.count).toBe(1);
    expect(Notification).toHaveBeenCalledWith(
      expect.objectContaining({ body: uniqueBody }),
    );
  });

  it("Does not fire notification but increments badge when due date is in the past", () => {
    const badge = { count: 0 };
    HandleNotification(
      lastWeek.toISODate()!,
      `due:${lastWeek.toISODate()!}`,
      badge,
    );

    expect(badge.count).toBe(1);
    expect(Notification).not.toHaveBeenCalled();
  });

  it("Does not fire notification and does not increment badge when due date is next week", () => {
    const badge = { count: 0 };
    HandleNotification(
      inOneWeek.toISODate()!,
      `due:${inOneWeek.toISODate()!}`,
      badge,
    );

    expect(badge.count).toBe(0);
    expect(Notification).not.toHaveBeenCalled();
  });

  it("Does not fire notification and does not increment badge when due date is not set", () => {
    const badge = { count: 0 };
    HandleNotification(
      null as unknown as string,
      `due:${inOneWeek.toISODate()!}`,
      badge,
    );

    expect(badge.count).toBe(0);
    expect(Notification).not.toHaveBeenCalled();
  });

  it("Does not fire notification and does not increment badge when body is empty", () => {
    const badge = { count: 0 };
    HandleNotification(today.toISODate()!, "", badge);

    expect(badge.count).toBe(0);
    expect(Notification).not.toHaveBeenCalled();
  });

  it("Does not fire notification but still increments badge when hash was already notified", () => {
    const badge = { count: 0 };
    // Find a body whose SHA-256 matches one of the hashes pre-seeded in the NotificationsStore mock
    const seededHash =
      "d501a7388cde39b1ce79c3457228188b51696a8a8f578147ce83b89ee1d9b15f";
    // Produce a body by brute-forcing is impractical; instead we spy on crypto to return the seeded hash
    vi.spyOn(crypto, "createHash").mockReturnValueOnce({
      update: () => ({ digest: () => seededHash }),
    } as unknown as ReturnType<typeof crypto.createHash>);
    HandleNotification(today.toISODate()!, "some body", badge);

    expect(badge.count).toBe(1);
    expect(Notification).not.toHaveBeenCalled();
  });
});
