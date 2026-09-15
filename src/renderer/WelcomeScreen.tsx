import { FC, memo } from "react";
import Link from "@mui/material/Link";
import { useTranslation } from "react-i18next";
import { handleLinkClick } from "./Shared";
import "./WelcomeScreen.scss";

interface WelcomeScreenProps {
  onComplete: (allowAnalytics: boolean) => void;
}

const WelcomeScreenComponent: FC<WelcomeScreenProps> = memo(
  ({ onComplete }) => {
    const { t } = useTranslation();

    const handleAllowAnalytics = (): void => {
      onComplete(true);
    };

    const handleDeclineAnalytics = (): void => {
      onComplete(false);
    };

    return (
      <div id="welcomeScreen">
        <div className="container">
          <h1>{t("welcome.headline")}</h1>
          <p className="description">{t("welcome.description")}</p>

          <div className="analyticsSection">
            <h2>{t("welcome.analyticsHeadline")}</h2>
            <p className="analyticsDescription">
              {t("welcome.analyticsDescription")}
            </p>
            <p className="analyticsDetails">
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
              onClick={handleDeclineAnalytics}
              data-testid="welcome-button-decline"
              className="continueButton"
            >
              {t("welcome.skipAnalytics")}
            </button>
            <button
              onClick={handleAllowAnalytics}
              data-testid="welcome-button-accept"
              className="continueButton"
            >
              {t("welcome.analyticsAllow")}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

WelcomeScreenComponent.displayName = "WelcomeScreenComponent";

export default WelcomeScreenComponent;
