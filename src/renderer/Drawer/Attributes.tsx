import React, { useState, useRef, memo, useMemo } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AirIcon from '@mui/icons-material/Air';
import { handleFilterSelect } from '../Shared';
import { withTranslation, WithTranslation } from 'react-i18next';
import { i18n } from '../Settings/LanguageSelector';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import calendar from 'dayjs/plugin/calendar';
import './Attributes.scss';
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(calendar);

const { store } = window.api;

interface DrawerAttributesProps extends WithTranslation {
  settings: Settings;
  attributes: Attributes | null;
  attributeMapping: TranslatedAttributes;
  filters: Filters | null;
  t: typeof i18n.t;
}

const DrawerAttributes: React.FC<DrawerAttributesProps> = memo(({
  settings,
  attributes,
  attributeMapping,
  filters,
  t,
}) => {
  const firstTabbableElementRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const friendlyDate = (value: string) => {
    dayjs.locale(settings.language);
    return dayjs(value).calendar(null, {
      sameDay: `[${t(`drawer.attributes.today`)}]`,
      nextDay: `[${t(`drawer.attributes.tomorrow`)}]`,
      nextWeek: `[${t(`drawer.attributes.nextWeek`)}]`,
      lastDay: `[${t(`drawer.attributes.yesterday`)}]`,
      lastWeek: `[${t(`drawer.attributes.lastWeek`)}]`,
      sameElse: function () {
        return dayjs(this).fromNow();
      },
    });
  };

  const preprocessAttributes = (attributeKey, attributes) => {
    if (!attributes) {
      return null;
    }

    const processedAttributes = {};

    Object.keys(attributes).forEach((key) => {
      if (attributes[key]) {
        const count = attributes[key].count;
        const formattedValue = settings.useHumanFriendlyDates && dayjs(key).isValid() ? friendlyDate(key) : key;

        if (!processedAttributes[formattedValue]) {
          processedAttributes[formattedValue] = {
            key: attributeKey,
            name: formattedValue,
            count,
            notify: attributes[key].notify,
            aggregatedValues: [key]
          };
        } else {
          processedAttributes[formattedValue].count += count;
          processedAttributes[formattedValue].notify = processedAttributes[formattedValue].notify || attributes[key].notify;
          processedAttributes[formattedValue].aggregatedValues.push(key);
        }
      }
    });

    return processedAttributes;
  };

  const isAttributesEmpty = useMemo(
    () => !attributes || Object.values(attributes).every((attribute) => !Object.keys(attribute).length),
    [attributes]
  );

  const handleAccordionToggle = (index: number) => {
    const updatedAccordionOpenState = settings.accordionOpenState;
    updatedAccordionOpenState[index] = !updatedAccordionOpenState[index];
    store.setConfig('accordionOpenState', updatedAccordionOpenState);
  };

  const renderAttributes = (preprocessedAttributes: any, filters: Filters | null, handleFilterSelect: Function) => {

    return Object.keys(preprocessedAttributes).map((value, childIndex) => {

      const attribute = preprocessedAttributes[value];
      const name = preprocessedAttributes[value].name;
      const key = preprocessedAttributes[value].key;
      const excluded = filters && filters[key]?.some((filter: any) => filter.name === name && filter.exclude);
      const selected = filters && filters[key]?.some((filter: any) => filter.name === name);
      const disabled = attribute.count === 0;
      const notify = key === 'due' ? attribute.notify : false;

      return (
        <div
          key={`${key}-${value}-${childIndex}`}
          data-todotxt-attribute={key}
          data-todotxt-value={value}
          onMouseEnter={() => setHovered(`${key}-${value}-${childIndex}`)}
          onMouseLeave={() => setHovered(null)}
          className={`filter ${selected ? 'selected' : ''} ${excluded ? 'excluded' : ''}`}
        >
          <Badge
            badgeContent={
              !disabled && attribute.count > 0 ? (
                <span
                  onClick={(event) => {
                    event.stopPropagation();
                    handleFilterSelect(key, name, attribute.aggregatedValues, filters, true);
                  }}
                >
                  {hovered === `${key}-${value}-${childIndex}` ? <VisibilityOffIcon /> : attribute.count}
                </span>
              ) : null
            }
            className={notify ? 'notify' : null}
          >
            <Button
              className="attribute"
              data-testid={`drawer-button-${key}`}
              onClick={
                disabled
                  ? undefined
                  : () =>
                    handleFilterSelect(key, name, attribute.aggregatedValues, filters, false)
              }
              disabled={disabled}
            >
              {value}
            </Button>
          </Badge>
          {excluded && (
            <div
              data-todotxt-attribute={key}
              data-todotxt-value={value}
              data-testid={`drawer-button-exclude-${key}`}
              className="overlay"
              onClick={() => handleFilterSelect(key, name, attribute.aggregatedValues, filters, false)}
            >
              <VisibilityOffIcon />
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div id="Attributes" ref={firstTabbableElementRef}>
      {!isAttributesEmpty ? (
        Object.keys(attributes).map((key, index) => {

          const preprocessedAttributes = attributes[key] ? preprocessAttributes(key, attributes[key]) : attributes[key];

          return Object.keys(preprocessedAttributes).length > 0 ? (
            <Accordion
              TransitionProps={{ unmountOnExit: true }}
              key={index}
              expanded={settings.accordionOpenState[index]}
              onChange={() => handleAccordionToggle(index)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Badge variant="dot" invisible={!(key === 'due' && Object.values(preprocessedAttributes).some((attribute) => attribute.notify))}>
                  <h3 data-testid={`drawer-attributes-accordion-${key}`}>
                    {attributeMapping[key]}
                  </h3>
                </Badge>
              </AccordionSummary>
              <AccordionDetails>
                {renderAttributes(preprocessedAttributes, filters, handleFilterSelect)}
              </AccordionDetails>
            </Accordion>
          ) : null;
        })
      ) : (
        <div className="placeholder">
          <AirIcon />
          <br />
          {t(`drawer.attributes.noAttributesAvailable`)}
        </div>
      )}
    </div>
  );
});

export default withTranslation()(DrawerAttributes);
