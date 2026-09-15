import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WelcomeScreen from "./WelcomeScreen";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

vi.mock("./Shared", () => ({
  handleLinkClick: vi.fn(),
}));

describe("WelcomeScreen", () => {
  const onComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render welcome headline and description", () => {
    render(<WelcomeScreen onComplete={onComplete} />);

    expect(screen.getByText("welcome.headline")).toBeInTheDocument();
    expect(screen.getByText("welcome.description")).toBeInTheDocument();
  });

  it("should render analytics section", () => {
    render(<WelcomeScreen onComplete={onComplete} />);

    expect(screen.getByText("welcome.analyticsHeadline")).toBeInTheDocument();
    expect(
      screen.getByText("welcome.analyticsDescription"),
    ).toBeInTheDocument();
    expect(screen.getByText("welcome.analyticsDetails")).toBeInTheDocument();
    expect(screen.getByText("welcome.privacyPolicyLink")).toBeInTheDocument();
  });

  it("should render two buttons with correct text", () => {
    render(<WelcomeScreen onComplete={onComplete} />);

    const declineButton = screen.getByTestId("welcome-button-decline");
    const acceptButton = screen.getByTestId("welcome-button-accept");

    expect(declineButton).toBeInTheDocument();
    expect(declineButton).toHaveTextContent("welcome.skipAnalytics");

    expect(acceptButton).toBeInTheDocument();
    expect(acceptButton).toHaveTextContent("welcome.analyticsAllow");
  });

  it("should call onComplete with false when decline button is clicked", async () => {
    const user = userEvent.setup();
    render(<WelcomeScreen onComplete={onComplete} />);

    const declineButton = screen.getByTestId("welcome-button-decline");
    await user.click(declineButton);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(false);
  });

  it("should call onComplete with true when accept button is clicked", async () => {
    const user = userEvent.setup();
    render(<WelcomeScreen onComplete={onComplete} />);

    const acceptButton = screen.getByTestId("welcome-button-accept");
    await user.click(acceptButton);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith(true);
  });
});
