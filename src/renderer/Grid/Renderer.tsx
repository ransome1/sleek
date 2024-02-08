import React from 'react';
import reactStringReplace from 'react-string-replace';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { ReactComponent as TomatoIconDuo } from '../../../assets/icons/tomato-duo.svg';
import DatePickerInline from './DatePickerInline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { handleLinkClick } from '../Shared';

const RendererComponent = ({ todoObject, filters, settings, handleButtonClick }) => {
	const expressions = [
	  { pattern: new RegExp(`t:${todoObject.tString?.replace(/\s/g, '\\s')}`, 'g'), type: 't', key: 't:' },
	  { pattern: new RegExp(`due:${todoObject.dueString?.replace(/\s/g, '\\s')}`, 'g'), type: 'due', key: 'due:' },
	  { pattern: /@(\S+)/, type: 'contexts', key: '@' },
	  { pattern: /(?:^|\s)\+(\S+)/, type: 'projects', key: '+' },
	  { pattern: /\bh:1\b/, type: 'hidden', key: 'h:1' },
	  { pattern: /pm:(\d+)/, type: 'pm', key: 'pm:' },
	  { pattern: /rec:([^ ]+)/, type: 'rec', key: 'rec:' },
	];

	const replacements: {
		[key: string]: (value: string, type: string) => React.ReactNode;
	} = {
		due: (value,type) => (
		  <DatePickerInline
		    type={type}
		    todoObject={todoObject}
		    date={todoObject.due}
		    filters={filters}
		    settings={settings}
		  />
		),
		t: (value, type) => (
		  <DatePickerInline
		    type={type}
		    todoObject={todoObject}
		    date={todoObject.t}
		    filters={filters}
		    settings={settings}
		  />
		),
		contexts: (value, type) => (
		  <Button className='contexts' onClick={() => handleButtonClick(type, value)} data-testid={`datagrid-button-${type}`}>
		    {value}
		  </Button>
		),
		projects: (value, type) => (
		  <Button onClick={() => handleButtonClick(type, value)} data-testid={`datagrid-button-${type}`}>
		    {value}
		  </Button>
		),
		rec: (value, type) => (
		  <Button onClick={() => handleButtonClick(type, value)} data-testid={`datagrid-button-${type}`}>
		    <Chip label="rec:" />
		    {value}
		  </Button>
		),
		pm: (value, type) => (
		  <Button className='pomodoro' onClick={() => handleButtonClick(type, value)} data-testid={`datagrid-button-${type}`}>
		    <TomatoIconDuo />
		    {value}
		  </Button>
		),
		hidden: () => null as React.ReactNode,
	};

	const options = {
		p: ({children}) => {
			const modifiedChildren = React.Children.map(children, (child) => {

				if(typeof child === 'object') return child;

				let modifiedChild = child.split(/(\S+\s*)/).filter(Boolean);

				expressions.forEach(({ pattern, type }) => {

					modifiedChild = reactStringReplace(modifiedChild, pattern, (match, i) => {
						
						const selected = filters && type !== null && (filters[type as keyof Filters] || []).some((filter: Filter) => filter.value === match);	
						return (
							<span key={`${type}-${i}`} className={selected ? 'filter selected' : 'filter'} data-todotxt-attribute={type}>
								{replacements[type](match, type)}
							</span>
						);
					});
				});
				return modifiedChild;
			});
			return modifiedChildren;
		},
		a: ({ children, href }) => {
			const match = /([a-zA-Z]+:\/\/\S+)/g.exec(children);
			if (match) {
				return (
					<a onClick={(event) => handleLinkClick(event, children)}>
						{children}<OpenInNewIcon />
					</a>
				);
			}
			return <a onClick={(event) => handleLinkClick(event, href)}>{children}<OpenInNewIcon /></a>;
		},
	};

	return <ReactMarkdown remarkPlugins={[remarkGfm]} components={options}>{todoObject.body}</ReactMarkdown>;
};

export default RendererComponent;