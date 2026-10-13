import { memo } from "react";
import Link from "@mui/material/Link";
import { useTranslation } from "react-i18next";
import { handleLinkClick } from "./Shared";
import "./WelcomeScreen.scss";

interface WelcomeScreenProps {
  onComplete: (allowAnalytics: boolean) => void;
}

const WelcomeScreenComponent = memo(({ onComplete }: WelcomeScreenProps) => {
  const { t } = useTranslation();

  return (
    <div id="welcomeScreen">
      <div className="container">
        <div className="analyticsSection">
          <h2>{t("welcome.analyticsHeadline")}</h2>
          <p>
            {t("welcome.analyticsDescription")}&nbsp;
            {t("welcome.analyticsDetails")}
            <Link
              onClick={(event) =>
                handleLinkClick(
                  event,
                  "https://github.com/ransome1/sleek/blob/main/PRIVACY.md",
                )
              }
            >
              {t("welcome.privacyPolicyLink")}
            </Link>
          </p>
        </div>

        <div className="buttons">
          <button
            onClick={() => onComplete(false)}
            data-testid="welcome-button-decline"
            className="continueButton"
          >
            {t("welcome.skipAnalytics")}
          </button>
          <button
            onClick={() => onComplete(true)}
            data-testid="welcome-button-accept"
            className="continueButton"
          >
            {t("welcome.analyticsAllow")}
          </button>
        </div>
      </div>
    </div>
  );
});

WelcomeScreenComponent.displayName = "WelcomeScreenComponent";

export default WelcomeScreenComponent;
