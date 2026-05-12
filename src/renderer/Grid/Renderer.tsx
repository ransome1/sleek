import React, { JSX, memo } from "react";
import reactStringReplace from "react-string-replace";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import PomodoroIcon from "../../../resources/pomodoro.svg?asset";
import DatePickerInline from "./DatePickerInline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { handleLinkClick, HandleFilterSelect, IsSelected } from "../Shared";
import { TodoObject, Filters, SettingStore, AttributeKey } from "@sleek-types";

interface RendererComponentProps {
  todoObject: TodoObject;
  filters: Filters;
  settings: SettingStore;
}

const RendererComponent: React.FC<RendererComponentProps> = memo(
  ({ todoObject, filters, settings }) => {
    const expressions: { pattern: RegExp; type: AttributeKey; key: string }[] =
      [
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
      [key: string]: (value: string, type: AttributeKey) => React.ReactNode;
    } = {
      due: (_, type) => (
        <DatePickerInline
          type={type}
          todoObject={todoObject}
          date={todoObject.due}
          filters={filters}
          settings={settings}
        />
      ),
      t: (_, type) => (
        <DatePickerInline
          type={type}
          todoObject={todoObject}
          date={todoObject.t}
          filters={filters}
          settings={settings}
        />
      ),
      contexts: (value, type) => (
        <button
          onClick={() =>
            HandleFilterSelect(type, [value], filters, false, null)
          }
          data-testid={`datagrid-button-${type}`}
        >
          {value}
        </button>
      ),
      projects: (value, type) => (
        <button
          onClick={() =>
            HandleFilterSelect(type, [value], filters, false, null)
          }
          data-testid={`datagrid-button-${type}`}
        >
          {value}
        </button>
      ),
      rec: (value, type) => (
        <button
          onClick={() =>
            HandleFilterSelect(type, [value], filters, false, null)
          }
          data-testid={`datagrid-button-${type}`}
        >
          <Chip label="rec:" />
          <div>{value}</div>
        </button>
      ),
      pm: (value, type) => (
        <button
          className="pomodoro"
          onClick={() =>
            HandleFilterSelect(type, [value], filters, false, null)
          }
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

    const linkOptions: Components = {
      a: ({ children, href, ...props }): JSX.Element | null => {
        if (!children) return null;
        const childrenStr =
          typeof children === "string" ? children : String(children);
        const match = /([a-zA-Z]+:\/\/\S+)/g.exec(childrenStr);
        const maxChars = 40;
        const truncatedChildren =
          childrenStr.length > maxChars
            ? childrenStr.slice(0, maxChars) + "..."
            : childrenStr;

        const link = (
          <a
            {...props}
            onClick={(event) =>
              handleLinkClick(event, match ? childrenStr : href || childrenStr)
            }
          >
            {truncatedChildren}
            <OpenInNewIcon />
          </a>
        );

        return childrenStr.length > maxChars ? (
          <Tooltip title={childrenStr} arrow>
            {link}
          </Tooltip>
        ) : (
          link
        );
      },
    };

    if (settings.multiLineView) {
      const badgePatterns: RegExp[] = [];
      if (todoObject.tString) badgePatterns.push(new RegExp(`t:${todoObject.tString.replace(/\s/g, "\\s")}`, "g"));
      if (todoObject.dueString) badgePatterns.push(new RegExp(`due:${todoObject.dueString.replace(/\s/g, "\\s")}`, "g"));
      badgePatterns.push(/@\S+/g, /(?:^|\s)\+\S+/g, /\bh:1\b/g, /\bpm:\d+/g, /\brec:[^ ]+/g);

      let cleanBody = todoObject.body;
      for (const pattern of badgePatterns) {
        cleanBody = cleanBody.replace(pattern, "");
      }
      cleanBody = cleanBody.replace(/\s+/g, " ").trim();

      const badgeElements: React.ReactNode[] = [];
      let badgeIndex = 0;

      if (todoObject.due) {
        badgeIndex++;
        badgeElements.push(
          <span
            key={`due-${badgeIndex}`}
            className={
              IsSelected("due", filters, [todoObject.due])
                ? "selected filter"
                : "filter"
            }
            data-todotxt-attribute="due"
          >
            <DatePickerInline
              type="due"
              todoObject={todoObject}
              date={todoObject.due}
              filters={filters}
              settings={settings}
            />
          </span>
        );
      }

      if (todoObject.t) {
        badgeIndex++;
        badgeElements.push(
          <span
            key={`t-${badgeIndex}`}
            className={
              IsSelected("t", filters, [todoObject.t])
                ? "selected filter"
                : "filter"
            }
            data-todotxt-attribute="t"
          >
            <DatePickerInline
              type="t"
              todoObject={todoObject}
              date={todoObject.t}
              filters={filters}
              settings={settings}
            />
          </span>
        );
      }

      if (todoObject.projects) {
        todoObject.projects.forEach((project) => {
          badgeIndex++;
          badgeElements.push(
            <span
              key={`projects-${project}-${badgeIndex}`}
              className={
                IsSelected("projects", filters, [project])
                  ? "selected filter"
                  : "filter"
              }
              data-todotxt-attribute="projects"
            >
              <button
                onClick={() =>
                  HandleFilterSelect("projects", [project], filters, false, null)
                }
                data-testid="datagrid-button-projects"
              >
                {project}
              </button>
            </span>
          );
        });
      }

      if (todoObject.contexts) {
        todoObject.contexts.forEach((context) => {
          badgeIndex++;
          badgeElements.push(
            <span
              key={`contexts-${context}-${badgeIndex}`}
              className={
                IsSelected("contexts", filters, [context])
                  ? "selected filter"
                  : "filter"
              }
              data-todotxt-attribute="contexts"
            >
              <button
                onClick={() =>
                  HandleFilterSelect("contexts", [context], filters, false, null)
                }
                data-testid="datagrid-button-contexts"
              >
                {context}
              </button>
            </span>
          );
        });
      }

      if (todoObject.rec) {
        badgeIndex++;
        badgeElements.push(
          <span
            key={`rec-${badgeIndex}`}
            className="filter"
            data-todotxt-attribute="rec"
          >
            <button
              onClick={() =>
                HandleFilterSelect("rec", [todoObject.rec!], filters, false, null)
              }
              data-testid="datagrid-button-rec"
            >
              <Chip label="rec:" />
              <div>{todoObject.rec}</div>
            </button>
          </span>
        );
      }

      if (todoObject.pm) {
        badgeIndex++;
        badgeElements.push(
          <span
            key={`pm-${badgeIndex}`}
            className="filter"
            data-todotxt-attribute="pm"
          >
            <button
              className="pomodoro"
              onClick={() =>
                HandleFilterSelect(
                  "pm",
                  [String(todoObject.pm)],
                  filters,
                  false,
                  null,
                )
              }
              data-testid="datagrid-button-pm"
            >
              <img src={PomodoroIcon} alt="Pomodoro" />
              {todoObject.pm}
            </button>
          </span>
        );
      }

      return (
        <>
          <span className="row-text">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={linkOptions}
              urlTransform={transformURL}
            >
              {cleanBody}
            </ReactMarkdown>
          </span>
          {badgeElements.length > 0 && (
            <span className="row-badges">{badgeElements}</span>
          )}
        </>
      );
    }

    const options: Components = {
      ...linkOptions,
      p: ({ children }): JSX.Element | null => {
        const mappedChildren = React.Children.map(children, (child) => {
          if (typeof child !== "string") return child;
          let modifiedChild: React.ReactNode = child;
          let index = 0;
          expressions.forEach(({ pattern, type }) => {
            modifiedChild = reactStringReplace(
              modifiedChild as string,
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
        return mappedChildren ? <>{mappedChildren}</> : null;
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
