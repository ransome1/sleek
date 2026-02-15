import React, { useState, memo, useMemo } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Link from "@mui/material/Link";
import HelpIcon from "@mui/icons-material/Help";
import Badge from "@mui/material/Badge";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PomodoroIcon from "../../../resources/pomodoro.svg?asset";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AirIcon from "@mui/icons-material/Air";
import {
  HandleFilterSelect,
  friendlyDate,
  translatedAttributes,
  IsSelected,
  IsExcluded,
  handleLinkClick,
} from "../Shared";
import { useTranslation } from "react-i18next";
import "./Attributes.scss";
import {
  AttributeGroup,
  Attributes,
  Filters,
  AttributeKey,
  SettingStore,
} from "@sleek-types";
import { i18n } from "../Settings/LanguageSelector";

const { store } = window.api;

const DATE_ATTRIBUTE_KEYS = ["due", "t", "completed", "created"];

interface DrawerAttributesComponentProps {
  settings: SettingStore;
  attributes: Attributes | null;
  filters: Filters | null;
}

// Merges raw attribute entries into display-ready buckets.
//
// For date attributes with useHumanFriendlyDates enabled, multiple ISO date
// values can collapse into one human label (e.g. "Today", "This Week").
// When that happens, counts are summed, notify uses OR, and hide uses AND
// (false wins — one visible todo makes the whole bucket visible).
//
// For non-date attributes, each raw value becomes its own bucket unchanged.
//
// Date buckets are sorted by recency (overdue → next month). All other
// attribute values were already sorted alphabetically by the main process.
function buildDisplayBuckets(
  attributeKey: AttributeKey,
  rawGroup: AttributeGroup,
  settings: SettingStore,
  t: typeof i18n.t,
): AttributeGroup {
  const isDate = DATE_ATTRIBUTE_KEYS.includes(attributeKey);
  const buckets: AttributeGroup = {};

  for (const [rawKey, entry] of Object.entries(rawGroup)) {
    const bucketNames =
      settings.useHumanFriendlyDates && isDate
        ? friendlyDate(rawKey, attributeKey, settings, t)
        : [rawKey];

    for (const bucketName of bucketNames) {
      if (!buckets[bucketName]) {
        buckets[bucketName] = {
          count: entry.count,
          notify: entry.notify,
          hide: entry.hide,
          value: [rawKey],
        };
      } else {
        buckets[bucketName].count += entry.count;
        buckets[bucketName].notify = buckets[bucketName].notify || entry.notify;
        // false wins: one visible todo in the bucket makes the whole bucket visible
        buckets[bucketName].hide = buckets[bucketName].hide && entry.hide;
        buckets[bucketName].value.push(rawKey);
      }
    }
  }

  // Sort date buckets by recency. Non-date buckets are already alphabetically
  // sorted by the main process and their order is preserved here.
  if (isDate) {
    const dateSortOrder: string[] = [
      t("drawer.attributes.overdue"),
      t("drawer.attributes.elapsed"),
      t("drawer.attributes.lastWeek"),
      t("drawer.attributes.yesterday"),
      t("drawer.attributes.today"),
      t("drawer.attributes.tomorrow"),
      t("drawer.attributes.thisWeek"),
      t("drawer.attributes.nextWeek"),
      t("drawer.attributes.thisMonth"),
      t("drawer.attributes.nextMonth"),
    ];
    return Object.fromEntries(
      Object.entries(buckets).sort(([a], [b]) => {
        const indexA = dateSortOrder.indexOf(a);
        const indexB = dateSortOrder.indexOf(b);
        return (
          (indexA !== -1 ? indexA : Number.MAX_SAFE_INTEGER) -
          (indexB !== -1 ? indexB : Number.MAX_SAFE_INTEGER)
        );
      }),
    );
  }

  return buckets;
}

