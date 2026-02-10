import { render, screen } from "@testing-library/react";
import Prompt from "./Prompt";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

describe("Prompt", () => {
  const handleButton1 = vi.fn();
  const handleButton2 = vi.fn();
  const p = (
    <Prompt
      open
      onClose={() => {}}
      promptItem={{
        headline: "A or B?",
        text: "Please decide.",
        button1: "Option A",
        onButton1: handleButton1,
        button2: "Option B",
        onButton2: handleButton2,
      }}
      setPromptItem={() => {}}
      setContextMenu={() => {}}
    />
  );

  it("should show labels", () => {
    render(p);

    expect(screen.getByText("A or B?")).toBeInTheDocument();
    expect(screen.getByText("Please decide.")).toBeInTheDocument();
    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("should fire click events", () => {
    render(p);

    const btn1 = screen.getByTestId("prompt-button-Option A");
    const btn2 = screen.getByTestId("prompt-button-Option B");

    btn1.click();
    expect(handleButton1).toHaveBeenCalledTimes(1);
    btn2.click();
    expect(handleButton2).toHaveBeenCalledTimes(1);
  });
});
