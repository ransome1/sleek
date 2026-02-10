import React, { memo } from "react";
import reactStringReplace from "react-string-replace";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import PomodoroIcon from "../../../resources/pomodoro.svg?asset";
import DatePickerInline from "./DatePickerInline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { handleLinkClick, HandleFilterSelect, IsSelected } from "../Shared";
import { WithTranslation } from "react-i18next";
import { i18n } from "../Settings/LanguageSelector";

interface RendererComponentProps extends WithTranslation {
  todoObject: TodoObject;
  filters: Filters;
  settings: Settings;
  t: typeof i18n.t;
}

const RendererComponent: React.FC<RendererComponentProps> = memo(
  ({ todoObject, filters, settings }) => {
    const expressions = [
      {
        pattern: new RegExp(
          `t:${todoObject.tString?.replace(/\s/g, "\\s")}`,
          "g",
        ),
        type: "t",
        key: "t:",
      },
      {
        pattern: new RegExp(
          `due:${todoObject.dueString?.replace(/\s/g, "\\s")}`,
          "g",
        ),
        type: "due",
        key: "due:",
      },
      { pattern: /@(\S+)/, type: "contexts", key: "@" },
      { pattern: /(?:^|\s)\+(\S+)/, type: "projects", key: "+" },
      { pattern: /\bh:1\b/, type: "hidden", key: "h:1" },
      { pattern: /\bpm:(\d+)/, type: "pm", key: "pm:" },
      { pattern: /\brec:([^ ]+)/, type: "rec", key: "rec:" },
    ];

    const replacements: {
      [key: string]: (value: string, type: string) => React.ReactNode;
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
        <button
          onClick={() => HandleFilterSelect(type, [value], filters, false)}
          data-testid={`datagrid-button-${type}`}
        >
          {value}
        </button>
      ),
      projects: (value, type) => (
        <button
          onClick={() => HandleFilterSelect(type, [value], filters, false)}
          data-testid={`datagrid-button-${type}`}
        >
          {value}
        </button>
      ),
      rec: (value, type) => (
        <button
          onClick={() => HandleFilterSelect(type, [value], filters, false)}
          data-testid={`datagrid-button-${type}`}
        >
          <Chip label="rec:" />
          <div>{value}</div>
        </button>
      ),
      pm: (value, type) => (
        <button
          className="pomodoro"
          onClick={() => HandleFilterSelect(type, [value], filters, false)}
          data-testid={`datagrid-button-${type}`}
        >
          <img src={PomodoroIcon} alt="Pomodoro" />
          {value}
        </button>
      ),
      hidden: () => null as React.ReactNode,
    };

    const transformURL = (uri: string): string => {
      return uri;
    };

    const options = {
      p: ({ children }: { children: React.ReactNode }): JSX.Element => {
        return React.Children.map(children, (child) => {
          if (typeof child === "object") return child;
          let modifiedChild = child.split(/(\S+\s*)/).filter(Boolean);
          let index = 0;
          expressions.forEach(({ pattern, type }) => {
            modifiedChild = reactStringReplace(
              modifiedChild,
              pattern,
              (match) => {
                index++;
                return (
                  <span
                    key={`${type}-${match}-${index}`}
                    className={
                      IsSelected(type, filters, [match])
                        ? "selected filter"
                        : "filter"
                    }
                    data-todotxt-attribute={type}
                  >
                    {replacements[type](match, type)}
                  </span>
                );
              },
            );
          });
          return modifiedChild;
        });
      },
      a: ({
        children,
        href,
      }: {
        children: string;
        href?: string;
      }): JSX.Element => {
        if (!children) return false;
        const match = /([a-zA-Z]+:\/\/\S+)/g.exec(children);
        const maxChars = 40;
        const truncatedChildren =
          children.length > maxChars
            ? children.slice(0, maxChars) + "..."
            : children;

        const link = (
          <a
            onClick={(event) => handleLinkClick(event, match ? children : href)}
          >
            {truncatedChildren}
            <OpenInNewIcon />
          </a>
        );

        return children.length > maxChars ? (
          <Tooltip title={children} arrow>
            {link}
          </Tooltip>
        ) : (
          link
        );
      },
    };

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={options}
        urlTransform={transformURL}
      >
        {todoObject.body}
      </ReactMarkdown>
    );
  },
);

RendererComponent.displayName = "RendererComponent";

export default RendererComponent;
