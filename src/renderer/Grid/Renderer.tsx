import React, { memo } from 'react'
import reactStringReplace from 'react-string-replace'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import TomatoIconDuo from '../tomato-duo.svg?asset'
import DatePickerInline from './DatePickerInline'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { handleLinkClick } from '../Shared'
import { WithTranslation } from 'react-i18next'
import { i18n } from '../Settings/LanguageSelector'

interface RendererComponentProps extends WithTranslation {
  todoObject: TodoObject
  filters: Filters
  settings: Settings
  handleButtonClick: (type: string, value: string, label: string) => void
  t: typeof i18n.t
}

const RendererComponent: React.FC<RendererComponentProps> = memo(
  ({ todoObject, filters, settings, handleButtonClick }) => {
    const expressions = [
      {
        pattern: new RegExp(`t:${todoObject.tString?.replace(/\s/g, '\\s')}`, 'g'),
        type: 't',
        key: 't:'
      },
      {
        pattern: new RegExp(`due:${todoObject.dueString?.replace(/\s/g, '\\s')}`, 'g'),
        type: 'due',
        key: 'due:'
      },
      { pattern: /@(\S+)/, type: 'contexts', key: '@' },
      { pattern: /(?:^|\s)\+(\S+)/, type: 'projects', key: '+' },
      { pattern: /\bh:1\b/, type: 'hidden', key: 'h:1' },
      { pattern: /pm:(\d+)/, type: 'pm', key: 'pm:' },
      { pattern: /rec:([^ ]+)/, type: 'rec', key: 'rec:' }
    ]

    const replacements: {
      [key: string]: (value: string, type: string) => React.ReactNode
    } = {
      due: (value, type) => (
        <DatePickerInline
          name={value}
          type={type}
          todoObject={todoObject}
          date={todoObject.due}
          filters={filters}
          settings={settings}
        />
      ),
      t: (value, type) => (
        <DatePickerInline
          name={value}
          type={type}
          todoObject={todoObject}
          date={todoObject.t}
          filters={filters}
          settings={settings}
        />
      ),
      contexts: (value, type) => (
        <Button
          className="contexts"
          onClick={() => handleButtonClick(type, value, value)}
          data-testid={`datagrid-button-${type}`}
        >
          {value}
        </Button>
      ),
      projects: (value, type) => (
        <Button
          onClick={() => handleButtonClick(type, value, value)}
          data-testid={`datagrid-button-${type}`}
        >
          {value}
        </Button>
      ),
      rec: (value, type) => (
        <Button
          onClick={() => handleButtonClick(type, value, value)}
          data-testid={`datagrid-button-${type}`}
        >
          <Chip label="rec:" />
          {value}
        </Button>
      ),
      pm: (value, type) => (
        <Button
          className="pomodoro"
          onClick={() => handleButtonClick(type, value, value)}
          data-testid={`datagrid-button-${type}`}
        >
          <img src={TomatoIconDuo} width={25} height={25} alt="Pomodoro" />
          {value}
        </Button>
      ),
      hidden: () => null as React.ReactNode
    }

    const transformURL = (uri: string): string => {
      return uri
    }

    const options = {
      p: ({ children }: { children: React.ReactNode }): JSX.Element => {
        return React.Children.map(children, (child) => {
          if (typeof child === 'object') return child
          let modifiedChild = child.split(/(\S+\s*)/).filter(Boolean)
          let index = 0
          expressions.forEach(({ pattern, type }) => {
            modifiedChild = reactStringReplace(modifiedChild, pattern, (match) => {
              const selected =
                filters &&
                type !== null &&
                (filters[type as keyof Filters] || []).some((filter: Filter) => {
                  return filter.name === match
                })
              index++
              return (
                <span
                  key={`${type}-${match}-${index}`}
                  className={selected ? 'filter selected' : 'filter'}
                  data-todotxt-attribute={type}
                >
                  {replacements[type](match, type)}
                </span>
              )
            })
          })
          return modifiedChild
        })
      },
      a: ({ children, href }: { children: string; href?: string }): JSX.Element => {
        if (!children) return false
        const match = /([a-zA-Z]+:\/\/\S+)/g.exec(children)
        const maxChars = 40
        const truncatedChildren =
          children.length > maxChars ? children.slice(0, maxChars) + '...' : children

        const link = (
          <a onClick={(event) => handleLinkClick(event, match ? children : href)}>
            {truncatedChildren}
            <OpenInNewIcon />
          </a>
        )

        return children.length > maxChars ? (
          <Tooltip title={children} arrow>
            {link}
          </Tooltip>
        ) : (
          link
        )
      }
    }

    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={options} urlTransform={transformURL}>
        {todoObject.body}
      </ReactMarkdown>
    )
  }
)

RendererComponent.displayName = 'RendererComponent'

export default RendererComponent