const DrawerAttributesComponent: React.FC<DrawerAttributesComponentProps> =
  memo(({ settings, attributes, filters }) => {
    const [hovered, setHovered] = useState<string | null>(null);

    const { t } = useTranslation();

    const isAttributesEmpty = useMemo(
      () =>
        !attributes ||
        Object.values(attributes).every(
          (group) => Object.keys(group).length === 0,
        ),
      [attributes],
    );

    const handleAccordionToggle = (index: number): void => {
      // Spread to avoid mutating the settings object in place
      const updated = [...settings.accordionOpenState];
      updated[index] = !updated[index];
      store.setConfig("accordionOpenState", updated);
    };

    const renderFilterChips = (
      categoryKey: AttributeKey,
      buckets: AttributeGroup,
    ) => {
      return Object.entries(buckets).map(
        ([bucketName, attribute], childIndex) => {
          if (attribute.hide) return null;

          const chipId = `${categoryKey}-${bucketName}-${childIndex}`;
          const isHovered = hovered === chipId;
          const excluded = IsExcluded(attribute, filters);
          const selected = IsSelected(categoryKey, filters, attribute.value);
          const disabled = attribute.count === 0;
          // groupedName is only set when multiple raw dates collapsed into one bucket label
          const groupedName = attribute.value.length > 1 ? bucketName : null;

          return (
            <div
              key={chipId}
              data-todotxt-attribute={categoryKey}
              data-todotxt-value={bucketName}
              onMouseEnter={() => setHovered(chipId)}
              onMouseLeave={() => setHovered(null)}
              className={`filter ${selected ? "selected" : ""} ${excluded ? "excluded" : ""}`}
            >
              <Badge
                badgeContent={
                  attribute.count > 0 ? (
                    <span
                      onClick={(event) => {
                        event.stopPropagation();
                        HandleFilterSelect(
                          categoryKey,
                          attribute.value,
                          filters,
                          true,
                          groupedName,
                        );
                      }}
                    >
                      {isHovered ? <VisibilityOffIcon /> : attribute.count}
                    </span>
                  ) : null
                }
                className={attribute.notify ? "notify" : undefined}
              >
                <button
                  data-testid={`drawer-button-${categoryKey}`}
                  onClick={
                    disabled
                      ? undefined
                      : () =>
                          HandleFilterSelect(
                            categoryKey,
                            attribute.value,
                            filters,
                            false,
                            groupedName,
                          )
                  }
                  disabled={disabled}
                  className={categoryKey === "pm" ? "pomodoro" : undefined}
                >
                  {categoryKey === "pm" && (
                    <img src={PomodoroIcon} alt="Pomodoro" />
                  )}
                  {bucketName}
                </button>
              </Badge>
              {excluded && (
                <div
                  data-todotxt-attribute={categoryKey}
                  data-todotxt-value={bucketName}
                  data-testid={`drawer-button-exclude-${categoryKey}`}
                  className="overlay"
                  onClick={() =>
                    HandleFilterSelect(
                      categoryKey,
                      attribute.value,
                      filters,
                      true,
                      groupedName,
                    )
                  }
                >
                  <VisibilityOffIcon />
                </div>
              )}
            </div>
          );
        },
      );
    };

    return (
      <div id="Attributes">
        {!isAttributesEmpty && attributes ? (
          Object.keys(attributes).map((catKey, index) => {
            const categoryKey = catKey as AttributeKey;
            const buckets = buildDisplayBuckets(
              categoryKey,
              attributes[categoryKey],
              settings,
              t,
            );
            // Don't render the accordion if there are no entries at all,
            // or if every entry is intentionally hidden via h:1.
            const hasEntries = Object.keys(buckets).length > 0;
            const hasVisibleEntries = Object.values(buckets).some(
              (attribute) => !attribute.hide,
            );
            if (!hasEntries || !hasVisibleEntries) return null;

            const hasNotification =
              categoryKey === "due" &&
              Object.values(buckets).some((attribute) => attribute.notify);

            return (
              <Accordion
                key={index}
                expanded={settings.accordionOpenState[index]}
                onChange={() => handleAccordionToggle(index)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Badge
                    variant="dot"
                    invisible={!hasNotification}
                    data-testid={`drawer-attributes-accordion-${categoryKey}`}
                  >
                    {translatedAttributes(t)[categoryKey]}
                  </Badge>
                </AccordionSummary>
                <AccordionDetails>
                  {renderFilterChips(categoryKey, buckets)}
                </AccordionDetails>
              </Accordion>
            );
          })
        ) : (
          <div className="placeholder">
            <AirIcon />
            <br />
            {t("drawer.attributes.noAttributesAvailable")}
            <Link
              onClick={(event) =>
                handleLinkClick(
                  event,
                  "https://github.com/ransome1/sleek/wiki/Available-todo.txt-attributes-and-extensions",
                )
              }
            >
              <HelpIcon />
            </Link>
          </div>
        )}
      </div>
    );
  });

DrawerAttributesComponent.displayName = "DrawerAttributesComponent";

export default DrawerAttributesComponent;
