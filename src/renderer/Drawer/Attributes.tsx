import React, { useState, memo, useMemo } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Link from '@mui/material/Link'
import HelpIcon from '@mui/icons-material/Help'
import Badge from '@mui/material/Badge'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PomodoroIcon from '../../../resources/pomodoro.svg?asset'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import AirIcon from '@mui/icons-material/Air'
import { HandleFilterSelect, friendlyDate, translatedAttributes, IsSelected, IsExcluded, handleLinkClick } from '../Shared'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from '../Settings/LanguageSelector'
import './Attributes.scss'

const { store } = window.api

interface DrawerAttributesComponentProps extends WithTranslation {
  settings: Settings
  attributes: Attributes | null
  filters: Filters | null
  t: typeof i18n.t
}

const DrawerAttributesComponent: React.FC<DrawerAttributesComponentProps> = memo(({ settings, attributes, filters, t }) => {
    const [hovered, setHovered] = useState<string | null>(null)
    const isAttributesEmpty = useMemo(() => !attributes || Object.values(attributes).every((attribute) => !Object.keys(attribute).length), [attributes] )

    const preprocessAttributes = (attributeKey: string, attributes) => {
      if (!attributes) return null

      const isDate = ['due', 't', 'completed', 'created'].includes(attributeKey)
      const processedAttributes = {}

      Object.keys(attributes).forEach((key) => {
        if (attributes[key]) {
          const count = attributes[key].count
          const groupedNames =
            settings.useHumanFriendlyDates && isDate
              ? friendlyDate(key, attributeKey, settings, t)
              : [key]

          groupedNames.forEach((groupedName) => {
            if (!processedAttributes[groupedName]) {
              processedAttributes[groupedName] = {
                count,
                notify: attributes[key].notify,
                value: [key],
              }
            } else {
              processedAttributes[groupedName].count += count
              processedAttributes[groupedName].notify = processedAttributes[groupedName].notify || attributes[key].notify
              processedAttributes[groupedName].value.push(key)
            }
          })
        }
      })
      const sorting = [
        t('drawer.attributes.overdue'),
        t('drawer.attributes.elapsed'),
        t('drawer.attributes.lastWeek'),
        t('drawer.attributes.yesterday'),
        t('drawer.attributes.today'),
        t('drawer.attributes.tomorrow'),
        t('drawer.attributes.thisWeek'),
        t('drawer.attributes.nextWeek'),
        t('drawer.attributes.thisMonth'),
        t('drawer.attributes.nextMonth')
      ]
      const sortedAttributes = Object.fromEntries(
        Object.entries(processedAttributes).sort((a: unknown, b: unknown) => {
          const indexA = sorting.indexOf(a.name)
          const indexB = sorting.indexOf(b.name)
          return (
            (indexA !== -1 ? indexA : Number.MAX_SAFE_INTEGER) -
            (indexB !== -1 ? indexB : Number.MAX_SAFE_INTEGER)
          )
        })
      )
      return sortedAttributes
    }

    const handleAccordionToggle = (index: number): void => {
      const updatedAccordionOpenState = settings.accordionOpenState
      updatedAccordionOpenState[index] = !updatedAccordionOpenState[index]
      store.setConfig('accordionOpenState', updatedAccordionOpenState)
    }

    const renderAttributes = (key: string, preprocessedAttributes) => {
      return Object.keys(preprocessedAttributes).map((value, childIndex) => {
        const attribute = preprocessedAttributes[value]
        const excluded = IsExcluded(attribute, filters)
        const selected = IsSelected(key, filters, attribute.value)
        const disabled = attribute.count === 0

        const notify = key === 'due' ? attribute.notify : false
        const groupedName = (attribute.value.length > 1) ? value : null
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
                      event.stopPropagation()
                      HandleFilterSelect(key, attribute.value, filters, true, groupedName)
                    }}
                  >
                    {hovered === `${key}-${value}-${childIndex}` ? (
                      <VisibilityOffIcon />
                    ) : (
                      attribute.count
                    )}
                  </span>
                ) : null
              }
              className={notify ? 'notify' : null}
            >
              <button
                data-testid={`drawer-button-${key}`}
                onClick={
                  disabled
                    ? undefined
                    : (): void => {
                      HandleFilterSelect(key, attribute.value, filters, false, groupedName)
                    }
                }
                disabled={disabled}
                className={key === 'pm' ? 'pomodoro' : undefined}
              >
                {key === 'pm' && <img src={PomodoroIcon} alt="Pomodoro" />}
                {value}
              </button>
            </Badge>
            {excluded && (
              <div
                data-todotxt-attribute={key}
                data-todotxt-value={value}
                data-testid={`drawer-button-exclude-${key}`}
                className="overlay"
                onClick={() =>
                  HandleFilterSelect(key, attribute.value, filters, true, groupedName)
                }
              >
                <VisibilityOffIcon />
              </div>
            )}
          </div>
        )
      })
    }

    return (
      <div id="Attributes">
        {!isAttributesEmpty ? (
          Object.keys(attributes).map((key, index) => {
            const preprocessedAttributes: Attributes = preprocessAttributes(key, attributes[key])
            const accordionSummary: string = translatedAttributes(t)[key]
            return Object.keys(preprocessedAttributes).length > 0 ? (
              <Accordion
                key={index}
                expanded={settings.accordionOpenState[index]}
                onChange={() => handleAccordionToggle(index)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Badge
                    variant="dot"
                    invisible={
                      !(
                        key === 'due' &&
                        Object.values(preprocessedAttributes).some((attribute) => attribute.notify)
                      )
                    }
                    data-testid={`drawer-attributes-accordion-${key}`}
                  >
                    {accordionSummary}
                  </Badge>
                </AccordionSummary>
                <AccordionDetails>
                  {renderAttributes(key, preprocessedAttributes)}
                </AccordionDetails>
              </Accordion>
            ) : null
          })
        ) : (
          <div className="placeholder">
            <AirIcon />
            <br />
            {t(`drawer.attributes.noAttributesAvailable`)}

            <Link onClick={(event) => handleLinkClick(event, 'https://github.com/ransome1/sleek/wiki/Available-todo.txt-attributes-and-extensions')}>
              <HelpIcon />
            </Link>            
          </div>
        )}
      </div>
    )
  }
)

DrawerAttributesComponent.displayName = 'DrawerAttributesComponent'

export default withTranslation()(DrawerAttributesComponent)
