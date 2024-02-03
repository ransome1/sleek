import React, { useState, useRef, memo } from 'react';
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
import './Attributes.scss';

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
  const mustNotify = (attributes: Attribute[]) => attributes.some((attribute) => attribute.notify);

  //const [isCtrlKeyPressed, setIsCtrlKeyPressed] = useState(false);
  const firstTabbableElementRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const isAttributesEmpty = (attributes: Attributes | null) => {
    return !attributes || Object.values(attributes).every((attribute) => !Object.keys(attribute).length);
  };

  // const handleCtrlCmdDown = (event: globalThis.KeyboardEvent) => {
  //   if(event.ctrlKey || event.metaKey) {
  //     setIsCtrlKeyPressed(true);
  //   }
  // };

  // const handleCtrlCmdUp = () => {
  //   setIsCtrlKeyPressed(false);
  // };

  const handleAccordionToggle = (index: number) => {
    const updatedAccordionOpenState = settings.accordionOpenState;
    updatedAccordionOpenState[index] = !updatedAccordionOpenState[index];
    store.setConfig('accordionOpenState', updatedAccordionOpenState);
  };

  // useEffect(() => {
  //   const handleFocusFirstTabbableElement = () => {
  //     if(firstTabbableElementRef.current) {
  //       firstTabbableElementRef.current.focus();
  //     }
  //   };

  //   handleFocusFirstTabbableElement();

  //   document.addEventListener('keydown', (event) => handleCtrlCmdDown(event));
  //   document.addEventListener('keyup', handleCtrlCmdUp);
  //   window.addEventListener('focus', handleCtrlCmdUp);
  //   return () => {
  //     document.removeEventListener('keydown', handleCtrlCmdDown);
  //     document.removeEventListener('keyup', handleCtrlCmdUp);
  //     window.removeEventListener('focus', handleCtrlCmdUp);
  //   };
  // }, []);

  return (
    <div id="Attributes" ref={firstTabbableElementRef}>
      {isAttributesEmpty(attributes) ? (
        <div className="placeholder">
          <AirIcon />
          <br />
          {t(`drawer.attributes.noAttributesAvailable`)}
        </div>
      ) : (
        Object.keys(attributes).map((key, index) =>
          attributes[key] && Object.keys(attributes[key]).length > 0 ? (
            <Accordion
              TransitionProps={{ unmountOnExit: true }}
              key={index}
              expanded={settings.accordionOpenState[index]}
              onChange={() => handleAccordionToggle(index)}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
              >
                <Badge variant="dot" invisible={!(key === 'due' && mustNotify(Object.values(attributes[key])))}>
                  <h3 data-testid={`drawer-attributes-accordion-${key}`}>
                    {attributeMapping[key]}
                  </h3>
                </Badge>
              </AccordionSummary>
              <AccordionDetails>
                  {attributes && Object.keys(attributes[key]).map((value, childIndex) => {
                    const excluded = filters && filters[key]?.some(
                      (filter: any) => filter.value === value && filter.exclude
                    );
                    const selected = filters && filters[key]?.some((filter: any) => filter.value === value);
                    const disabled = attributes[key][value].count === 0;
                    const notify = (key === 'due') ? attributes[key][value].notify : false;
                    return (
                      <div
                        key={`${key}-${value}-${childIndex}`}
                        data-todotxt-attribute={key}
                        data-todotxt-value={value}

                        onMouseEnter={() => setHovered(`${key}-${value}-${childIndex}`)}
                        onMouseLeave={() => setHovered(null)}

                        className={`filter ${
                          selected ? 'selected' : ''
                        } ${excluded ? 'excluded' : ''}`}
                      >
                        <Badge 
                          badgeContent={
                            attributes[key][value].count > 0 ? (
                              <span
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleFilterSelect(key, value, filters, true);
                                }}
                              >
                                {hovered === `${key}-${value}-${childIndex}` ? <VisibilityOffIcon /> : attributes[key][value].count}
                              </span>
                            ) : null
                          }
                          className={notify ? 'notify' : null }
                        >
                          <Button
                            className="attribute"
                            data-testid={`drawer-button-${key}`}
                            onClick={
                              disabled
                                ? undefined
                                : () =>
                                  handleFilterSelect(key, value, filters, false)
                            }
                            disabled={disabled}
                          >
                            {value}
                          </Button>
                        </Badge>
                        {(excluded) && (
                          <div
                            data-todotxt-attribute={key}
                            data-todotxt-value={value}
                            data-testid={`drawer-button-exclude-${key}`}
                            className="overlay"
                            onClick={() => handleFilterSelect(key, value, filters, false)}
                          >
                            <VisibilityOffIcon />
                          </div>
                        )}
                      </div>
                    );
                  })}
                
              </AccordionDetails>
            </Accordion>
          ) : null
        )
      )}
    </div>
  );
});

export default withTranslation()(DrawerAttributes);
